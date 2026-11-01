
"""
RescueNet AI - FastAPI Backend
Firebase Authentication + Individual Responder Assignment
+ Demo SQLite Incident API.

Demo only. Not suitable for real emergencies or
deployment with sensitive data.
"""

import os
import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from typing import Literal

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field


# --------------------------------------------------
# 1. ENVIRONMENT CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

DB = os.getenv(
    "DEMO_DB_PATH",
    str(BASE_DIR / "demo.db")
)


# --------------------------------------------------
# 2. CREATE FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="RescueNet AI API",
    description="Emergency response coordination API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in CORS_ORIGINS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# 3. FIREBASE ADMIN SDK INITIALIZATION
# --------------------------------------------------

service_account_path = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH"
)

if not service_account_path:
    raise RuntimeError(
        "FIREBASE_SERVICE_ACCOUNT_PATH is missing in backend/.env"
    )

service_account_file = (
    BASE_DIR / service_account_path
).resolve()

if not service_account_file.is_file():
    raise FileNotFoundError(
        f"Firebase service account file not found: "
        f"{service_account_file}"
    )

try:
    firebase_admin.get_app()

except ValueError:
    firebase_credential = credentials.Certificate(
        str(service_account_file)
    )

    firebase_admin.initialize_app(firebase_credential)

firestore_db = firestore.client()


# --------------------------------------------------
# 4. FIREBASE AUTHENTICATION
# --------------------------------------------------

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials

        decoded_token = firebase_auth.verify_id_token(
            token,
            check_revoked=True
        )

        return decoded_token

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase authentication token"
        )


# --------------------------------------------------
# 5. FIRESTORE USER PROFILES
# --------------------------------------------------

@app.post("/api/auth/register")
def register_user(
    user: dict = Depends(get_current_user)
):
    uid = user["uid"]

    user_ref = firestore_db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:

        profile = {
            "uid": uid,
            "email": user.get("email"),
            "role": "citizen",
            "created_at": datetime.now(
                timezone.utc
            ).isoformat()
        }

        user_ref.set(profile)

        return profile

    return user_doc.to_dict()


@app.get("/api/auth/me")
def get_profile(
    user: dict = Depends(get_current_user)
):
    user_ref = firestore_db.collection(
        "users"
    ).document(user["uid"])

    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=403,
            detail="User profile not found. Please register first."
        )

    profile = user_doc.to_dict()
    role = profile.get("role", "citizen")

    if role not in ["citizen", "admin", "responder"]:
        raise HTTPException(
            status_code=403,
            detail="Invalid user role"
        )

    return {
        "authenticated": True,
        "uid": user["uid"],
        "email": user.get("email") or profile.get("email"),
        "role": role
    }


# --------------------------------------------------
# 6. ROLE-BASED AUTHORIZATION
# --------------------------------------------------

def get_user_profile(
    user: dict = Depends(get_current_user)
):
    user_ref = firestore_db.collection(
        "users"
    ).document(user["uid"])

    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=403,
            detail="User profile not found"
        )

    profile = user_doc.to_dict()

    profile["uid"] = user["uid"]
    profile["email"] = (
        user.get("email") or profile.get("email")
    )

    return profile


def require_roles(*allowed_roles):

    def check_role(
        profile: dict = Depends(get_user_profile)
    ):

        if profile.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action"
            )

        return profile

    return check_role


# --------------------------------------------------
# 7. SQLITE DATABASE
# --------------------------------------------------

def db():
    connection = sqlite3.connect(DB)
    connection.row_factory = sqlite3.Row
    return connection


