from database import db
from datetime import datetime

class User(db.Model):
    """User model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    is_driver = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rides = db.relationship('Ride', backref='user', lazy=True, cascade='all, delete-orphan')
    driver_profile = db.relationship('Driver', backref='user', uselist=False, lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'

class Ride(db.Model):
    """Ride booking model"""
    __tablename__ = 'rides'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=True, index=True)
    
    rider_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    pickup_location = db.Column(db.String(255), nullable=False)
    dropoff_location = db.Column(db.String(255), nullable=False)
    pickup_time = db.Column(db.DateTime, nullable=False)
    
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, assigned, in_progress, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    driver = db.relationship('Driver', backref='rides', lazy=True)
    
    def __repr__(self):
        return f'<Ride {self.id} - {self.pickup_location} to {self.dropoff_location}>'

class Driver(db.Model):
    """Driver model"""
    __tablename__ = 'drivers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False, index=True)
    
    vehicle_type = db.Column(db.String(50), nullable=False)  # Sedan, SUV, etc.
    model = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(50), nullable=False)
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    
    is_approved = db.Column(db.Boolean, default=False, nullable=False)
    is_available = db.Column(db.Boolean, default=False, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Driver {self.id} - {self.vehicle_type} {self.model}>'

