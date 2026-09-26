import React from 'react';
import { 
  Sprout, 
  Layers, 
  Droplet, 
  Clock, 
  Truck, 
  Info, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  SOIL_TYPES, 
  ROOT_DEPTH_OPTIONS, 
  calculateSoilWaterBalance 
} from '../services/soilPhysics';

export default function SoilWaterCard({
  soilType,
  setSoilType,
  rootDepth,
  setRootDepth,
  forecastData,
}) {
  if (!forecastData || !forecastData.hourly || !forecastData.daily) return null;

  const h = forecastData.hourly;
  const d = forecastData.daily;

  // Umidades médias ao meio-dia do primeiro dia de previsão
  const s0_7 = h.soil_moisture_0_to_7cm ? (h.soil_moisture_0_to_7cm[12] ?? 0.30) : 0.30;
  const s7_28 = h.soil_moisture_7_to_28cm ? (h.soil_moisture_7_to_28cm[12] ?? 0.30) : 0.30;

  const balance = calculateSoilWaterBalance({
    soilTypeKey: soilType,
    rootDepth: Number(rootDepth),
    soilMoisture0_7: s0_7,
    soilMoisture7_28: s7_28,
    et0Daily: d.et0_fao_evapotranspiration || [],
    rainForecast: d.precipitation_sum || [],
  });

  const clampedAd = Math.max(0, Math.min(100, balance.adPercent));

  return (
    <div className="soil-water-card">
      {/* Cabeçalho do Card */}
      <div className="soil-card-header">
        <div className="soil-card-title-group">
          <div className="soil-icon-badge">
            <Sprout size={18} />
          </div>
          <div>
            <h3>Inteligência de Solo & Balanço Hídrico</h3>
            <span className="soil-card-subtitle">
              Capacidade de Campo e Água Disponível Real (Embrapa / FAO)
            </span>
          </div>
        </div>
      </div>

      {/* Seletores Interativos: Tipo de Solo & Profundidade Radicular */}
      <div className="soil-selectors-grid">
        <div className="soil-selector-col">
          <label htmlFor="soil-type-select">
            <Layers size={13} /> Textura do Solo:
          </label>
          <select
            id="soil-type-select"
            className="soil-select-input"
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
          >
            {Object.values(SOIL_TYPES).map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.subname})
              </option>
            ))}
          </select>
        </div>

        <div className="soil-selector-col">
          <label htmlFor="root-depth-select">
            <Sprout size={13} /> Sistema Radicular:
          </label>
          <select
            id="root-depth-select"
            className="soil-select-input"
            value={rootDepth}
            onChange={(e) => setRootDepth(Number(e.target.value))}
          >
            {ROOT_DEPTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Painel Principal de Água Disponível (AD%) */}
      <div className="soil-ad-banner" style={{ borderLeftColor: balance.statusColor }}>
        <div className="soil-ad-main">
          <div className="soil-ad-value-col">
            <span className="soil-ad-label">Água Disponível (AD)</span>
            <div className="soil-ad-number">
              <strong>{balance.adPercent}%</strong>
              <span className="soil-ad-tag" style={{ backgroundColor: `${balance.statusColor}22`, color: balance.statusColor }}>
                {balance.statusLabel}
              </span>
            </div>
          </div>

          <div className="soil-moisture-badge">
            <span>Umidade Volumétrica Média</span>
            <strong>{balance.currentMoisturePercent.toFixed(1)}%</strong>
            <small>CC: {balance.fieldCapacityPercent}% • PMP: {balance.wiltingPointPercent}%</small>
          </div>
        </div>

        {/* Barra de Progresso Visual de Água Disponível */}
        <div className="soil-progress-wrapper">
          <div className="soil-progress-track">
            {/* Faixa 0-40%: Déficit */}
            <div className="zone-deficit" style={{ width: '40%' }} title="0 a 40%: Déficit Hídrico Severo" />
            {/* Faixa 40-60%: Atenção */}
            <div className="zone-attention" style={{ width: '20%' }} title="40 a 60%: Início de Esgotamento" />
            {/* Faixa 60-100%: Conforto */}
            <div className="zone-optimal" style={{ width: '40%' }} title="60 a 100%: Conforto Hídrico Pleno" />

            {/* Marcador da Umidade Atual */}
            <div 
              className="soil-progress-marker" 
              style={{ left: `${Math.min(100, Math.max(0, balance.adPercent))}%` }}
              title={`Água Disponível Atual: ${balance.adPercent}%`}
            >
              <div className="marker-pin" style={{ backgroundColor: balance.statusColor }} />
            </div>
          </div>

          <div className="soil-progress-labels">
            <span>0% (Ponto Murcha)</span>
            <span>40% (Crítico)</span>
            <span>60% (Adequado)</span>
            <span>100% (Cap. Campo)</span>
          </div>
        </div>
      </div>

      {/* Grid de 3 Métricas Agronômicas Operacionais */}
      <div className="soil-metrics-grid">
        {/* Métrica 1: Lâmina de Irrigação */}
        <div className="soil-metric-card">
          <div className="soil-metric-icon" style={{ color: '#007AFF', backgroundColor: 'rgba(0, 122, 255, 0.12)' }}>
            <Droplet size={18} />
          </div>
          <div className="soil-metric-content">
            <span className="metric-title">Lâmina Necessária</span>
            <strong className="metric-value">
              {balance.irrigationRequiredMm > 0 ? `${balance.irrigationRequiredMm} mm` : '0.0 mm (Satisfeito)'}
            </strong>
            <span className="metric-subtext">
              Para atingir Capacidade de Campo no perfil de {rootDepth} cm
            </span>
          </div>
        </div>

        {/* Métrica 2: Autonomia Hídrica Estimada */}
        <div className="soil-metric-card">
          <div className="soil-metric-icon" style={{ color: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.12)' }}>
            <Clock size={18} />
          </div>
          <div className="soil-metric-content">
            <span className="metric-title">Autonomia Estimada</span>
            <strong className="metric-value">
              {balance.adPercent <= 40 ? 'Limiar Crítico' : `${balance.autonomyDays} dias`}
            </strong>
            <span className="metric-subtext">
              Até esgotamento crítico (AD &lt; 40%) sob a ET₀ prevista
            </span>
          </div>
        </div>

        {/* Métrica 3: Trafegabilidade de Máquinas */}
        <div className="soil-metric-card full-width">
          <div className="soil-metric-icon" style={{ color: balance.trafficability.badgeColor, backgroundColor: `${balance.trafficability.badgeColor}22` }}>
            <Truck size={18} />
          </div>
          <div className="soil-metric-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="metric-title">Trafegabilidade no Talhão:</span>
              <strong style={{ fontSize: '0.88rem', color: balance.trafficability.badgeColor }}>
                {balance.trafficability.title}
              </strong>
            </div>
            <span className="metric-subtext" style={{ marginTop: 2 }}>
              {balance.trafficability.description}
            </span>
          </div>
        </div>
      </div>

      {/* Nota de rodapé técnica */}
      <div className="soil-footer-note">
        <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Textura <strong>{balance.profile.name}</strong> ({balance.profile.description}). 
          Capacidade de Água Disponível (CAD): {balance.totalCadMm} mm no perfil radicular.
        </span>
      </div>
    </div>
  );
}
