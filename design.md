# Manual de Design e Identidade Visual (Design System)

Este documento descreve a linguagem visual, arquitetura de interface, tokens de estilo, paleta de cores e padrões de componentes desenvolvidos para este projeto. O objetivo deste guia é permitir a replicação fiel dessa estética minimalista, densa em dados e inspirada no design da Apple (Human Interface Guidelines) em outros sistemas e aplicações web.

---

## 1. Filosofia de Design e Princípios Estéticos

1. **Elegância Funcional (Apple-Inspired Minimalism):**
   - Eliminação de ornamentos desnecessários, ruído visual e gradientes agressivos sem propósito.
   - Prioridade total à legibilidade dos dados agronômicos e meteorológicos.
   - Bordas sutis semitransparentes combinadas com sombras difusas para delimitar camadas e profundidade.

2. **Densidade de Dados com Conforto Visual:**
   - Apresentação de múltiplas camadas de métricas e equações técnicas sem sensação de poluição visual.
   - Agrupamento em cartões hierárquicos (*Cards within Cards*), pílulas de status (*Pills/Badges*) e seções expansíveis (*Accordions*).

3. **Glassmorphism de Precisão (Materiais Translúcidos):**
   - Uso de `backdrop-filter: blur(...)` e saturação controlada para cabeçalhos, barras de pesquisa e controles de mapa.
   - Sensação táctil de vidro fosco fosco sobreposto ao conteúdo de fundo.

4. **Tema Dual Nativo (Light Mode e Dark Mode de Alto Contraste):**
   - No modo claro: tons de cinza suave (*Apple Light Gray* `#F5F5F7`), cartões brancos puros e sombras delicadas.
   - No modo escuro: tons profundos de ardósia e grafite OLED (`#0E0E10`, `#1C1C1E`), eliminando contraste agressivo de pretos puros vazios e realçando a visibilidade das curvas dos gráficos.

5. **Ergonomia Móvel e Respeito aos Dispositivos:**
   - Suporte de ponta a ponta para navegadores móveis (Safari iOS, Chrome Android).
   - Uso rigoroso de unidades dinâmicas de viewport (`100dvh`), áreas de segurança (`env(safe-area-inset-*)`), áreas de toque acessíveis (mínimo de 36px a 44px) e prevenção contra cortes de tela causados por teclados virtuais e barras dinâmicas.

---

## 2. Tokens de Design (Design Tokens)

### 2.1. Variáveis CSS Globais

Abaixo está o bloco central de tokens que deve ser inserido no arquivo raiz de estilos (`index.css` ou `tokens.css`):

```css
:root {
  /* Cores de Fundo e Superfície (Modo Claro) */
  --bg-color: #F5F5F7;
  --card-bg: #FFFFFF;
  --item-bg: #F2F2F7;
  --item-hover: #E5E5EA;
  --header-bg: rgba(255, 255, 255, 0.82);

  /* Bordas e Delimitadores */
  --border-color: rgba(0, 0, 0, 0.08);

  /* Cores de Texto */
  --text-main: #1D1D1F;
  --text-light: #86868B;

  /* Cores Semânticas de Sistema (Apple Palette) */
  --primary-blue: #007AFF;
  --primary-blue-hover: #0062CC;
  --success-green: #34C759;
  --warning-orange: #FF9500;
  --danger-red: #FF3B30;

  /* Camada Geográfica / Mapa */
  --map-bg: #aad3df;

  /* Sombras de Elevação */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
  --shadow-modal: 0 24px 48px rgba(0, 0, 0, 0.28);
}

:root[data-theme="dark"], body.dark {
  /* Cores de Fundo e Superfície (Modo Escuro / OLED Slate) */
  --bg-color: #0E0E10;
  --card-bg: #1C1C1E;
  --item-bg: #2C2C2E;
  --item-hover: #3A3A3C;
  --header-bg: rgba(24, 24, 26, 0.85);

  /* Bordas e Delimitadores */
  --border-color: rgba(255, 255, 255, 0.12);

  /* Cores de Texto */
  --text-main: #F5F5F7;
  --text-light: #98989D;

  /* Cores Semânticas de Sistema (Dark Adjusted) */
  --primary-blue: #0A84FF;
  --primary-blue-hover: #409CFF;
  --success-green: #32D74B;
  --warning-orange: #FF9F0A;
  --danger-red: #FF453A;

  /* Camada Geográfica / Mapa */
  --map-bg: #151c24;

  /* Sombras de Elevação (Profundidade Dark) */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.40);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.60);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.65);
  --shadow-modal: 0 24px 48px rgba(0, 0, 0, 0.75);
}
```

---

## 3. Tipografia e Escala de Texto

