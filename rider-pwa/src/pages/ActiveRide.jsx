import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RatingModal } from '../components/RatingModal';
import { RideMap } from '../components/RideMap';
import { Chat } from '../components/Chat';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './ActiveRide.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export default function ActiveRide() {
  const { rideId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const rideRef = useRef(null);

  useEffect(() => {
    rideRef.current = ride;
  }, [ride]);

  useEffect(() => {
    if (!rideId) return;

    loadRide();

    const pollInterval = setInterval(() => {
      const currentRide = rideRef.current;
      if (currentRide && !currentRide.driver_id && (currentRide.status === 'matching' || currentRide.status === 'requested')) {
        loadRide(false);
      }
    }, 1000);

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
          const updatedRide = payload.new;
          
          setRide((currentRide) => {
            const previousDriverId = currentRide?.driver_id;
            
            if (updatedRide.driver_id && updatedRide.driver_id !== previousDriverId) {
              loadDriver(updatedRide.driver_id).then(() => {
                setShowChat(true);
              }).catch(err => {
                console.error('Error loading driver:', err);
              });
            } else if (!updatedRide.driver_id && previousDriverId) {
              setDriver(null);
              setShowChat(false);
            }
            
            return updatedRide;
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  useEffect(() => {
    if (ride?.driver_id && (!driver || driver.id !== ride.driver_id)) {
      loadDriver(ride.driver_id).then(() => {
        setShowChat(true);
      }).catch(err => {
        console.error('Failed to load driver profile:', err);
      });
    } else if (ride && !ride.driver_id && driver) {
      setDriver(null);
      setShowChat(false);
    }
  }, [ride?.driver_id, ride?.id]);

  const loadRide = useCallback(async (showLoading = true) => {
    if (!rideId) return;

    if (showLoading) setLoading(true);

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

    const previousDriverId = rideRef.current?.driver_id;
    
    setRide(data);
    rideRef.current = data;
    
    if (data.driver_id) {
      try {
        await loadDriver(data.driver_id);
        setShowChat(true);
      } catch (err) {
        console.error('Error loading driver:', err);
      }
    } else {
      setShowChat(false);
      if (previousDriverId) {
        setDriver(null);
      }
    }

    if (data.status === 'completed' && user) {
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('rider_rating')
        .eq('ride_id', rideId)
        .maybeSingle();

      if (existingRating && existingRating.rider_rating !== null) {
        setHasRated(true);
      } else {
        setShowRatingModal(true);
      }
    }

    if (showLoading) setLoading(false);
  }, [rideId, navigate, user]);

  const loadDriver = async (driverId) => {
    const { data } = await supabase
      .from('driver_profiles')
      .select('*, user:profiles!driver_profiles_user_id_fkey(full_name)')
      .eq('id', driverId)
      .maybeSingle();

    if (data) {
      setDriver(data);
    }
  };

  const handleCancel = async () => {
    if (!ride || !user) return;

    if (ride.status !== 'matching' && ride.status !== 'requested') {
      alert('Ride cannot be canceled at this stage');
      return;
    }

    if (!confirm('Are you sure you want to cancel this ride?')) return;

    setCanceling(true);
    try {
      const { error } = await supabase
        .from('rides')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          canceled_by: 'rider',
        })
        .eq('id', ride.id);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error canceling ride:', error);
      alert('Failed to cancel ride');
    } finally {
      setCanceling(false);
    }
  };

  const handleRatingSubmit = async (rating, comment) => {
    if (!ride || !user || !ride.driver_id) return;

    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('ride_id', ride.id)
      .maybeSingle();

    if (existingRating) {
      await supabase
        .from('ratings')
        .update({ rider_rating: rating, rider_comment: comment })
        .eq('id', existingRating.id);
    } else {
      await supabase.from('ratings').insert({
        ride_id: ride.id,
        rider_id: user.id,
        driver_id: ride.driver_id,
        rider_rating: rating,
        rider_comment: comment,
      });
    }

    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rider_rating')
      .eq('driver_id', ride.driver_id)
      .not('rider_rating', 'is', null);

    if (allRatings && allRatings.length > 0) {
      const avgRating =
        allRatings.reduce((sum, r) => sum + (r.rider_rating || 0), 0) / allRatings.length;
      await supabase
        .from('driver_profiles')
        .update({ rating_avg: avgRating })
        .eq('id', ride.driver_id);
    }

    setShowRatingModal(false);
    setHasRated(true);
  };

  const handleRatingSkip = () => {
    setShowRatingModal(false);
  };

  const { hasDriver, effectiveStatus, statusInfo } = useMemo(() => {
    if (!ride) {
      return {
        hasDriver: false,
        effectiveStatus: 'matching',
        statusInfo: {
          title: 'Loading...',
          description: 'Loading ride details...',
          color: 'gray'
        }
      };
    }
    
    const hasDriverValue = ride.driver_id != null && ride.driver_id !== '';
    
    let effectiveStatusValue = ride.status;
    if (hasDriverValue && (ride.status === 'matching' || ride.status === 'requested')) {
      effectiveStatusValue = 'accepted';
    }
    
    const statusInfoMap = {
      matching: {
        title: 'Finding Your Driver',
        description: 'Searching for nearby available drivers...',
        color: 'blue',
      },
      requested: {
        title: 'Finding Your Driver',
        description: 'Searching for nearby available drivers...',
        color: 'blue',
      },
      accepted: {
        title: 'Driver Assigned',
        description: 'Your driver is on the way to pick you up',
        color: 'green',
      },
      arriving: {
        title: 'Driver Arriving',
        description: 'Your driver is arriving at pickup location',
        color: 'green',
      },
      in_progress: {
        title: 'Trip in Progress',
        description: 'Enjoy your ride!',
        color: 'blue',
      },
    };
    
    const statusInfoValue = statusInfoMap[effectiveStatusValue] || { 
      title: `Status: ${effectiveStatusValue}`, 
      description: 'Ride in progress', 
      color: 'gray' 
    };
    
    return {
      hasDriver: hasDriverValue,
      effectiveStatus: effectiveStatusValue,
      statusInfo: statusInfoValue
    };
  }, [ride]);

  if (loading || !ride) {
    return (
      <div className="active-ride-page">
        <div className="active-ride-loading">
          <div className="spinner"></div>
          <p>Loading ride details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-ride-page">
        <div className="active-ride-container">
          <Card className="active-ride-status-card">
            <div className="active-ride-status-header">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadRide()}
              >
                🔄 Refresh
              </Button>
            </div>
            <div className="active-ride-status-content">
              <div className={`active-ride-status-icon status-${statusInfo.color}`}>
                {(effectiveStatus === 'matching' || effectiveStatus === 'requested') ? (
                  <span className="status-icon-pulse">⏰</span>
                ) : (
                  <span>🚗</span>
                )}
              </div>
              <h3 className="active-ride-status-title">{statusInfo.title}</h3>
              <p className="active-ride-status-description">{statusInfo.description}</p>
            </div>
          </Card>

          {ride.driver_id && (
            <Card className="active-ride-driver-card">
              <h4 className="active-ride-section-title">Your Driver</h4>
              {driver ? (
                <>
                  <div className="active-ride-driver-info">
                    <div className="active-ride-driver-avatar">👤</div>
                    <div className="active-ride-driver-details">
                      <h5 className="active-ride-driver-name">
                        {driver.user?.full_name || 'Driver'}
                      </h5>
                      <div className="active-ride-driver-rating">
                        <span>⭐</span>
                        <span className="rating-value">{(driver.rating_avg || 0).toFixed(1)}</span>
                        <span className="rating-count">({driver.total_trips || 0} trips)</span>
                      </div>
                    </div>
                  </div>
                  <div className="active-ride-vehicle-info">
                    <div className="active-ride-vehicle-item">
                      <span>🚙</span>
                      <span className="vehicle-details">
                        {driver.vehicle_color} {driver.vehicle_make} {driver.vehicle_model}
                        {driver.vehicle_year && ` (${driver.vehicle_year})`}
                      </span>
                    </div>
                    <div className="active-ride-vehicle-plate">
                      <span className="plate-label">License Plate:</span>
                      <span className="plate-value">{driver.vehicle_plate}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="active-ride-loading-driver">
                  <div className="spinner"></div>
                  <p>Loading driver information...</p>
                </div>
              )}

              {ride.driver_current_lat && ride.driver_current_lng && (
                <div className="active-ride-driver-location">
                  <div className="active-ride-location-header">
                    <div className="active-ride-location-label">
                      <span>📍</span>
                      <span>Driver Location</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/${ride.driver_current_lat},${ride.driver_current_lng}/${ride.pickup_lat},${ride.pickup_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="active-ride-maps-link"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                  {ride.last_location_update && (
                    <div className="active-ride-location-update">
                      Updated {new Date(ride.last_location_update).toLocaleTimeString()}
                    </div>
                  )}
                  <RideMap
                    pickupLat={ride.pickup_lat}
                    pickupLng={ride.pickup_lng}
                    dropoffLat={ride.dropoff_lat}
                    dropoffLng={ride.dropoff_lng}
                    driverLat={ride.driver_current_lat}
                    driverLng={ride.driver_current_lng}
                    pickupAddress={ride.pickup_address}
                    dropoffAddress={ride.dropoff_address}
                    height="300px"
                  />
                </div>
              )}
            </Card>
          )}

          <Card className="active-ride-trip-card">
            <h4 className="active-ride-section-title">Trip Details</h4>
            
            {ride.pickup_lat && ride.pickup_lng && (
              <div className="active-ride-map-section">
                <RideMap
                  pickupLat={ride.pickup_lat}
                  pickupLng={ride.pickup_lng}
                  dropoffLat={ride.dropoff_lat}
                  dropoffLng={ride.dropoff_lng}
                  driverLat={ride.driver_current_lat || undefined}
                  driverLng={ride.driver_current_lng || undefined}
                  pickupAddress={ride.pickup_address}
                  dropoffAddress={ride.dropoff_address}
                  height="250px"
                />
              </div>
            )}
            
            <div className="active-ride-locations">
              <div className="active-ride-location-item">
                <span className="location-icon pickup">📍</span>
                <div className="location-content">
                  <div className="location-label">Pickup</div>
                  <div className="location-address">{ride.pickup_address}</div>
                </div>
              </div>
              <div className="active-ride-location-divider"></div>
              <div className="active-ride-location-item">
                <span className="location-icon dropoff">📍</span>
                <div className="location-content">
                  <div className="location-label">Dropoff</div>
                  <div className="location-address">{ride.dropoff_address}</div>
                </div>
              </div>
            </div>

            <div className="active-ride-fare">
              <span className="fare-label">Estimated Fare</span>
              <span className="fare-amount">{formatCurrency(ride.fare_estimate)}</span>
            </div>
          </Card>

          {ride.driver_id && (
            <Card className="active-ride-chat-card">
              <div className="active-ride-chat-header">
                <h4 className="active-ride-section-title">Chat with Driver</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                >
                  💬 {showChat ? 'Hide Chat' : 'Show Chat'}
                </Button>
              </div>
              {showChat && driver ? (
                <div className="active-ride-chat-container">
                  <Chat
                    rideId={ride.id}
                    recipientId={driver.user_id}
                    recipientType="driver"
                    title="Chat with Driver"
                  />
                </div>
              ) : showChat ? (
                <div className="active-ride-loading-chat">
                  <div className="spinner"></div>
                  <p>Loading chat...</p>
                </div>
              ) : null}
            </Card>
          )}

          {(effectiveStatus === 'matching' || effectiveStatus === 'requested') && (
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={canceling}
              fullWidth
            >
              {canceling ? 'Canceling...' : 'Cancel Ride'}
            </Button>
          )}

          {showRatingModal && driver && (
            <RatingModal
              title="Rate Your Driver"
              subtitle={`How was your ride with ${driver.user?.full_name || 'your driver'}?`}
              onSubmit={handleRatingSubmit}
              onSkip={handleRatingSkip}
            />
          )}
        </div>
      </div>
  );
}


