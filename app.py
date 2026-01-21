from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import db, init_db
from models import User, Ride, Driver

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
# Database configuration - supports both PostgreSQL and SQLite
# For PostgreSQL: postgresql://postgres:password@localhost:5432/ride_app_db
# For SQLite (quick start): sqlite:///ride_app.db
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///ride_app.db'  # Default to SQLite for quick start
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
CORS(app, origins=[
    # Local development
    "http://localhost:3000",  # Original React frontend
    "http://localhost:3001",  # Rider PWA
    "http://localhost:3002",  # Driver PWA
    "http://localhost:3003",  # Admin PWA
    # Production
    "https://fairfaretransportation.app",
    "https://www.fairfaretransportation.app",
    "https://rider.fairfaretransportation.app",
    "https://driver.fairfaretransportation.app",
    "https://admin.fairfaretransportation.app"
])
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Initialize database (will fail gracefully if PostgreSQL not available)
try:
    init_db(app)
except Exception as e:
    print(f"\n⚠ Database initialization failed: {e}")
    print("Please ensure PostgreSQL is installed and running.")
    print("See README.md for setup instructions.\n")

# ==================== USER AUTHENTICATION ====================

@app.route('/api/users/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ['name', 'email', 'password']):
            return jsonify({'error': 'Name, email, and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create new user
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not bcrypt.check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'isDriver': user.is_driver
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== RIDE ENDPOINTS ====================

@app.route('/api/rides', methods=['POST'])
@jwt_required()
def create_ride():
    """Create a new ride booking"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['riderName', 'phoneNumber', 'email', 'pickupLocation', 'dropoffLocation', 'pickupTime']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'All ride fields are required'}), 400
        
        # Parse pickup time
        try:
            pickup_time = datetime.fromisoformat(data['pickupTime'].replace('Z', '+00:00'))
        except:
            pickup_time = datetime.strptime(data['pickupTime'], '%Y-%m-%dT%H:%M')
        
        # Create ride
        ride = Ride(
            user_id=int(current_user_id),
            rider_name=data['riderName'],
            phone_number=data['phoneNumber'],
            email=data['email'],
            pickup_location=data['pickupLocation'],
            dropoff_location=data['dropoffLocation'],
            pickup_time=pickup_time,
            status='pending'
        )
        
        # Try to assign a driver automatically
        available_driver = Driver.query.filter_by(
            is_approved=True,
            is_available=True
        ).first()
        
        if available_driver:
            ride.driver_id = available_driver.id
            ride.status = 'assigned'
            available_driver.is_available = False
        
        db.session.add(ride)
        db.session.commit()
        
        # If no driver was available, the ride stays pending
        # It will be assigned when a driver becomes available
        
        ride_data = {
            'id': ride.id,
            'riderName': ride.rider_name,
            'phoneNumber': ride.phone_number,
            'email': ride.email,
            'pickupLocation': ride.pickup_location,
            'dropoffLocation': ride.dropoff_location,
            'pickupTime': ride.pickup_time.isoformat(),
            'status': ride.status,
            'driverId': ride.driver_id,
            'createdAt': ride.created_at.isoformat()
        }
        
        return jsonify({
            'message': 'Ride booked successfully',
            'ride': ride_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/rides', methods=['GET'])
@jwt_required()
def get_user_rides():
    """Get all rides for the current user"""
    try:
        current_user_id = get_jwt_identity()
        
        rides = Ride.query.filter_by(user_id=int(current_user_id)).order_by(Ride.created_at.desc()).all()
        
        rides_data = [{
            '_id': ride.id,
            'riderName': ride.rider_name,
            'phoneNumber': ride.phone_number,
            'email': ride.email,
            'pickupLocation': ride.pickup_location,
            'dropoffLocation': ride.dropoff_location,
            'pickupTime': ride.pickup_time.isoformat(),
            'status': ride.status,
            'driverId': ride.driver_id,
            'createdAt': ride.created_at.isoformat()
        } for ride in rides]
        
        return jsonify({'rides': rides_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== DRIVER ENDPOINTS ====================

@app.route('/api/users/become-driver', methods=['POST'])
@jwt_required()
def become_driver():
    """Apply to become a driver"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['vehicleType', 'model', 'year', 'color', 'licensePlate']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'All vehicle fields are required'}), 400
        
        user = User.query.get(int(current_user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already a driver
        if user.is_driver:
            existing_driver = Driver.query.filter_by(user_id=user.id).first()
            if existing_driver:
                return jsonify({'error': 'You are already registered as a driver'}), 400
        
        # Create or update driver record
        driver = Driver.query.filter_by(user_id=user.id).first()
        
        if driver:
            # Update existing driver application
            driver.vehicle_type = data['vehicleType']
            driver.model = data['model']
            driver.year = int(data['year'])
            driver.color = data['color']
            driver.license_plate = data['licensePlate']
            driver.is_approved = False  # Reset approval status
        else:
            # Create new driver application
            driver = Driver(
                user_id=user.id,
                vehicle_type=data['vehicleType'],
                model=data['model'],
                year=int(data['year']),
                color=data['color'],
                license_plate=data['licensePlate'],
                is_approved=False,
                is_available=False
            )
            db.session.add(driver)
        
        user.is_driver = True
        db.session.commit()
        
        return jsonify({
            'message': 'Driver application submitted successfully',
            'driver': {
                'id': driver.id,
                'vehicleType': driver.vehicle_type,
                'model': driver.model,
                'isApproved': driver.is_approved
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    """Get all drivers (admin endpoint)"""
    try:
        drivers = Driver.query.join(User).all()
        
        drivers_data = [{
            '_id': driver.id,
            'name': driver.user.name,
            'email': driver.user.email,
            'vehicle': f"{driver.vehicle_type} {driver.model} ({driver.year})",
            'vehicleType': driver.vehicle_type,
            'model': driver.model,
            'year': driver.year,
            'color': driver.color,
            'licensePlate': driver.license_plate,
            'isAvailable': driver.is_available,
            'isApproved': driver.is_approved,
            'userId': driver.user_id
        } for driver in drivers]
        
        return jsonify(drivers_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers/me', methods=['GET'])
@jwt_required()
def get_my_driver_info():
    """Get current user's driver info"""
    try:
        current_user_id = get_jwt_identity()
        driver = Driver.query.filter_by(user_id=int(current_user_id)).first()
        
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        driver_data = {
            '_id': driver.id,
            'name': driver.user.name,
            'email': driver.user.email,
            'vehicle': f"{driver.vehicle_type} {driver.model} ({driver.year})",
            'vehicleType': driver.vehicle_type,
            'model': driver.model,
            'year': driver.year,
            'color': driver.color,
            'licensePlate': driver.license_plate,
            'isAvailable': driver.is_available,
            'isApproved': driver.is_approved
        }
        
        return jsonify(driver_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers/my-rides', methods=['GET'])
@jwt_required()
def get_my_driver_rides():
    """Get rides assigned to current driver"""
    try:
        current_user_id = get_jwt_identity()
        driver = Driver.query.filter_by(user_id=int(current_user_id)).first()
        
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        # Get all rides assigned to this driver
        rides = Ride.query.filter_by(driver_id=driver.id).order_by(Ride.created_at.desc()).all()
        
        rides_data = [{
            'id': ride.id,
            'riderName': ride.rider_name,
            'phoneNumber': ride.phone_number,
            'email': ride.email,
            'pickupLocation': ride.pickup_location,
            'dropoffLocation': ride.dropoff_location,
            'pickupTime': ride.pickup_time.isoformat(),
            'status': ride.status,
            'createdAt': ride.created_at.isoformat()
        } for ride in rides]
        
        return jsonify({'rides': rides_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    """Get driver by ID"""
    try:
        driver = Driver.query.get_or_404(driver_id)
        
        driver_data = {
            '_id': driver.id,
            'name': driver.user.name,
            'email': driver.user.email,
            'vehicle': f"{driver.vehicle_type} {driver.model} ({driver.year})",
            'vehicleType': driver.vehicle_type,
            'model': driver.model,
            'year': driver.year,
            'color': driver.color,
            'licensePlate': driver.license_plate,
            'isAvailable': driver.is_available,
            'isApproved': driver.is_approved
        }
        
        return jsonify(driver_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers/<int:driver_id>/approve', methods=['PATCH'])
def approve_driver(driver_id):
    """Approve a driver and assign pending rides if driver is available"""
    try:
        driver = Driver.query.get_or_404(driver_id)
        driver.is_approved = True
        driver.is_available = True
        db.session.commit()
        
        # Try to assign pending rides to newly approved driver
        assigned_count = assign_pending_rides()
        
        message = 'Driver approved successfully'
        if assigned_count > 0:
            message += f'. {assigned_count} pending ride(s) assigned.'
        
        return jsonify({
            'message': message,
            'driver': {
                'id': driver.id,
                'isApproved': driver.is_approved,
                'isAvailable': driver.is_available
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def assign_pending_rides():
    """Helper function to assign pending rides to available drivers"""
    pending_rides = Ride.query.filter_by(status='pending', driver_id=None).all()
    available_drivers = Driver.query.filter_by(
        is_approved=True,
        is_available=True
    ).all()
    
    assigned_count = 0
    for ride in pending_rides:
        if available_drivers:
            driver = available_drivers.pop(0)  # Get first available driver
            ride.driver_id = driver.id
            ride.status = 'assigned'
            driver.is_available = False
            assigned_count += 1
    
    if assigned_count > 0:
        db.session.commit()
    
    return assigned_count

@app.route('/api/drivers/<int:driver_id>/availability', methods=['PATCH'])
def toggle_driver_availability(driver_id):
    """Toggle driver availability and assign pending rides if driver goes online"""
    try:
        driver = Driver.query.get_or_404(driver_id)
        data = request.get_json()
        
        was_available = driver.is_available
        
        if 'isAvailable' in data:
            driver.is_available = data['isAvailable']
        else:
            driver.is_available = not driver.is_available
        
        db.session.commit()
        
        # If driver just became available, try to assign pending rides
        if driver.is_available and not was_available and driver.is_approved:
            assigned_count = assign_pending_rides()
            if assigned_count > 0:
                return jsonify({
                    'message': f'Driver availability updated. {assigned_count} pending ride(s) assigned.',
                    'driver': {
                        'id': driver.id,
                        'isAvailable': driver.is_available
                    }
                }), 200
        
        return jsonify({
            'message': 'Driver availability updated',
            'driver': {
                'id': driver.id,
                'isAvailable': driver.is_available
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    """Remove a driver"""
    try:
        driver = Driver.query.get_or_404(driver_id)
        user = driver.user
        user.is_driver = False
        
        db.session.delete(driver)
        db.session.commit()
        
        return jsonify({'message': 'Driver removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/rides/assign-pending', methods=['POST'])
def assign_pending_rides_endpoint():
    """Manually trigger assignment of pending rides to available drivers"""
    try:
        assigned_count = assign_pending_rides()
        
        return jsonify({
            'message': f'{assigned_count} pending ride(s) assigned to available drivers',
            'assignedCount': assigned_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8001)