A tipografia é baseada na fonte de sistema nativa da Apple (`San Francisco`), garantindo renderização ultra-rápida, sem flashes de carregamento de fontes externas (FOUT/FOIT) e consistência estética com o ecossistema iOS e macOS.

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-main);
  background-color: var(--bg-color);
  line-height: 1.45;
}
```

### Escala Tipográfica Padronizada:
- **Títulos de Seção / Header:** `1.25rem` a `1.4rem` | `font-weight: 700` | `letter-spacing: -0.5px`
- **Subtítulos e Nomes de Cartão:** `1.0rem` a `1.1rem` | `font-weight: 600` | `letter-spacing: -0.2px`
- **Títulos de Métricas / Blocos Menores:** `0.85rem` a `0.92rem` | `font-weight: 600`
- **Texto Principal / Corpo:** `0.85rem` a `0.90rem` | `font-weight: 400`
- **Valores Numéricos Destacados (Grandes):** `1.5rem` a `1.8rem` | `font-weight: 700` | `letter-spacing: -0.5px`
- **Legendas, Badges e Rótulos Menores:** `0.70rem` a `0.78rem` | `font-weight: 600` | `text-transform: uppercase`

---

## 4. Geometria, Espaçamentos e Arredondamentos

A interface utiliza cantos altamente arredondados (*Squircle / Continuous Corners*), uma das marcas registradas do design moderno de software:

- **Modais e Cartões Principais:** `border-radius: 20px`
- **Seções Internas e Cartões Secundários:** `border-radius: 14px` a `16px`
- **Botões e Campos de Input:** `border-radius: 12px` a `14px`
- **Pílulas de Status e Badges de Notificação:** `border-radius: 6px` a `8px`
- **Botões Circulares / Alternadores:** `border-radius: 50%`

### Grid de Espaçamento Base (Múltiplos de 4px):
- `4px`: Micro-espaçamentos entre ícone e texto ou dentro de badges
- `8px`: Espaço entre itens de lista e gaps de formulário
- `12px`: Padding interno padrão de botões e cartões compactos
- `16px`: Padding de seções e margens de layout móvel
- `20px` a `24px`: Padding interno de cartões de análise e modais de diálogo

---

## 5. Arquitetura de Componentes da Interface

### 5.1. Segmented Control (Abas Superiores Estilo iOS)
Substitui as abas web tradicionais por uma barra segmentada com container de fundo sutil e botão ativo elevado em cartão.

```css
.segmented-control-container {
  display: flex;
  background: var(--item-bg);
  padding: 4px;
  border-radius: 14px;
  gap: 4px;
  border: 1px solid var(--border-color);
}

.segmented-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.segmented-tab-btn:hover {
  color: var(--text-main);
}

.segmented-tab-btn.active {
  background: var(--card-bg);
  color: var(--primary-blue);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

---

### 5.2. Pílulas de Status e Badges Semânticos (Status Badges)
As badges nunca utilizam fundos com cores 100% sólidas e saturadas. Em vez disso, adotam uma base translúcida (opacidade entre 10% e 15%) combinada com tipografia na cor plena:

```css
.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Variação Azul (Informativo / Primário) */
.badge-tag.info {
  background: rgba(0, 122, 255, 0.12);
  color: var(--primary-blue);
}

/* Variação Verde (Sucesso / Favorável) */
.badge-tag.success {
  background: rgba(52, 199, 89, 0.12);
  color: var(--success-green);
}

/* Variação Laranja (Atenção / Moderado) */
.badge-tag.warning {
  background: rgba(255, 149, 0, 0.12);
  color: var(--warning-orange);
}

/* Variação Vermelha (Perigo / Crítico) */
.badge-tag.danger {
  background: rgba(255, 59, 48, 0.12);
  color: var(--danger-red);
}
```

---

### 5.3. Cartão de Destaque Hero (Hero Card)
Utilizado para evidenciar o ponto ou local em análise. Carrega um gradiente azul característico da Apple, com botões de ação integrados:

```css
.hero-card {
  background: linear-gradient(135deg, #007AFF 0%, #0051B3 100%);
  border-radius: 20px;
  padding: 20px;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.30);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-card h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
}

.hero-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.btn-hero-action {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 0.2s ease;
}

.btn-hero-action:hover {
  background: rgba(255, 255, 255, 0.28);
}
```

---

### 5.4. Barra de Pesquisa Flutuante com Glassmorphism
Uma barra de pesquisa flutuante com blur profundo, ícone incorporado e iluminação sutil de borda no estado de foco:

```css
.floating-search-bar {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 4px 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.floating-search-bar:focus-within {
  border-color: var(--primary-blue);
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.25);
}

.floating-search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 0.88rem;
  padding: 8px;
  outline: none;
}
```

---

### 5.5. Cartões Recolhíveis com Cabeçalho Interativo (Accordions)
Padrão utilizado para seções ricas em gráficos ou inteligência de solo, permitindo que a interface permaneça limpa e seja expandida conforme o interesse do usuário:

```css
.collapsible-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
}

.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.collapsible-chevron {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-light);
}

.collapsible-card.is-expanded .collapsible-chevron {
  transform: rotate(180deg);
}
```

---

### 5.6. Modais à Prova de Falhas (Safe Portals & iOS Viewport Safe)
Estrutura de modal resiliente a barras dinâmicas do Safari, entalhes de tela e conflitos de sobreposição:

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh; /* Dynamic Viewport Units */
  background: rgba(0, 0, 0, 0.60);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999 !important;
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  overflow-y: auto;
  box-sizing: border-box;
}

