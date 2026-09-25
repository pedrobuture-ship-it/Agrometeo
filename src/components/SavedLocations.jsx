import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bookmark, Trash2, ArrowUpRight, Calendar, MapPin, FileText } from 'lucide-react';
import { db, deleteLocation, MAX_SAVED_LOCATIONS } from '../db';

export default function SavedLocations({ onSelectLocation }) {
  const locations = useLiveQuery(() => db.locations.orderBy('createdAt').reverse().toArray());

  async function handleDelete(id, name, e) {
    e.stopPropagation();
    if (confirm(`Deseja realmente remover o local "${name}"?`)) {
      await deleteLocation(id);
    }
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="empty-state">
        <Bookmark size={48} />
        <h3>Nenhum local salvo ainda</h3>
        <p>
          Clique em qualquer ponto do mapa para analisar e utilize o botão <strong>"Salvar Local"</strong> para guardar até {MAX_SAVED_LOCATIONS} talhões ou áreas de interesse.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bookmark size={18} color="#007AFF" />
          <span>Talhões e Locais Cadastrados ({locations.length}/{MAX_SAVED_LOCATIONS})</span>
        </h3>
      </div>

      {locations.map((loc) => {
        const dateStr = loc.createdAt
          ? new Date(loc.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '';

        return (
          <div className="item-card" key={loc.id}>
            <div className="item-card-header">
              <div className="item-title-group">
                <h4>{loc.name}</h4>
                <p>
                  <MapPin size={13} /> {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </p>
              </div>

              <div className="item-actions">
                <button
                  className="btn-icon danger"
                  title="Excluir local"
                  onClick={(e) => handleDelete(loc.id, loc.name, e)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {loc.notes && (
              <div className="item-notes">
                <FileText size={13} /> {loc.notes}
              </div>
            )}

            <div className="item-card-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} /> {dateStr}
              </span>

              <button className="btn-load" onClick={() => onSelectLocation(loc)}>
                Analisar <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
