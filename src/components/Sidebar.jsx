import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart3, Bookmark, History } from 'lucide-react';
import { db } from '../db';
import ForecastView from './ForecastView';
import SavedLocations from './SavedLocations';
import HistoryView from './HistoryView';

export default function Sidebar({
  theme,
  activeTab,
  setActiveTab,
  forecastData,
  currentPoint,
  isLoading,
  error,
  onOpenSaveModal,
  onSelectLocation,
  onLoadHistorySnapshot,
  onRefreshFromHistory,
}) {
  const savedCount = useLiveQuery(() => db.locations.count()) ?? 0;
  const historyCount = useLiveQuery(() => db.history.count()) ?? 0;

  return (
    <div id="sidebar">
      {/* Abas Superiores */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          <BarChart3 size={15} />
          <span>Análise</span>
        </button>

        <button
          className={`sidebar-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={15} />
          <span>Locais Salvos</span>
          {savedCount > 0 && <span className="badge-count">{savedCount}</span>}
        </button>

        <button
          className={`sidebar-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={15} />
          <span>Histórico</span>
          {historyCount > 0 && <span className="badge-count">{historyCount}</span>}
        </button>
      </div>

      {/* Área Rolável de Conteúdo */}
      <div className="sidebar-scroll-area">
        {activeTab === 'analysis' && (
          <ForecastView
            theme={theme}
            forecastData={forecastData}
            lat={currentPoint?.lat}
            lng={currentPoint?.lng}
            locationName={currentPoint?.name}
            initialSoilType={currentPoint?.soilType}
            initialRootDepth={currentPoint?.rootDepth}
            isLoading={isLoading}
            error={error}
            onOpenSaveModal={onOpenSaveModal}
          />
        )}

        {activeTab === 'saved' && (
          <SavedLocations onSelectLocation={onSelectLocation} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            onLoadHistorySnapshot={onLoadHistorySnapshot}
            onRefreshFromHistory={onRefreshFromHistory}
          />
        )}
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="sidebar-footer">
        Dados meteorológicos por{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>
        .<br />
        Desenvolvido por Pedro Buture • Universidade Estadual de Ponta Grossa (UEPG).
      </div>
    </div>
  );
}
