from dotenv import load_dotenv
from flask import Flask, render_template, url_for
from jinja2 import FileSystemLoader, select_autoescape

load_dotenv()

app = Flask(__name__)

# Configure Jinja2 to recognize .jinja files

app.jinja_env.loader = FileSystemLoader("templates")
app.jinja_env.autoescape = select_autoescape(["html", "xml", "jinja"])


@app.route("/")
def home():
    return render_template("home.jinja")


@app.route("/about")
def about():
    return render_template("about.jinja")


@app.route("/projects")
def projects():
    return render_template("projects.jinja")


@app.route("/blog")
def blog():
    return render_template("blog.jinja")


if __name__ == "__main__":
    app.run(debug=True)
