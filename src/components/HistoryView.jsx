import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { History, Trash2, RefreshCw, Eye, Clock, MapPin, Mountain, Pin } from 'lucide-react';
import { db, deleteHistoryEntry, clearHistory, togglePinHistoryEntry, MAX_PINNED_HISTORY } from '../db';

export default function HistoryView({ onLoadHistorySnapshot, onRefreshFromHistory }) {
  const historyItems = useLiveQuery(() => db.history.orderBy('timestamp').reverse().toArray());

  const pinnedCount = historyItems?.filter(i => !!i.isPinned).length || 0;

  // Ordena colocando os fixados no topo, e depois por data decrescente
  const sortedItems = [...(historyItems || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  async function handleTogglePin(id, e) {
    e.stopPropagation();
    try {
      await togglePinHistoryEntry(id);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleClearAll() {
    if (pinnedCount > 0) {
      if (confirm(`Deseja limpar as consultas recentes do histórico? As ${pinnedCount} consultas fixadas serão preservadas.`)) {
        await clearHistory(true);
      }
    } else {
      if (confirm('Deseja realmente limpar todo o histórico de consultas?')) {
        await clearHistory(false);
      }
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    await deleteHistoryEntry(id);
  }

  if (!historyItems || historyItems.length === 0) {
    return (
      <div className="empty-state">
        <History size={48} />
        <h3>Nenhum histórico registrado</h3>
        <p>As análises meteorológicas que você consultar no mapa serão registradas automaticamente aqui para acesso rápido e offline.</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 8 }}>
          Você pode fixar até 5 consultas favoritas para que nunca sejam apagadas.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="history-header-bar">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} color="#007AFF" />
            <span>Histórico de Consultas ({historyItems.length})</span>
          </h3>
          <div className="history-header-subtitle">
            {pinnedCount > 0 ? (
              <span className="pinned-counter-badge" title="Consultas fixadas protegidas contra exclusão automática">
                <Pin size={11} /> {pinnedCount}/{MAX_PINNED_HISTORY} fixadas (protegidas)
              </span>
            ) : (
              <span className="history-hint-text">
                Fixe até 5 consultas para não serem excluídas
              </span>
            )}
          </div>
        </div>

        <button 
          type="button"
          className="btn-icon danger" 
          title={pinnedCount > 0 ? "Limpar histórico recente (mantém as fixadas)" : "Limpar todo o histórico"} 
          onClick={handleClearAll}
          style={{ fontSize: '0.75rem', display: 'flex', gap: 4, alignItems: 'center' }}
        >
          <Trash2 size={14} /> Limpar
        </button>
      </div>

      {sortedItems.map((item) => {
        const dateObj = new Date(item.timestamp);
        const timeFormatted = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div className={`item-card ${item.isPinned ? 'is-pinned' : ''}`} key={item.id}>
            <div className="item-card-header">
              <div className="item-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <h4>{item.locationLabel}</h4>
                  {item.isPinned && (
                    <span className="pinned-badge" title="Consulta fixada — protegida contra exclusão automática">
                      <Pin size={10} /> Fixado
                    </span>
                  )}
                </div>
                <p>
                  <MapPin size={13} /> {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                  {item.elevation != null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6 }}>
                      • <Mountain size={12} /> {item.elevation}m
                    </span>
                  )}
                </p>
              </div>

              <div className="item-actions">
                <button
                  type="button"
                  className={`btn-icon pin-btn ${item.isPinned ? 'active' : ''}`}
                  title={item.isPinned ? 'Desafixar consulta' : `Fixar consulta (${pinnedCount}/${MAX_PINNED_HISTORY} fixadas)`}
                  onClick={(e) => handleTogglePin(item.id, e)}
                  aria-label={item.isPinned ? 'Desafixar consulta' : 'Fixar consulta'}
                >
                  <Pin size={15} className={item.isPinned ? 'pin-active-icon' : ''} />
                </button>

                <button
                  type="button"
                  className="btn-icon danger"
                  title="Excluir do histórico"
                  onClick={(e) => handleDelete(item.id, e)}
                  aria-label="Excluir do histórico"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="item-card-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {timeFormatted}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                {item.forecastData && (
                  <button 
                    type="button"
                    className="btn-action-light" 
                    style={{ background: 'var(--item-bg)', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={() => onLoadHistorySnapshot(item)}
                    title="Carregar snapshot salvo sem consumir internet"
                  >
                    <Eye size={13} /> Ver Salvo
                  </button>
                )}
                <button 
                  type="button"
                  className="btn-load"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={() => onRefreshFromHistory(item)}
                  title="Buscar previsão climática atualizada na Open-Meteo"
                >
                  <RefreshCw size={13} /> Atualizar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
