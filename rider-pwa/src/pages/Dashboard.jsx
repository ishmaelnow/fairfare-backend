import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRides();
    }
  }, [user]);

  const fetchRides = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('rides')
        .select('*')
        .eq('rider_id', user.id)
        .order('requested_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRides(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load rides');
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
          <div key={ride.id} className="card ride-card">
            <div className="ride-header">
              <h3>Ride #{ride.id.slice(0, 8)}</h3>
              <span className={`status status-${ride.status}`}>{ride.status}</span>
            </div>
            
            <div className="ride-details">
              <div className="detail">
                <strong>From:</strong> {ride.pickup_address}
              </div>
              <div className="detail">
                <strong>To:</strong> {ride.dropoff_address}
              </div>
              <div className="detail">
                <strong>Requested:</strong> {new Date(ride.requested_at).toLocaleString()}
              </div>
              {ride.driver_id && (
                <div className="detail">
                  <strong>Driver Assigned:</strong> Yes
                </div>
              )}
              {ride.fare && (
                <div className="detail">
                  <strong>Fare:</strong> ${ride.fare.toFixed(2)}
                </div>
              )}
              <div className="detail">
                <button 
                  onClick={() => navigate(`/ride/${ride.id}`)}
                  className="btn btn-primary"
                  style={{ marginTop: '10px' }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

