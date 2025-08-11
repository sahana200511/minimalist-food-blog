from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # store hashed passwords
    # Optionally you can add created_at timestamp if needed
    # created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    created_by = Column(String(50), nullable=False)  # or ForeignKey to users.id if you want relational integrity
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    read_time = Column(Text, nullable=True)
