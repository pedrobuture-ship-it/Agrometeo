import React, { useState } from 'react';
import { Droplet, Wind, Thermometer, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { evaluateSprayingCondition } from '../services/openMeteo';

export default function SprayingWindow({ hourly, dayIndex }) {
  const [selectedHour, setSelectedHour] = useState(null);

  if (!hourly) return null;

  // Horários diurnos operacionais de pulverização (06:00 até 19:00)
  const operationalHours = [];
  const startHour = dayIndex * 24 + 6;
  const endHour = dayIndex * 24 + 19;

  let favorableCount = 0;
  let marginalCount = 0;
  let inadequateCount = 0;

  for (let i = startHour; i <= endHour; i++) {
    const temp = hourly.temperature_2m ? hourly.temperature_2m[i] : null;
    const rh = hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : null;
    const wind = hourly.windspeed_10m ? hourly.windspeed_10m[i] : null;
    const precip = hourly.precipitation ? hourly.precipitation[i] : 0;

    const condition = evaluateSprayingCondition({ temp, rh, wind, precip });
    const hourLabel = `${String(i % 24).padStart(2, '0')}:00`;

    if (condition.status === 'favorable') favorableCount++;
    else if (condition.status === 'marginal') marginalCount++;
    else inadequateCount++;

    operationalHours.push({
      hourIdx: i,
      hourLabel,
      temp,
      rh,
      wind,
      precip,
      condition,
    });
  }

  // Define hora selecionada por padrão se não selecionada
  const activeDetail = selectedHour 
    ? operationalHours.find(h => h.hourLabel === selectedHour) || operationalHours[0]
    : operationalHours[2] || operationalHours[0]; // por volta das 08h

  return (
    <div className="spraying-module">
      <div className="spraying-header">
        <div className="spraying-title-group">
          <span className="spraying-icon-badge">
            <Droplet size={15} />
          </span>
          <h4>Janela de Pulverização (Delta T)</h4>
        </div>

        <div className="spraying-summary-badges">
          {favorableCount > 0 && (
            <span className="badge-pill favorable" title="Horas favoráveis">
              <CheckCircle2 size={12} /> {favorableCount}h ideais
            </span>
          )}
          {marginalCount > 0 && (
            <span className="badge-pill marginal" title="Horas marginais">
              <AlertTriangle size={12} /> {marginalCount}h atenção
            </span>
          )}
          {inadequateCount > 0 && (
            <span className="badge-pill inadequate" title="Horas inadequadas">
              <XCircle size={12} /> {inadequateCount}h impróprias
            </span>
          )}
        </div>
      </div>

      {/* Régua Horária Diurna (06h às 19h) */}
      <div className="spraying-timeline">
        {operationalHours.map((item) => {
          const isSelected = activeDetail?.hourLabel === item.hourLabel;
          return (
            <button
              key={item.hourLabel}
              type="button"
              className={`timeline-chip ${item.condition.status} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedHour(item.hourLabel)}
              title={`${item.hourLabel} — ${item.condition.label}: ${item.condition.reason}`}
            >
              <span className="chip-hour">{item.hourLabel.replace(':00', 'h')}</span>
              <span className="chip-indicator"></span>
            </button>
          );
        })}
      </div>

      {/* Card de Detalhe da Hora Selecionada */}
      {activeDetail && (
        <div className={`spraying-detail-card ${activeDetail.condition.status}`}>
          <div className="detail-top-row">
            <div className="detail-status">
              <span className={`status-badge-dot ${activeDetail.condition.status}`}></span>
              <strong>{activeDetail.hourLabel}</strong> — 
              <span className="status-name">{activeDetail.condition.label}</span>
            </div>
            {activeDetail.condition.deltaT != null && (
              <span className="delta-t-tag" title="Delta T = Temperatura do Ar - Temperatura de Bulbo Úmido">
                ΔT: {activeDetail.condition.deltaT}°C
              </span>
            )}
          </div>

          <p className="detail-reason">{activeDetail.condition.reason}</p>

          <div className="detail-metrics-row">
            <div className="metric-chip">
              <Thermometer size={13} />
              <span>{activeDetail.temp != null ? `${activeDetail.temp}°C` : '-'}</span>
            </div>
            <div className="metric-chip">
              <Droplet size={13} />
              <span>{activeDetail.rh != null ? `${activeDetail.rh}% UR` : '-'}</span>
            </div>
            <div className="metric-chip">
              <Wind size={13} />
              <span>{activeDetail.wind != null ? `${activeDetail.wind} km/h` : '-'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nota agronômica explicativa */}
      <div className="spraying-footnote">
        <Info size={12} />
        <span>Delta T ideal: 2°C a 8°C • Vento: &lt; 10 km/h • Umidade: &gt; 50%</span>
      </div>
    </div>
  );
}
