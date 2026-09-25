import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Header({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <header>
      <div className="header-brand">
        <h1>AgroMeteo</h1>
      </div>

      <div className="header-links">

        {/* Botão de Alternar Modo Claro / Escuro */}
        <button
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
  );
}
