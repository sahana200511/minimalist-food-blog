from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ------------------------
# Posts CRUD functions
# ------------------------

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def get_posts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Post).offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.PostCreate):
    db_post = models.Post(
        title=post.title,
        content=post.content,
        created_by=post.created_by,
        read_time=post.read_time
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

# ------------------------
# Users CRUD functions (optional)
# ------------------------

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
