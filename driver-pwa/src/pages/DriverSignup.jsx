import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './DriverSignup.css';

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    vehicleType: '',
    model: '',
    year: '',
    color: '',
    licensePlate: ''
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

    if (!formData.vehicleType || !formData.model || !formData.year || !formData.color || !formData.licensePlate) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/users/become-driver', formData);
      setSuccess('Driver application submitted! Waiting for approval...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-signup-page">
      <div className="container">
        <div className="card">
          <h1>Apply to Become a Driver</h1>
          <p className="subtitle">Fill in your vehicle details</p>
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="">Select vehicle type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="Toyota Camry"
              />
            </div>
            
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="2000"
                max="2025"
                placeholder="2022"
              />
            </div>
            
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="White"
              />
            </div>
            
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                placeholder="ABC-1234"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverSignup;

