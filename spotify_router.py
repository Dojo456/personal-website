import base64
import os
import time
import urllib.parse
import uuid
from flask import Blueprint, redirect, request, url_for
from flask_login import  current_user
import requests

from utils import requires_auth

spotify_router = Blueprint("spotify", __name__, url_prefix="/spotify")

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

from firebase import db

@spotify_router.route("/login")
@requires_auth
def login():
    state = uuid.uuid4()
    scope = "user-read-playback-state"

    queries = {
        "response_type": "code",
        "client_id": SPOTIFY_CLIENT_ID,
        "scope": scope,
        "redirect_uri": url_for(".callback", _external=True),
        "state": state
    }

    query = urllib.parse.urlencode(queries)

    return redirect("https://accounts.spotify.com/authorize?" + query)

def get_spotify_token():
    return base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode()

@spotify_router.route("/callback")
@requires_auth
def callback():
    code = request.args["code"]
    state = request.args["state"]

    resp = requests.post("https://accounts.spotify.com/api/token", {
        "code": code,
        "redirect_uri": url_for(".callback", _external=True),
        "grant_type": "authorization_code"
    }, headers={
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + get_spotify_token()
    })

    if resp.ok:
        save_token_from_resp_json(resp.json())

    return redirect(url_for("home"))

saved_token = None
expires_at = None

def get_access_token() -> str:
    global expires_at
    global saved_token

    if saved_token != None and time.time() < expires_at:
        return saved_token

    data = db.collection("admin").document("spotify").get()

    print("refetching access token")

    if not saved_token: # First time fetching, will cache
        token = data.get("access_token")
        expires_at = data.get("expires_at")
        saved_token = token
        assert token
        return token
    elif time.time() > expires_at: # Need to refresh
        refresh_token = data.get("refresh_token")

        req_body = {
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "client_id": SPOTIFY_CLIENT_ID
        }

        req_headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': "Basic " + get_spotify_token()
        }

        resp = requests.post("https://accounts.spotify.com/api/token", data=req_body, headers=req_headers)

        data = resp.json()

        if resp.ok:
            save_token_from_resp_json(data)
            expires_at = data["expires_at"]
            saved_token = data["access_token"]
            return data["access_token"]
        else:
            raise RuntimeError("spotify request failed", resp.status_code, data, "request:", {"body": req_body, "headers": req_headers})

    return saved_token

def save_token_from_resp_json(json: dict):
    json["expires_at"] = int(time.time() + json["expires_in"])

    db.collection("admin").document("spotify").set(json, merge=True)

@spotify_router.route("/playback_state")
def playback_state():
    
    resp = requests.get("https://api.spotify.com/v1/me/player", headers={"Authorization": "Bearer " + get_access_token()})

    if resp.status_code == 200:
        data = resp.json()

        song = data["item"]

        return {
            "track": song["name"],
            "album": song["album"]["name"],
            "artist": song["artists"][0]["name"],
            "cover_image": song["album"]["images"][-1],
            "link": song["external_urls"]["spotify"],
            "progress_ms": data["progress_ms"],
            "duration_ms": song["duration_ms"],
            "is_playing": data["is_playing"]
        }
    else:
        return None