with db() as connection:

    connection.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            description TEXT,
            location TEXT,
            lat REAL,
            lng REAL,
            status TEXT,
            severity TEXT,
            assigned_to TEXT,
            created_at TEXT,
            simulated INTEGER
        )
    """)

    # Migrate existing databases safely.

    existing_columns = {
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(incidents)"
        ).fetchall()
    }

    if "assigned_responder_uid" not in existing_columns:

        connection.execute("""
            ALTER TABLE incidents
            ADD COLUMN assigned_responder_uid TEXT
        """)

    if "assigned_responder_email" not in existing_columns:

        connection.execute("""
            ALTER TABLE incidents
            ADD COLUMN assigned_responder_email TEXT
        """)

    # Insert sample incidents only when the table is empty.

    count = connection.execute(
        "SELECT COUNT(*) FROM incidents"
    ).fetchone()[0]

    if count == 0:

        connection.executemany("""
            INSERT INTO incidents (
                category,
                description,
                location,
                lat,
                lng,
                status,
                severity,
                assigned_to,
                created_at,
                simulated
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, [

            (
                "Road Accident",
                "Multiple vehicles involved. Medical assistance requested.",
                "Madhapur, Hyderabad",
                17.4483,
                78.3915,
                "Assigned",
                "Critical",
                "Team Alpha",
                "2026-10-31T10:24:00Z"
            ),

            (
                "Fire Emergency",
                "Smoke reported near a commercial building.",
                "Gachibowli, Hyderabad",
                17.4401,
                78.3489,
                "In progress",
                "High",
                "Team Bravo",
                "2026-10-31T09:45:00Z"
            ),

            (
                "Medical Emergency",
                "A person needs immediate medical attention.",
                "Banjara Hills, Hyderabad",
                17.4156,
                78.4347,
                "Resolved",
                "Medium",
                "Team Alpha",
                "2026-10-31T08:12:00Z"
            ),

            (
                "Road Accident",
                "Minor collision reported at an intersection.",
                "Kondapur, Hyderabad",
                17.4619,
                78.3649,
                "New",
                "Medium",
                None,
                "2026-10-31T07:30:00Z"
            )
        ])


# --------------------------------------------------
# 8. REQUEST MODELS
# --------------------------------------------------

class Incident(BaseModel):

    category: Literal[
        "Road Accident",
        "Fire Emergency",
        "Medical Emergency",
        "Flood Emergency",
        "Crime / Safety",
        "Building Emergency"
    ]

    description: str = Field(
        min_length=10,
        max_length=2000
    )

    location: str = Field(
        min_length=3,
        max_length=250
    )

    lat: float | None = Field(
        default=None,
        ge=-90,
        le=90
    )

    lng: float | None = Field(
        default=None,
        ge=-180,
        le=180
    )


class Update(BaseModel):

    status: Literal[
        "New",
        "Assigned",
        "In progress",
        "Arrived",
        "Resolved"
    ] | None = None

    # Retained for compatibility with the old demo frontend.

    assigned_to: Literal[
        "Team Alpha",
        "Team Bravo"
    ] | None = None

    # New individual responder assignment.

    assigned_responder_uid: str | None = Field(
        default=None,
        max_length=128
    )


# --------------------------------------------------
# 9. HEALTH CHECK
# --------------------------------------------------

@app.get("/api/health")
def health():

    return {
        "status": "ok",
        "mode": "demo",
        "firebase": "initialized"
    }


# --------------------------------------------------
# 10. ADMIN - LIST REGISTERED RESPONDERS
# --------------------------------------------------

@app.get("/api/responders")
def list_responders(
    admin: dict = Depends(require_roles("admin"))
):

    responders = firestore_db.collection(
        "users"
    ).where(
        "role",
        "==",
        "responder"
    ).stream()

    result = []

    for responder in responders:

        profile = responder.to_dict()

        result.append({
            "uid": responder.id,
            "email": profile.get("email", ""),
            "name": profile.get(
                "name",
                profile.get("display_name", "")
            ),
            "role": "responder"
        })

    return result


# --------------------------------------------------
# 11. INCIDENT APIs - DEMO ONLY
# --------------------------------------------------

@app.get("/api/incidents")
def list_incidents(
    user: dict = Depends(
        require_roles("admin", "responder")
    )
):
    with db() as connection:

        if user["role"] == "admin":
            rows = connection.execute("""
                SELECT *
                FROM incidents
                ORDER BY id DESC
            """).fetchall()

        else:
            rows = connection.execute("""
                SELECT *
                FROM incidents
                WHERE assigned_responder_uid = ?
                   OR assigned_to = 'Team Alpha'
                ORDER BY id DESC
            """, (user["uid"],)).fetchall()

        return [
            dict(row)
            for row in rows
        ]

