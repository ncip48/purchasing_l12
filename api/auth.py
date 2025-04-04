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
    # # Step 1: Verify token in Laravel's `personal_access_tokens` table
    result = db.execute(
        text("SELECT user_id FROM sessions WHERE id = :session_id LIMIT 1"),
        {"session_id": token}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id_bin = result[0]  # Should be BINARY(16)
    
    # user_id_bin = "0195709d-afdc-73aa-9e92-8fb43148264a"
    
    print(user_id_bin)
    
    try:
        user = db.query(User).filter(User.id == user_id_bin).first()
    except Exception:
        raise HTTPException(status_code=401, detail="User lookup failed")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
