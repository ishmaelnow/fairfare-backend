import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './Wallet.css';

const PLATFORM_FEE = 0.20; // 20% platform cut
const DRIVER_SHARE = 1 - PLATFORM_FEE;

export default function Wallet() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) loadEarnings();
  }, [user]);

  const loadEarnings = async () => {
    try {
      // Get this driver's profile row
      const { data: profile, error: profileErr } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileErr || !profile) {
        setError('Driver profile not found.');
        return;
      }

      // Fetch all completed rides driven by this driver
      const { data: rides, error: ridesErr } = await supabase
        .from('rides')
        .select('id, pickup_address, dropoff_address, fare_final, fare_estimate, updated_at, requested_at')
        .eq('driver_id', profile.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

      if (ridesErr) throw ridesErr;

      setEarnings(rides || []);
    } catch (err) {
      setError(err.message || 'Failed to load earnings.');
    } finally {
      setLoading(false);
    }
  };

  const fareFor = (ride) => ride.fare_final ?? ride.fare_estimate ?? 0;
  const driverEarning = (ride) => fareFor(ride) * DRIVER_SHARE;

  const totalEarned = earnings.reduce((sum, r) => sum + driverEarning(r), 0);

  const now = new Date();
  const thisMonthEarned = earnings
    .filter((r) => {
      const d = new Date(r.updated_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, r) => sum + driverEarning(r), 0);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const shorten = (addr) => (addr?.length > 32 ? addr.slice(0, 32) + '…' : addr);

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="wallet-loading">
          <div className="spinner"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <h1 className="wallet-title">My Wallet</h1>

        {error && <div className="wallet-error">{error}</div>}

        <div className="wallet-stats">
          <div className="wallet-stat-card wallet-stat-total">
            <span className="wallet-stat-label">Total Earned</span>
            <span className="wallet-stat-value">${totalEarned.toFixed(2)}</span>
          </div>
          <div className="wallet-stat-card">
            <span className="wallet-stat-label">This Month</span>
            <span className="wallet-stat-value">${thisMonthEarned.toFixed(2)}</span>
          </div>
          <div className="wallet-stat-card">
            <span className="wallet-stat-label">Completed Rides</span>
            <span className="wallet-stat-value">{earnings.length}</span>
          </div>
        </div>

        <div className="wallet-breakdown-header">
          <h2>Earnings Breakdown</h2>
          <span className="wallet-fee-note">You receive {Math.round(DRIVER_SHARE * 100)}% of each fare</span>
        </div>

        {earnings.length === 0 ? (
          <div className="wallet-empty">
            <p>No completed rides yet. Earnings will appear here once you complete a ride.</p>
          </div>
        ) : (
          <div className="wallet-rides">
            {earnings.map((ride) => (
              <div key={ride.id} className="wallet-ride-row">
                <div className="wallet-ride-info">
                  <span className="wallet-ride-date">{formatDate(ride.updated_at)}</span>
                  <span className="wallet-ride-route">
                    {shorten(ride.pickup_address)} → {shorten(ride.dropoff_address)}
                  </span>
                </div>
                <div className="wallet-ride-amounts">
                  <span className="wallet-ride-fare">Fare: ${fareFor(ride).toFixed(2)}</span>
                  <span className="wallet-ride-earning">+${driverEarning(ride).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
