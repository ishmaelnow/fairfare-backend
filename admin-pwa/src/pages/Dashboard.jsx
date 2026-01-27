import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/fare';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chat } from '../components/Chat';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalRides: 0,
    completedRides: 0,
    activeRides: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
    totalRevenue: 0,
    completionRate: 0,
  });
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedChatRideId, setSelectedChatRideId] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadMetrics(),
      loadRides(),
      loadDrivers(),
      loadProfiles(),
      loadApplications(),
    ]);
    setLoading(false);
  };

  const loadMetrics = async () => {
    const { data: allRides } = await supabase.from('rides').select('*');
    const { data: allDrivers } = await supabase.from('driver_profiles').select('*');

    if (allRides && allDrivers) {
      const completed = allRides.filter((r) => r.status === 'completed');
      const active = allRides.filter((r) =>
        ['accepted', 'arriving', 'in_progress'].includes(r.status)
      );
      const online = allDrivers.filter((d) => d.is_available && d.is_active);
      const revenue = completed.reduce(
        (sum, r) => sum + (r.fare_final || r.fare_estimate || 0),
        0
      );

      setMetrics({
        totalRides: allRides.length,
        completedRides: completed.length,
        activeRides: active.length,
        totalDrivers: allDrivers.length,
        onlineDrivers: online.length,
        totalRevenue: revenue,
        completionRate: allRides.length > 0 ? (completed.length / allRides.length) * 100 : 0,
      });
    }
  };

  const loadRides = async () => {
    const { data } = await supabase
      .from('rides')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(50);

    setRides(data || []);
  };

  const loadDrivers = async () => {
    const { data } = await supabase
      .from('driver_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setDrivers(data || []);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');

    if (data) {
      const profileMap = data.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
      setProfiles(profileMap);
    }
  };

  const loadApplications = async () => {
    const { data } = await supabase
      .from('driver_applications')
      .select('*')
      .order('created_at', { ascending: false });

    setApplications(data || []);
  };

  const handleDeactivateDriver = async (driverId, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this driver?`)) return;

    const { error } = await supabase
      .from('driver_profiles')
      .update({ is_active: !isActive })
      .eq('id', driverId);

    if (error) {
      alert(`Failed to ${action} driver`);
      return;
    }

    loadDrivers();
    loadMetrics();
  };

  const handleApplicationReview = async (applicationId, status, reason) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Authentication error. Please log out and log back in.');
      return;
    }

    const updateData = {
      status,
      reviewed_by: authUser.id,
      reviewed_at: new Date().toISOString(),
    };

    if (status === 'rejected' && reason) {
      updateData.rejection_reason = reason;
    }

    const { error } = await supabase
      .from('driver_applications')
      .update(updateData)
      .eq('id', applicationId);

    if (error) {
      alert(`Failed to update application: ${error.message}`);
      return;
    }

    await loadApplications();
    await loadDrivers();
    alert(`Application ${status} successfully!`);
  };

  const filteredRides =
    statusFilter === 'all' ? rides : rides.filter((r) => r.status === statusFilter);

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard-page">
        <Card className="admin-dashboard-card">
          <h2>Access Denied</h2>
          <p>You must be an admin to access this dashboard.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <Button onClick={onLogout} variant="danger">
          Logout
        </Button>
      </div>

      <div className="admin-dashboard-container">
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('rides')}
            className={`admin-tab ${activeTab === 'rides' ? 'active' : ''}`}
          >
            Rides
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`admin-tab ${activeTab === 'drivers' ? 'active' : ''}`}
          >
            Drivers
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`admin-tab ${activeTab === 'applications' ? 'active' : ''}`}
          >
            Applications
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="metrics-grid">
              <Card className="metric-card">
                <div className="metric-icon">🚗</div>
                <div className="metric-content">
                  <div className="metric-label">Total Rides</div>
                  <div className="metric-value">{metrics.totalRides}</div>
                </div>
              </Card>

              <Card className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <div className="metric-label">Completed</div>
                  <div className="metric-value">{metrics.completedRides}</div>
                </div>
              </Card>

              <Card className="metric-card">
                <div className="metric-icon">🔄</div>
                <div className="metric-content">
                  <div className="metric-label">Active Rides</div>
                  <div className="metric-value">{metrics.activeRides}</div>
                </div>
              </Card>

              <Card className="metric-card">
                <div className="metric-icon">👥</div>
                <div className="metric-content">
                  <div className="metric-label">Total Drivers</div>
                  <div className="metric-value">{metrics.totalDrivers}</div>
                </div>
              </Card>

              <Card className="metric-card">
                <div className="metric-icon">🟢</div>
                <div className="metric-content">
                  <div className="metric-label">Online Drivers</div>
                  <div className="metric-value">
                    {metrics.onlineDrivers}/{metrics.totalDrivers}
                  </div>
                </div>
              </Card>

              <Card className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <div className="metric-label">Total Revenue</div>
                  <div className="metric-value">{formatCurrency(metrics.totalRevenue)}</div>
                </div>
              </Card>
            </div>

            <div className="overview-grid">
              <Card className="overview-card">
                <h3 className="section-title">Active Rides</h3>
                {metrics.activeRides === 0 ? (
                  <p className="no-data">No active rides</p>
                ) : (
                  <div className="active-rides-list">
                    {rides
                      .filter((r) => ['accepted', 'arriving', 'in_progress'].includes(r.status))
                      .slice(0, 5)
                      .map((ride) => (
                        <div key={ride.id} className="active-ride-item">
                          <div className="ride-route">
                            {ride.pickup_address.split(',')[0]} →{' '}
                            {ride.dropoff_address.split(',')[0]}
                          </div>
                          <div className="ride-status-badge status-{ride.status}">
                            {ride.status.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="ride-fare">{formatCurrency(ride.fare_estimate)}</div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              <Card className="overview-card">
                <h3 className="section-title">Key Metrics</h3>
                <div className="metrics-details">
                  <div className="metric-bar">
                    <div className="metric-bar-label">
                      <span>Completion Rate</span>
                      <span>{metrics.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="metric-bar-bg">
                      <div
                        className="metric-bar-fill"
                        style={{ width: `${metrics.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="metric-bar">
                    <div className="metric-bar-label">
                      <span>Driver Availability</span>
                      <span>
                        {metrics.totalDrivers > 0
                          ? ((metrics.onlineDrivers / metrics.totalDrivers) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="metric-bar-bg">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${
                            metrics.totalDrivers > 0
                              ? (metrics.onlineDrivers / metrics.totalDrivers) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="metric-average">
                    <div className="metric-average-label">Average Fare</div>
                    <div className="metric-average-value">
                      {metrics.completedRides > 0
                        ? formatCurrency(metrics.totalRevenue / metrics.completedRides)
                        : '$0.00'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'rides' && (
          <Card className="admin-dashboard-card">
            <div className="rides-header">
              <h3 className="section-title">All Rides</h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="matching">Matching</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div className="rides-table-container">
              <table className="rides-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Fare</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRides.map((ride) => (
                    <tr key={ride.id}>
                      <td>
                        <div className="ride-route-cell">
                          <div className="route-from">
                            {ride.pickup_address.split(',').slice(0, 2).join(',')}
                          </div>
                          <div className="route-to">
                            → {ride.dropoff_address.split(',').slice(0, 2).join(',')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${ride.status}`}>
                          {ride.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="fare-cell">
                        {formatCurrency(ride.fare_final || ride.fare_estimate)}
                      </td>
                      <td className="date-cell">
                        {new Date(ride.requested_at).toLocaleDateString()}{' '}
                        {new Date(ride.requested_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <Button
                          onClick={() =>
                            setSelectedChatRideId(
                              selectedChatRideId === ride.id ? null : ride.id
                            )
                          }
                          variant="secondary"
                          size="sm"
                        >
                          💬 Chat
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedChatRideId && (
              <div className="chat-modal">
                <div className="chat-modal-header">
                  <h4>Chat for Ride #{selectedChatRideId.slice(0, 8)}</h4>
                  <Button
                    onClick={() => setSelectedChatRideId(null)}
                    variant="secondary"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
                <div className="chat-modal-content">
                  <Chat rideId={selectedChatRideId} title="Ride Chat" />
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'drivers' && (
          <Card className="admin-dashboard-card">
            <h3 className="section-title">All Drivers</h3>
            <div className="drivers-table-container">
              <table className="drivers-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Trips</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => {
                    const profile = profiles[driver.user_id];
                    return (
                      <tr key={driver.id}>
                        <td>
                          <div className="driver-name-cell">
                            <div className="driver-name">{profile?.full_name || 'Unknown'}</div>
                            <div className="driver-email">{profile?.email || ''}</div>
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-cell">
                            {driver.vehicle_color} {driver.vehicle_make} {driver.vehicle_model}
                            {driver.vehicle_year && ` (${driver.vehicle_year})`}
                            <div className="vehicle-plate">{driver.vehicle_plate}</div>
                          </div>
                        </td>
                        <td>
                          <div className="driver-status-cell">
                            <span
                              className={`status-badge ${
                                driver.is_active ? 'status-active' : 'status-inactive'
                              }`}
                            >
                              {driver.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {driver.is_available && (
                              <span className="status-badge status-online">Online</span>
                            )}
                          </div>
                        </td>
                        <td className="trips-cell">{driver.total_trips || 0}</td>
                        <td className="rating-cell">
                          ⭐ {(driver.rating_avg || 0).toFixed(1)}
                        </td>
                        <td>
                          <Button
                            onClick={() => handleDeactivateDriver(driver.id, driver.is_active)}
                            variant={driver.is_active ? 'danger' : 'success'}
                            size="sm"
                          >
                            {driver.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'applications' && (
          <Card className="admin-dashboard-card">
            <div className="applications-header">
              <h3 className="section-title">Driver Applications</h3>
              <div className="applications-stats">
                Total: {applications.length} | Pending:{' '}
                {applications.filter((a) => a.status === 'pending').length}
              </div>
            </div>

            {applications.length === 0 && (
              <div className="no-applications">
                <p>⚠️ No applications found</p>
                <p className="hint">
                  No driver applications have been submitted yet. Drivers need to submit
                  applications through the driver app.
                </p>
              </div>
            )}

            {applications.filter((a) => a.status === 'pending').length > 0 && (
              <div className="applications-section">
                <h4 className="applications-subtitle">
                  Pending Applications ({applications.filter((a) => a.status === 'pending').length})
                </h4>
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Vehicle</th>
                        <th>License Info</th>
                        <th>Applied Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications
                        .filter((a) => a.status === 'pending')
                        .map((app) => {
                          const profile = profiles[app.user_id];
                          return (
                            <tr key={app.id}>
                              <td>
                                <div className="applicant-cell">
                                  <div className="applicant-name">
                                    {profile?.full_name || 'Unknown'}
                                  </div>
                                  <div className="applicant-phone">{profile?.phone || 'No phone'}</div>
                                </div>
                              </td>
                              <td>
                                <div className="vehicle-info-cell">
                                  {app.vehicle_year} {app.vehicle_make} {app.vehicle_model}
                                  <div className="vehicle-details">
                                    {app.vehicle_color} • {app.license_plate}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="license-cell">
                                  DL: {app.drivers_license}
                                  <div className="insurance">Ins: {app.insurance_policy}</div>
                                </div>
                              </td>
                              <td className="date-cell">
                                {new Date(app.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="application-actions">
                                  <Button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Approve driver application for ${profile?.full_name}?`
                                        )
                                      ) {
                                        handleApplicationReview(app.id, 'approved');
                                      }
                                    }}
                                    variant="success"
                                    size="sm"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const reason = prompt(
                                        'Enter rejection reason (required):',
                                        'Please provide additional documentation.'
                                      );
                                      if (reason) {
                                        handleApplicationReview(app.id, 'rejected', reason);
                                      }
                                    }}
                                    variant="danger"
                                    size="sm"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {applications.filter((a) => a.status !== 'pending').length > 0 && (
              <div className="applications-section">
                <h4 className="applications-subtitle">Application History</h4>
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Vehicle</th>
                        <th>Status</th>
                        <th>Reviewed Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications
                        .filter((a) => a.status !== 'pending')
                        .map((app) => {
                          const profile = profiles[app.user_id];
                          return (
                            <tr key={app.id}>
                              <td className="applicant-name">{profile?.full_name || 'Unknown'}</td>
                              <td>
                                {app.vehicle_make} {app.vehicle_model}
                              </td>
                              <td>
                                <span
                                  className={`status-badge ${
                                    app.status === 'approved' ? 'status-approved' : 'status-rejected'
                                  }`}
                                >
                                  {app.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="date-cell">
                                {app.reviewed_at
                                  ? new Date(app.reviewed_at).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className="notes-cell">{app.rejection_reason || '-'}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