# --------------------------------------------------
# 12. CITIZEN - CREATE INCIDENT
# --------------------------------------------------

@app.post("/api/incidents", status_code=201)
def create_incident(
    incident: Incident,
    user: dict = Depends(
        require_roles("citizen")
    )
):

    with db() as connection:

        cursor = connection.execute("""
            INSERT INTO incidents (
                category,
                description,
                location,
                lat,
                lng,
                status,
                severity,
                assigned_to,
                created_at,
                simulated,
                assigned_responder_uid,
                assigned_responder_email
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """, (

            incident.category,
            incident.description,
            incident.location,
            incident.lat,
            incident.lng,
            "New",
            "Unclassified",
            None,
            datetime.now(timezone.utc).isoformat(),
            None,
            None
        ))

        row = connection.execute("""
            SELECT *
            FROM incidents
            WHERE id = ?
        """, (cursor.lastrowid,)).fetchone()

        return dict(row)


# --------------------------------------------------
# 13. UPDATE INCIDENT - ADMIN AND RESPONDER
# --------------------------------------------------

@app.patch("/api/incidents/{incident_id}")
def update_incident(
    incident_id: int,
    update: Update,
    user: dict = Depends(
        require_roles("admin", "responder")
    )
):

    with db() as connection:

        existing = connection.execute("""
            SELECT *
            FROM incidents
            WHERE id = ?
        """, (incident_id,)).fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        changes = update.model_dump(
            exclude_unset=True
        )

        is_admin = user["role"] == "admin"

                # ------------------------------------------
        # RESPONDER PERMISSIONS
        # ------------------------------------------

        if not is_admin:

            # Allow individual assignment OR Team Alpha demo assignment
            is_assigned_to_responder = (
                existing["assigned_responder_uid"] == user["uid"]
            )

            is_assigned_to_team = (
                existing["assigned_to"] == "Team Alpha"
            )

            if not (
                is_assigned_to_responder
                or is_assigned_to_team
            ):
                raise HTTPException(
                    status_code=403,
                    detail="This incident is not assigned to you"
                )

            # Responders cannot assign or reassign incidents
            if (
                "assigned_responder_uid" in changes
                or "assigned_to" in changes
            ):
                raise HTTPException(
                    status_code=403,
                    detail="Only administrators can assign incidents"
                )

            # Responders can update only response status
            if (
                "status" not in changes
                or changes["status"] not in [
                    "In progress",
                    "Arrived",
                    "Resolved"
                ]
            ):
                raise HTTPException(
                    status_code=403,
                    detail="You can only update your incident response status"
                )

        # ------------------------------------------
        # LEGACY TEAM ASSIGNMENT
        # ------------------------------------------

        if "assigned_to" in changes:

            if not is_admin:

                raise HTTPException(
                    status_code=403,
                    detail="Only administrators can assign teams"
                )

            connection.execute("""
                UPDATE incidents
                SET assigned_to = ?,
                    status = CASE
                        WHEN status = 'New'
                        THEN 'Assigned'
                        ELSE status
                    END
                WHERE id = ?
            """, (
                changes["assigned_to"],
                incident_id
            ))

        # ------------------------------------------
        # UPDATE INCIDENT STATUS
        # ------------------------------------------

        if "status" in changes:

            connection.execute("""
                UPDATE incidents
                SET status = ?
                WHERE id = ?
            """, (
                changes["status"],
                incident_id
            ))

        # ------------------------------------------
        # RETURN UPDATED INCIDENT
        # ------------------------------------------

        row = connection.execute("""
            SELECT *
            FROM incidents
            WHERE id = ?
        """, (incident_id,)).fetchone()

        return dict(row)


# --------------------------------------------------
# 14. ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def root():

    return {
        "message": "Welcome to RescueNet AI API",
        "version": "2.0.0",
        "mode": "demo"
    }
