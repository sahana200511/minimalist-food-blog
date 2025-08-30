# crud.py - Add these functions to your existing crud.py file

from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas, auth
import logging

logger = logging.getLogger(__name__)

# Existing functions (make sure you have these)
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_posts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Post).offset(skip).limit(limit).all()

def create_user_post(db: Session, post: schemas.PostCreate, user: models.User):
    db_post = models.Post(
        title=post.title,
        content=post.content,
        created_by=user.username,
        read_time=post.read_time,
        category=post.category,
        excerpt=post.excerpt,
        image=post.image,
        likes=0
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_post(db: Session, post_id: int):
    """Get a single post by ID"""
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def delete_post(db: Session, post_id: int):
    """Delete a post by ID"""
    try:
        # First delete all likes for this post
        db.query(models.LikedPost).filter(models.LikedPost.post_id == post_id).delete()
        # Then delete the post
        post = db.query(models.Post).filter(models.Post.id == post_id).first()
        if post:
            db.delete(post)
            db.commit()
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting post: {e}")
        db.rollback()
        return False

def toggle_post_like(db: Session, post_id: int, user_id: int):
    """
    Toggle like status for a post by a user.
    Returns (post, is_liked) tuple.
    """
    try:
        logger.info(f"Toggling like for post_id={post_id}, user_id={user_id}")
        
        # Get the post
        post = db.query(models.Post).filter(models.Post.id == post_id).first()
        if not post:
            logger.warning(f"Post {post_id} not found")
            return None, False
        
        # Check if user already liked this post
        existing_like = db.query(models.LikedPost).filter(
            models.LikedPost.post_id == post_id,
            models.LikedPost.user_id == user_id
        ).first()
        
        if existing_like:
            # Unlike: remove the like
            logger.info(f"Removing like from post {post_id}")
            db.delete(existing_like)
            post.likes = max(0, post.likes - 1)  # Decrease likes count
            is_liked = False
        else:
            # Like: add the like
            logger.info(f"Adding like to post {post_id}")
            new_like = models.LikedPost(user_id=user_id, post_id=post_id)
            db.add(new_like)
            post.likes += 1  # Increase likes count
            is_liked = True
        
        db.commit()
        db.refresh(post)
        logger.info(f"Like toggle completed. Post {post_id} liked: {is_liked}, total likes: {post.likes}")
        return post, is_liked
        
    except Exception as e:
        logger.error(f"Error toggling like: {e}")
        db.rollback()
        raise e