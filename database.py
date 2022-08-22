from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

import os

# Use heroku's database url if in production mode, and local database url for production
if os.environ.get("DATABASE_URL"):
    SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")
    if SQLALCHEMY_DATABASE_URL("postgres://"):
        SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://")
else:
    SQLALCHEMY_DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Base = declarative_base()