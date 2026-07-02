from functools import wraps
import typing

from flask import redirect, session, url_for
from flask_login import current_user

def requires_scope(scope: list[str]):
    def decorator(func):
        def wrapper(*args, **kwargs):
            session_scopes: list[str] = session.get("scopes", [])

            intersect = list(filter(lambda x: x in scope, session_scopes))

            if len(intersect) == 0:
                return redirect(url_for("access"))

            return func(*args, **kwargs)

        return wrapper

    return decorator

def requires_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for("home"))

        return func(*args, **kwargs)

    return wrapper


class BlogInfo(typing.TypedDict):
    alt_title: str
    alt_description: str
