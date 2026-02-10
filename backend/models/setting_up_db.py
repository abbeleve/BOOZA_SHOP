from sqlalchemy import MetaData, Table, Column, Integer, String, Time, DateTime, CheckConstraint, Enum, ForeignKey, Boolean
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

    OrderID = Column(Integer, primary_key=True)
    CreateDateTime = Column(DateTime, default=datetime.utcnow)
    EndDateTime = Column(DateTime, nullable=True)
    Status = Column(Enum(Status))
    DeliveryAddress = Column(String, nullable=False)
    TotalAmount = Column(Integer, nullable=False)
    Description = Column(String, nullable=True)
    OrderFoodID = Column(Integer, ForeignKey('orderItems.orderFoodID'), nullable=False)
    UserID = Column(Integer, ForeignKey('users.UserID'), nullablke=False)

    user = relationship('Users', back_populates='orders')
    item
class OrderItems(Base):
    __tablename__ = 'orderItems'

    OrderFoodID = Column(Integer, primary_key=True)
    MenuItemID = Column(Integer, ForeignKey('menuItems.menuItemID'), nullable=False)
    OrderID = Column(Integer, ForeignKey('orders.OrderID'), nullable=False)
    Quantity = Column(Integer)
    Price = Column(Integer)

class MenuItems(Base):
    __tablename__ = 'menuItems'
    
    MenuID = Column(Integer, primary_key=True)
    FoodName = Column(String)
    Description = Column(String)
    ImageURL = Column(String)
    IsAvailable = Column(Boolean)
    Price = Column('Price', Integer, CheckConstraint('Price > 0'), nullable=False)
    PreparationTime = Column(Time, nullable=False)
    CategoryID = Column(Integer, ForeignKey('foodType.CategoryID'))

class FoodType(Base):
    __tablename__ = 'foodType'

    CategoryID = Column(Integer, primary_key=True)
    Name = Column(String, nullable=False)

class Users(Base):
    __tablename__ = 'users'

    UserID = Column(Integer, primary_key=True)
    Username = Column(String, CheckConstraint('len(Username) < 30 AND len(Username) >= 2'))
    Name = Column(String, CheckConstraint('len(Name) < 30 AND len(Name) >= 2'))
    Surname = Column(String, CheckConstraint('len(Surname) < 30 AND len(Surname) >= 2'))
    Patronymic = Column(String, CheckConstraint("len(Patronymic) < 30 AND len(Patronymic) >= 2"), nullable = True)
    HashPassword = Column(String, nullable=False)
    Address = Column(String)
    Phone = Column(String, nullable=False)
    Email = Column(String, nullable=False)

class Staff(Base):
    __tablename__ = 'staff'

    Username = Column(String, primary_key=True)
    HashPassword = Column(String, nullable=False)
    Role = Column(Enum(Role))