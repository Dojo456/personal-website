import typing

from flask import redirect, session, url_for


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


class BlogInfo(typing.TypedDict):
    alt_title: str
    alt_description: str
