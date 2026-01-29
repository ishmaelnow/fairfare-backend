import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/fare';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RideMap } from '../components/RideMap';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!profile) return;

    checkActiveRide();
    if (profile.is_available) {
      loadAvailableRides();
      subscribeToNewRides();
      startLocationTracking();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [profile]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      navigate('/driver-signup');
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const checkActiveRide = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', profile.id)
      .in('status', ['accepted', 'arriving', 'in_progress'])
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      navigate(`/ride/${data.id}`);
    }
  };

  const loadAvailableRides = async () => {
    if (!profile) return;

    let query = supabase
      .from('rides')
      .select('*')
      .in('status', ['matching', 'requested'])
      .is('driver_id', null);

    if (profile.vehicle_type) {
      query = query.or(`vehicle_type.is.null,vehicle_type.eq.${profile.vehicle_type}`);
    }

    const { data } = await query
      .order('requested_at', { ascending: true })
      .limit(20);

    const now = new Date();
    const availableRides = (data || []).filter((ride) => {
      if (ride.scheduled_at) {
        const scheduledTime = new Date(ride.scheduled_at);
        return scheduledTime <= now;
      }
      return true;
    }).slice(0, 5);

    setAvailableRides(availableRides);
  };

  const subscribeToNewRides = () => {
    const channel = supabase
      .channel('available-rides')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rides',
        },
        (payload) => {
          const newRide = payload.new;
          if ((newRide.status === 'matching' || newRide.status === 'requested') && !newRide.driver_id) {
            if (!profile) return;
            
            if (newRide.scheduled_at) {
              const scheduledTime = new Date(newRide.scheduled_at);
              const now = new Date();
              if (scheduledTime > now) return;
            }
            
            if (!newRide.vehicle_type || !profile.vehicle_type || newRide.vehicle_type === profile.vehicle_type) {
              setAvailableRides((prev) => [newRide, ...prev].slice(0, 5));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
        },
        (payload) => {
          const updatedRide = payload.new;
          if (updatedRide.status !== 'matching' && updatedRide.status !== 'requested' || updatedRide.driver_id) {
            setAvailableRides((prev) => prev.filter((r) => r.id !== updatedRide.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const toggleAvailability = async () => {
    if (!profile) return;

    // SECURITY: Prevent unapproved drivers from going online
    if (!profile.is_active) {
      alert('Your driver account is pending admin approval. You cannot go online until approved.');
      return;
    }

    setUpdatingAvailability(true);
    try {
      const newAvailability = !profile.is_available;
      const { error } = await supabase
        .from('driver_profiles')
        .update({
          is_available: newAvailability,
          last_location_updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, is_available: newAvailability });

      if (newAvailability) {
        await updateLocation();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const updateLocation = async () => {
    if (!profile) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await supabase
            .from('driver_profiles')
            .update({
              last_location_lat: position.coords.latitude,
              last_location_lng: position.coords.longitude,
              last_location_updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const startLocationTracking = () => {
    if (!profile || !profile.is_available) return;

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          await supabase
            .from('driver_profiles')
            .update({
              last_location_lat: position.coords.latitude,
              last_location_lng: position.coords.longitude,
              last_location_updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        },
        (error) => {
          console.error('Error tracking location:', error);
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  const handleAcceptRide = async (rideId) => {
    if (!profile) {
      alert('Driver profile not loaded. Please refresh the page.');
      return;
    }

    // SECURITY: Prevent unapproved drivers from accepting rides
    if (!profile.is_active) {
      alert('Your driver account is pending admin approval. You cannot accept rides until approved.');
      return;
    }

    try {
      const { data: ride, error: fetchError } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .maybeSingle();

      if (fetchError || !ride) {
        alert('This ride is no longer available');
        loadAvailableRides();
        return;
      }

      if (ride.status !== 'matching' && ride.status !== 'requested') {
        alert('This ride is no longer available');
        loadAvailableRides();
        return;
      }

      if (ride.driver_id && ride.driver_id !== profile.id) {
        alert('This ride has been accepted by another driver');
        loadAvailableRides();
        return;
      }

      const { error } = await supabase
        .from('rides')
        .update({
          driver_id: profile.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', rideId);

      if (error) throw error;

      navigate(`/ride/${rideId}`);
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('Failed to accept ride. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="driver-dashboard-page">
          <div className="driver-dashboard-loading">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="driver-dashboard-page">
          <Card className="driver-dashboard-card">
            <h2>Driver Profile Not Found</h2>
            <p>You need to complete driver registration first.</p>
            <Button onClick={() => navigate('/driver-signup')} variant="primary">
              Complete Registration
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="driver-dashboard-page">
        <div className="driver-dashboard-container">
          <Card className="driver-dashboard-card">
            <div className="driver-dashboard-header">
              <div>
                <h1 className="driver-dashboard-title">Driver Dashboard</h1>
                <p className="driver-dashboard-subtitle">
                  {user?.full_name || 'Driver'}
                </p>
              </div>
              <Button
                onClick={toggleAvailability}
                variant={profile.is_available ? 'danger' : 'primary'}
                disabled={updatingAvailability || !profile.is_active}
                title={!profile.is_active ? 'Pending admin approval' : ''}
              >
                {updatingAvailability
                  ? 'Updating...'
                  : !profile.is_active
                  ? '⏳ Pending Approval'
                  : profile.is_available
                  ? '🟢 Go Offline'
                  : '⚫ Go Online'}
              </Button>
            </div>

            <div className="driver-stats">
              <div className="driver-stat">
                <div className="stat-label">Rating</div>
                <div className="stat-value">
                  ⭐ {(profile.rating_avg || 0).toFixed(1)}
                </div>
              </div>
              <div className="driver-stat">
                <div className="stat-label">Total Trips</div>
                <div className="stat-value">{profile.total_trips || 0}</div>
              </div>
              <div className="driver-stat">
                <div className="stat-label">Status</div>
                <div className={`stat-value status-${profile.is_available ? 'online' : 'offline'}`}>
                  {profile.is_available ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>
            </div>

            {profile.vehicle_make && (
              <div className="driver-vehicle-info">
                <div className="vehicle-label">Vehicle</div>
                <div className="vehicle-details">
                  {profile.vehicle_color} {profile.vehicle_make} {profile.vehicle_model}
                  {profile.vehicle_year && ` (${profile.vehicle_year})`}
                </div>
                <div className="vehicle-plate">Plate: {profile.vehicle_plate}</div>
              </div>
            )}

            {!profile.is_active && (
              <div className="approval-notice" style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '8px',
                color: '#856404'
              }}>
                <strong>⏳ Account Pending Approval</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  Your driver application is being reviewed by an administrator. 
                  You will be notified once your account is approved.
                </p>
              </div>
            )}
          </Card>

          {profile.is_active && profile.is_available ? (
            <Card className="driver-dashboard-card">
              <h2 className="section-title">Available Rides</h2>
              {availableRides.length === 0 ? (
                <div className="no-rides">
                  <p>No rides available at the moment.</p>
                  <p className="hint">Rides will appear here when riders request them.</p>
                </div>
              ) : (
                <div className="available-rides-list">
                  {availableRides.map((ride) => (
                    <div key={ride.id} className="available-ride-card">
                      <div className="ride-card-header">
                        <div>
                          <h3 className="ride-id">Ride #{ride.id.slice(0, 8)}</h3>
                          <div className="ride-fare">
                            {formatCurrency(ride.fare_estimate || 0)}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAcceptRide(ride.id)}
                          variant="primary"
                          size="sm"
                        >
                          Accept
                        </Button>
                      </div>

                      <div className="ride-locations">
                        <div className="ride-location">
                          <span className="location-icon pickup">📍</span>
                          <div className="location-text">
                            <div className="location-label">Pickup</div>
                            <div className="location-address">{ride.pickup_address}</div>
                          </div>
                        </div>
                        <div className="ride-location-divider"></div>
                        <div className="ride-location">
                          <span className="location-icon dropoff">📍</span>
                          <div className="location-text">
                            <div className="location-label">Dropoff</div>
                            <div className="location-address">{ride.dropoff_address}</div>
                          </div>
                        </div>
                      </div>

                      {ride.pickup_lat && ride.pickup_lng && (
                        <div className="ride-map-preview">
                          <RideMap
                            pickupLat={ride.pickup_lat}
                            pickupLng={ride.pickup_lng}
                            dropoffLat={ride.dropoff_lat}
                            dropoffLng={ride.dropoff_lng}
                            pickupAddress={ride.pickup_address}
                            dropoffAddress={ride.dropoff_address}
                            height="200px"
                          />
                        </div>
                      )}

                      {ride.distance_miles && (
                        <div className="ride-distance">
                          Distance: {ride.distance_miles.toFixed(2)} miles
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card className="driver-dashboard-card">
              <div className="offline-message">
                <p>🔴 You're currently offline.</p>
                <p>Go online to receive ride requests.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
