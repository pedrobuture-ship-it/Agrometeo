import React from 'react';
import { AlertTriangle, Snowflake, CloudLightning, Droplets, Info } from 'lucide-react';
import { checkAgronomicAlerts } from '../services/openMeteo';

export default function AgronomicAlerts({ forecastData }) {
  const alerts = checkAgronomicAlerts(forecastData);

  if (!alerts || alerts.length === 0) return null;

  function getIcon(category, type) {
    if (category === 'Geada') return <Snowflake size={20} className="alert-badge-icon" />;
    if (category === 'Tempestade') return <CloudLightning size={20} className="alert-badge-icon" />;
    if (category === 'Solo') return <Droplets size={20} className="alert-badge-icon" />;
    return <AlertTriangle size={20} className="alert-badge-icon" />;
  }

  return (
    <div className="agronomic-alerts-container">
      <div className="alerts-heading">
        <AlertTriangle size={16} />
        <span>Alertas Agronômicos Ativos ({alerts.length})</span>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div className={`agronomic-alert-card ${alert.type}`} key={alert.id}>
            <div className="alert-icon-col">
              {getIcon(alert.category, alert.type)}
            </div>
            <div className="alert-body">
              <div className="alert-title-row">
                <span className="alert-category-tag">{alert.category}</span>
                <h4>{alert.title}</h4>
              </div>
              <p>{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
