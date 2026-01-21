import { useState, useEffect } from 'react';
import api from '../config/api';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    try {
      await api.patch(`/drivers/${driverId}/approve`);
      alert('Driver approved successfully!');
      fetchDrivers();
    } catch (err) {
      alert('Failed to approve driver');
    }
  };

  const handleToggleAvailability = async (driverId, currentStatus) => {
    try {
      await api.patch(`/drivers/${driverId}/availability`, {
        isAvailable: !currentStatus
      });
      alert('Driver availability updated!');
      fetchDrivers();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleRemove = async (driverId) => {
    if (!window.confirm('Are you sure you want to remove this driver?')) return;
    
    try {
      await api.delete(`/drivers/${driverId}`);
      alert('Driver removed successfully!');
      fetchDrivers();
    } catch (err) {
      alert('Failed to remove driver');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout} className="btn-danger">Logout</button>
      </div>
      
      <div className="container">
        {loading && <div className="loading">Loading drivers...</div>}
        {error && <div className="error">{error}</div>}
        
        <div className="card">
          <h2>Driver Management</h2>
          <p className="subtitle">Manage all registered drivers</p>
          
          {drivers.length === 0 && !loading && (
            <p>No drivers registered yet.</p>
          )}
          
          {drivers.map((driver) => (
            <div key={driver._id} className="driver-card">
              <div className="driver-info">
                <h3>{driver.name}</h3>
                <p><strong>Email:</strong> {driver.email}</p>
                <p><strong>Vehicle:</strong> {driver.vehicle}</p>
                <p><strong>License Plate:</strong> {driver.licensePlate}</p>
                <div className="status-badges">
                  <span className={`badge ${driver.isApproved ? 'approved' : 'pending'}`}>
                    {driver.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  {driver.isApproved && (
                    <span className={`badge ${driver.isAvailable ? 'available' : 'busy'}`}>
                      {driver.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="driver-actions">
                {!driver.isApproved ? (
                  <>
                    <button 
                      onClick={() => handleApprove(driver._id)}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRemove(driver._id)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleToggleAvailability(driver._id, driver.isAvailable)}
                      className={`btn ${driver.isAvailable ? 'btn-danger' : 'btn-success'}`}
                    >
                      {driver.isAvailable ? 'Mark Busy' : 'Mark Available'}
                    </button>
                    <button 
                      onClick={() => handleRemove(driver._id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

