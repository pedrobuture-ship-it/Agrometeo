import React, { useState, useEffect } from 'react';
import { 
  Info, 
  X, 
  Cloud, 
  Database, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sun, 
  Sprout, 
  Layers, 
  Cpu, 
  ExternalLink,
  CheckCircle2,
  Gauge,
  Activity,
  Compass
} from 'lucide-react';

export default function DataSourcesModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('meteorology'); // 'meteorology' | 'calculations'

  // Fechar ao pressionar a tecla ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content data-sources-modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-sources-modal-title"
      >
        {/* Cabeçalho do Modal */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Info size={22} color="#007AFF" />
            </div>
            <div>
              <h3 id="data-sources-modal-title">Origem dos Dados & Metodologia de Cálculos</h3>
              <p className="modal-subtitle">
                Transparência meteorológica e equações agronômicas aplicadas no AgroMeteo
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose} 
            title="Fechar janela (ESC)"
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="modal-tabs-nav">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'meteorology' ? 'active' : ''}`}
            onClick={() => setActiveTab('meteorology')}
          >
            <Cloud size={16} />
            <span>Dados Meteorológicos (Open-Meteo)</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'calculations' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculations')}
          >
            <Cpu size={16} />
            <span>Cálculos Feitos no Site</span>
          </button>
        </div>

        {/* Conteúdo da Aba 1: Dados Meteorológicos Brutos da API */}
        {activeTab === 'meteorology' && (
          <div className="modal-tab-body">
            {/* Banner Informativo sobre a Open-Meteo */}
            <div className="data-source-banner">
              <div className="banner-icon">
                <Database size={24} color="#007AFF" />
              </div>
              <div className="banner-text">
                <h4>Provedor Meteorológico: Open-Meteo API</h4>
                <p>
                  Os dados atmosféricos e climáticos brutos são fornecidos pela <strong>Open-Meteo</strong>, 
                  uma plataforma aberta que integra e interpola os principais modelos numéricos de previsão do mundo 
                  em malha de alta resolução (ECMWF 9 km, DWD ICON 11 km, NOAA GFS 13 km e Météo-France), 
                  com correção orográfica e sem restrições de uso comercial.
                </p>
                <a 
                  href="https://open-meteo.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="banner-external-link"
                >
                  Documentação oficial da Open-Meteo <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Lista Detalhada de Variáveis e Origens */}
            <div className="data-sources-grid">
              {/* Temperatura */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Thermometer size={16} className="text-warning" />
                    <strong>Temperatura do Ar e Extremos</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetros da API:</strong> <code>temperature_2m</code>, <code>temperature_2m_max</code>, <code>temperature_2m_min</code>.
                  </p>
                  <p>
                    Medida padrão da Organização Meteorológica Mundial (OMM) a 2 metros de altura em abrigo meteorológico ventilado, representando o ambiente térmico da copa das culturas.
                  </p>
                </div>
              </div>

              {/* Umidade Relativa */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Droplets size={16} className="text-blue" />
                    <strong>Umidade Relativa do Ar</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetro da API:</strong> <code>relative_humidity_2m</code> (em %).
                  </p>
                  <p>
                    Percentual de vapor de água na atmosfera em relação ao ponto de saturação à temperatura atual. Fundamental para a taxa de evapotranspiração e avaliação de risco de doenças fúngicas.
                  </p>
                </div>
              </div>

              {/* Chuva e Precipitação */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Cloud size={16} className="text-blue" />
                    <strong>Precipitação e Probabilidade</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetros da API:</strong> <code>precipitation</code>, <code>precipitation_sum</code>, <code>precipitation_probability_max</code>.
                  </p>
                  <p>
                    Volume milimétrico de chuva líquida acumulada por hora e por dia, além da probabilidade calculada pelo conjunto de membros dos modelos (Ensemble).
                  </p>
                </div>
              </div>

              {/* Vento e Rajadas */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Wind size={16} className="text-teal" />
                    <strong>Vento Médio, Rajadas e Direção</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetros da API:</strong> <code>windspeed_10m</code>, <code>windgusts_10m_max</code>, <code>winddirection_10m_dominant</code>.
                  </p>
                  <p>
                    Velocidade medida a 10 metros de altura sobre terreno plano. A direção é fornecida em graus azimutais (0° a 360°) e convertida no site para a Rosa dos Ventos (N, NE, L, SE, S, SO, O, NO).
                  </p>
                </div>
              </div>

              {/* Instabilidade CAPE */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Activity size={16} className="text-danger" />
                    <strong>Índice CAPE (Instabilidade Convectiva)</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetro da API:</strong> <code>cape</code> (Convective Available Potential Energy em J/kg).
                  </p>
                  <p>
                    Mede a energia potencial de flutuabilidade na coluna atmosférica. Valores acima de 1500 J/kg indicam alta probabilidade de tempestades severas, rajadas convectivas de vento e granizo.
                  </p>
                </div>
              </div>

              {/* Radiação Solar e UV */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Sun size={16} className="text-warning" />
                    <strong>Radiação Solar Global e Índice UV</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetros da API:</strong> <code>shortwave_radiation_sum</code> (MJ/m²), <code>uv_index_max</code>.
                  </p>
                  <p>
                    Radiação solar global de ondas curtas incidente à superfície da Terra, motor primário da fotossíntese e da demanda evaporativa atmosférica.
                  </p>
                </div>
              </div>

              {/* Pressão e Nebulosidade */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Gauge size={16} className="text-secondary" />
                    <strong>Pressão Superficial e Nuvens</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetros da API:</strong> <code>surface_pressure</code> (hPa), <code>cloudcover</code> (%).
                  </p>
                  <p>
                    Pressão barométrica real na altitude local do terreno e percentual de cobertura do céu por nuvens em todos os níveis.
                  </p>
                </div>
              </div>

              {/* Umidade e Temperatura do Solo (Open-Meteo) */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Layers size={16} className="text-brown" />
                    <strong>Umidade e Temperatura do Solo (Camadas 0-7 e 7-28cm)</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetros da API:</strong> <code>soil_moisture_0_to_7cm</code>, <code>soil_moisture_7_to_28cm</code> (m³/m³), <code>soil_temperature_0_to_7cm</code>, <code>soil_temperature_7_to_28cm</code> (°C).
                  </p>
                  <p>
                    Valores brutos modelados fisicamente pelo modelo de superfície de solo (Land Surface Model) acoplado da Open-Meteo, servindo de dado de entrada para as equações hidrofísicas do AgroMeteo.
                  </p>
                </div>
              </div>

              {/* Evapotranspiração de Referência */}
              <div className="data-source-card">
                <div className="card-header-source">
                  <div className="source-param-name">
                    <Sprout size={16} className="text-success" />
                    <strong>Evapotranspiração de Referência (ET₀)</strong>
                  </div>
                  <span className="source-tag api">Open-Meteo</span>
                </div>
                <div className="card-body-source">
                  <p>
                    <strong>Parâmetro da API:</strong> <code>et0_fao_evapotranspiration</code> (mm/dia).
                  </p>
                  <p>
                    Calculada pela Open-Meteo conforme a equação padrão FAO-56 Penman-Monteith para grama de referência (altura de 0,12 m, albedo de 0,23 e resistência de dossel de 70 s/m).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Cálculos e Metodologias Locais do AgroMeteo */}
        {activeTab === 'calculations' && (
          <div className="modal-tab-body">
            {/* Banner Explicativo sobre a Camada Agronômica Local */}
            <div className="data-source-banner local">
              <div className="banner-icon">
                <Cpu size={24} color="#34C759" />
              </div>
              <div className="banner-text">
                <h4>Processamento Agronômico Local (Frontend AgroMeteo)</h4>
                <p>
                  O AgroMeteo aplica fórmulas matemáticas, equações psicrométricas e modelos hidrofísicos 
                  da <strong>Embrapa Solos</strong>, <strong>FAO-56</strong>, <strong>ZARC (MAPA)</strong> e <strong>ASAE S572</strong> 
                  diretamente no navegador sobre os dados brutos recebidos da API.
                </p>
              </div>
            </div>

            <div className="calculations-list">
              {/* Delta T */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <Droplets size={18} color="#007AFF" />
                    <h4>Delta T (ΔT) — Janela de Pulverização Agrícola</h4>
                  </div>
                  <span className="calc-badge standard">Fórmula de Stull (2011) & ASAE S572</span>
                </div>
                <div className="calc-body">
                  <p>
                    O <strong>Delta T</strong> avalia a taxa de sobrevivência e evaporação das gotas pulverizadas, 
                    sendo a diferença entre a temperatura do ar seco e a temperatura de bulbo úmido:
                  </p>
                  <div className="calc-formula">
                    ΔT = Temperatura do Ar (°C) − Temperatura de Bulbo Úmido (°C)
                  </div>
                  <p>
                    A temperatura de bulbo úmido (Tw) é calculada localmente no código pela equação psicrométrica de Stull (2011) a partir da temperatura (T) e da umidade relativa (UR):
                  </p>
                  <div className="calc-formula code-formula">
                    Tw = T · atan(0.151977 · (UR + 8.313659)<sup>0.5</sup>) + atan(T + UR) − atan(UR − 1.676331) + 0.00391838 · UR<sup>1.5</sup> · atan(0.023101 · UR) − 4.686035
                  </div>
                  <div className="calc-classes-grid">
                    <div className="class-item favorable">
                      <strong>Favorável (2°C a 8°C):</strong> Condição ideal. Evaporação controlada das gotas e excelente absorção foliar.
                    </div>
                    <div className="class-item marginal">
                      <strong>Atenção / Marginal (8°C a 10°C ou ventos de 10 a 12 km/h):</strong> Gotas finas evaporam rápido. Recomenda-se pontas com indução de ar ou adjuvantes anti-deriva.
                    </div>
                    <div className="class-item inadequate">
                      <strong>Inadequado (&lt; 2°C, &gt; 10°C, ventos &gt; 12 km/h ou chuva):</strong> Risco severo de deriva por vento, evaporação total da gota antes de atingir o alvo ou escorrimento por chuva.
                    </div>
                  </div>
                </div>
              </div>

              {/* Água Disponível no Solo (AD%) */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <Layers size={18} color="#34C759" />
                    <h4>Água Disponível no Solo (AD%)</h4>
                  </div>
                  <span className="calc-badge standard">Embrapa Solos & FAO-56</span>
                </div>
                <div className="calc-body">
                  <p>
                    Calcula a porcentagem da reserva hídrica útil contida entre o <strong>Ponto de Murcha Permanente (PMP = 0%)</strong> 
                    e a <strong>Capacidade de Campo (CC = 100%)</strong>:
                  </p>
                  <div className="calc-formula">
                    AD (%) = [ (θ<sub>atual</sub> − θ<sub>PMP</sub>) / (θ<sub>CC</sub> − θ<sub>PMP</sub>) ] × 100
                  </div>
                  <p>
                    A umidade atual do solo (θ<sub>atual</sub>) é uma média ponderada das camadas de 0-7 cm e 7-28 cm, ajustada conforme a profundidade efetiva do sistema radicular (20 cm, 40 cm ou 60 cm).
                  </p>
                  <p>
                    <strong>Constantes Hidrofísicas por Classe Textural (m³/m³):</strong>
                  </p>
                  <div className="calc-table-wrapper">
                    <table className="calc-table">
                      <thead>
                        <tr>
                          <th>Textura</th>
                          <th>Capacidade de Campo (CC)</th>
                          <th>Ponto de Murcha (PMP)</th>
                          <th>Saturação Total (SAT)</th>
                          <th>CAD por cm</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Argiloso (35-60%)</strong></td>
                          <td>0.34 (34%)</td>
                          <td>0.19 (19%)</td>
                          <td>0.50 (50%)</td>
                          <td>1.5 mm/cm</td>
                        </tr>
                        <tr>
                          <td><strong>Muito Argiloso (&gt;60%)</strong></td>
                          <td>0.40 (40%)</td>
                          <td>0.25 (25%)</td>
                          <td>0.54 (54%)</td>
                          <td>1.5 mm/cm</td>
                        </tr>
                        <tr>
                          <td><strong>Médio / Franco (15-35%)</strong></td>
                          <td>0.24 (24%)</td>
                          <td>0.11 (11%)</td>
                          <td>0.44 (44%)</td>
                          <td>1.3 mm/cm</td>
                        </tr>
                        <tr>
                          <td><strong>Arenoso (&lt;15%)</strong></td>
                          <td>0.14 (14%)</td>
                          <td>0.05 (5%)</td>
                          <td>0.38 (38%)</td>
                          <td>0.9 mm/cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Lâmina de Irrigação */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <Droplets size={18} color="#5856D6" />
                    <h4>Lâmina Líquida de Irrigação Necessária (L<sub>irr</sub>)</h4>
                  </div>
                  <span className="calc-badge standard">Manejo de Irrigação FAO</span>
                </div>
                <div className="calc-body">
                  <p>
                    Indica a quantidade exata de água em milímetros (mm) a ser reposta no solo para elevar o perfil de umidade da condição atual até a Capacidade de Campo (100% da AD) na profundidade radicular da cultura:
                  </p>
                  <div className="calc-formula">
                    L<sub>irr</sub> (mm) = (θ<sub>CC</sub> − θ<sub>atual</sub>) × Z × 10
                  </div>
                  <p>
                    Onde <strong>Z</strong> é a profundidade radicular em centímetros (ex: 40 cm) e o fator <strong>10</strong> converte m³/m³ × cm em lâmina de água equivalente em milímetros (1 mm = 1 L/m²).
                  </p>
                </div>
              </div>

              {/* Autonomia Hídrica Estimada */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <Activity size={18} color="#FF9500" />
                    <h4>Autonomia Hídrica Estimada (Dias de Conforto)</h4>
                  </div>
                  <span className="calc-badge standard">Balanço Hídrico Climatológico Prospectivo</span>
                </div>
                <div className="calc-body">
                  <p>
                    Simula o estoque útil de água acima do limiar crítico de estresse hídrico (depleção de 60% da CAD, restando 40% de AD) 
                    e projeta dia a dia a durabilidade dessa reserva consumindo a <strong>ET₀ diária prevista</strong> e somando a <strong>chuva efetiva prevista</strong> (com taxa de aproveitamento agronômico de 80%):
                  </p>
                  <div className="calc-formula">
                    Estoque<sub>dia+1</sub> = Estoque<sub>dia</sub> − ET₀<sub>dia</sub> + (Chuva<sub>dia</sub> × 0.8)
                  </div>
                  <p>
                    A simulação encerra no dia em que o estoque se esgota, indicando ao produtor quando a cultura entrará em estresse severo sem irrigação.
                  </p>
                </div>
              </div>

              {/* Trafegabilidade de Máquinas */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <Gauge size={18} color="#FF2D55" />
                    <h4>Índice de Trafegabilidade de Máquinas</h4>
                  </div>
                  <span className="calc-badge standard">Mecânica do Solo & Compactação</span>
                </div>
                <div className="calc-body">
                  <p>
                    Calculado cruzando o teor de umidade volumétrica com a porosidade total de saturação (θ<sub>SAT</sub>) e a Capacidade de Campo (θ<sub>CC</sub>):
                  </p>
                  <div className="calc-classes-grid">
                    <div className="class-item favorable">
                      <strong>Friável (Tráfego Seguro):</strong> Umidade abaixo da Capacidade de Campo. Solo com suporte mecânico pleno para tratores e colhedoras sem risco de compactação subsuperficial.
                    </div>
                    <div className="class-item marginal">
                      <strong>Plástico (Risco de Compactação):</strong> Umidade entre a Capacidade de Campo e 95% da Saturação. Solo sujeito à deformação plástica e formação de pé de arado. Evitar cargas pesadas.
                    </div>
                    <div className="class-item inadequate">
                      <strong>Crítico (Lama / Risco de Atolamento):</strong> Umidade a 95% ou mais da saturação de poros. Solo fluido; tráfego desaconselhado para evitar atolamentos e sulcamento profundo.
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas Agronômicos */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <CheckCircle2 size={18} color="#FF3B30" />
                    <h4>Sistema de Alertas Agronômicos em Tempo Real</h4>
                  </div>
                  <span className="calc-badge standard">Algoritmo Diagnóstico AgroMeteo</span>
                </div>
                <div className="calc-body">
                  <p>
                    Varre continuamente os vetores meteorológicos dos próximos 7 dias e diagnostica ameaças agrometeorológicas imediatas:
                  </p>
                  <ul className="calc-bullet-list">
                    <li><strong>Alerta de Geada:</strong> Disparado quando T<sub>mín</sub> ≤ 0°C (Geada Severa) ou entre 0°C e 3°C (Geada de Relva).</li>
                    <li><strong>Alerta de Tempestade e Granizo:</strong> Cruzamento de CAPE ≥ 1500 J/kg com precipitação acumulada ≥ 30 mm ou rajadas de vento ≥ 50 km/h.</li>
                    <li><strong>Alerta de Déficit Hídrico:</strong> Disparado quando a umidade volumétrica do solo fica abaixo de 30% da AD ou atinge o Ponto de Murcha.</li>
                  </ul>
                </div>
              </div>

              {/* Rosa dos Ventos */}
              <div className="calculation-card">
                <div className="calc-header">
                  <div className="calc-title">
                    <Compass size={18} color="#007AFF" />
                    <h4>Conversão de Azimute da Rosa dos Ventos</h4>
                  </div>
                  <span className="calc-badge standard">Geodésia & Navegação</span>
                </div>
                <div className="calc-body">
                  <p>
                    O ângulo de direção do vento (0° a 360°) recebido da Open-Meteo é mapeado matematicamente em setores radiais de 45°:
                  </p>
                  <div className="calc-formula">
                    Setor = round((Graus mod 360) / 45) mod 8 → [N, NE, L, SE, S, SO, O, NO]
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé do Modal com Fechamento e Créditos */}
        <div className="modal-footer data-sources-footer">
          <div className="footer-citation">
            Desenvolvido para apoio à pesquisa agronômica e extensão rural na <strong>UEPG (Universidade Estadual de Ponta Grossa)</strong>.
          </div>
          <button type="button" className="btn-action-solid" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
