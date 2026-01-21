from flask_sqlalchemy import SQLAlchemy
import logging

db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✓ Database tables created successfully!")
    except Exception as e:
        logging.error(f"Database initialization error: {e}")
        print(f"⚠ Warning: Could not initialize database. Make sure PostgreSQL is running.")
        print(f"   Error: {e}")
        raise

