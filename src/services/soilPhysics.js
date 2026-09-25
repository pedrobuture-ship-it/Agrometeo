// Módulo de Inteligência Hidrofísica de Solos e Balanço Hídrico Agronômico
// Parâmetros baseados em: Embrapa Solos, FAO Irrigation and Drainage Paper 56 e ZARC (MAPA)

export const SOIL_TYPES = {
  argiloso: {
    id: 'argiloso',
    name: 'Argiloso',
    subname: 'Latossolo Vermelho / Nitossolo',
    description: '35% a 60% de argila (Padrão Campos Gerais / PR)',
    fieldCapacity: 0.34, // 34% em base volumétrica (m³/m³)
    wiltingPoint: 0.19,  // 19% em base volumétrica (m³/m³)
    saturation: 0.50,    // 50% de porosidade total
    cadPerCm: 1.5,       // 1.5 mm de água por cm de solo
    bulkDensity: 1.25,   // g/cm³
  },
  muito_argiloso: {
    id: 'muito_argiloso',
    name: 'Muito Argiloso',
    subname: 'Latossolo Bruno / Terra Roxa',
    description: 'Acima de 60% de argila (Estrutura forte / microporos)',
    fieldCapacity: 0.40,
    wiltingPoint: 0.25,
    saturation: 0.54,
    cadPerCm: 1.5,
    bulkDensity: 1.15,
  },
  medio: {
    id: 'medio',
    name: 'Médio / Franco',
    subname: 'Franco-argilo-arenoso',
    description: '15% a 35% de argila (Equilíbrio de retenção e drenagem)',
    fieldCapacity: 0.24,
    wiltingPoint: 0.11,
    saturation: 0.44,
    cadPerCm: 1.3,
    bulkDensity: 1.40,
  },
  arenoso: {
    id: 'arenoso',
    name: 'Arenoso',
    subname: 'Neossolo Quartzarênico',
    description: 'Menos de 15% de argila (Drenagem rápida, baixa retenção)',
    fieldCapacity: 0.14,
    wiltingPoint: 0.05,
    saturation: 0.38,
    cadPerCm: 0.9,
    bulkDensity: 1.55,
  },
};

export const ROOT_DEPTH_OPTIONS = [
  { value: 20, label: '20 cm (Fase Inicial / Plântula)' },
  { value: 40, label: '40 cm (Desenvolvimento Pleno / Vegetativo)' },
  { value: 60, label: '60 cm (Raiz Profunda / Enchimento de Grãos)' },
];

export function getSoilProfile(soilTypeKey) {
  return SOIL_TYPES[soilTypeKey] || SOIL_TYPES.argiloso;
}

/**
 * Calcula o balanço hídrico do solo e parâmetros de conforto da lavoura
 */
