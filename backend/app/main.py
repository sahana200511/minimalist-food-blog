from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Config from environment variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_DATABASE = os.getenv("DB_NAME")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

app = FastAPI()

# CORS middleware (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_connection():
    return psycopg2.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_DATABASE,
    )


# Pydantic models

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class PostCreate(BaseModel):
    title: str
    content: str
    created_by: str
    read_time: Optional[str] = None


class PostResponse(PostCreate):
    id: int
    created_at: datetime


# User-related DB helpers

def get_user_by_username(username: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM users WHERE username = %s;", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def get_user_by_email(email: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email = %s;", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def create_user(user: UserCreate):
    conn = get_connection()
    cur = conn.cursor()
    hashed_password = pwd_context.hash(user.password)
    cur.execute(
        """
        INSERT INTO users (username, email, password_hash)
        VALUES (%s, %s, %s)
        RETURNING id, username, email;
        """,
        (user.username, user.email, hashed_password),
    )
    new_user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return new_user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Posts DB helpers

def create_post(post: PostCreate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO posts (title, content, created_by, read_time)
        VALUES (%s, %s, %s, %s)
        RETURNING id, title, content, created_by, created_at, read_time;
        """,
        (post.title, post.content, post.created_by, post.read_time),
    )
    new_post = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return new_post


def get_posts():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM posts ORDER BY created_at DESC;")
    posts = cur.fetchall()
    cur.close()
    conn.close()
    return posts


# Routes

@app.post("/signup", status_code=201)
def signup(user: UserCreate):
    if get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = create_user(user)
    return {
        "message": "User created",
        "user": {
            "id": new_user[0],
            "username": new_user[1],
            "email": new_user[2],
        },
    }


@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_username(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/")
def root():
    return {"message": "API is running successfully!"}


@app.post("/posts/", response_model=PostResponse, status_code=201)
def api_create_post(post: PostCreate = Body(...)):
    new_post = create_post(post)
    return {
        "id": new_post[0],
        "title": new_post[1],
        "content": new_post[2],
        "created_by": new_post[3],
        "created_at": new_post[4],
        "read_time": new_post[5],
    }


@app.get("/posts/", response_model=List[PostResponse])
def api_get_posts():
    return get_posts()
