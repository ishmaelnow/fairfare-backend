# Frontend-Backend API Mapping

This document shows how the React frontend endpoints map to the Flask backend API.

## Frontend API Calls → Backend Endpoints

### Authentication

| Frontend Call | Backend Endpoint | Method | Auth Required |
|--------------|-----------------|--------|---------------|
| `axios.post("/users/register", formData)` | `/api/users/register` | POST | No |
| `axios.post("/users/login", formData)` | `/api/users/login` | POST | No |

**Request/Response Examples:**

**Register:**
```javascript
// Frontend sends:
{ name: "John Doe", email: "john@example.com", password: "password123" }

// Backend returns:
{ message: "User registered successfully", user: {...} }
```

**Login:**
```javascript
// Frontend sends:
{ email: "john@example.com", password: "password123" }

// Backend returns:
{ token: "jwt_token_here", user: {...} }
```

### Ride Booking

| Frontend Call | Backend Endpoint | Method | Auth Required |
|--------------|-----------------|--------|---------------|
| `axios.post("/rides", formData)` | `/api/rides` | POST | Yes (Bearer token) |
| `axios.get("/users/rides")` | `/api/users/rides` | GET | Yes (Bearer token) |

**Request/Response Examples:**

**Create Ride:**
```javascript
// Frontend sends:
{
  riderName: "John Doe",
  phoneNumber: "+1234567890",
  email: "john@example.com",
  pickupLocation: "123 Main St",
  dropoffLocation: "456 Oak Ave",
  pickupTime: "2024-01-01T10:00"
}

// Backend returns:
{
  message: "Ride booked successfully",
  ride: {
    id: 1,
    riderName: "John Doe",
    pickupLocation: "123 Main St",
    dropoffLocation: "456 Oak Ave",
    status: "assigned",
    driverId: 5,
    ...
  }
}
```

**Get User Rides:**
```javascript
// Backend returns:
{
  rides: [
    {
      _id: 1,
      pickupLocation: "123 Main St",
      dropoffLocation: "456 Oak Ave",
      pickupTime: "2024-01-01T10:00:00",
      status: "assigned",
      ...
    }
  ]
}
```

### Driver Management

| Frontend Call | Backend Endpoint | Method | Auth Required |
|--------------|-----------------|--------|---------------|
| `axios.post("/users/become-driver", vehicleData)` | `/api/users/become-driver` | POST | Yes (Bearer token) |
| `axios.get("/drivers")` | `/api/drivers` | GET | No |
| `axios.get("/drivers/${driverId}")` | `/api/drivers/<id>` | GET | No |
| `axios.patch("/drivers/${driverId}/approve")` | `/api/drivers/<id>/approve` | PATCH | No |
| `axios.patch("/drivers/${driverId}/availability", {...})` | `/api/drivers/<id>/availability` | PATCH | No |
| `axios.delete("/drivers/${driverId}")` | `/api/drivers/<id>` | DELETE | No |

**Request/Response Examples:**

**Become Driver:**
```javascript
// Frontend sends:
{
  vehicleType: "Sedan",
  model: "Toyota Camry",
  year: 2022,
  color: "White",
  licensePlate: "ABC-1234"
}

// Backend returns:
{
  message: "Driver application submitted successfully",
  driver: {...}
}
```

**Get Drivers:**
```javascript
// Backend returns:
[
  {
    _id: 1,
    name: "John Doe",
    vehicle: "Sedan Toyota Camry (2022)",
    isAvailable: true,
    isApproved: true,
    ...
  }
]
```

## Frontend Pages → Backend Endpoints

### `/register` (Register.js)
- Uses: `POST /api/users/register`

### `/login` (Login.js)
- Uses: `POST /api/users/login`
- Stores token in `localStorage`

### `/book-ride` (RideBooking.js)
- Uses: `POST /api/rides` (create ride)
- Uses: `GET /api/drivers/:id` (fetch assigned driver)

### `/dashboard` (Dashboard.js)
- Uses: `GET /api/users/rides` (get user's rides)

### `/driver-signup` (DriverSignup.js)
- Uses: `POST /api/users/become-driver`

### `/manage-drivers` (DriverManagement.js)
- Uses: `GET /api/drivers` (list all drivers)
- Uses: `PATCH /api/drivers/:id/approve` (approve driver)
- Uses: `PATCH /api/drivers/:id/availability` (toggle availability)
- Uses: `DELETE /api/drivers/:id` (remove driver)

## Authentication Flow

1. User registers → `POST /api/users/register`
2. User logs in → `POST /api/users/login` → receives JWT token
3. Frontend stores token in `localStorage`
4. Frontend axios interceptor adds token to all requests:
   ```javascript
   config.headers.Authorization = `Bearer ${token}`
   ```
5. Backend validates token using `@jwt_required()` decorator

## Error Handling

The backend returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token or credentials)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message here"
}
```

The frontend axios interceptor handles these errors and shows alerts to the user.

## CORS Configuration

Backend allows requests from:
- `http://localhost:3000` (React default port)
- `http://localhost:3001` (alternative port)

To add more origins, update `app.py`:
```python
CORS(app, origins=["http://localhost:3000", "http://your-domain.com"])
```

## Testing the Integration

1. Start backend: `python app.py` (runs on port 8001)
2. Start frontend: `npm start` (runs on port 3000)
3. Update frontend `.env`: `REACT_APP_API_BASE_URL=http://localhost:8001`
4. Test registration → login → book ride flow

