import base64
import html
import traceback
from http import HTTPStatus
import math
import os
import time
import typing
from datetime import datetime

from flask_socketio import SocketIO
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

from routers import playlist_blueprint
import spotify_router
from utils import BlogInfo, requires_auth
from firebase import db
import sentry_sdk

# Environment Setup
load_dotenv()

API_KEY = os.getenv("FIREBASE_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Application Default credentials are automatically created.


# Flask Setup

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
login_manager = LoginManager()
login_manager.init_app(app)
sentry_sdk.init(
    dsn="https://408e3609a2d1959d32a6f0b7b5e8b245@o4511663717089280.ingest.us.sentry.io/4511663719120896",
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
    traces_sample_rate=1.0,
    profile_session_sample_rate=1.0,
    # Set profile_lifecycle to "trace" to automatically
    # run the profiler on when there is an active transaction
    profile_lifecycle="trace"
)


app.register_blueprint(spotify_router.spotify_router)

app.register_error_handler(
    HTTPStatus.INTERNAL_SERVER_ERROR,
    lambda e: traceback.print_exception(e, e.__traceback__),
)

socketio = SocketIO(app)

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
@app.route("/blog/<topic>", methods=["GET"])
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
    posts_ref = (
        blog_ref.order_by("created", direction=firestore.firestore.Query.DESCENDING)
        .offset(start)
        .limit(per_page)
        .stream()
    )

    # Convert Firestore documents to dictionaries
    posts = [post_ref.to_dict() | {"id": post_ref.id} for post_ref in posts_ref]


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

@app.route("/post/delete", methods=["POST"])
def delete_post():
    entry = request.form

    post_id = entry["post_id"]
    if not post_id:
        return "Bad request!", 400

    ref = db.collection("posts").document(post_id)
    
    data = ref.get().to_dict() | {"deleted": firestore.firestore.SERVER_TIMESTAMP}
    db.collection("archive").add(data, ref.id)
    ref.delete()

    return redirect(request.referrer)

# @socketio.on("update_editor")
# def update_editor(data):
#     if data is None:
#         return "Missing data"

#     content = data.get("content")

#     if not content:
#         return "Missing content"

#     db.collection("admin").document("editor").update({"content": content})

#     return "OK"


@app.route("/post/new", methods=["GET", "POST", "PUT"])
@requires_auth
def new_post():
    if request.method == "POST":
        entry: dict[str, typing.Any] = dict(request.form)

        entry["created"] = firestore.firestore.SERVER_TIMESTAMP

        db.collection("posts").add(entry)
        db.collection("admin").document("editor").update({"content": ""})

        topic = entry["topic"]

        return redirect(url_for("blog", topic=topic if topic != "default" else None))

    topics = set(doc.id for doc in db.collection("blogs").stream())
    editor_doc = db.collection("admin").document("editor").get().to_dict()
    initial_content = editor_doc.get("content") if editor_doc else None

    return render_template(
        "new_post.jinja", topics=list(topics), initial_content=initial_content
    )

@app.route("/search")
def search():
    query = request.args.get("query")

    results = []

    search_terms = db.collection("search").where("term", "==", query).get()

    search_terms = [doc for doc in [term.to_dict() for term in search_terms] if doc]

    for term in search_terms:
        results.append(
            {
                "description": term.get("description"),
                "url": term.get("url"),
                "term": term.get("term"),
            }
        )

    return results


@app.route("/search_terms", methods=["GET", "POST"])
@requires_auth
def search_terms():
    if request.method == "POST":
        term = request.form.get("term")
        description = request.form.get("description")
        url = request.form.get("url")

        db.collection("search").add(
            {"term": term, "description": description, "url": url}
        )

        return redirect(url_for("search_terms"))

    search_terms = db.collection("search").get()

    search_terms = [term.to_dict() for term in search_terms]

    return render_template("search_terms.jinja", terms=search_terms)


@app.route("/delete_term", methods=["POST"])
def delete_term():
    term = request.form.get("term")

    db.collection("search").document(term).delete()

    return redirect(url_for("search_terms"))


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

    response = requests.get(
        f"https://api.github.com/users/{username}/repos",
        headers={"Authorization": f"Bearer {GITHUB_TOKEN}"},
    )
    if not response.ok:
        abort(500, response.text)

    projects = response.json()

    # Clean up project data
    formatted_projects = [
        {
            "name": project["name"],
            "description": project.get("description", "No description available"),
            "stars": project["stargazers_count"],
            "forks": project["forks_count"],
            "language": project.get("language", "N/A"),
            "url": project["html_url"],
            "updated_at": datetime.strptime(project["pushed_at"], "%Y-%m-%dT%H:%M:%SZ"),
            "created_at": datetime.strptime(
                project["created_at"], "%Y-%m-%dT%H:%M:%SZ"
            ),
        }
        for project in projects
        if project["stargazers_count"] > 0
    ]

    formatted_projects.sort(key=lambda x: x["updated_at"].timestamp(), reverse=True)

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
            },
            headers={"Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"},
        )

        # GitHub API is eventually consistent, so wait a second
        time.sleep(1)

        return redirect(url_for("project_details", project=project))

    try:
        # Fetch README content from GitHub API
        response = requests.get(
            f"https://api.github.com/repos/Dojo456/{project}/contents/README.md",
            headers={"Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"},
        )

        if response.status_code == 404:
            readme_content = "I haven't written a README for this project yet."
            sha = None
        elif not response.ok:
            print(response.text)
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


@playlist_blueprint.before_request
@requires_auth
def before_request():
    if (
        "playlist" not in session.get("scopes", [])
    ):
        return redirect(url_for("access", on_success=url_for("playlist.playlist")))


app.register_blueprint(playlist_blueprint, url_prefix="/playlist")

if __name__ == "__main__":
    app.run(debug=True)
