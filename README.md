# AgroMeteo • Inteligência Agrometeorológica

> **Universidade Estadual de Ponta Grossa (UEPG)**  
> Painel agrometeorológico de alta resolução para monitoramento de solo, previsão horária, janelas de pulverização, balanço hídrico personalizado e laudos técnicos para o campo.

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
  * **Estresse Hídrico Personalizado por Solo**: Diagnóstico baseado nas propriedades hidrofísicas reais da classe textural do solo selecionado.

### 4. Inteligência Hidrofísica de Solos & Balanço Hídrico
* **Seleção de Classes Texturais**: Arenoso, Médio / Franco, Argiloso (Padrão Campos Gerais / PR) e Muito Argiloso.
* **Cálculo de Água Disponível Real (AD%)**: Medição precisa do status hídrico da cultura em relação aos pontos críticos de umidade.
* **Lâmina de Irrigação / Reposição (mm)**: Quantidade exata de água necessária para conduzir o solo de volta à Capacidade de Campo.
* **Autonomia Hídrica Estimada (dias)**: Projeção de quantos dias o solo sustenta a lavoura sob a evapotranspiração ($ET_0$) e chuvas previstas antes de atingir o déficit crítico.
* **Diagnóstico de Trafegabilidade de Máquinas**: Avaliação do risco de compactação e atolamento no talhão para operações de tratores, plantio e pulverização.

### 5. Gráficos Interativos (Recharts)
* **Precipitação & Probabilidade**: Barras de volume diário (mm) e curva de probabilidade (%) com alternância entre visão 7 Dias e 48 Horas.
* **Curva Térmica & Amplitude**: Evolução das temperaturas máximas e mínimas ao longo dos dias.
* **Perfil de Umidade do Solo**: Linhas dinâmicas das camadas 0–7 cm e 7–28 cm com marcações da Capacidade de Campo e Ponto de Murcha do solo ativo.
* **Apple Dark Mode Nativo**: Todos os eixos, tooltips e marcadores adaptam-se dinamicamente aos modos Claro e Escuro.

### 6. Armazenamento Local com Dexie.js (IndexedDB)
* **Locais Salvos (Até 5 talhões)**: Salve fazendas e talhões personalizados com anotações de manejo, coordenadas, tipo de solo e profundidade radicular.
* **Histórico Automático (Até 25 consultas)**: Snapshots meteorológicos salvos automaticamente para consulta offline no campo.

### 7. Laudo Técnico em PDF & Exportação CSV
* **Laudo Oficial UEPG em PDF**: Gera relatórios técnicos formatados em A4 com a marca da universidade, resumo do talhão, balanço hídrico de solo, alertas, tabela de 7 dias, orientações de tráfego e recomendações fitossanitárias prontos para envio por WhatsApp ou impressão.
* **Exportação CSV**: Download de planilhas de dados climáticos brutos compatíveis com Excel.

### 8. PWA (Progressive Web App)
* **Instalável na Tela Inicial**: Ícones nativos em alta resolução (`192x192`, `512x512` e `apple-touch-icon`).
* **Cache Offline (`sw.js`)**: Permite carregar a aplicação mesmo sem conexão de dados móveis no campo.

### 9. Transparência de Dados e Metodologia Científica
* **Painel Interativo no Cabeçalho**: Botão com ícone de informação que detalha a origem de cada variável e os modelos de cálculo adotados.
* **Origem dos Dados Meteorológicos**: Especificação de provedor (Open-Meteo API), modelos numéricos (ECMWF, ICON, GFS) e parâmetros atmosféricos brutos.
* **Cálculos Agronômicos Locais**: Exposição aberta das equações psicrométricas (Delta T via Stull), física de solos (AD%, CAD, Lâmina de Irrigação), autonomia hídrica e trafegabilidade.

---

## Fundamentos e Cálculos Hidrofísicos de Solo

O AgroMeteo adota as propriedades físico-hídricas padronizadas pela **Embrapa Solos**, **FAO Irrigation and Drainage Paper 56** e pelas diretrizes do **Zoneamento Agrícola de Risco Climático (ZARC/MAPA)**.

### Tabela de Classes Texturais e Constantes Hidrofísicas

| Classe Textural | Argila (%) | Capacidade de Campo ($\theta_{CC}$) | Ponto de Murcha ($\theta_{PMP}$) | Saturação ($\theta_{SAT}$) | CAD por cm | Densidade Estimada | Ocorrência Regional Típica |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Arenoso** | < 15% | 14% (0,14) | 5% (0,05) | 38% (0,38) | 0,9 mm/cm | 1,55 g/cm³ | Neossolos Quartzarênicos, solos arenitos |
| **Médio / Franco** | 15% a 35% | 24% (0,24) | 11% (0,11) | 44% (0,44) | 1,3 mm/cm | 1,40 g/cm³ | Franco-arenoso a Franco-argilo-arenoso |
| **Argiloso** *(Padrão)* | 35% a 60% | 34% (0,34) | 19% (0,19) | 50% (0,50) | 1,5 mm/cm | 1,25 g/cm³ | Latossolo Vermelho e Nitossolos (Campos Gerais / PR) |
| **Muito Argiloso** | > 60% | 40% (0,40) | 25% (0,25) | 54% (0,54) | 1,5 mm/cm | 1,15 g/cm³ | Latossolo Bruno / Terra Roxa estruturada |

