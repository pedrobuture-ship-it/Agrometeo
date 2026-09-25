# AgroMeteo • Inteligência Agrometeorológica

> **Universidade Estadual de Ponta Grossa (UEPG)**  
> Painel agrometeorológico de alta resolução para monitoramento de solo, previsão horária, janelas de pulverização e laudos técnicos para o campo.

---

## Sobre o Projeto

O **AgroMeteo** é uma Progressive Web Application (PWA) desenvolvida para atender produtores rurais, agrônomos e pesquisadores. Construída sobre uma arquitetura moderna em **React 18 + Vite** e banco de dados local **Dexie.js (IndexedDB)**, a plataforma opera 100% no navegador do usuário, com suporte a consulta offline e instalação na tela inicial de celulares e tablets.

---

## Principais Funcionalidades

### 1. Busca de Municípios & Localização GPS
* **Autocomplete de Cidades**: Busca em tempo real de municípios brasileiros via API Geocoding da Open-Meteo.
* **Voo Suave no Mapa (`flyTo`)**: Transição animada para as coordenadas do município selecionado.
* **Botão Minha Localização (GPS)**: Acesso às coordenadas de alta precisão do dispositivo via Geolocation API.

### 2. Mapas Interativos de Alta Disponibilidade
* **Esri World Street Map**: Mapa base urbano e rodoviário limpo e nítido.
* **Esri Satélite Híbrido**: Imagens orbitais de alta resolução com sobreposição de municípios e divisas.
* **Esri World Topo**: Curvas de nível e relevo topográfico para análise de declividade e drenagem.
* **OpenStreetMap France**: Servidor alternativo livre de bloqueios ou restrições.

### 3. Inteligência Agronômica & Janela de Pulverização
* **Cálculo de Delta T (Fórmula de Stull)**: Monitoramento hora a hora da taxa de evaporação de gotas com base na temperatura de bulbo seco e úmido.
* **Classificação Operacional Diurna (06:00 às 19:00)**:
  * **Favorável**: Vento $\le$ 10 km/h, umidade $\ge$ 50%, temp 15°C a 30°C e Delta T entre 2°C e 8°C.
  * **Marginal**: Condições limítrofes requerendo bicos de gotas grossas ou adjuvantes antideriva.
  * **Inadequado**: Ventos excessivos (> 12 km/h), ar muito seco (< 45% UR), calor excessivo ou chuva.
* **Alertas Agronômicos Proativos**:
  * **Risco de Geada**: Mínimas $\le$ 3°C (geada de relva) e $\le$ 0°C (congelamento severo).
  * **Tempestades & Granizo**: Monitoramento contínuo de energia convectiva atmosférica (CAPE > 1200 / 1800 J/kg).
  * **Estresse Hídrico do Solo**: Diagnóstico das camadas 0–7 cm e 7–28 cm para déficit crítico (< 18%) ou encharcamento (> 85%).

### 4. Gráficos Interativos (Recharts)
* **Precipitação & Probabilidade**: Barras de volume diário (mm) e curva de probabilidade (%) com alternância entre visão 7 Dias e 48 Horas.
* **Curva Térmica & Amplitude**: Evolução das temperaturas máximas e mínimas ao longo dos dias.
* **Perfil de Umidade do Solo**: Dinâmica comparativa entre a camada superficial (0–7 cm) e a subsuperficial (7–28 cm) com linhas de referência agronômica.
* **Apple Dark Mode Nativo**: Todos os eixos, tooltips e marcadores adaptam-se dinamicamente aos modos Claro e Escuro.

### 5. Armazenamento Local com Dexie.js (IndexedDB)
* **Locais Salvos (Até 5 talhões)**: Salve fazendas e talhões personalizados com anotações de manejo.
* **Histórico Automático (Até 25 consultas)**: Snapshots meteorológicos salvos automaticamente para consulta offline no campo.

### 6. Laudo Técnico em PDF & Exportação CSV
* **Laudo Oficial UEPG em PDF**: Gera relatórios técnicos formatados em A4 com a marca da universidade, resumo do talhão, alertas, tabela de 7 dias e recomendações fitossanitárias prontos para envio por WhatsApp ou impressão.
* **Exportação CSV**: Download de planilhas de dados climáticos brutos compatíveis com Excel.

### 7. PWA (Progressive Web App)
* **Instalável na Tela Inicial**: Ícones nativos em alta resolução (`192x192`, `512x512` e `apple-touch-icon`).
* **Cache Offline (`sw.js`)**: Permite carregar a aplicação mesmo sem conexão de dados móveis no campo.

---

## Tecnologias Utilizadas

* **Frontend**: [React 18](https://react.dev/) • [Vite 6](https://vite.dev/)
* **Mapas**: [Leaflet 1.9](https://leafletjs.com/) • [Esri ArcGIS Tile Services](https://www.arcgis.com/)
* **Banco Local**: [Dexie.js 4](https://dexie.org/) (IndexedDB Wrapper)
* **Gráficos**: [Recharts](https://recharts.org/)
* **Relatórios PDF**: [jsPDF](https://github.com/parallax/jsPDF) • [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
* **Ícones**: [Lucide React](https://lucide.dev/)
* **Dados Climáticos**: [Open-Meteo Weather & Geocoding API](https://open-meteo.com/)

---

## Como Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/pedrobuture-ship-it/Agrometeo.git

# Acesse o diretório
cd Agrometeo

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados e prontos para publicação estarão no diretório `dist/`.

---

## Créditos e Parceria

* **Desenvolvimento**: Pedro Buture
* **Instituição**: Universidade Estadual de Ponta Grossa (UEPG)
* **Fonte de Dados**: Open-Meteo (sob licença Creative Commons Attribution 4.0 International)
