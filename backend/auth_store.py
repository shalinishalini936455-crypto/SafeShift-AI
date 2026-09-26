"""
auth_store.py
Simple username/password auth backend for SafeShift AI (FastAPI version).

Users are stored in a local JSON file (users_db.json) sitting next to
this file. Passwords are salted and hashed with the standard-library
hashlib/secrets modules -- no extra pip installs required.

INTEGRATION (app.py)
---------------------
Replace:
    from auth_store import auth_bp
    ...
    app.register_blueprint(auth_bp)

With:
    from auth_store import router as auth_router
    ...
    app.include_router(auth_router)

That adds two endpoints:
    POST /api/auth/signup   { "username": ..., "password": ... }
    POST /api/auth/login    { "username": ..., "password": ... }

Both return JSON like:
    { "success": true, "username": "..." }
    { "success": false, "username": null, "error": "..." }
"""

import hashlib
import json
import os
import secrets
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

USERS_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    success: bool
    username: Optional[str] = None
    error: Optional[str] = None


def _load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def _save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt), 100_000
    )
    return f"{salt}${digest.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, hash_hex = stored.split("$")
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt), 100_000
    )
    return secrets.compare_digest(digest.hex(), hash_hex)


@router.post("/signup", response_model=AuthResponse)
def signup(payload: AuthRequest):
    username = payload.username.strip()
    password = payload.password

    if not username or not password:
        return AuthResponse(success=False, error="Username and password are required.")

    if len(password) < 6:
        return AuthResponse(success=False, error="Password must be at least 6 characters.")

    users = _load_users()
    key = username.lower()

    if key in users:
        return AuthResponse(success=False, error="That username is already taken.")

    users[key] = {"username": username, "password_hash": _hash_password(password)}
    _save_users(users)

    return AuthResponse(success=True, username=username)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthRequest):
    username = payload.username.strip()
    password = payload.password

    if not username or not password:
        return AuthResponse(success=False, error="Username and password are required.")

    users = _load_users()
    user = users.get(username.lower())

    if not user or not _verify_password(password, user["password_hash"]):
        return AuthResponse(success=False, error="Invalid username or password.")

    return AuthResponse(success=True, username=user["username"])
