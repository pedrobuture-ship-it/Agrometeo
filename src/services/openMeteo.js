export function getWindDirection(degree) {
  const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8];
}

export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const encoded = encodeURIComponent(query.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=6&language=pt&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Erro na busca de cidades:', error);
    return [];
  }
}

export async function fetchForecast(lat, lng) {
  const daily = [
    'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum',
    'precipitation_probability_max', 'et0_fao_evapotranspiration', 
    'windspeed_10m_max', 'windgusts_10m_max', 'winddirection_10m_dominant',
    'shortwave_radiation_sum', 'uv_index_max'
  ].join(',');

  const hourly = [
    'temperature_2m', 'relative_humidity_2m', 'windspeed_10m', 'precipitation',
    'precipitation_probability', 'surface_pressure', 'cloudcover', 'cape', 
    'visibility', 'soil_temperature_0_to_7cm', 'soil_temperature_7_to_28cm',
    'soil_moisture_0_to_7cm', 'soil_moisture_7_to_28cm'
  ].join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=${daily}&hourly=${hourly}&timezone=America%2FSao_Paulo`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro na API Open-Meteo (Status ${response.status})`);
  }
  const data = await response.json();
  return data;
}

// Cálculo da Temperatura de Bulbo Úmido (Fórmula de Stull) e Delta T (°C)
export function calculateDeltaT(temp, rh) {
  if (temp == null || rh == null) return null;
  const tw = temp * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
             Math.atan(temp + rh) -
             Math.atan(rh - 1.676331) +
             0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
             4.686035;
  const deltaT = temp - tw;
  return Math.max(0, parseFloat(deltaT.toFixed(1)));
}

// Avaliação agronômica horária da janela de pulverização
export function evaluateSprayingCondition({ temp, rh, wind, precip }) {
  const deltaT = calculateDeltaT(temp, rh);

  // 1. Inadequado
  if (precip > 0.1) {
    return {
      status: 'inadequate',
      label: 'Inadequado',
      color: 'danger',
      reason: 'Precipitação no horário (risco de escorrimento/lavagem)',
      deltaT
    };
  }
  if (wind > 12) {
    return {
      status: 'inadequate',
      label: 'Inadequado',
      color: 'danger',
      reason: `Vento muito forte (${wind} km/h). Risco alto de deriva`,
      deltaT
    };
  }
  if (temp > 30) {
    return {
      status: 'inadequate',
      label: 'Inadequado',
      color: 'danger',
      reason: `Temperatura alta (${temp}°C). Risco de queima e evaporação`,
      deltaT
    };
  }
  if (temp < 12) {
    return {
      status: 'inadequate',
      label: 'Inadequado',
      color: 'danger',
      reason: `Temperatura baixa (${temp}°C). Absorção reduzida`,
      deltaT
    };
  }
  if (rh < 45) {
    return {
      status: 'inadequate',
      label: 'Inadequado',
      color: 'danger',
      reason: `Umidade muito baixa (${rh}%). Evaporação rápida das gotas`,
      deltaT
    };
  }
  if (deltaT > 10) {
    return {
      status: 'inadequate',
      label: 'Inadequado',
      color: 'danger',
      reason: `Delta T excessivo (${deltaT}°C). Gotas evaporam antes do alvo`,
      deltaT
    };
  }

  // 2. Favorável
  if (wind <= 10 && rh >= 50 && temp >= 15 && temp <= 30 && deltaT >= 2 && deltaT <= 8) {
    return {
      status: 'favorable',
      label: 'Favorável',
      color: 'success',
      reason: 'Condições perfeitas de vento, umidade e temperatura',
      deltaT
    };
  }

  // 3. Marginal
  return {
    status: 'marginal',
    label: 'Marginal',
    color: 'warning',
    reason: 'Condições limítrofes. Use pontas anti-deriva ou adjuvantes',
    deltaT
  };
}

