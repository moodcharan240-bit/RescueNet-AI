
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from dotenv import load_dotenv

load_dotenv()

service_account_path = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH"
)

if not firebase_admin._apps:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
