from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

# -------------------------
# SQLAlchemy setup
# -------------------------
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------
# psycopg2 direct fetch
# -------------------------
def fetch_data():
    connection = None
    try:
        connection = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users;")
        columns = [desc[0] for desc in cursor.description]
        records = cursor.fetchall()
        for row in records:
            print(dict(zip(columns, row)))
    except (Exception, psycopg2.Error) as error:
        print("Error while fetching data:", error)
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection closed.")