// Analisador de Alertas Agronômicos em Tempo Real
export function checkAgronomicAlerts(data) {
  if (!data || !data.daily || !data.hourly) return [];
  const alerts = [];
  const d = data.daily;
  const h = data.hourly;

  // 1. Alerta de Geada (próximos 3 dias)
  for (let i = 0; i < Math.min(3, d.time.length); i++) {
    const minTemp = d.temperature_2m_min[i];
    if (minTemp <= 0) {
      alerts.push({
        id: `frost-crit-${i}`,
        type: 'danger',
        category: 'Geada',
        title: `Risco Crítico de Geada Severa (${minTemp}°C)`,
        description: `Previsão de temperatura negativa em ${formatAlertDate(d.time[i])}. Alto risco de danos em lavouras e pastagens.`,
      });
      break;
    } else if (minTemp <= 3) {
      alerts.push({
        id: `frost-warn-${i}`,
        type: 'warning',
        category: 'Geada',
        title: `Atenção: Risco de Geada de Relva (${minTemp}°C)`,
        description: `Temperatura mínima prevista de ${minTemp}°C em ${formatAlertDate(d.time[i])}. Atenção especial em baixadas e plantas sensíveis.`,
      });
      break;
    }
  }

  // 2. Alerta de Granizo / Tempestades Severas (CAPE)
  let maxCapeToday = 0;
  for (let i = 0; i < 24; i++) {
    if (h.cape && h.cape[i] > maxCapeToday) {
      maxCapeToday = h.cape[i];
    }
  }

  if (maxCapeToday >= 1800) {
    alerts.push({
      id: 'cape-severe',
      type: 'danger',
      category: 'Tempestade',
      title: 'Alerta de Tempestade Severa e Granizo',
      description: `Instabilidade atmosférica extrema detectada (CAPE de ${maxCapeToday} J/kg). Alto potencial de rajadas destrutivas e granizo nas próximas 24h.`,
    });
  } else if (maxCapeToday >= 1200) {
    alerts.push({
      id: 'cape-mod',
      type: 'warning',
      category: 'Tempestade',
      title: 'Atenção para Pancadas Fortes e Rajadas',
      description: `Índice de convecção elevado (CAPE de ${maxCapeToday} J/kg). Probabilidade de chuvas convectivas intensas e vento forte.`,
    });
  }

  // 3. Alerta de Estresse Hídrico do Solo
  if (h.soil_moisture_0_to_7cm && h.soil_moisture_7_to_28cm) {
    const m1 = h.soil_moisture_0_to_7cm[12] ?? 0.3;
    const m2 = h.soil_moisture_7_to_28cm[12] ?? 0.3;
    const avgMoisture = ((m1 + m2) / 2) * 100;

    if (avgMoisture < 18) {
      alerts.push({
        id: 'soil-drought',
        type: 'warning',
        category: 'Solo',
        title: 'Déficit Hídrico Crítico no Solo',
        description: `Umidade média nas camadas radiculares de apenas ${avgMoisture.toFixed(1)}%. Condição de estresse para semeadura e desenvolvimento vegetativo.`,
      });
    } else if (avgMoisture > 85) {
      alerts.push({
        id: 'soil-saturated',
        type: 'info',
        category: 'Solo',
        title: 'Solo Saturado / Risco de Encharcamento',
        description: `Umidade do solo em ${avgMoisture.toFixed(1)}%. Evite tráfego pesado de maquinário para não compactar o solo.`,
      });
    }
  }

  return alerts;
}

function formatAlertDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

export function exportForecastToCSV(data, lat, lng, locationName = '') {
  if (!data || !data.daily || !data.hourly) return;
  const d = data.daily;
  const h = data.hourly;

  let csvRows = [];
  csvRows.push("Data;Temp_Max_C;Temp_Min_C;Precipitacao_mm;Prob_Precipitacao_%;ET0_FAO_mm;Vento_Max_kmh;Umidade_12h_%;CAPE_Jkg;Umidade_Solo_0_7cm_%;Umidade_Solo_7_28cm_%");

  for (let i = 0; i < d.time.length; i++) {
    const hrIdx = (i * 24) + 12;
    const row = [
      d.time[i],
      d.temperature_2m_max[i],
      d.temperature_2m_min[i],
      d.precipitation_sum[i],
      d.precipitation_probability_max[i],
      d.et0_fao_evapotranspiration[i],
      d.windspeed_10m_max[i],
      h.relative_humidity_2m[hrIdx],
      h.cape[hrIdx],
      (h.soil_moisture_0_to_7cm[hrIdx] * 100).toFixed(1),
      (h.soil_moisture_7_to_28cm[hrIdx] * 100).toFixed(1)
    ].join(";");
    csvRows.push(row);
  }

  const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = locationName 
    ? `AgroMeteo_${locationName.replace(/[^a-zA-Z0-9]/g, '_')}_${lat.toFixed(2)}_${lng.toFixed(2)}.csv`
    : `AgroMeteo_Relatorio_${lat.toFixed(2)}_${lng.toFixed(2)}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
