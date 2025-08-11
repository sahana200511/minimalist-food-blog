from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Post schemas
class PostBase(BaseModel):
    title: str
    content: str
    created_by: str
    read_time: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
