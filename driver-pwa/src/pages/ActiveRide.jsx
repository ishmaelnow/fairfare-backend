import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/fare';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RatingModal } from '../components/RatingModal';
import { RideMap } from '../components/RideMap';
import { Chat } from '../components/Chat';
import './ActiveRide.css';

export default function ActiveRide() {
  const { rideId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!rideId) return;

    loadRide();

    const channel = supabase
      .channel(`ride:${rideId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          setRide(payload.new);
        }
      )
      .subscribe();

    let locationInterval;
    if (navigator.geolocation) {
      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await supabase
              .from('rides')
              .update({
                driver_current_lat: latitude,
                driver_current_lng: longitude,
                last_location_update: new Date().toISOString(),
              })
              .eq('id', rideId);
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      };

      updateLocation();
      locationInterval = setInterval(updateLocation, 10000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [rideId]);

  const loadRide = async () => {
    if (!rideId) return;

    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .maybeSingle();

    if (error || !data) {
      alert('Ride not found');
      navigate('/dashboard');
      return;
    }

    setRide(data);
    setLoading(false);
  };

  const updateRideStatus = async (newStatus) => {
    if (!ride) return;

    setUpdating(true);
    try {
      const updates = { status: newStatus };

      if (newStatus === 'arriving') {
        updates.accepted_at = new Date().toISOString();
      } else if (newStatus === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.fare_final = ride.fare_estimate;
      } else if (newStatus === 'canceled') {
        updates.canceled_at = new Date().toISOString();
        updates.canceled_by = 'driver';
        updates.driver_id = null;
        updates.status = 'matching';
      }

      const { error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', ride.id);

      if (error) throw error;

      if (newStatus === 'completed') {
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('total_trips')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('driver_profiles')
            .update({ total_trips: (profile.total_trips || 0) + 1 })
            .eq('user_id', user?.id);
        }

        setShowRatingModal(true);
      } else if (newStatus === 'canceled') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      alert('Failed to update ride status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRatingSubmit = async (rating, comment) => {
    if (!ride || !user) return;

    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('ride_id', ride.id)
      .maybeSingle();

    if (existingRating) {
      await supabase
        .from('ratings')
        .update({ driver_rating: rating, driver_comment: comment })
        .eq('id', existingRating.id);
    } else {
      await supabase.from('ratings').insert({
        ride_id: ride.id,
        rider_id: ride.rider_id,
        driver_id: user.id,
        driver_rating: rating,
        driver_comment: comment,
      });
    }

    setShowRatingModal(false);
    navigate('/dashboard');
  };

  const handleRatingSkip = () => {
    setShowRatingModal(false);
    navigate('/dashboard');
  };

  if (loading || !ride) {
    return (
      <div className="active-driver-ride-page">
          <div className="active-driver-ride-loading">
            <div className="spinner"></div>
            <p>Loading ride details...</p>
          </div>
        </div>
    );
  }

  const getNextAction = () => {
    switch (ride.status) {
      case 'accepted':
        return {
          label: 'Arriving at Pickup',
          action: () => updateRideStatus('arriving'),
          variant: 'primary',
        };
      case 'arriving':
        return {
          label: 'Start Trip',
          action: () => updateRideStatus('in_progress'),
          variant: 'success',
        };
      case 'in_progress':
        return {
          label: 'Complete Trip',
          action: () => updateRideStatus('completed'),
          variant: 'success',
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  const statusDisplay = {
    accepted: 'Drive to Pickup Location',
    arriving: 'Arriving at Pickup',
    in_progress: 'Trip in Progress',
  }[ride.status] || ride.status;

  return (
    <div className="active-driver-ride-page">
        <div className="active-driver-ride-container">
          <Card className="active-driver-ride-status-card">
            <div className="status-badge-container">
              <div className={`status-badge status-${ride.status}`}>
                <span className="status-icon">🚗</span>
                <span className="status-text">{statusDisplay}</span>
              </div>
            </div>
          </Card>

          <Card className="active-driver-ride-card">
            <h3 className="section-title">Trip Details</h3>
            
            {ride.pickup_lat && ride.pickup_lng && (
              <div className="ride-map-section">
                <RideMap
                  pickupLat={ride.pickup_lat}
                  pickupLng={ride.pickup_lng}
                  dropoffLat={ride.dropoff_lat}
                  dropoffLng={ride.dropoff_lng}
                  driverLat={ride.driver_current_lat || undefined}
                  driverLng={ride.driver_current_lng || undefined}
                  pickupAddress={ride.pickup_address}
                  dropoffAddress={ride.dropoff_address}
                  height="300px"
                />
              </div>
            )}
            
            <div className="ride-locations">
              <div className="ride-location-item">
                <span className="location-icon pickup">📍</span>
                <div className="location-content">
                  <div className="location-label">Pickup</div>
                  <div className="location-address">{ride.pickup_address}</div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${ride.pickup_lat},${ride.pickup_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-link"
                  >
                    Navigate to Pickup
                  </a>
                </div>
              </div>
              <div className="ride-location-divider"></div>
              <div className="ride-location-item">
                <span className="location-icon dropoff">📍</span>
                <div className="location-content">
                  <div className="location-label">Dropoff</div>
                  <div className="location-address">{ride.dropoff_address}</div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${ride.dropoff_lat},${ride.dropoff_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-link"
                  >
                    Navigate to Dropoff
                  </a>
                </div>
              </div>
            </div>

            <div className="ride-fare-section">
              <div className="fare-row">
                <span className="fare-label">Estimated Fare</span>
                <span className="fare-amount">{formatCurrency(ride.fare_estimate)}</span>
              </div>
              {ride.distance_miles && (
                <div className="fare-row">
                  <span className="fare-label">Distance</span>
                  <span className="fare-value">{ride.distance_miles.toFixed(2)} miles</span>
                </div>
              )}
            </div>
          </Card>

          {nextAction && (
            <Button
              onClick={nextAction.action}
              variant={nextAction.variant}
              fullWidth
              disabled={updating}
              size="lg"
            >
              {updating ? 'Updating...' : nextAction.label}
            </Button>
          )}

          <Card className="active-driver-ride-card">
            <div className="chat-header-section">
              <h3 className="section-title">Chat with Rider</h3>
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="secondary"
                size="sm"
              >
                💬 {showChat ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </div>
            {showChat && (
              <div className="chat-container-section">
                <Chat
                  rideId={ride.id}
                  recipientId={ride.rider_id}
                  recipientType="rider"
                  title="Chat with Rider"
                />
              </div>
            )}
          </Card>

          {ride.status !== 'completed' && (
            <Button
              onClick={() => updateRideStatus('canceled')}
              variant="danger"
              fullWidth
              disabled={updating}
            >
              Cancel Ride
            </Button>
          )}

          {showRatingModal && (
            <RatingModal
              title="Rate Your Rider"
              subtitle="How was your experience with this rider?"
              onSubmit={handleRatingSubmit}
              onSkip={handleRatingSkip}
            />
          )}
        </div>
    </div>
  );
}


