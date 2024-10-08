import os
import typing

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import firestore
from flask import Flask, redirect, render_template, request, session, url_for
from jinja2 import FileSystemLoader, select_autoescape

load_dotenv()

default_app = firebase_admin.initialize_app()

# Application Default credentials are automatically created.
db = firestore.client()

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configure Jinja2 to recognize .jinja files

app.jinja_env.loader = FileSystemLoader("templates")
app.jinja_env.autoescape = select_autoescape(["html", "xml", "jinja"])


@app.route("/")
def home():
    return render_template("home.jinja")


@app.route("/blog")
def blog():
    return render_template("blog.jinja")


@app.route("/new_blog", methods=["GET", "POST"])
def new_blog():
    if not session.get("admin"):
        return redirect(url_for("home"))

    if request.method == "POST":
        entry: dict[str, typing.Any] = dict(request.form)

        entry["created"] = firestore.firestore.SERVER_TIMESTAMP

        db.collection("blog").add(entry)

        return redirect(url_for("blog"))

    return render_template("new_blog.jinja")


@app.route("/search")
def search():
    query = request.args.get("query")

    if query == "mrow":
        results = [
            {"description": "Log In", "url": "/login"},
        ]
    else:
        results = []

    return results


@app.route("/login")
def login():
    session["admin"] = True
    return render_template("login.jinja")


@app.route("/logout")
def logout():
    return redirect(url_for("home"))


if __name__ == "__main__":
    app.run(debug=True)
