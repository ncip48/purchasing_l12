from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from uuid import UUID
import binascii
from utils import uuid_to_bin,bin_to_uuid
from uuid import UUID
from sqlalchemy import text

def get_token_from_header(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authorization header",
        )
    return authorization.replace("Bearer ", "").strip()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_header),
):  
    try:
        user = db.query(User).filter(User.id == token).first()
    except Exception:
        raise HTTPException(status_code=401, detail="User lookup failed")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
