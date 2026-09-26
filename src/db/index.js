import Dexie from 'dexie';

export const db = new Dexie('AgroMeteoDB');

db.version(1).stores({
  locations: '++id, name, lat, lng, createdAt',
  history: '++id, locationLabel, lat, lng, timestamp'
});

db.version(2).stores({
  history: '++id, locationLabel, lat, lng, timestamp, isPinned'
});

export const MAX_SAVED_LOCATIONS = 5;
export const MAX_HISTORY_ITEMS = 25; // Limite ideal para navegação instantânea sem sobrecarregar a memória
export const MAX_PINNED_HISTORY = 5; // Limite de 5 consultas fixadas que não são excluídas automaticamente

export async function saveLocation({ name, lat, lng, notes = '', soilType = 'argiloso', rootDepth = 40 }) {
  const count = await db.locations.count();
  if (count >= MAX_SAVED_LOCATIONS) {
    throw new Error(`Limite máximo de ${MAX_SAVED_LOCATIONS} locais salvos atingido. Remova um local para salvar outro.`);
  }

  return await db.locations.add({
    name: name.trim() || `Ponto (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    lat,
    lng,
    notes,
    soilType,
    rootDepth,
    createdAt: new Date().toISOString()
  });
}

export async function updateLocation(id, changes) {
  return await db.locations.update(id, changes);
}

export async function deleteLocation(id) {
  return await db.locations.delete(id);
}

export async function addHistoryEntry({ locationLabel, lat, lng, elevation, forecastData }) {
  // Mantém estritamente os últimos MAX_HISTORY_ITEMS registros
  // NUNCA exclui registros fixados (isPinned: true)
  const totalCount = await db.history.count();
  if (totalCount >= MAX_HISTORY_ITEMS) {
    // Busca registros não fixados ordenados pelos mais antigos
    const unpinnedItems = await db.history
      .filter(item => !item.isPinned)
      .sortBy('id');

    if (unpinnedItems.length > 0) {
      const excess = totalCount - MAX_HISTORY_ITEMS + 1;
      const keysToDelete = unpinnedItems.slice(0, excess).map(item => item.id);
      if (keysToDelete.length > 0) {
        await db.history.bulkDelete(keysToDelete);
      }
    }
  }

  return await db.history.add({
    locationLabel: locationLabel || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
    lat,
    lng,
    elevation,
    timestamp: new Date().toISOString(),
    isPinned: false,
    forecastData
  });
}

export async function togglePinHistoryEntry(id) {
  const item = await db.history.get(id);
  if (!item) return false;

  const willPin = !item.isPinned;

  if (willPin) {
    const pinnedCount = await db.history.filter(h => !!h.isPinned).count();
    if (pinnedCount >= MAX_PINNED_HISTORY) {
      throw new Error(`Limite de ${MAX_PINNED_HISTORY} consultas fixadas atingido. Desafixe uma para fixar outra.`);
    }
  }

  await db.history.update(id, { 
    isPinned: willPin,
    pinnedAt: willPin ? new Date().toISOString() : null
  });

  return willPin;
}

export async function deleteHistoryEntry(id) {
  return await db.history.delete(id);
}

export async function clearHistory(preservePinned = true) {
  if (preservePinned) {
    const unpinnedKeys = await db.history
      .filter(item => !item.isPinned)
      .primaryKeys();
    if (unpinnedKeys.length > 0) {
      await db.history.bulkDelete(unpinnedKeys);
    }
    return;
  }
  return await db.history.clear();
}