---

### Equações do Balanço Hídrico

#### 1. Umidade Média Ponderada da Zona Radicular ($\theta_{\text{atual}}$)
A umidade volumétrica efetiva do solo é calculada integrando a camada superficial (0 a 7 cm) e a camada subsuperficial (7 a 28 cm) com base na profundidade do sistema radicular ($Z$):

$$\theta_{\text{atual}} = (\theta_{0-7\text{cm}} \times W_1) + (\theta_{7-28\text{cm}} \times W_2)$$

* Para plântula / inicial ($Z \le 20\text{ cm}$): $W_1 = 0,45$ e $W_2 = 0,55$
* Para desenvolvimento pleno ($Z = 40\text{ cm}$): $W_1 = 0,30$ e $W_2 = 0,70$
* Para raiz profunda ($Z \ge 60\text{ cm}$): $W_1 = 0,30$ e $W_2 = 0,70$

#### 2. Água Disponível Real (AD%)
Representa a porcentagem da capacidade de armazenamento de água que está atualmente disponível para absorção pelas plantas:

$$AD\% = \left( \frac{\theta_{\text{atual}} - \theta_{PMP}}{\theta_{CC} - \theta_{PMP}} \right) \times 100$$

Faixas de interpretação agronômica:
* **AD > 100%**: Solo Saturado / Risco de anoxia e asfixia radicular.
* **60% a 100%**: Conforto Hídrico Ideal (desenvolvimento vegetativo pleno).
* **40% a 60%**: Atenção / Início de Esgotamento (início do fechamento estomático).
* **0% a 40%**: Déficit Hídrico Crítico (estresse severo e perda de rendimento).
* **AD $\le$ 0%**: Abaixo do Ponto de Murcha Permanente (murchamento irreversível).

#### 3. Lâmina de Irrigação / Reposição Necessária ($L_{\text{irr}}$)
Volume de água necessário para elevar a umidade atual até a Capacidade de Campo ($\theta_{CC}$) em toda a profundidade explorada pelas raízes:

$$L_{\text{irr}} = (\theta_{CC} - \theta_{\text{atual}}) \times Z \times 10$$

* Onde $Z$ é a profundidade radicular em centímetros ($20$, $40$ ou $60\text{ cm}$).
* O fator multiplicador $10$ converte $\text{m}^3/\text{m}^3 \times \text{cm}$ diretamente em milímetros ($\text{mm}$) de lâmina líquida.
* Se $\theta_{\text{atual}} \ge \theta_{CC}$, a lâmina necessária é igual a $0,0\text{ mm}$.

#### 4. Capacidade Total de Água Disponível no Perfil ($CAD_{\text{total}}$)
Volume total máximo de água retida entre a Capacidade de Campo e o Ponto de Murcha:

$$CAD_{\text{total}} = (\theta_{CC} - \theta_{PMP}) \times Z \times 10$$

#### 5. Autonomia Hídrica Estimada (Dias até Estresse Crítico)
Calcula quantos dias a reserva hídrica suporta a demanda atmosférica antes que a Água Disponível caia abaixo do limiar crítico de $40\%$ ($p \approx 0,60$ de esgotamento da CAD):

$$\theta_{\text{crítico}} = \theta_{PMP} + [0,40 \times (\theta_{CC} - \theta_{PMP})]$$

$$\text{Reserva Remanescente (mm)} = (\theta_{\text{atual}} - \theta_{\text{crítico}}) \times Z \times 10$$

A autonomia é obtida através de balanço diário sequencial nos próximos dias da previsão:

$$\text{Saldo}_{d+1} = \text{Saldo}_d - ET_{0, d} + (0,80 \times \text{Precipitação}_d)$$

Onde $0,80$ representa a fração de chuva efetiva infiltrada no solo. O processo contabiliza os dias até que o saldo atinja zero.

---

### Diagnóstico de Trafegabilidade de Máquinas no Talhão

O tráfego de tratores, colhedoras, transbordos e pulverizadores em solos úmidos é uma das principais causas de compactação subsuperficial e espelhamento de rastro. O modelo avalia a consistência do solo:

* **Saturado / Crítico ($\theta_{\text{atual}} \ge 0,95 \times \theta_{SAT}$)**: Solo em estado líquido/lama. Risco extremo de atolamento e formação de valas. Tráfego desaconselhado.
* **Plástico / Atenção ($\theta_{\text{atual}} > 1,05 \times \theta_{CC}$)**: Solo em estado plástico. Alto risco de compactação severa e destruição de macroporos. Evite máquinas pesadas.
* **Friável / Seguro ($\theta_{PMP} \le \theta_{\text{atual}} \le 1,05 \times \theta_{CC}$)**: Estado friável ideal. O solo esboroa sem deformação plástica, permitindo tráfego seguro de tratores, semeadura e pulverização.
* **Seco / Livre ($\theta_{\text{atual}} < \theta_{PMP}$)**: Solo seco. Sem risco de compactação por umidade, mas com potencial de formação de poeira e encrostamento superficial.

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
