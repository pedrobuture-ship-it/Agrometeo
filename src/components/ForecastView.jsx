import React, { useState } from 'react';
import { 
  Bookmark, 
  Download, 
  MapPin, 
  Wind, 
  CloudRain, 
  Sprout, 
  Compass, 
  Thermometer, 
  Calendar,
  Mountain,
  FileText
} from 'lucide-react';
import { exportForecastToCSV, getWindDirection } from '../services/openMeteo';
import { generateAgroMeteoPDF } from '../services/pdfReport';
import AgronomicAlerts from './AgronomicAlerts';
import SprayingWindow from './SprayingWindow';
import AgronomicCharts from './AgronomicCharts';

export default function ForecastView({
  theme,
  forecastData,
  lat,
  lng,
  locationName,
  isLoading,
  error,
  onOpenSaveModal,
}) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  async function handleExportPDF() {
    try {
      setIsGeneratingPDF(true);
      await generateAgroMeteoPDF({ forecastData, lat, lng, locationName });
    } catch (err) {
      alert(`Falha ao gerar o laudo PDF: ${err.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }
  if (isLoading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        <p>Baixando variáveis atmosféricas e de solo via satélite...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p style={{ color: 'var(--danger-red)', fontWeight: 600 }}>{error}</p>
        <p style={{ marginTop: 8 }}>Tente clicar em outro ponto do mapa.</p>
      </div>
    );
  }

  if (!forecastData || !forecastData.daily || !forecastData.hourly) {
    return (
      <div className="empty-state">
        <Compass size={48} />
        <h3>Nenhum ponto selecionado</h3>
        <p>Toque ou clique no mapa para carregar os parâmetros atmosféricos e de solo detalhados do local.</p>
      </div>
    );
  }

  const d = forecastData.daily;
  const h = forecastData.hourly;

  return (
    <div>
      {/* Card de Coordenadas e Ações */}
      <div className="coord-card">
        <div className="coord-top-row">
          <div className="coord-title-group">
            <h2>
              <MapPin size={18} /> {locationName || 'Análise de Ponto'}
            </h2>
            <span>
              <Compass size={14} /> {lat?.toFixed(4)}, {lng?.toFixed(4)}
            </span>
          </div>
          {forecastData.elevation != null && (
            <div className="coord-elevation">
              <Mountain size={14} /> {forecastData.elevation}m alt.
            </div>
          )}
        </div>

        <div className="coord-actions-row">
          <button className="btn-action-solid" onClick={onOpenSaveModal} title="Salvar este ponto no IndexedDB">
            <Bookmark size={14} /> Salvar
          </button>
          <button 
            className="btn-action-pdf" 
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            title="Gerar laudo técnico em PDF formatado com logo da UEPG para envio por WhatsApp"
          >
            <FileText size={14} /> {isGeneratingPDF ? 'Gerando...' : 'Laudo PDF'}
          </button>
          <button 
            className="btn-action-light" 
            onClick={() => exportForecastToCSV(forecastData, lat, lng, locationName)}
            title="Exportar dados para planilha CSV"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Alertas Agronômicos em Destaque */}
      <AgronomicAlerts forecastData={forecastData} />

      {/* Gráficos Visuais e Interativos */}
      <AgronomicCharts forecastData={forecastData} theme={theme} />

      {/* Cards dos Dias de Previsão */}
      {d.time.map((timeStr, i) => {
        const dateObj = new Date(timeStr + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        }).toUpperCase();

        const hrIdx = (i * 24) + 12;
        const cape = h.cape ? h.cape[hrIdx] : 0;
        const capeStatus = cape < 500 ? 'Baixo' : cape < 1500 ? 'Moderado' : 'ALTO';
        const capeClass = cape >= 1500 ? 'alert-cape' : '';

        return (
          <div className="day-card" key={timeStr}>
            <div className="day-card-header">
              <h3>
                <Calendar size={17} /> {formattedDate}
              </h3>
              <span className="temp-badge">
                {d.temperature_2m_max[i]}° / {d.temperature_2m_min[i]}°
              </span>
            </div>

            {/* Janela de Pulverização Horária (Delta T) */}
            <SprayingWindow hourly={h} dayIndex={i} />

            {/* Visão Geral & Atmosfera */}
            <div className="section-title">
              <Thermometer size={15} /> Visão Geral & Atmosfera
            </div>
            <div className="data-grid">
              <div className="data-item">
                <span>Temp. Máx/Mín</span>
                <strong>{d.temperature_2m_max[i]}° / {d.temperature_2m_min[i]}°</strong>
              </div>
              <div className="data-item">
                <span>Umidade (12h)</span>
                <strong>{h.relative_humidity_2m ? h.relative_humidity_2m[hrIdx] : '-'}%</strong>
              </div>
              <div className="data-item">
                <span>Pressão Atm.</span>
                <strong>{h.surface_pressure ? h.surface_pressure[hrIdx] : '-'} hPa</strong>
              </div>
            </div>

            {/* Chuva & Nuvens */}
            <div className="section-title">
              <CloudRain size={15} /> Chuva & Nuvens
            </div>
            <div className="data-grid">
              <div className="data-item">
                <span>Precipitação</span>
                <strong>{d.precipitation_sum[i]} mm</strong>
              </div>
              <div className="data-item">
                <span>Probabilidade</span>
                <strong>{d.precipitation_probability_max[i]}%</strong>
              </div>
              <div className="data-item">
                <span>Nuvens (12h)</span>
                <strong>{h.cloudcover ? h.cloudcover[hrIdx] : '-'}%</strong>
              </div>
              <div className="data-item" style={{ gridColumn: 'span 3' }}>
                <span>Índice CAPE (Risco de Tempestade Severa)</span>
                <strong className={capeClass}>
                  {cape} J/kg — {capeStatus}
                </strong>
              </div>
            </div>

            {/* Vento & Condições */}
            <div className="section-title">
              <Wind size={15} /> Vento & Condições
            </div>
            <div className="data-grid">
              <div className="data-item">
                <span>Vento Médio</span>
                <strong>{d.windspeed_10m_max[i]} km/h</strong>
              </div>
              <div className="data-item">
                <span>Rajadas Máx.</span>
                <strong style={{ color: 'var(--warning-orange)' }}>
                  {d.windgusts_10m_max[i]} km/h
                </strong>
              </div>
              <div className="data-item">
                <span>Direção</span>
                <strong>{getWindDirection(d.winddirection_10m_dominant[i])}</strong>
              </div>
              <div className="data-item">
                <span>Visibilidade</span>
                <strong>
                  {h.visibility ? (h.visibility[hrIdx] / 1000).toFixed(1) : '-'} km
                </strong>
              </div>
              <div className="data-item">
                <span>Índice UV</span>
                <strong>{d.uv_index_max[i]}</strong>
              </div>
              <div className="data-item">
                <span>Radiação Solar</span>
                <strong>{d.shortwave_radiation_sum[i]} MJ/m²</strong>
              </div>
            </div>

            {/* Agronomia & Solo */}
            <div className="section-title">
              <Sprout size={15} /> Agronomia & Solo (0 a 28cm)
            </div>
            <div className="data-grid">
              <div className="data-item">
                <span>ET₀ Evapotransp.</span>
                <strong>{d.et0_fao_evapotranspiration[i]} mm</strong>
              </div>
              <div className="data-item">
                <span>Temp Solo 0-7cm</span>
                <strong>{h.soil_temperature_0_to_7cm ? h.soil_temperature_0_to_7cm[hrIdx] : '-'}°C</strong>
              </div>
              <div className="data-item">
                <span>Temp Solo 7-28cm</span>
                <strong>{h.soil_temperature_7_to_28cm ? h.soil_temperature_7_to_28cm[hrIdx] : '-'}°C</strong>
              </div>
              <div className="data-item" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <span>Umidade Solo 0-7cm</span>
                  <strong>
                    {h.soil_moisture_0_to_7cm ? (h.soil_moisture_0_to_7cm[hrIdx] * 100).toFixed(1) : '-'}%
                  </strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span>Umidade Solo 7-28cm</span>
                  <strong>
                    {h.soil_moisture_7_to_28cm ? (h.soil_moisture_7_to_28cm[hrIdx] * 100).toFixed(1) : '-'}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
