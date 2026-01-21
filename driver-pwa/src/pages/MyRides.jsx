import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './MyRides.css';

const MyRides = ({ onLogout }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await api.get('/drivers/my-rides');
      setRides(response.data.rides || []);
    } catch (err) {
      if (err.response?.status === 404) {
        // Driver profile not found, no rides
        setRides([]);
      } else {
        console.error('Error fetching rides:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-rides-page">
      <div className="header">
        <h1>My Rides</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">Dashboard</button>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>
      
      <div className="container">
        {loading && <div className="loading">Loading rides...</div>}
        
        {rides.length === 0 && !loading && (
          <div className="card">
            <p>No rides assigned yet.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        )}
        
        {rides.map((ride) => (
          <div key={ride.id} className="card ride-card">
            <div className="ride-header">
              <h3>Ride #{ride.id}</h3>
              <span className={`status status-${ride.status}`}>{ride.status}</span>
            </div>
            <div className="ride-details">
              <p><strong>Rider:</strong> {ride.riderName}</p>
              <p><strong>Phone:</strong> {ride.phoneNumber}</p>
              <p><strong>Email:</strong> {ride.email}</p>
              <p><strong>From:</strong> {ride.pickupLocation}</p>
              <p><strong>To:</strong> {ride.dropoffLocation}</p>
              <p><strong>Pickup Time:</strong> {new Date(ride.pickupTime).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRides;

