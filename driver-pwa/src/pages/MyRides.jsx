import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './MyRides.css';

const MyRides = ({ onLogout }) => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRides();
    }
  }, [user]);

  const fetchRides = async () => {
    if (!user) return;

    try {
      // Get driver profile first
      const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!driverProfile) {
        setRides([]);
        setLoading(false);
        return;
      }

      // Get all rides for this driver
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          rider:profiles!rides_rider_id_fkey(full_name, email, phone)
        `)
        .eq('driver_id', driverProfile.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      // Format rides data
      const formattedRides = (data || []).map(ride => ({
        id: ride.id,
        status: ride.status,
        riderName: ride.rider?.full_name || 'Unknown',
        email: ride.rider?.email || '',
        phoneNumber: ride.rider?.phone || '',
        pickupLocation: ride.pickup_address,
        dropoffLocation: ride.dropoff_address,
        pickupTime: ride.requested_at,
      }));

      setRides(formattedRides);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setRides([]);
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

