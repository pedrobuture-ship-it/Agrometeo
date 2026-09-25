import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { History, Trash2, RefreshCw, Eye, Clock, MapPin, Mountain } from 'lucide-react';
import { db, deleteHistoryEntry, clearHistory } from '../db';

export default function HistoryView({ onLoadHistorySnapshot, onRefreshFromHistory }) {
  const historyItems = useLiveQuery(() => db.history.orderBy('timestamp').reverse().toArray());

  async function handleClearAll() {
    if (confirm('Deseja realmente limpar todo o histórico de consultas?')) {
      await clearHistory();
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
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} color="#007AFF" />
            <span>Histórico de Consultas ({historyItems.length})</span>
          </h3>
        </div>

        <button 
          className="btn-icon danger" 
          title="Limpar todo o histórico" 
          onClick={handleClearAll}
          style={{ fontSize: '0.75rem', display: 'flex', gap: 4, alignItems: 'center' }}
        >
          <Trash2 size={14} /> Limpar
        </button>
      </div>

      {historyItems.map((item) => {
        const dateObj = new Date(item.timestamp);
        const timeFormatted = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div className="item-card" key={item.id}>
            <div className="item-card-header">
              <div className="item-title-group">
                <h4>{item.locationLabel}</h4>
                <p>
                  <MapPin size={13} /> {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                  {item.elevation != null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6 }}>
                      • <Mountain size={12} /> {item.elevation}m
                    </span>
                  )}
                </p>
              </div>

              <button
                className="btn-icon danger"
                title="Excluir do histórico"
                onClick={(e) => handleDelete(item.id, e)}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="item-card-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {timeFormatted}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                {item.forecastData && (
                  <button 
                    className="btn-action-light" 
                    style={{ background: 'var(--item-bg)', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={() => onLoadHistorySnapshot(item)}
                    title="Carregar snapshot salvo sem consumir internet"
                  >
                    <Eye size={13} /> Ver Salvo
                  </button>
                )}
                <button 
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
