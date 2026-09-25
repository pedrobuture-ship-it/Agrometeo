import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { searchCities } from '../services/openMeteo';

export default function MapSearch({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce na busca de cidades
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchCities(query);
      setResults(cities);
      setIsOpen(cities.length > 0);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(city) {
    const label = city.admin1 ? `${city.name} - ${city.admin1}` : city.name;
    setQuery(label);
    setIsOpen(false);
    onSelectLocation(city.latitude, city.longitude, label, 12);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  function handleGPS() {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta geolocalização por GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setQuery('Minha Localização (GPS)');
        setIsOpen(false);
        setIsLocating(false);
        onSelectLocation(latitude, longitude, 'Minha Localização (GPS)', 13);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Erro ao obter localização.';
        if (error.code === 1) msg = 'Permissão de localização negada pelo navegador.';
        else if (error.code === 2) msg = 'Sinal de GPS indisponível no momento.';
        else if (error.code === 3) msg = 'Tempo limite esgotado ao buscar GPS.';
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div className="map-search-container" ref={containerRef}>
      <div className="map-search-bar">
        <div className="search-input-wrapper">
          {isSearching ? (
            <Loader2 size={16} className="search-icon spinning" />
          ) : (
            <Search size={16} className="search-icon" />
          )}

          <input
            type="text"
            className="map-search-input"
            placeholder="Buscar município (ex: Ponta Grossa, Castro)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
          />

          {query && (
            <button className="btn-clear-search" onClick={handleClear} title="Limpar">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botão de Localização GPS */}
        <button
          className={`btn-gps ${isLocating ? 'locating' : ''}`}
          onClick={handleGPS}
          disabled={isLocating}
          title="Usar minha localização atual (GPS)"
        >
          {isLocating ? <Loader2 size={18} className="spinning" /> : <LocateFixed size={18} />}
        </button>
      </div>

      {/* Resultados do Autocomplete */}
      {isOpen && results.length > 0 && (
        <ul className="map-search-results">
          {results.map((city) => (
            <li
              key={`${city.id}-${city.latitude}-${city.longitude}`}
              className="search-result-item"
              onClick={() => handleSelect(city)}
            >
              <MapPin size={15} className="result-pin" />
              <div className="result-text">
                <span className="result-city">{city.name}</span>
                <span className="result-region">
                  {city.admin1 ? `${city.admin1}, ` : ''}{city.country || 'Brasil'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
