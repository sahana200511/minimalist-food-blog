from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
import logging
import traceback

from . import crud, models, schemas, auth
from .database import SessionLocal, engine

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(debug=True)  # Enable debug mode

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# Authentication Endpoints
# -------------------------
@app.post("/api/token", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

# -------------------------
# Blog Post Endpoints
# -------------------------

@app.get("/api/posts", response_model=List[schemas.PostResponse])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info("Fetching posts...")
        posts = crud.get_posts(db, skip=skip, limit=limit)
        logger.info(f"Found {len(posts)} posts")
        # Mark liked=False by default
        for post in posts:
            post.liked = False
        return posts
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching posts: {str(e)}")

@app.post("/api/posts", response_model=schemas.PostResponse)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        logger.info(f"Creating post by user: {current_user.username}")
        db_post = crud.create_user_post(db=db, post=post, user=current_user)
        db_post.liked = False
        return db_post
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}")

@app.delete("/api/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        logger.info(f"Deleting post {post_id} by user {current_user.username}")
        db_post = crud.get_post(db, post_id=post_id)
        if not db_post:
            raise HTTPException(status_code=404, detail="Post not found")
        if db_post.created_by != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        crud.delete_post(db=db, post_id=post_id)
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting post: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error deleting post: {str(e)}")

@app.put("/api/posts/{post_id}/like")
def toggle_like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        logger.info(f"Toggle like for post {post_id} by user {current_user.username} (ID: {current_user.id})")
        
        # Check if the toggle_post_like function exists
        if not hasattr(crud, 'toggle_post_like'):
            logger.error("crud.toggle_post_like function not found!")
            raise HTTPException(status_code=500, detail="toggle_post_like function not implemented")
        
        db_post, liked = crud.toggle_post_like(db=db, post_id=post_id, user_id=current_user.id)
        if not db_post:
            logger.warning(f"Post {post_id} not found")
            raise HTTPException(status_code=404, detail="Post not found")
        
        logger.info(f"Like toggled successfully. Post {post_id} liked: {liked}")
        
        # Return a simple response that won't cause serialization issues
        return {
            "id": db_post.id,
            "title": db_post.title,
            "content": db_post.content,
            "created_by": db_post.created_by,
            "created_at": str(db_post.created_at) if db_post.created_at else None,
            "read_time": db_post.read_time,
            "likes": db_post.likes,
            "category": db_post.category,
            "excerpt": db_post.excerpt,
            "image": db_post.image,
            "liked": liked
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in toggle_like_post: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error toggling like: {str(e)}")

@app.get("/api/user/liked-posts")
def get_liked_posts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        logger.info(f"Fetching liked posts for user {current_user.username} (ID: {current_user.id})")
        
        liked_posts = (
            db.query(models.Post)
            .join(models.LikedPost, models.Post.id == models.LikedPost.post_id)
            .filter(models.LikedPost.user_id == current_user.id)
            .all()
        )
        
        logger.info(f"Found {len(liked_posts)} liked posts")
        
        # Return manual serialization to avoid issues
        result = []
        for post in liked_posts:
            result.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "created_by": post.created_by,
                "created_at": str(post.created_at) if post.created_at else None,
                "read_time": post.read_time,
                "likes": post.likes,
                "category": post.category,
                "excerpt": post.excerpt,
                "image": post.image,
                "liked": True
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching liked posts: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching liked posts: {str(e)}")

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

# Test endpoint to check database connection
@app.get("/api/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        # Try to query something simple
        result = db.execute("SELECT 1").fetchone()
        return {"status": "Database connection successful", "result": result[0]}
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Test authentication
@app.get("/api/test-auth")
def test_auth(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "message": "Authentication working", 
        "user": current_user.username,
        "user_id": current_user.id
    }