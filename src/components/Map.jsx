import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import MapSearch from './MapSearch';

// Fix para ícones padrão do Leaflet no build Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function Map({ selectedPoint, onSelectPoint }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179532475, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map(mapContainerRef.current, {
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 2,
    }).setView([-25.09, -50.16], 6);

    // Camadas de mapa 100% gratuitas e sem restrições
    const esriStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri | &copy; <a href="https://open-meteo.com/" target="_blank">Open-Meteo</a>',
      maxZoom: 19,
      noWrap: true,
      bounds: bounds,
    });

    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics | &copy; <a href="https://open-meteo.com/" target="_blank">Open-Meteo</a>',
      maxZoom: 18,
      noWrap: true,
      bounds: bounds,
    });

    const esriLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      noWrap: true,
      bounds: bounds,
    });

    const satelliteHybrid = L.layerGroup([esriSatellite, esriLabels]);

    const esriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ | &copy; <a href="https://open-meteo.com/" target="_blank">Open-Meteo</a>',
      maxZoom: 19,
      noWrap: true,
      bounds: bounds,
    });

    const osmFr = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | &copy; <a href="https://open-meteo.com/" target="_blank">Open-Meteo</a>',
      maxZoom: 19,
      noWrap: true,
      bounds: bounds,
    });

    // Padrão: Esri Street
    esriStreet.addTo(map);

    const baseMaps = {
      'Mapa Padrão': esriStreet,
      'Satélite Híbrido': satelliteHybrid,
      'Relevo Topográfico': esriTopo,
      'OpenStreetMap': osmFr,
    };

    const layerControl = L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    // No mobile, fecha o seletor automaticamente após o usuário escolher uma camada
    map.on('baselayerchange', () => {
      if (window.innerWidth <= 768) {
        layerControl.collapse();
      }
    });

    // Se o usuário clicar na área de busca do mapa, fecha o seletor de camadas
    const searchContainer = mapContainerRef.current?.parentElement?.querySelector('.map-search-container');
    const handleSearchClick = () => {
      layerControl.collapse();
    };
    if (searchContainer) {
      searchContainer.addEventListener('click', handleSearchClick);
    }

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onSelectPoint(lat, lng);
    });

    mapInstanceRef.current = map;
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (searchContainer) {
        searchContainer.removeEventListener('click', handleSearchClick);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Atualiza marcador e move visão quando selectedPoint mudar
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedPoint && selectedPoint.lat != null && selectedPoint.lng != null) {
      const { lat, lng, zoom } = selectedPoint;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      if (zoom) {
        map.flyTo([lat, lng], zoom, { duration: 1.2 });
      }
    }
  }, [selectedPoint]);

  return (
    <div className="map-outer-container">
      <MapSearch onSelectLocation={onSelectPoint} />
      <div id="map" ref={mapContainerRef} />
    </div>
  );
}
