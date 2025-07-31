import os
from flask import Blueprint, abort, render_template

playlist_blueprint = Blueprint(
    "playlist",
    __name__,
)


@playlist_blueprint.route("/")
def playlist():
    return render_template("playlist/index.jinja")


@playlist_blueprint.route("/song/<int:index>")
def song(index):
    file = f"playlist/{index}.jinja"

    print(file)

    songs = [
        int(name)
        for name in [
            song.split(".")[0]
            for song in os.listdir("templates/playlist")
            if song.endswith(".jinja")
        ]
        if name.isdigit()
    ]

    if index not in songs:
        return render_template("playlist/out_of_range.jinja", index=index)

    return render_template(f"playlist/{index}.jinja", index=index)
