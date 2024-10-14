import math
import os
import typing

import firebase_admin
import requests
from dotenv import load_dotenv
from firebase_admin import auth, firestore
from flask import Flask, redirect, render_template, request, session, url_for
from flask_login import LoginManager, UserMixin
from jinja2 import FileSystemLoader, select_autoescape

# Environment Setup
load_dotenv()

API_KEY = os.getenv("FIREBASE_API_KEY")

# Application Default credentials are automatically created.

default_app = firebase_admin.initialize_app()
db = firestore.client()

# Flask Setup

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
login_manager = LoginManager()
login_manager.init_app(app)

# Configure Jinja2 to recognize .jinja files

app.jinja_env.loader = FileSystemLoader("templates")
app.jinja_env.autoescape = select_autoescape(["html", "xml", "jinja"])


class User(UserMixin):
    def __init__(self, record: auth.UserRecord):
        self.record = record


@login_manager.user_loader
def load_user(user_id):
    user = auth.get_user(user_id)

    return User(user)


@app.route("/")
def home():
    return render_template("home.jinja")


@app.route("/blog")
def blog():
    page = request.args.get("page", 1, type=int)
    per_page = 5  # Number of blog posts per page

    # Calculate the start and end indices for the current page
    start = (page - 1) * per_page
    end = start + per_page

    # Query Firestore to get total count and paginated results
    blog_ref = db.collection("blog")
    total_posts = len(blog_ref.get())

    # Order by creation date (descending) and limit to the current page
    posts = blog_ref.order_by("created").offset(start).limit(per_page).stream()

    # Convert Firestore documents to dictionaries
    posts = [post.to_dict() for post in posts]

    # Calculate total pages
    total_pages = math.ceil(total_posts / per_page)

    return render_template(
        "blog.jinja",
        posts=posts,
        page=page,
        total_pages=total_pages,
        total_posts=total_posts,
    )


@app.route("/blog/new", methods=["GET", "POST"])
def new_blog():
    if not session.get("user"):
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


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return redirect(url_for("home"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        resp = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}",
            json={"email": email, "password": password, "returnSecureToken": True},
        )

        if resp.ok:
            session["user"] = resp.json()

            return redirect(url_for("home"))
        else:
            return redirect(url_for("login"))

    return render_template("login.jinja")


if __name__ == "__main__":
    app.run(debug=True)
