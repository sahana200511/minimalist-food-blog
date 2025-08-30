from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

# ---------------------------
# User Schemas
# ---------------------------
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ---------------------------
# Post Schemas
# ---------------------------
class PostBase(BaseModel):
    title: str
    content: str
    created_by: Optional[str] = None
    read_time: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    image: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    created_at: datetime
    likes: Optional[int] = 0
    liked: Optional[bool] = False   # <-- Important for frontend
    model_config = ConfigDict(from_attributes=True)

# ---------------------------
# Token Schemas
# ---------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
