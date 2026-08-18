#  AgroMeteo

> Painel interativo de análise agrometeorológica para monitoramento de solo e condições climáticas em tempo real.

O **AgroMeteo** é uma aplicação web focada em fornecer dados meteorológicos e agronômicos de alta precisão para produtores, pesquisadores e profissionais do campo. Com uma interface moderna inspirada no ecossistema iOS, a ferramenta permite analisar variáveis da atmosfera e do solo diretamente em um mapa interativo.

---

##  Funcionalidades

* ** Consulta Geográfica:** Clique em qualquer ponto do mapa para obter instantaneamente o diagnóstico climático local.
* ** Navegação Limitada (Mundo Único):** Configuração de mapa restrita para evitar duplicidade de continentes ou falhas de clique fora das coordenadas reais.
* ** Indicadores Atmosféricos:** Previsão de temperatura (mínima e máxima), umidade relativa do ar, pressão de superfície e visibilidade.
* ** Alerta de Tempestades:** Monitoramento do índice **CAPE** (*Convective Available Potential Energy*) para identificação antecipada de eventos severos, além de volume e probabilidade de chuva.
* ** Parâmetros Agronômicos e Solo:**
  * Evapotranspiração de referência (ET₀ FAO).
  * Temperatura do solo nas camadas de 0–7 cm e 7–28 cm.
  * Umidade do solo nas camadas de 0–7 cm e 7–28 cm.
  * Radiação solar acumulada (MJ/m²) e Índice UV máximo.
* ** Exportação em CSV:** Download de relatórios agrometeorológicos completos compatíveis com Excel e plataformas de gestão agrícola.
* ** Design Responsivo:** Interface otimizada para smartphones, tablets e computadores desktop.

---

##  Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Glassmorphism, CSS Grid, Flexbox) e JavaScript (ES6+ Vanilla).
* **Mapas:** [Leaflet.js](https://leafletjs.com/) + Tiles do [OpenStreetMap](https://www.openstreetmap.org/).
* **Dados Meteorológicos:** [Open-Meteo API](https://open-meteo.com/).

---

##  Como Executar o Projeto

Como o AgroMeteo é uma aplicação *client-side* pura, não há necessidade de instalação de dependências ou servidores:

1. Clone este repositório:
   ```bash
   git clone [https://github.com/pedrobuture-ship-it/Agrometeo.git](https://github.com/pedrobuture-ship-it/Agrometeo.git)
