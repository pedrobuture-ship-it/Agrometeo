import Dexie from 'dexie';

export const db = new Dexie('AgroMeteoDB');

db.version(1).stores({
  locations: '++id, name, lat, lng, createdAt',
  history: '++id, locationLabel, lat, lng, timestamp'
});

export const MAX_SAVED_LOCATIONS = 5;

export async function saveLocation({ name, lat, lng, notes = '' }) {
  const count = await db.locations.count();
  if (count >= MAX_SAVED_LOCATIONS) {
    throw new Error(`Limite máximo de ${MAX_SAVED_LOCATIONS} locais salvos atingido. Remova um local para salvar outro.`);
  }

  return await db.locations.add({
    name: name.trim() || `Ponto (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    lat,
    lng,
    notes,
    createdAt: new Date().toISOString()
  });
}

export async function updateLocation(id, changes) {
  return await db.locations.update(id, changes);
}

export async function deleteLocation(id) {
  return await db.locations.delete(id);
}

export const MAX_HISTORY_ITEMS = 25; // Limite ideal para navegação instantânea sem sobrecarregar a memória

export async function addHistoryEntry({ locationLabel, lat, lng, elevation, forecastData }) {
  // Mantém estritamente os últimos MAX_HISTORY_ITEMS registros (elimina excedentes mais antigos)
  const count = await db.history.count();
  if (count >= MAX_HISTORY_ITEMS) {
    const excess = count - MAX_HISTORY_ITEMS + 1;
    const oldKeys = await db.history.orderBy('id').limit(excess).primaryKeys();
    await db.history.bulkDelete(oldKeys);
  }

  return await db.history.add({
    locationLabel: locationLabel || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
    lat,
    lng,
    elevation,
    timestamp: new Date().toISOString(),
    forecastData
  });
}

export async function deleteHistoryEntry(id) {
  return await db.history.delete(id);
}

export async function clearHistory() {
  return await db.history.clear();
}
