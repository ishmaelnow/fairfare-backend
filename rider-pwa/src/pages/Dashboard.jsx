import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await api.get('/users/rides');
      setRides(response.data.rides || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="header">
        <h1>My Rides</h1>
        <div>
          <button onClick={() => navigate('/book-ride')} className="btn-primary">Book New Ride</button>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>
      
      <div className="container">
        {loading && <div className="loading">Loading rides...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && rides.length === 0 && (
          <div className="card">
            <p>No rides yet. Book your first ride!</p>
            <button onClick={() => navigate('/book-ride')} className="btn btn-primary">
              Book a Ride
            </button>
          </div>
        )}
        
        {rides.map((ride) => (
          <div key={ride._id} className="card ride-card">
            <div className="ride-header">
              <h3>Ride #{ride._id}</h3>
              <span className={`status status-${ride.status}`}>{ride.status}</span>
            </div>
            
            <div className="ride-details">
              <div className="detail">
                <strong>From:</strong> {ride.pickupLocation}
              </div>
              <div className="detail">
                <strong>To:</strong> {ride.dropoffLocation}
              </div>
              <div className="detail">
                <strong>Pickup Time:</strong> {new Date(ride.pickupTime).toLocaleString()}
              </div>
              {ride.driverId && (
                <div className="detail">
                  <strong>Driver Assigned:</strong> Yes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

