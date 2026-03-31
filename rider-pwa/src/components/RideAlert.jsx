import './RideAlert.css';

export function RideAlert({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="ride-alerts-container">
      {alerts.map((alert) => (
        <div key={alert.id} className={`ride-alert ride-alert-${alert.type}`}>
          <span className="ride-alert-icon">{alert.icon}</span>
          <div className="ride-alert-content">
            <div className="ride-alert-title">{alert.title}</div>
            {alert.message && <div className="ride-alert-message">{alert.message}</div>}
          </div>
          <button className="ride-alert-dismiss" onClick={() => onDismiss(alert.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
