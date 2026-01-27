import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { searchAddress } from '../lib/geocoding';
import { calculateFare, calculateDistance, formatCurrency } from '../lib/fare';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import Navbar from '../components/Navbar';
import './BookRide.css';

const BookRide = ({ onLogout }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
  });
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for active ride on mount
  useEffect(() => {
    if (user) {
      checkActiveRide();
    }
  }, [user]);

  // Calculate fare estimate when both locations are selected
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      const dist = calculateDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        dropoffCoords.lat,
        dropoffCoords.lng
      );
      setDistance(dist);
      // Estimate duration: roughly 2 minutes per mile
      const estimatedDuration = Math.ceil(dist * 2);
      const fare = calculateFare(dist, estimatedDuration);
      setFareEstimate(fare);
    } else {
      setFareEstimate(null);
      setDistance(null);
    }
  }, [pickupCoords, dropoffCoords]);

  const checkActiveRide = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('rides')
      .select('*')
      .eq('rider_id', user.id)
      .in('status', ['requested', 'matching', 'accepted', 'arriving', 'in_progress'])
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      navigate(`/ride/${data.id}`);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    // Geocode addresses as user types
    if (name === 'pickupLocation' && value.length > 3) {
      const suggestions = await searchAddress(value);
      setPickupSuggestions(suggestions);
      setShowPickupSuggestions(suggestions.length > 0);
      
      // Auto-select if only one suggestion
      if (suggestions.length === 1) {
        selectPickup(suggestions[0]);
      }
    } else if (name === 'pickupLocation') {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
      if (value.length === 0) {
        setPickupCoords(null);
      }
    }

    if (name === 'dropoffLocation' && value.length > 3) {
      const suggestions = await searchAddress(value);
      setDropoffSuggestions(suggestions);
      setShowDropoffSuggestions(suggestions.length > 0);
      
      // Auto-select if only one suggestion
      if (suggestions.length === 1) {
        selectDropoff(suggestions[0]);
      }
    } else if (name === 'dropoffLocation') {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
      if (value.length === 0) {
        setDropoffCoords(null);
      }
    }
  };

  const selectPickup = (suggestion) => {
    setFormData({ ...formData, pickupLocation: suggestion.address });
    setPickupCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);
  };

  const selectDropoff = (suggestion) => {
    setFormData({ ...formData, dropoffLocation: suggestion.address });
    setDropoffCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setShowDropoffSuggestions(false);
    setDropoffSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to book a ride');
      return;
    }

    if (!formData.pickupLocation || !formData.dropoffLocation) {
      setError('Please enter both pickup and dropoff locations');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Geocode addresses if coordinates aren't set
      let pickup = pickupCoords;
      let dropoff = dropoffCoords;

      if (!pickup) {
        const pickupSuggestions = await searchAddress(formData.pickupLocation);
        if (pickupSuggestions.length === 0) {
          throw new Error('Could not find pickup location. Please select from suggestions.');
        }
        pickup = { lat: pickupSuggestions[0].lat, lng: pickupSuggestions[0].lng };
      }

      if (!dropoff) {
        const dropoffSuggestions = await searchAddress(formData.dropoffLocation);
        if (dropoffSuggestions.length === 0) {
          throw new Error('Could not find dropoff location. Please select from suggestions.');
        }
        dropoff = { lat: dropoffSuggestions[0].lat, lng: dropoffSuggestions[0].lng };
      }

      const pickupTime = formData.pickupTime 
        ? new Date(formData.pickupTime).toISOString()
        : new Date().toISOString();

      // Calculate fare and distance
      const dist = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const estimatedDuration = Math.ceil(dist * 2);
      const fare = calculateFare(dist, estimatedDuration);

      const { data, error: insertError } = await supabase
        .from('rides')
        .insert({
          rider_id: user.id,
          pickup_address: formData.pickupLocation,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          dropoff_address: formData.dropoffLocation,
          dropoff_lat: dropoff.lat,
          dropoff_lng: dropoff.lng,
          fare_estimate: fare,
          distance_miles: dist,
          duration_minutes: estimatedDuration,
          status: 'matching',
          requested_at: pickupTime,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess('Ride booked successfully! Redirecting...');
      
      // Reset form
      setFormData({
        pickupLocation: '',
        dropoffLocation: '',
        pickupTime: '',
      });
      setPickupCoords(null);
      setDropoffCoords(null);
      setFareEstimate(null);
      setDistance(null);
      
      // Navigate to active ride page
      if (data) {
        setTimeout(() => navigate(`/ride/${data.id}`), 1500);
      } else {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="book-ride-page">
        <div className="book-ride-container">
          <Card className="book-ride-card">
            <h1 className="book-ride-title">Book a Ride</h1>
            
            {error && <div className="book-ride-error">{error}</div>}
            {success && <div className="book-ride-success">{success}</div>}
            
            {user && (
              <div className="book-ride-user-info">
                <span className="user-label">Booking as:</span>
                <span className="user-name">{user.full_name || user.email}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="book-ride-form">
              <div className="book-ride-form-group">
                <label className="book-ride-label">Pickup Location</label>
                <div className="book-ride-input-wrapper">
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    onFocus={() => setShowPickupSuggestions(pickupSuggestions.length > 0)}
                    required
                    placeholder="123 Main St, City, State"
                    className="book-ride-input"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="book-ride-suggestions">
                      {pickupSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectPickup(suggestion)}
                          className="book-ride-suggestion-item"
                        >
                          {suggestion.address}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="book-ride-form-group">
                <label className="book-ride-label">Dropoff Location</label>
                <div className="book-ride-input-wrapper">
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleChange}
                    onFocus={() => setShowDropoffSuggestions(dropoffSuggestions.length > 0)}
                    required
                    placeholder="456 Oak Ave, City, State"
                    className="book-ride-input"
                  />
                  {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                    <div className="book-ride-suggestions">
                      {dropoffSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectDropoff(suggestion)}
                          className="book-ride-suggestion-item"
                        >
                          {suggestion.address}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fare Estimate Display */}
              {fareEstimate && distance && (
                <div className="book-ride-estimate">
                  <div className="estimate-row">
                    <span className="estimate-label">Distance:</span>
                    <span className="estimate-value">{distance.toFixed(2)} miles</span>
                  </div>
                  <div className="estimate-row">
                    <span className="estimate-label">Estimated Fare:</span>
                    <span className="estimate-value estimate-fare">{formatCurrency(fareEstimate)}</span>
                  </div>
                </div>
              )}
              
              <div className="book-ride-form-group">
                <label className="book-ride-label">Pickup Time (Optional)</label>
                <input
                  type="datetime-local"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  className="book-ride-input"
                />
                <small className="book-ride-hint">Leave blank for immediate ride</small>
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={loading || !user || !formData.pickupLocation || !formData.dropoffLocation}
              >
                {loading ? 'Booking...' : 'Book Ride'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BookRide;
