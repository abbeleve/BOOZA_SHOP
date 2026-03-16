from sqlalchemy import MetaData, Column, Integer, String, Time, DateTime, CheckConstraint, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class Status(enum.Enum):
    PENDING = 1
    COMPLETED = 2
    CANCELLED = 3

class Role(enum.Enum):
    STAFF = 1
    ADMIN = 2

class Order(Base):
    __tablename__ = 'orders'

    order_id = Column(Integer, primary_key=True)
    create_datetime = Column(DateTime, default=datetime.utcnow)
    end_datetime = Column(DateTime, nullable=True)
    status = Column(Enum(Status))
    delivery_address = Column(String, nullable=False)
    total_amount = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)

    user = relationship('Users', back_populates='orders')
    items = relationship('OrderItems', back_populates='order', lazy='selectin')

class OrderItems(Base):
    __tablename__ = 'order_items'

    order_food_id = Column(Integer, primary_key=True)
    menu_item_id = Column(Integer, ForeignKey('menu_items.menu_id'), nullable=False)
    order_id = Column(Integer, ForeignKey('orders.order_id'), nullable=False)
    quantity = Column(Integer)
    price = Column(Integer)

    order = relationship('Order', back_populates='items')
    menu_item = relationship('MenuItems', back_populates='order_items')

class MenuItems(Base):
    __tablename__ = 'menu_items'
    
    menu_id = Column(Integer, primary_key=True)
    food_name = Column(String)
    description = Column(String)
    image_url = Column(String)
    is_available = Column(Boolean)
    price = Column(Integer, CheckConstraint('price > 0'), nullable=False)
    preparation_time = Column(Time, nullable=False)
    category_id = Column(Integer, ForeignKey('food_type.category_id'))

    order_items = relationship("OrderItems", back_populates="menu_item")
    category = relationship("FoodType", back_populates="menu_items")

class FoodType(Base):
    __tablename__ = 'food_type'

    category_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    menu_items = relationship("MenuItems", back_populates="category")

class Users(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True)
    username = Column(String(29), CheckConstraint('LENGTH(username) >= 2'), unique=True, nullable=False)
    name = Column(String(29), CheckConstraint('LENGTH(name) >= 2'), nullable=False)
    surname = Column(String(29), CheckConstraint('LENGTH(surname) >= 2'), nullable=False)
    patronymic = Column(String(29), CheckConstraint('LENGTH(patronymic) >= 2'), nullable=True)
    hash_password = Column(String, nullable=False)
    address = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    create_datetime = Column(DateTime, nullable=False)

    orders = relationship("Order", back_populates="user")
    staff = relationship("Staff", back_populates="user", uselist=False)

class Staff(Base):
    __tablename__ = 'staff'

    username = Column(String, ForeignKey('users.username'), primary_key=True)
    role = Column(Enum(Role))

    user = relationship("Users", back_populates="staff")