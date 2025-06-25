# app/utils/security.py
from passlib.context import CryptContext
from typing import Optional

# Dùng bcrypt cho hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a plain text password.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hashed version.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False  # tránh raise nếu hashed_password không đúng format
