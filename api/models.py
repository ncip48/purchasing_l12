import uuid
from sqlalchemy.dialects.mysql import BINARY as MYSQL_BINARY
from sqlalchemy import Column, String, LargeBinary, ForeignKey, DateTime, func
from sqlalchemy.dialects.mysql import BINARY
from sqlalchemy.orm import relationship
from database import Base
from utils import uuid_to_bin  # UUID -> binary(16)
from datetime import datetime

def generate_uuid_bin():
    return uuid.uuid4()

class Face(Base):
    __tablename__ = "faces"

    id = Column(String, primary_key=True, default=generate_uuid_bin)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    face_encoding = Column(LargeBinary, nullable=True)
    photo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="face")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

    face = relationship("Face", uselist=False, back_populates="user")