export function calculateSoilWaterBalance({
  soilTypeKey = 'argiloso',
  rootDepth = 40,
  soilMoisture0_7 = 0.30,
  soilMoisture7_28 = 0.30,
  et0Daily = [],
  rainForecast = [],
}) {
  const profile = getSoilProfile(soilTypeKey);

  // Média ponderada pela profundidade efetiva das raízes
  // 0-7 cm representa a camada evaporativa e inicial
  // 7-28 cm representa a reserva subsuperficial
  const weight0_7 = rootDepth <= 20 ? 0.45 : 0.30;
  const weight7_28 = 1 - weight0_7;
  const currentMoisture = (soilMoisture0_7 * weight0_7) + (soilMoisture7_28 * weight7_28);

  const cc = profile.fieldCapacity;
  const pmp = profile.wiltingPoint;
  const sat = profile.saturation;

  // Água Disponível Real (AD%): fração entre PMP (0%) e Capacidade de Campo (100%)
  const adPercentRaw = ((currentMoisture - pmp) / (cc - pmp)) * 100;
  const adPercent = Math.max(-20, Math.min(130, adPercentRaw));

  // Classificação agronômica do estado hídrico
  let status = 'optimal';
  let statusLabel = 'Conforto Hídrico Pleno';
  let statusColor = '#34C759'; // Verde
  let statusBadgeClass = 'status-optimal';

  if (currentMoisture > cc * 1.05) {
    status = 'saturated';
    statusLabel = 'Solo Saturado / Encharcado';
    statusColor = '#007AFF'; // Azul
    statusBadgeClass = 'status-saturated';
  } else if (adPercent >= 60) {
    status = 'optimal';
    statusLabel = 'Conforto Hídrico Ideal';
    statusColor = '#34C759';
    statusBadgeClass = 'status-optimal';
  } else if (adPercent >= 40) {
    status = 'attention';
    statusLabel = 'Atenção (Início de Esgotamento)';
    statusColor = '#FF9500'; // Amarelo/Laranja
    statusBadgeClass = 'status-attention';
  } else if (adPercent > 0) {
    status = 'deficit';
    statusLabel = 'Déficit Hídrico Crítico';
    statusColor = '#FF3B30'; // Vermelho
    statusBadgeClass = 'status-deficit';
  } else {
    status = 'wilting';
    statusLabel = 'Abaixo do Ponto de Murcha';
    statusColor = '#AF52DE'; // Roxo
    statusBadgeClass = 'status-wilting';
  }

  // Lâmina de Irrigação / Chuva necessária para atingir a Capacidade de Campo (em mm)
  // Lâmina = (θcc - θatual) * Z(cm) * 10
  let irrigationRequiredMm = 0;
  if (currentMoisture < cc) {
    irrigationRequiredMm = Math.max(0, (cc - currentMoisture) * rootDepth * 10);
  }

  // Capacidade Total de Água Disponível no perfil (CAD em mm)
  const totalCadMm = (cc - pmp) * rootDepth * 10;

  // Água atualmente armazenada no perfil (mm acima do PMP)
  const currentAvailableWaterMm = Math.max(0, (currentMoisture - pmp) * rootDepth * 10);

  // Estimativa de Autonomia Hídrica (dias até atingir o limite crítico de estresse: AD < 40%)
  // Limiar crítico (Fator de depleção p ≈ 0.6 da CAD, restando 40% de AD)
  const criticalMoisture = pmp + (0.4 * (cc - pmp));
  let remainingWaterAboveCriticalMm = Math.max(0, (currentMoisture - criticalMoisture) * rootDepth * 10);

  let autonomyDays = 0;
  if (remainingWaterAboveCriticalMm > 0) {
    let simWater = remainingWaterAboveCriticalMm;
    const maxDays = Math.min(7, et0Daily.length || 7);
    
    for (let day = 0; day < maxDays; day++) {
      const dailyEt0 = (et0Daily[day] && !isNaN(et0Daily[day])) ? Number(et0Daily[day]) : 4.0;
      const dailyRain = (rainForecast[day] && !isNaN(rainForecast[day])) ? Number(rainForecast[day]) : 0;
      
      // Chuva efetiva (estimando 80% de aproveitamento sem escoamento superficial)
      const effectiveRain = dailyRain * 0.8;
      simWater = simWater - dailyEt0 + effectiveRain;

      if (simWater > 0) {
        autonomyDays++;
      } else {
        break;
      }
    }
  }

  // Condição de Trafegabilidade de Máquinas no Talhão
  let trafficability = {
    status: 'good',
    title: 'Friável (Tráfego Seguro)',
    description: 'Umidade ideal para trânsito de tratores, plantio e pulverização sem risco de compactação.',
    badgeColor: '#34C759',
  };

  if (currentMoisture >= sat * 0.95) {
    trafficability = {
      status: 'severe',
      title: 'Crítico (Lama / Atolamento)',
      description: 'Solo saturado. Risco extremo de atolamento e formação de sulcos profundos. Tráfego desaconselhado.',
      badgeColor: '#FF3B30',
    };
  } else if (currentMoisture > cc * 1.05) {
    trafficability = {
      status: 'warning',
      title: 'Plástico (Risco de Compactação)',
      description: 'Solo muito úmido. Evite maquinário pesado (colhedoras e transbordos) para prevenir compactação subsuperficial.',
      badgeColor: '#FF9500',
    };
  } else if (currentMoisture < pmp) {
    trafficability = {
      status: 'dry',
      title: 'Seco (Tráfego Livre)',
      description: 'Solo com baixa umidade. Sem risco de compactação plástica, mas pode apresentar poeira e encrostamento.',
      badgeColor: '#8E8E93',
    };
  }

  return {
    soilTypeKey,
    profile,
    rootDepth,
    currentMoisturePercent: currentMoisture * 100,
    fieldCapacityPercent: cc * 100,
    wiltingPointPercent: pmp * 100,
    saturationPercent: sat * 100,
    adPercent: Number(adPercent.toFixed(1)),
    status,
    statusLabel,
    statusColor,
    statusBadgeClass,
    irrigationRequiredMm: Number(irrigationRequiredMm.toFixed(1)),
    totalCadMm: Number(totalCadMm.toFixed(1)),
    currentAvailableWaterMm: Number(currentAvailableWaterMm.toFixed(1)),
    autonomyDays,
    trafficability,
  };
}
