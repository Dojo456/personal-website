import os

import firebase_admin
from firebase_admin import firestore


if os.getenv("ENV") == "production":
    default_app = firebase_admin.initialize_app()
else:
    default_app = firebase_admin.initialize_app(
        credential=firebase_admin.credentials.Certificate(
            os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
        )
    )
db = firestore.client()
