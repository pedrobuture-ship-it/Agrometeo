import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SaveLocationModal from './components/SaveLocationModal';
import { fetchForecast } from './services/openMeteo';
import { addHistoryEntry } from './db';

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('agrometeo_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeTab, setActiveTab] = useState('analysis');
  const [currentPoint, setCurrentPoint] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('agrometeo_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  async function handleSelectPoint(lat, lng, customName = '', zoom = null) {
    setCurrentPoint({ lat, lng, name: customName, zoom });
    setIsLoading(true);
    setError(null);
    setActiveTab('analysis');

    try {
      const data = await fetchForecast(lat, lng);
      setForecastData(data);

      // Salva snapshot no histórico IndexedDB de forma transparente
      await addHistoryEntry({
        locationLabel: customName || `Ponto (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng,
        elevation: data.elevation,
        forecastData: data,
      });
    } catch (err) {
      setError(`Falha ao obter dados meteorológicos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectSavedLocation(loc) {
    handleSelectPoint(loc.lat, loc.lng, loc.name, 12);
  }

  function handleLoadHistorySnapshot(historyItem) {
    setCurrentPoint({
      lat: historyItem.lat,
      lng: historyItem.lng,
      name: historyItem.locationLabel,
      zoom: 12,
    });
    setForecastData(historyItem.forecastData);
    setError(null);
    setIsLoading(false);
    setActiveTab('analysis');
  }

  function handleRefreshFromHistory(historyItem) {
    handleSelectPoint(historyItem.lat, historyItem.lng, historyItem.locationLabel, 12);
  }

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <div id="container">
        <Map
          selectedPoint={currentPoint}
          onSelectPoint={(lat, lng) => handleSelectPoint(lat, lng)}
        />

        <Sidebar
          theme={theme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          forecastData={forecastData}
          currentPoint={currentPoint}
          isLoading={isLoading}
          error={error}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
          onSelectLocation={handleSelectSavedLocation}
          onLoadHistorySnapshot={handleLoadHistorySnapshot}
          onRefreshFromHistory={handleRefreshFromHistory}
        />
      </div>

      <SaveLocationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        lat={currentPoint?.lat}
        lng={currentPoint?.lng}
        onSaved={() => {
          setActiveTab('saved');
        }}
      />
    </>
  );
}
