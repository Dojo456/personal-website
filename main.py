import base64
import html
import math
import os
import typing
from datetime import datetime

import firebase_admin
import requests
from dotenv import load_dotenv
from firebase_admin import auth, firestore
from flask import (
    Flask,
    abort,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from flask_login import LoginManager, UserMixin, current_user, login_user, logout_user
from jinja2 import FileSystemLoader, select_autoescape

from utils import BlogInfo

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

    def get_id(self):
        return str(self.record.uid)


@login_manager.user_loader
def load_user(user_id):
    user = auth.get_user(user_id)

    return User(user)


@app.route("/")
def home():
    return render_template("home.jinja")


all_blogs = [
    ("/sabrina", "For Sabrina", "sabrina"),
]


alternate_titles = {
    "sabrina": "Sabrina",
}


@app.route("/blog")
@app.route("/blog/<topic>")
def blog(topic: str | None = None):
    blog_info: BlogInfo | None = None

    if topic is None:
        topic = "default"

    if topic != "default":
        if topic not in session.get("scopes", []):
            return redirect(url_for("access", on_success=url_for("blog", topic=topic)))

        blog_info_doc = db.collection("blogs").document(topic).get().to_dict()

        if not blog_info_doc:
            abort(404)

        blog_info = BlogInfo(**blog_info_doc)

    page = request.args.get("page", 1, type=int)
    per_page = 5  # Number of blog posts per page

    # Calculate the start and end indices for the current page
    start = (page - 1) * per_page
    end = start + per_page

    # Query Firestore to get total count and paginated results
    blog_ref = db.collection("posts").where("topic", "==", topic)

    total_posts = len(blog_ref.get())

    # Order by creation date (descending) and limit to the current page
    posts = (
        blog_ref.order_by("created", direction=firestore.firestore.Query.DESCENDING)
        .offset(start)
        .limit(per_page)
        .stream()
    )

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
        current_topic=topic,
        alt_title=blog_info["alt_title"] if blog_info else None,
        alt_description=blog_info["alt_description"] if blog_info else None,
    )


@app.route("/blog/new", methods=["GET", "POST"])
def new_post():
    if not current_user.is_authenticated:
        return redirect(url_for("home"))

    if request.method == "POST":
        entry: dict[str, typing.Any] = dict(request.form)

        entry["created"] = firestore.firestore.SERVER_TIMESTAMP

        db.collection("posts").add(entry)

        topic = entry["topic"]

        return redirect(url_for("blog", topic=topic if topic != "default" else None))

    topics = set(doc.id for doc in db.collection("blogs").stream())

    return render_template("new_post.jinja", topics=list(topics))


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


@app.route("/access", methods=["GET", "POST"])
def access():
    if request.method == "POST":
        access_code = request.form.get("access-code")
        on_success = request.form.get("on_success", url_for("home"))

        codes = (
            db.collection("access_codes")
            .where("code", "==", access_code)
            .limit(1)
            .get()
        )

        if len(codes) == 0:
            return redirect(url_for("access"))

        code = codes[0]

        scopes = code.get("scopes")
        session["scopes"] = scopes

        # Fetch blogs where document ID is in scopes
        blogs = db.collection("blogs").where("__name__", "in", scopes).stream()

        additional_links = [
            (f"/blog/{blog.id}", blog.get("link_title")) for blog in blogs
        ]

        session["additional_links"] = additional_links

        return redirect(on_success)

    on_success = request.args.get("on_success", url_for("home"))
    return render_template("access.jinja", on_success=on_success)


@app.route("/logout", methods=["POST"])
def logout():
    logout_user()
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
            user = resp.json()

            login_user(User(auth.get_user(user["localId"])), remember=True)

            return redirect(url_for("home"))
        else:
            flash(resp.text, "error")
            print(resp.text)

            return redirect(url_for("login"))

    return render_template("login.jinja")


@app.route("/projects")
def projects():
    username = "Dojo456"

    response = requests.get(f"https://api.github.com/users/{username}/repos")
    if not response.ok:
        abort(500)

    projects = response.json()
    # Sort projects by stars
    projects.sort(key=lambda x: x.get("stargazers_count", 0), reverse=True)

    # Clean up project data
    formatted_projects = [
        {
            "name": project["name"],
            "description": project.get("description", "No description available"),
            "stars": project["stargazers_count"],
            "forks": project["forks_count"],
            "language": project.get("language", "N/A"),
            "url": project["html_url"],
            "updated_at": datetime.strptime(
                project["updated_at"], "%Y-%m-%dT%H:%M:%SZ"
            ).strftime("%B %d, %Y"),
        }
        for project in projects
    ]

    return render_template("projects.jinja", projects=formatted_projects)


@app.route("/projects/<project>", methods=["GET", "POST"])
def project_details(project):
    if request.method == "POST":
        content = request.form.get("content")

        sha = request.form.get("sha")

        if not content:
            return redirect(url_for("project_details", project=project))

        response = requests.put(
            f"https://api.github.com/repos/Dojo456/{project}/contents/README.md",
            json={
                "message": "[skip ci] Update README",
                "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
                "sha": sha,
                "branch": "development",
            },
            headers={"Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"},
        )

        print(response.text)

        return redirect(url_for("project_details", project=project))

    try:
        # Fetch README content from GitHub API
        response = requests.get(
            f"https://api.github.com/repos/Dojo456/{project}/contents/README.md?ref=development"
        )

        if response.status_code == 404:
            readme_content = "I haven't written a README for this project yet."
            sha = None
        elif not response.ok:
            abort(500)
        else:
            content = response.json()

            # Decode content from base64
            readme_content = html.unescape(
                base64.b64decode(content["content"]).decode("utf-8")
            )
            sha = content["sha"]
        return render_template(
            "project_details.jinja",
            project_name=project,
            readme_content=readme_content,
            sha=sha,
        )
    except Exception as e:
        flash(f"Error fetching README: {str(e)}", "error")
        return redirect(url_for("projects"))


if __name__ == "__main__":
    app.run(debug=True)
