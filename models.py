from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from flask_login import UserMixin

from database import Base, engine

class User(Base, UserMixin):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(20), unique=True)
    password = Column(String(100))
    registration_date = Column(DateTime, server_default=func.now())
    tables = relationship('Table')

class Table(Base):
    __tablename__ = 'tables'

    id = Column(Integer, primary_key=True)
    client_side_id = Column(Integer, nullable=False)
    title = Column(String(50))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    position = Column(Integer, nullable=False)
    tasks = relationship('Task')

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True)
    client_side_id = Column(Integer, nullable=False)
    table_id = Column(Integer, ForeignKey('tables.id'), nullable=False)
    position = Column(Integer, nullable=False)
    content = Column(String(100))
    
Base.metadata.create_all(engine)
