import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bookmark, X, MapPin, AlertCircle } from 'lucide-react';
import { db, saveLocation, MAX_SAVED_LOCATIONS } from '../db';
import { SOIL_TYPES, ROOT_DEPTH_OPTIONS } from '../services/soilPhysics';

export default function SaveLocationModal({ 
  isOpen, 
  onClose, 
  lat, 
  lng, 
  onSaved,
  initialSoilType = 'argiloso',
  initialRootDepth = 40
}) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [soilType, setSoilType] = useState(initialSoilType);
  const [rootDepth, setRootDepth] = useState(initialRootDepth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza com as props quando o modal abre
  React.useEffect(() => {
    if (isOpen) {
      setSoilType(initialSoilType || 'argiloso');
      setRootDepth(initialRootDepth || 40);
    }
  }, [isOpen, initialSoilType, initialRootDepth]);

  const savedCount = useLiveQuery(() => db.locations.count()) ?? 0;
  const isLimitReached = savedCount >= MAX_SAVED_LOCATIONS;

  if (!isOpen || typeof document === 'undefined') return null;

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
        soilType,
        rootDepth: Number(rootDepth),
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

  return createPortal(
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
            <label>Tipo de Solo (Textura)</label>
            <select
              className="form-input"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {Object.values(SOIL_TYPES).map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.subname}) - {st.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Profundidade Radicular Efetiva</label>
            <select
              className="form-input"
              value={rootDepth}
              onChange={(e) => setRootDepth(Number(e.target.value))}
              style={{ cursor: 'pointer' }}
            >
              {ROOT_DEPTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Anotações</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Talhão 4, plantio de soja em 15/10..."
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
    </div>,
    document.body
  );
}
