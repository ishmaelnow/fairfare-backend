# React Frontend Backend API

Flask backend API for the React frontend ride booking application.

## Features

- User authentication (register/login) with JWT tokens
- Ride booking and management
- Driver registration and management
- PostgreSQL database
- CORS enabled for React frontend
- RESTful API design

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

### 2. Install Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

#### Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE ride_app_db;

-- Exit psql
\q
```

#### Or using command line:

```bash
createdb -U postgres ride_app_db
```

### 4. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux
```

2. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ride_app_db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### 5. Run the Application

```bash
python app.py
```

The API will be available at `http://localhost:8001`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`

- `POST /api/users/login` - Login user
  - Body: `{ "email": "john@example.com", "password": "password123" }`
  - Returns: `{ "token": "jwt_token", "user": {...} }`

### Rides

- `POST /api/rides` - Create a new ride booking (requires auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "riderName": "...", "phoneNumber": "...", "email": "...", "pickupLocation": "...", "dropoffLocation": "...", "pickupTime": "2024-01-01T10:00" }`

- `GET /api/users/rides` - Get user's rides (requires auth)
  - Headers: `Authorization: Bearer <token>`

### Drivers

- `POST /api/users/become-driver` - Apply to become a driver (requires auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "vehicleType": "Sedan", "model": "Toyota Camry", "year": 2022, "color": "White", "licensePlate": "ABC-1234" }`

- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/<id>` - Get driver by ID
- `PATCH /api/drivers/<id>/approve` - Approve a driver
- `PATCH /api/drivers/<id>/availability` - Toggle driver availability
  - Body: `{ "isAvailable": true }`
- `DELETE /api/drivers/<id>` - Remove a driver

### Health Check

- `GET /api/health` - Health check endpoint

## Frontend Integration

Update your React frontend `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:8001
```

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- is_driver (Boolean)
- created_at
- updated_at

### Rides Table
- id (Primary Key)
- user_id (Foreign Key -> Users)
- driver_id (Foreign Key -> Drivers, nullable)
- rider_name
- phone_number
- email
- pickup_location
- dropoff_location
- pickup_time
- status (pending, assigned, in_progress, completed, cancelled)
- created_at
- updated_at

### Drivers Table
- id (Primary Key)
- user_id (Foreign Key -> Users, Unique)
- vehicle_type
- model
- year
- color
- license_plate (Unique)
- is_approved (Boolean)
- is_available (Boolean)
- created_at
- updated_at

## Development

### Running in Development Mode

```bash
export FLASK_ENV=development  # macOS/Linux
set FLASK_ENV=development      # Windows
python app.py
```

### Database Migrations

For production, consider using Flask-Migrate:

```bash
pip install Flask-Migrate
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Production Deployment

1. Set `FLASK_ENV=production` and `FLASK_DEBUG=False`
2. Use a strong `SECRET_KEY` and `JWT_SECRET_KEY`
3. Configure PostgreSQL connection string for production database
4. Use a production WSGI server (e.g., Gunicorn)
5. Set up proper CORS origins for your production frontend domain

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `psql -U postgres -l`

### Port Already in Use

- Change port in `app.py`: `app.run(port=8002)`
- Or kill the process using port 8001

### Import Errors

- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

