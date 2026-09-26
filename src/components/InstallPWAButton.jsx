import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, X, CheckCircle2 } from 'lucide-react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está em modo standalone (PWA instalado e aberto)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Detecta ambiente iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // 3. Captura evento nativo do PWA no Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Detecta quando o app foi instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Se já estiver instalado ou rodando como PWA nativo, não exibe o botão
  if (isStandalone || isInstalled) {
    return null;
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Se não há prompt nativo (iOS Safari ou desktop sem evento disparado), abre instruções guiadas
      setShowInstructions(true);
    }
  }

  return (
    <>
      <button
        type="button"
        className="pwa-install-btn"
        onClick={handleInstallClick}
        title="Instalar AgroMeteo no seu dispositivo"
        aria-label="Instalar aplicativo AgroMeteo"
      >
        <Download size={16} className="pwa-install-icon" />
        <span>Instalar App</span>
      </button>

      {/* Modal de Instruções de Instalação (para iOS e outros navegadores) */}
      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
          <div 
            className="modal-content install-modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Smartphone size={22} color="#007AFF" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    Instalar o AgroMeteo
                  </h3>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-icon" 
                onClick={() => setShowInstructions(false)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="install-modal-body">
              {isIOS ? (
                <div className="install-steps-list">
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: 12 }}>
                    Para instalar no seu <strong>iPhone</strong> ou <strong>iPad</strong> via Safari:
                  </p>
                  
                  <div className="install-step-item">
                    <span className="step-number">1</span>
                    <div className="step-text">
                      Toque no botão de <strong>Compartilhar</strong> <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> na barra inferior do Safari.
                    </div>
                  </div>

                  <div className="install-step-item">
                    <span className="step-number">2</span>
                    <div className="step-text">
                      Role as opções para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                    </div>
                  </div>

                  <div className="install-step-item">
                    <span className="step-number">3</span>
                    <div className="step-text">
                      Toque em <strong>"Adicionar"</strong> no canto superior direito para concluir.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="install-steps-list">
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: 12 }}>
                    Para instalar no seu computador ou celular Android:
                  </p>

                  <div className="install-step-item">
                    <span className="step-number">1</span>
                    <div className="step-text">
                      No <strong>Chrome ou Edge (computador)</strong>, clique no ícone de instalação <Download size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> na barra de endereços (ao lado dos favoritos).
                    </div>
                  </div>

                  <div className="install-step-item">
                    <span className="step-number">2</span>
                    <div className="step-text">
                      No <strong>Android</strong>, toque no menu de três pontos do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </div>
                  </div>
                </div>
              )}

              <div className="install-benefits-box">
                <div className="benefit-item">
                  <CheckCircle2 size={15} color="#34C759" />
                  <span>Acesso instantâneo e direto da sua tela inicial</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle2 size={15} color="#34C759" />
                  <span>Navegação em tela cheia como aplicativo nativo</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle2 size={15} color="#34C759" />
                  <span>Consulta de dados salvos offline em áreas sem sinal</span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setShowInstructions(false)}
                style={{ width: '100%' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
