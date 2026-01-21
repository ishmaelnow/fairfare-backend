import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './BookRide.css';

const BookRide = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    riderName: '',
    phoneNumber: '',
    email: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/rides', formData);
      setSuccess('Ride booked successfully!');
      
      // Reset form
      setFormData({
        riderName: '',
        phoneNumber: '',
        email: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupTime: '',
      });
      
      // Show driver info if assigned
      if (response.data.ride.driverId) {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-ride-page">
      <div className="header">
        <h1>Book a Ride</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">My Rides</button>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>
      
      <div className="container">
        <div className="card">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="riderName"
                value={formData.riderName}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="+1234567890"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>
            
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                required
                placeholder="123 Main St, City"
              />
            </div>
            
            <div className="form-group">
              <label>Dropoff Location</label>
              <input
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleChange}
                required
                placeholder="456 Oak Ave, City"
              />
            </div>
            
            <div className="form-group">
              <label>Pickup Time</label>
              <input
                type="datetime-local"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Book Ride'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookRide;

