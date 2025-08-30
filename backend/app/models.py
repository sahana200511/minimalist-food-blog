from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # Use password_hash consistently

    # Relationship: User -> LikedPosts
    liked_posts = relationship("LikedPost", back_populates="user")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    created_by = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    read_time = Column(Text, nullable=True)
    likes = Column(Integer, default=0)
    category = Column(String(50), nullable=True)
    excerpt = Column(Text, nullable=True)
    image = Column(Text, nullable=True)

    # Relationship: Post -> LikedPosts
    liked_by = relationship("LikedPost", back_populates="post")


class LikedPost(Base):
    __tablename__ = "liked_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="liked_posts")
    post = relationship("Post", back_populates="liked_by")