.modal-content {
  background: var(--card-bg);
  color: var(--text-main);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 440px;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  margin: auto; /* Evita corte no topo em flexbox com overflow */
  box-shadow: var(--shadow-modal);
  border: 1px solid var(--border-color);
  transition: background-color 0.25s ease;
}
```

---

## 6. Arquitetura de Camadas e Hierarquia de Z-Index

Para evitar que componentes interativos como mapas, seletores e dropdowns colidam uns com os outros, o sistema adota as seguintes faixas de elevação estritas:

| Faixa de Z-Index | Componente / Elemento | Função e Comportamento |
| :--- | :--- | :--- |
| `200` a `700` | Camadas de Mapa Leaflet | Renderização de ladrilhos (tiles), polígonos e marcadores geográficos |
| `999` | Barra de Pesquisa do Mapa | Flutua sobre as camadas cartográficas |
| `1000` | Header e Controles do Mapa | Cabeçalho global fixo e botões recolhidos de zoom e camadas |
| `1005` | Menu de Camadas Expandido | Flutua sobre o mapa e sobre a barra de pesquisa quando aberto |
| `1010` | Barra de Pesquisa em Foco | Eleva os resultados de autocomplete durante digitação ativa |
| `99999` | Modais e Overlays (`createPortal`) | Montados diretamente no `body`, sobrepõem qualquer outro elemento |

---

## 7. Responsividade e Mobile-First

1. **Tag Meta Viewport Obrigatória:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
   ```
   O parâmetro `viewport-fit=cover` é essencial para que o design ocupe a totalidade da tela em smartphones modernos, permitindo o correto uso das funções CSS `env(safe-area-inset-*)`.

2. **Transição de Layout Desktop para Mobile:**
   - **Desktop (`> 860px`):** Layout horizontal de duas colunas (`#container { display: flex; }`), com mapa ocupando a porção esquerda/central flexível e a barra lateral de dados (`#sidebar`) fixada com largura de `450px` a `520px` e scroll interno independente.
   - **Mobile (`<= 860px`):** Transição fluida para layout vertical de coluna única (`#container { flex-direction: column; }`), onde o mini-mapa ocupa uma altura fixa (360px a 380px) no topo e a análise rola naturalmente abaixo.

3. **Scrollbars Elegantes e Discretas:**
   ```css
   ::-webkit-scrollbar {
     width: 6px;
     height: 6px;
   }
   ::-webkit-scrollbar-track {
     background: transparent;
   }
   ::-webkit-scrollbar-thumb {
     background: rgba(134, 134, 139, 0.28);
     border-radius: 9999px;
   }
   ::-webkit-scrollbar-thumb:hover {
     background: rgba(134, 134, 139, 0.45);
   }
   ```

---

## 8. Como Replicar Essa Estética em Outro Projeto

1. **Instale os ícones:** O projeto utiliza o pacote [`lucide-react`](https://lucide.dev/) (ou correspondente em Vue/Svelte/Vanilla). Utilize traços limpos com espessura padrão de 1.5 a 2px e tamanhos de 14px a 20px.
2. **Copie as variáveis CSS:** Copie a seção `2.1` deste documento para o seu arquivo global de estilos.
3. **Configure a alternância de tema:** Alterne a classe `dark` no elemento `<body>` ou o atributo `data-theme="dark"` no elemento `:root`.
4. **Utilize React Portals para diálogos:** Sempre renderize modais e gavetas laterais diretamente no `document.body` com `createPortal(jsx, document.body)`.
5. **Mantenha os cantos suaves:** Utilize sempre `border-radius: 14px` a `20px` nos blocos de informação e `10px` a `12px` em botões.
6. **Priorize transparência:** Dê preferência a fundos com `rgba(...)` e `backdrop-filter: blur(...)` sobre fundos sólidos e chapados.
