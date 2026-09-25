import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bookmark, X, MapPin, AlertCircle } from 'lucide-react';
import { db, saveLocation, MAX_SAVED_LOCATIONS } from '../db';

export default function SaveLocationModal({ isOpen, onClose, lat, lng, onSaved }) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savedCount = useLiveQuery(() => db.locations.count()) ?? 0;
  const isLimitReached = savedCount >= MAX_SAVED_LOCATIONS;

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || isLimitReached) return;

    setIsSubmitting(true);
    try {
      await saveLocation({
        name: name.trim(),
        lat,
        lng,
        notes: notes.trim(),
      });
      setName('');
      setNotes('');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={20} color="#007AFF" /> 
            <span>Salvar Ponto / Talhão ({savedCount}/{MAX_SAVED_LOCATIONS})</span>
          </h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isLimitReached && (
          <div style={{
            background: 'rgba(255, 59, 48, 0.12)',
            color: 'var(--danger-red)',
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: '0.82rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 500,
            lineHeight: 1.4
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>Limite de {MAX_SAVED_LOCATIONS} locais atingido. Remova um local existente na aba "Locais Salvos" para adicionar este.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Local / Identificação</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Coordenadas Selecionadas</label>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', padding: '8px 12px', background: 'var(--item-bg)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="#007AFF" />
              <span>{lat?.toFixed(5)}, {lng?.toFixed(5)}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Anotações</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !name.trim() || isLimitReached}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
