import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateDeltaT, evaluateSprayingCondition, checkAgronomicAlerts } from './openMeteo.js';
import { calculateSoilWaterBalance } from './soilPhysics.js';

/**
 * Converte a logo da UEPG para Data URL base64
 */
async function getLogoBase64() {
  try {
    const response = await fetch('/assets/uepg-logo.png');
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = typeof btoa !== 'undefined' 
      ? btoa(binary) 
      : Buffer.from(binary, 'binary').toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.warn('Não foi possível carregar a logo para o PDF:', error);
    return null;
  }
}

/**
 * Gera e faz o download de um Laudo Técnico / Boletim Agrometeorológico em PDF
 */
export async function generateAgroMeteoPDF({ 
  forecastData, 
  lat, 
  lng, 
  locationName,
  soilType = 'argiloso',
  rootDepth = 40 
}) {
  if (!forecastData || !forecastData.daily || !forecastData.hourly) {
    throw new Error('Dados meteorológicos incompletos para geração do PDF.');
  }

  const d = forecastData.daily;
  const h = forecastData.hourly;
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Cria documento PDF em formato A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  // 1. CABEÇALHO INSTITUCIONAL COM LOGO UEPG
  const logoData = await getLogoBase64();
  if (logoData) {
    try {
      // Adiciona a logo da UEPG na proporção original (~30x18mm)
      doc.addImage(logoData, 'PNG', margin, currentY, 32, 19);
    } catch (e) {
      console.warn('Erro ao inserir logo no PDF:', e);
    }
  }

  // Título e identificação institucional
  const textLeft = logoData ? margin + 36 : margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 51, 102); // Azul Institucional UEPG
  doc.text('UNIVERSIDADE ESTADUAL DE PONTA GROSSA - UEPG', textLeft, currentY + 4);

  doc.setFontSize(14);
  doc.setTextColor(26, 32, 44);
  doc.text('AgroMeteo • Laudo & Boletim Agrometeorológico', textLeft, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Emissão: ${dateFormatted} às ${timeFormatted} • Fuso Horário: América/São Paulo (UTC-3)`,
    textLeft,
    currentY + 16
  );

  currentY += 24;

  // Linha divisória de destaque
  doc.setDrawColor(0, 122, 255);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // 2. QUADRO DE IDENTIFICAÇÃO DO TALHÃO & BALANÇO HÍDRICO DE SOLO
  const s0_7 = h.soil_moisture_0_to_7cm ? (h.soil_moisture_0_to_7cm[12] ?? 0.3) : 0.3;
  const s7_28 = h.soil_moisture_7_to_28cm ? (h.soil_moisture_7_to_28cm[12] ?? 0.3) : 0.3;
  const soilBalance = calculateSoilWaterBalance({
    soilTypeKey: soilType,
    rootDepth: Number(rootDepth),
    soilMoisture0_7: s0_7,
    soilMoisture7_28: s7_28,
    et0Daily: d.et0_fao_evapotranspiration || [],
    rainForecast: d.precipitation_sum || [],
  });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 30, 2, 2, 'FD');

  const locTitle = locationName ? `Talhão / Local: ${locationName}` : 'Ponto de Monitoramento Georreferenciado';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(locTitle, margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  const elevText = forecastData.elevation != null ? `${forecastData.elevation} metros` : 'N/D';
  const totalPrecip = d.precipitation_sum ? d.precipitation_sum.reduce((a, b) => a + (b || 0), 0) : 0;
  const maxTempPeriod = d.temperature_2m_max ? Math.max(...d.temperature_2m_max) : '-';
  const minTempPeriod = d.temperature_2m_min ? Math.min(...d.temperature_2m_min) : '-';

  // Linha 1 de dados
  doc.text(`Latitude: ${lat != null ? lat.toFixed(4) : '-'}°`, col1X, currentY + 12);
  doc.text(`Altitude: ${elevText}`, col2X, currentY + 12);
  doc.text(`Chuva Acumulada (7d): ${totalPrecip.toFixed(1)} mm`, col3X, currentY + 12);

  // Linha 2 de dados
  doc.text(`Longitude: ${lng != null ? lng.toFixed(4) : '-'}°`, col1X, currentY + 18);
  doc.text('Horizonte: Previsão de 7 Dias', col2X, currentY + 18);
  doc.text(`Amplitude Térmica: ${minTempPeriod}°C a ${maxTempPeriod}°C`, col3X, currentY + 18);

  // Linha 3 de dados (Parâmetros de Solo e Água Disponível)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text(`Solo: ${soilBalance.profile.name} (${rootDepth} cm)`, col1X, currentY + 24);
  doc.text(`Água Disponível (AD): ${soilBalance.adPercent}%`, col2X, currentY + 24);
  doc.text(`Lâmina Reposição: ${soilBalance.irrigationRequiredMm > 0 ? `${soilBalance.irrigationRequiredMm} mm` : 'Satisfeita'}`, col3X, currentY + 24);

  currentY += 34;

  // 3. ALERTAS E DIAGNÓSTICO AGRONÔMICO
  const alerts = checkAgronomicAlerts(forecastData, soilType, rootDepth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 51, 102);
  doc.text('DIAGNÓSTICO E ALERTAS AGRONÔMICOS EM DESTAQUE', margin, currentY);
  currentY += 4;

  let alertSummaryText = '';
  if (alerts.length === 0) {
    alertSummaryText = 'Condições favoráveis: sem risco imediato de geada, tempestades severas (baixo índice CAPE) ou estresse hídrico crítico nas camadas radiculares.';
  } else {
    alertSummaryText = alerts.map((a) => `[${a.title.toUpperCase()}]: ${a.description}`).join(' | ');
  }

  doc.setFillColor(alerts.length > 0 ? 255 : 240, alerts.length > 0 ? 247 : 253, alerts.length > 0 ? 237 : 244);
  doc.setDrawColor(alerts.length > 0 ? 255 : 187, alerts.length > 0 ? 179 : 247, alerts.length > 0 ? 71 : 208);
  doc.setLineWidth(0.3);

  const splitAlertText = doc.splitTextToSize(alertSummaryText, pageWidth - margin * 2 - 8);
  const alertBoxHeight = Math.max(12, splitAlertText.length * 4.5 + 4);

  doc.roundedRect(margin, currentY, pageWidth - margin * 2, alertBoxHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', alerts.length > 0 ? 'bold' : 'normal');
  doc.setFontSize(8);
  doc.setTextColor(alerts.length > 0 ? 154 : 34, alerts.length > 0 ? 52 : 139, alerts.length > 0 ? 18 : 34);
  doc.text(splitAlertText, margin + 4, currentY + 5);

  currentY += alertBoxHeight + 6;

  // 4. TABELA RESUMIDA DOS 7 DIAS (AutoTable)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 51, 102);
  doc.text('BOLETIM METEOROLÓGICO DIÁRIO & JANELA DE PULVERIZAÇÃO', margin, currentY);
  currentY += 3;

  const tableHead = [
    [
      'Data / Dia',
      'Temp. Min/Máx',
      'Chuva (mm)',
      'Prob. (%)',
      'Vento Méd/Raj',
      'ET0 (mm)',
      'Solo 0-7cm',
      'Solo 7-28cm',
      'Janela Delta T',
    ],
  ];

  const tableBody = d.time.map((timeStr, i) => {
    const dateObj = new Date(timeStr + 'T00:00:00');
    const dayLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const hrMidday = i * 24 + 12;

    const tMin = d.temperature_2m_min ? `${d.temperature_2m_min[i]}°C` : '-';
    const tMax = d.temperature_2m_max ? `${d.temperature_2m_max[i]}°C` : '-';
    const rain = d.precipitation_sum ? `${d.precipitation_sum[i]} mm` : '0 mm';
    const prob = d.precipitation_probability_max ? `${d.precipitation_probability_max[i]}%` : '0%';
    const wind = d.windspeed_10m_max ? `${Math.round(d.windspeed_10m_max[i])} km/h` : '-';
    const gust = d.windgusts_10m_max ? ` (${Math.round(d.windgusts_10m_max[i])})` : '';
    const et0 = d.et0_fao_evapotranspiration ? `${d.et0_fao_evapotranspiration[i]}` : '-';

    const s0_7 = h.soil_moisture_0_to_7cm && h.soil_moisture_0_to_7cm[hrMidday] != null
      ? `${(h.soil_moisture_0_to_7cm[hrMidday] * 100).toFixed(0)}%`
      : '-';
    const s7_28 = h.soil_moisture_7_to_28cm && h.soil_moisture_7_to_28cm[hrMidday] != null
      ? `${(h.soil_moisture_7_to_28cm[hrMidday] * 100).toFixed(0)}%`
      : '-';

    // Avaliação da Janela de Pulverização diurna para o dia
    let favHours = 0;
    for (let hr = i * 24 + 6; hr <= i * 24 + 18; hr++) {
      const cond = evaluateSprayingCondition({
        temp: h.temperature_2m ? h.temperature_2m[hr] : 20,
        rh: h.relative_humidity_2m ? h.relative_humidity_2m[hr] : 60,
        wind: h.windspeed_10m ? h.windspeed_10m[hr] : 6,
        precip: h.precipitation ? h.precipitation[hr] : 0,
      });
      if (cond.status === 'favorable') favHours++;
    }

    const spraySummary = favHours >= 6 ? `Favorável (${favHours}h)` : favHours >= 3 ? `Marginal (${favHours}h)` : 'Inadequado';

    return [
      dayLabel.toUpperCase(),
      `${tMin} / ${tMax}`,
      rain,
      prob,
      `${wind}${gust}`,
      et0,
      s0_7,
      s7_28,
      spraySummary,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: 7.5,
      halign: 'center',
      valign: 'middle',
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 24 },
      1: { cellWidth: 22 },
      2: { cellWidth: 18 },
      3: { cellWidth: 15 },
      4: { cellWidth: 25 },
      5: { cellWidth: 15 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 27 },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      // Destaque de cor suave na coluna de Janela Delta T
      if (data.section === 'body' && data.column.index === 8) {
        const val = String(data.cell.raw);
        if (val.startsWith('Favorável')) {
          data.cell.styles.textColor = [36, 138, 61];
          data.cell.styles.fontStyle = 'bold';
        } else if (val.startsWith('Marginal')) {
          data.cell.styles.textColor = [199, 119, 0];
        } else {
          data.cell.styles.textColor = [211, 47, 47];
        }
      }
    },
  });

  currentY = doc.lastAutoTable.finalY + 7;

  // 5. OBSERVAÇÕES TÉCNICAS E RECOMENDAÇÕES FITOSSANITÁRIAS
  const rawNotes = [
    '• Aplicação de Defensivos: Operar preferencialmente com Delta T entre 2°C e 8°C, vento entre 3 e 10 km/h e UR > 50%.',
    '• Risco de Deriva e Evaporação: Delta T > 8°C causa rápida evaporação de gotas; Delta T < 2°C favorece orvalho e deriva estática.',
    `• Manejo Hídrico (Solo ${soilBalance.profile.name} - ${rootDepth} cm): Água Disponível em ${soilBalance.adPercent}%. Lâmina necessária para reposição: ${soilBalance.irrigationRequiredMm > 0 ? `${soilBalance.irrigationRequiredMm} mm` : '0 mm (Capacidade de campo atendida)'}. Autonomia estimada: ${soilBalance.adPercent <= 40 ? 'Limiar crítico atingido' : `${soilBalance.autonomyDays} dias`}.`,
    `• Trafegabilidade de Máquinas no Talhão: ${soilBalance.trafficability.title} - ${soilBalance.trafficability.description}`,
  ];

  const noteLines = [];
  rawNotes.forEach((n) => {
    const wrapped = doc.splitTextToSize(n, pageWidth - margin * 2 - 8);
    noteLines.push(...wrapped);
  });

  const notesBoxHeight = 10 + noteLines.length * 4;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, notesBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 51, 102);
  doc.text('ORIENTAÇÕES OPERACIONAIS PARA O CAMPO:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  noteLines.forEach((line, idx) => {
    doc.text(line, margin + 4, currentY + 10 + idx * 4);
  });

  // 6. RODAPÉ OFICIAL
  const footerY = pageHeight - 10;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'AgroMeteo • Universidade Estadual de Ponta Grossa (UEPG) • Dados numéricos de alta resolução via Open-Meteo',
    margin,
    footerY + 2
  );
  doc.text(
    'Página 1 de 1',
    pageWidth - margin - 16,
    footerY + 2
  );

  // 7. DOWNLOAD AUTOMÁTICO DO PDF
  const cleanName = (locationName || `Lat_${lat.toFixed(2)}_Lng_${lng.toFixed(2)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AgroMeteo_Laudo_${cleanName}_${now.toISOString().slice(0, 10)}.pdf`;

  doc.save(filename);
  return doc;
}
