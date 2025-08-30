# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import pathlib

# Path to .env (inside backend/)
env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(env_path)  # explicitly tell dotenv where .env is

# Check if the environment variables loaded correctly (only for development/debugging)
if os.getenv("DB_USER") is None or os.getenv("DB_PASSWORD") is None:
    print("📌 DEBUG: Environment variables not loaded correctly!")
else:
    print("📌 DEBUG: .env loaded from:", env_path)
    print("📌 DEBUG: DB_USER =", os.getenv("DB_USER"))
    print("📌 DEBUG: DB_NAME =", os.getenv("DB_NAME"))

# Read environment variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

# Build database URL
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)

# SessionLocal for DB transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Function to initialize the database tables
def init_db():
    from . import models  # Delay import to avoid circular import
    models.Base.metadata.create_all(bind=engine)
