import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { searchAddress } from '../lib/geocoding';
import { calculateFare, calculateDistance, formatCurrency } from '../lib/fare';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import PaymentForm from '../components/PaymentForm';
import './BookRide.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
  const [bookingStep, setBookingStep] = useState('form'); // 'form' | 'payment'
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingRide, setPendingRide] = useState(null);
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

    try {
      let pickup = pickupCoords;
      let dropoff = dropoffCoords;

      if (!pickup) {
        const pickupResults = await searchAddress(formData.pickupLocation);
        if (pickupResults.length === 0) throw new Error('Could not find pickup location. Please select from suggestions.');
        pickup = { lat: pickupResults[0].lat, lng: pickupResults[0].lng };
      }

      if (!dropoff) {
        const dropoffResults = await searchAddress(formData.dropoffLocation);
        if (dropoffResults.length === 0) throw new Error('Could not find dropoff location. Please select from suggestions.');
        dropoff = { lat: dropoffResults[0].lat, lng: dropoffResults[0].lng };
      }

      const pickupTime = formData.pickupTime
        ? new Date(formData.pickupTime).toISOString()
        : new Date().toISOString();

      const dist = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const estimatedDuration = Math.ceil(dist * 2);
      const fare = calculateFare(dist, estimatedDuration);

      // Create PaymentIntent before showing payment form
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/.netlify/functions/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fare }),
      });
      const { clientSecret: cs, error: piError } = await res.json();
      if (piError) throw new Error(piError);

      setClientSecret(cs);
      setPendingRide({
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
      });
      setBookingStep('payment');
    } catch (err) {
      setError(err.message || 'Failed to initiate booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const { data, error: insertError } = await supabase
        .from('rides')
        .insert({ ...pendingRide, payment_intent_id: paymentIntentId, payment_status: 'paid' })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/ride/${data.id}`);
    } catch (err) {
      setError(err.message || 'Payment succeeded but failed to create ride. Contact support.');
      setBookingStep('form');
    }
  };

  if (bookingStep === 'payment' && clientSecret) {
    return (
      <div className="book-ride-page">
        <div className="book-ride-container">
          <Card className="book-ride-card">
            <h1 className="book-ride-title">Complete Payment</h1>
            {error && <div className="book-ride-error">{error}</div>}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                fare={pendingRide.fare_estimate}
                onSuccess={handlePaymentSuccess}
                onBack={() => { setBookingStep('form'); setClientSecret(null); }}
              />
            </Elements>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="book-ride-page">
        <div className="book-ride-container">
          <Card className="book-ride-card">
            <h1 className="book-ride-title">Book a Ride</h1>

            {error && <div className="book-ride-error">{error}</div>}
            
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
                {loading ? 'Preparing payment...' : 'Continue to Payment →'}
              </Button>
            </form>
          </Card>
        </div>
        <p className="book-ride-map-attribution">
          Map ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
      </div>
  );
};

export default BookRide;
