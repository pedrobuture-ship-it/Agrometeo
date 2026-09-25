import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  CloudRain,
  Thermometer,
  Sprout,
  BarChart2,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Droplets,
  Layers,
} from 'lucide-react';

export default function AgronomicCharts({ forecastData, theme }) {
  const [activeChart, setActiveChart] = useState('rain'); // 'rain' | 'temp' | 'soil'
  const [rainViewMode, setRainViewMode] = useState('daily'); // 'daily' | 'hourly'
  const [soilViewMode, setSoilViewMode] = useState('daily'); // 'daily' | 'hourly'

  if (!forecastData || !forecastData.daily || !forecastData.hourly) {
    return null;
  }

  const d = forecastData.daily;
  const h = forecastData.hourly;
  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.body.classList.contains('dark'));

  // Paleta de cores adaptada para Light/Dark
  const colors = {
    grid: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
    axisText: isDark ? '#98989D' : '#8E8E93',
    tooltipBg: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    textMain: isDark ? '#FFFFFF' : '#1D1D1F',
    textLight: isDark ? '#8E8E93' : '#6E6E73',
    rainBar: isDark ? '#0A84FF' : '#007AFF',
    rainLine: isDark ? '#64D2FF' : '#5AC8FA',
    tempMax: isDark ? '#FF453A' : '#FF3B30',
    tempMin: isDark ? '#0A84FF' : '#007AFF',
    soilTop: isDark ? '#30D158' : '#34C759',
    soilDeep: isDark ? '#FF9F0A' : '#FF9500',
    warning: isDark ? '#FF453A' : '#FF3B30',
    neutral: isDark ? '#0A84FF' : '#007AFF',
  };

  // --- PREPARAÇÃO DE DADOS ---

  // 1. Dados Diários de Chuva (7 dias)
  const rainDailyData = d.time.map((timeStr, i) => {
    const dateObj = new Date(timeStr + 'T00:00:00');
    const label = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '');
    const precip = d.precipitation_sum ? d.precipitation_sum[i] : 0;
    const prob = d.precipitation_probability_max ? d.precipitation_probability_max[i] : 0;
    const et0 = d.et0_fao_evapotranspiration ? d.et0_fao_evapotranspiration[i] : 0;

    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      fullDate: timeStr,
      precip: Number((precip || 0).toFixed(1)),
      prob: Math.round(prob || 0),
      et0: Number((et0 || 0).toFixed(1)),
    };
  });

  // 1.1 Dados Horários de Chuva (Próximas 48 horas)
  const rainHourlyData = [];
  const hoursToTake = Math.min(48, h.time.length);
  for (let idx = 0; idx < hoursToTake; idx++) {
    const dateObj = new Date(h.time[idx]);
    const hourLabel = `${String(dateObj.getHours()).padStart(2, '0')}h`;
    const dayLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '');
    const precip = h.precipitation ? h.precipitation[idx] : 0;
    const prob = h.precipitation_probability ? h.precipitation_probability[idx] : (precip > 0 ? 80 : 10);

    rainHourlyData.push({
      label: hourLabel,
      subLabel: dayLabel,
      precip: Number((precip || 0).toFixed(1)),
      prob: Math.round(prob || 0),
    });
  }

  // Estatísticas de Chuva
  const totalRain = rainDailyData.reduce((acc, curr) => acc + curr.precip, 0);
  const maxRainDay = [...rainDailyData].sort((a, b) => b.precip - a.precip)[0];
  const maxProbDay = Math.max(...rainDailyData.map((x) => x.prob));

  // 2. Dados de Temperatura (7 dias)
  const tempData = d.time.map((timeStr, i) => {
    const dateObj = new Date(timeStr + 'T00:00:00');
    const label = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '');
    const max = d.temperature_2m_max ? d.temperature_2m_max[i] : 0;
    const min = d.temperature_2m_min ? d.temperature_2m_min[i] : 0;
    const amp = Number((max - min).toFixed(1));

    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      max: Number(max.toFixed(1)),
      min: Number(min.toFixed(1)),
      amplitude: amp,
    };
  });

  const absoluteMaxTemp = Math.max(...tempData.map((t) => t.max));
  const absoluteMinTemp = Math.min(...tempData.map((t) => t.min));
  const maxAmplitude = Math.max(...tempData.map((t) => t.amplitude));

  // 3. Dados de Solo (0-7cm e 7-28cm) - Diário (12h) e Horário (48h)
  const soilDailyData = d.time.map((timeStr, i) => {
    const dateObj = new Date(timeStr + 'T00:00:00');
    const label = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '');
    const hrIdx = i * 24 + 12; // Medição do meio-dia (pico solar)

    const m0_7 = h.soil_moisture_0_to_7cm && h.soil_moisture_0_to_7cm[hrIdx] != null
      ? Number((h.soil_moisture_0_to_7cm[hrIdx] * 100).toFixed(1))
      : 0;
    const m7_28 = h.soil_moisture_7_to_28cm && h.soil_moisture_7_to_28cm[hrIdx] != null
      ? Number((h.soil_moisture_7_to_28cm[hrIdx] * 100).toFixed(1))
      : 0;

    const t0_7 = h.soil_temperature_0_to_7cm ? h.soil_temperature_0_to_7cm[hrIdx] : 0;
    const t7_28 = h.soil_temperature_7_to_28cm ? h.soil_temperature_7_to_28cm[hrIdx] : 0;

    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      moisture0_7: m0_7,
      moisture7_28: m7_28,
      temp0_7: t0_7,
      temp7_28: t7_28,
    };
  });

  const soilHourlyData = [];
  for (let idx = 0; idx < hoursToTake; idx += 2) { // De 2 em 2 horas para suavidade
    const dateObj = new Date(h.time[idx]);
    const hourLabel = `${String(dateObj.getHours()).padStart(2, '0')}h`;
    const m0_7 = h.soil_moisture_0_to_7cm && h.soil_moisture_0_to_7cm[idx] != null
      ? Number((h.soil_moisture_0_to_7cm[idx] * 100).toFixed(1))
      : 0;
    const m7_28 = h.soil_moisture_7_to_28cm && h.soil_moisture_7_to_28cm[idx] != null
      ? Number((h.soil_moisture_7_to_28cm[idx] * 100).toFixed(1))
      : 0;

    soilHourlyData.push({
      label: hourLabel,
      moisture0_7: m0_7,
      moisture7_28: m7_28,
    });
  }

  const avgSoilTop = (
    soilDailyData.reduce((acc, curr) => acc + curr.moisture0_7, 0) / soilDailyData.length
  ).toFixed(1);
  const avgSoilDeep = (
    soilDailyData.reduce((acc, curr) => acc + curr.moisture7_28, 0) / soilDailyData.length
  ).toFixed(1);

  // Custom Tooltip estilizado Glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="chart-custom-tooltip">
        <div className="tooltip-title">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="tooltip-row">
            <span
              className="tooltip-dot"
              style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
            />
            <span className="tooltip-label">{entry.name}:</span>
            <strong className="tooltip-val">
              {entry.value} {entry.unit || ''}
            </strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="agronomic-charts-card">
      {/* Cabeçalho da Seção de Gráficos */}
      <div className="charts-card-header">
        <div className="charts-title-group">
          <span className="charts-icon-badge">
            <BarChart2 size={16} />
          </span>
          <div>
            <h3>Análise Gráfica & Tendências</h3>
            <span className="charts-subtitle">Comportamento hídrico, térmico e edáfico</span>
          </div>
        </div>

        {/* Seletor de Tipo de Gráfico */}
        <div className="chart-tabs-nav">
          <button
            className={`chart-tab-pill ${activeChart === 'rain' ? 'active' : ''}`}
            onClick={() => setActiveChart('rain')}
            title="Precipitação e Probabilidade"
          >
            <CloudRain size={14} />
            <span>Chuva</span>
          </button>

          <button
            className={`chart-tab-pill ${activeChart === 'temp' ? 'active' : ''}`}
            onClick={() => setActiveChart('temp')}
            title="Curva de Temperatura"
          >
            <Thermometer size={14} />
            <span>Temperatura</span>
          </button>

          <button
            className={`chart-tab-pill ${activeChart === 'soil' ? 'active' : ''}`}
            onClick={() => setActiveChart('soil')}
            title="Umidade do Solo 0-28cm"
          >
            <Sprout size={14} />
            <span>Solo</span>
          </button>
        </div>
      </div>

      {/* --- GRÁFICO 1: PRECIPITAÇÃO E PROBABILIDADE --- */}
      {activeChart === 'rain' && (
        <div className="chart-body-section">
          {/* Barra de Métricas Resumo */}
          <div className="chart-metrics-banner">
            <div className="chart-metric-item">
              <span className="metric-label">
                <Droplets size={13} /> Volume Total 7 Dias
              </span>
              <strong className="metric-value">{totalRain.toFixed(1)} mm</strong>
            </div>

            <div className="chart-metric-item">
              <span className="metric-label">
                <Calendar size={13} /> Pico de Chuva
              </span>
              <strong className="metric-value">
                {maxRainDay?.precip > 0 ? `${maxRainDay.label} (${maxRainDay.precip} mm)` : 'Sem chuva'}
              </strong>
            </div>

            <div className="chart-metric-item">
              <span className="metric-label">
                <TrendingUp size={13} /> Probabilidade Máx.
              </span>
              <strong className="metric-value">{maxProbDay}%</strong>
            </div>
          </div>

          {/* Sub-toggle Diário / Horário */}
          <div className="chart-subtoggle-row">
            <span className="subtoggle-hint">
              {rainViewMode === 'daily' ? 'Precipitação acumulada diária vs Probabilidade máxima' : 'Evolução horária nas próximas 48 horas'}
            </span>
            <div className="subtoggle-group">
              <button
                className={`subtoggle-btn ${rainViewMode === 'daily' ? 'active' : ''}`}
                onClick={() => setRainViewMode('daily')}
              >
                7 Dias
              </button>
              <button
                className={`subtoggle-btn ${rainViewMode === 'hourly' ? 'active' : ''}`}
                onClick={() => setRainViewMode('hourly')}
              >
                48 Horas
              </button>
            </div>
          </div>

          {/* Contêiner do Gráfico */}
          <div className="chart-container-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={rainViewMode === 'daily' ? rainDailyData : rainHourlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  yAxisId="left"
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="mm"
                  domain={[0, (dataMax) => Math.max(5, Math.ceil(dataMax * 1.25))]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Bar
                  yAxisId="left"
                  dataKey="precip"
                  name="Precipitação"
                  unit="mm"
                  fill={colors.rainBar}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="prob"
                  name="Probabilidade"
                  unit="%"
                  stroke={colors.rainLine}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: colors.rainLine }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- GRÁFICO 2: CURVA DE TEMPERATURA E AMPLITUDE --- */}
      {activeChart === 'temp' && (
        <div className="chart-body-section">
          {/* Barra de Métricas Resumo */}
          <div className="chart-metrics-banner">
            <div className="chart-metric-item">
              <span className="metric-label">
                <Thermometer size={13} style={{ color: colors.tempMax }} /> Máxima Absoluta
              </span>
              <strong className="metric-value" style={{ color: colors.tempMax }}>
                {absoluteMaxTemp}°C
              </strong>
            </div>

            <div className="chart-metric-item">
              <span className="metric-label">
                <Thermometer size={13} style={{ color: colors.tempMin }} /> Mínima Absoluta
              </span>
              <strong className="metric-value" style={{ color: colors.tempMin }}>
                {absoluteMinTemp}°C
              </strong>
            </div>

            <div className="chart-metric-item">
              <span className="metric-label">
                <Layers size={13} /> Maior Amplitude
              </span>
              <strong className="metric-value">{maxAmplitude}°C</strong>
            </div>
          </div>

          <div className="chart-subtoggle-row">
            <span className="subtoggle-hint">
              Curvas de temperatura máxima e mínima ao longo de 7 dias
            </span>
          </div>

          <div className="chart-container-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={tempData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tempMaxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.tempMax} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={colors.tempMax} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="tempMinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.tempMin} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={colors.tempMin} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="°C"
                  domain={[(dataMin) => Math.floor(dataMin - 2), (dataMax) => Math.ceil(dataMax + 2)]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="max"
                  name="Temp. Máxima"
                  unit="°C"
                  stroke={colors.tempMax}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempMaxGrad)"
                  dot={{ r: 3.5, fill: colors.tempMax }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="min"
                  name="Temp. Mínima"
                  unit="°C"
                  stroke={colors.tempMin}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempMinGrad)"
                  dot={{ r: 3.5, fill: colors.tempMin }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- GRÁFICO 3: PERFIL E UMIDADE DO SOLO (0-7cm vs 7-28cm) --- */}
      {activeChart === 'soil' && (
        <div className="chart-body-section">
          {/* Barra de Métricas Resumo */}
          <div className="chart-metrics-banner">
            <div className="chart-metric-item">
              <span className="metric-label">
                <Sprout size={13} style={{ color: colors.soilTop }} /> Média 0-7 cm (Superficial)
              </span>
              <strong className="metric-value" style={{ color: colors.soilTop }}>
                {avgSoilTop}%
              </strong>
            </div>

            <div className="chart-metric-item">
              <span className="metric-label">
                <Layers size={13} style={{ color: colors.soilDeep }} /> Média 7-28 cm (Subsuperficial)
              </span>
              <strong className="metric-value" style={{ color: colors.soilDeep }}>
                {avgSoilDeep}%
              </strong>
            </div>

            <div className="chart-metric-item">
              <span className="metric-label">
                <AlertCircle size={13} /> Status Hídrico
              </span>
              <strong
                className="metric-value"
                style={{
                  color:
                    avgSoilTop < 20 || avgSoilDeep < 20
                      ? colors.warning
                      : avgSoilTop > 80
                      ? colors.neutral
                      : colors.soilTop,
                }}
              >
                {avgSoilTop < 20
                  ? 'Déficit'
                  : avgSoilTop > 80
                  ? 'Saturação'
                  : 'Favorável'}
              </strong>
            </div>
          </div>

          {/* Sub-toggle Diário / Horário */}
          <div className="chart-subtoggle-row">
            <span className="subtoggle-hint">
              {soilViewMode === 'daily'
                ? 'Umidade do solo ao meio-dia (12h) ao longo dos 7 dias'
                : 'Variação horária da umidade do solo nas próximas 48 horas'}
            </span>
            <div className="subtoggle-group">
              <button
                className={`subtoggle-btn ${soilViewMode === 'daily' ? 'active' : ''}`}
                onClick={() => setSoilViewMode('daily')}
              >
                7 Dias
              </button>
              <button
                className={`subtoggle-btn ${soilViewMode === 'hourly' ? 'active' : ''}`}
                onClick={() => setSoilViewMode('hourly')}
              >
                48 Horas
              </button>
            </div>
          </div>

          <div className="chart-container-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={soilViewMode === 'daily' ? soilDailyData : soilHourlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  stroke={colors.axisText}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />

                {/* Linhas de Referência Agronômica */}
                <ReferenceLine
                  y={18}
                  stroke="#FF3B30"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                  label={{
                    value: 'Déficit (18%)',
                    fill: '#FF3B30',
                    fontSize: 9,
                    position: 'insideBottomRight',
                  }}
                />
                <ReferenceLine
                  y={85}
                  stroke="#007AFF"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: 'Saturação (85%)',
                    fill: '#007AFF',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="moisture0_7"
                  name="Umidade 0-7 cm"
                  unit="%"
                  stroke={colors.soilTop}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: colors.soilTop }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="moisture7_28"
                  name="Umidade 7-28 cm"
                  unit="%"
                  stroke={colors.soilDeep}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: colors.soilDeep }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-footnote">
            Linhas pontilhadas indicam o limiar de estresse por déficit (&lt;18%) e excesso de água por encharcamento (&gt;85%).
          </div>
        </div>
      )}
    </div>
  );
}
