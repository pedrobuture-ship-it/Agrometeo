import React, { useState } from 'react';
import { AlertTriangle, Snowflake, CloudLightning, Droplets, Info, ChevronDown } from 'lucide-react';
import { checkAgronomicAlerts } from '../services/openMeteo';

export default function AgronomicAlerts({ forecastData, soilType = 'argiloso', rootDepth = 40 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const alerts = checkAgronomicAlerts(forecastData, soilType, rootDepth);

  if (!alerts || alerts.length === 0) return null;

  function getIcon(category, type) {
    if (category === 'Geada') return <Snowflake size={20} className="alert-badge-icon" />;
    if (category === 'Tempestade') return <CloudLightning size={20} className="alert-badge-icon" />;
    if (category === 'Solo') return <Droplets size={20} className="alert-badge-icon" />;
    return <AlertTriangle size={20} className="alert-badge-icon" />;
  }

  return (
    <div className={`agronomic-alerts-container ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
      <div 
        className={`alerts-heading ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        title={isExpanded ? 'Clique para recolher alertas' : 'Clique para expandir alertas'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <span>Alertas Agronômicos Ativos ({alerts.length})</span>
        </div>

        <button
          type="button"
          className="btn-card-toggle"
          aria-label={isExpanded ? 'Recolher alertas' : 'Expandir alertas'}
        >
          <ChevronDown
            size={18}
            className={`toggle-icon ${isExpanded ? 'open' : ''}`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="alerts-list" style={{ marginTop: 12 }}>
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
      )}
    </div>
  );
}
