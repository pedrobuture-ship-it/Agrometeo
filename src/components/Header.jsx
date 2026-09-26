import React, { useState } from 'react';
import { Sun, Moon, Info } from 'lucide-react';
import DataSourcesModal from './DataSourcesModal';

export default function Header({ theme, onToggleTheme }) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <>
      <header>
        <div className="header-brand">
          <h1>AgroMeteo</h1>
        </div>

        <div className="header-links">
          {/* Botão de Origem dos Dados & Metodologia de Cálculos */}
          <button
            type="button"
            className="info-toggle-btn"
            onClick={() => setIsInfoOpen(true)}
            title="Origem dos dados e metodologia de cálculos"
            aria-label="Origem dos dados e metodologia de cálculos"
          >
            <Info size={16} color="#007AFF" />
            <span>Fontes & Cálculos</span>
          </button>

          {/* Botão de Alternar Modo Claro / Escuro */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {isDark ? <Sun size={16} color="#FF9500" /> : <Moon size={16} color="#007AFF" />}
            <span>{isDark ? 'Claro' : 'Escuro'}</span>
          </button>

          <a 
            href="https://www.uepg.br/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="uepg-logo-link" 
            title="Universidade Estadual de Ponta Grossa"
          >
            <div className="uepg-logo-wrapper">
              <img src="/assets/uepg-logo.png" alt="Logo UEPG" className="uepg-logo" />
            </div>
          </a>
        </div>
      </header>

      {/* Modal de Origem dos Dados & Metodologias */}
      {isInfoOpen && (
        <DataSourcesModal onClose={() => setIsInfoOpen(false)} />
      )}
    </>
  );
}
