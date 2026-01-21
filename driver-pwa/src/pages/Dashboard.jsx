import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [assignedRides, setAssignedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverInfo();
  }, []);

  useEffect(() => {
    // Fetch rides when driver info is loaded
    if (driverInfo) {
      fetchAssignedRides();
    }
  }, [driverInfo]);

  const fetchDriverInfo = async () => {
    try {
      const response = await api.get('/drivers/me');
      setDriverInfo(response.data);
    } catch (err) {
      // If 404, user is not a driver yet
      if (err.response?.status === 404) {
        setDriverInfo(null);
      } else {
        console.error('Error fetching driver info:', err);
      }
    }
  };

  const fetchAssignedRides = async () => {
    try {
      const response = await api.get('/drivers/my-rides');
      setAssignedRides(response.data.rides || []);
    } catch (err) {
      if (err.response?.status === 404) {
        // Driver profile not found, no rides
        setAssignedRides([]);
      } else {
        console.error('Error fetching rides:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!driverInfo) return;
    
    try {
      await api.patch(`/drivers/${driverInfo._id}/availability`, {
        isAvailable: !driverInfo.isAvailable
      });
      setDriverInfo({ ...driverInfo, isAvailable: !driverInfo.isAvailable });
      
      // Refresh assigned rides after toggling availability
      // (in case a ride was assigned when driver went online)
      setTimeout(() => {
        fetchAssignedRides();
      }, 1000);
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="header">
        <h1>Driver Dashboard</h1>
        <div>
          <button onClick={() => navigate('/my-rides')} className="btn-secondary">My Rides</button>
          {!driverInfo && (
            <button onClick={() => navigate('/driver-signup')} className="btn-primary">
              Apply as Driver
            </button>
          )}
          {driverInfo?.isApproved && (
            <button 
              onClick={toggleAvailability}
              className={`btn ${driverInfo.isAvailable ? 'btn-danger' : 'btn-success'}`}
            >
              {driverInfo.isAvailable ? 'Go Offline' : 'Go Online'}
            </button>
          )}
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>
      
      <div className="container">
        {loading && <div className="loading">Loading...</div>}
        
        {driverInfo && (
          <div className="card">
            <h2>Driver Status</h2>
            <div className="driver-status">
              <p><strong>Name:</strong> {driverInfo.name}</p>
              <p><strong>Vehicle:</strong> {driverInfo.vehicle}</p>
              <p><strong>Status:</strong> 
                <span className={`status status-${driverInfo.isApproved ? 'approved' : 'pending'}`}>
                  {driverInfo.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </p>
              {driverInfo.isApproved && (
                <div className="availability-toggle">
                  <p><strong>Availability:</strong> 
                    <span className={`status status-${driverInfo.isAvailable ? 'available' : 'busy'}`}>
                      {driverInfo.isAvailable ? 'Available' : 'Offline'}
                    </span>
                  </p>
                  <button 
                    onClick={toggleAvailability}
                    className={`btn ${driverInfo.isAvailable ? 'btn-danger' : 'btn-success'}`}
                  >
                    {driverInfo.isAvailable ? 'Go Offline' : 'Go Online'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!driverInfo && (
          <div className="card">
            <p>You haven't applied as a driver yet.</p>
            <button onClick={() => navigate('/driver-signup')} className="btn btn-primary">
              Apply Now
            </button>
          </div>
        )}
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Assigned Rides</h2>
            <button 
              onClick={fetchAssignedRides} 
              className="btn btn-secondary"
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Refresh
            </button>
          </div>
          {assignedRides.length === 0 ? (
            <p>No rides assigned yet.</p>
          ) : (
            assignedRides.map((ride) => (
              <div key={ride.id} className="ride-item">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

