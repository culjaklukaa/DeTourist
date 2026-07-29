import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB() {
  db = await SQLite.openDatabaseAsync('detourist.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_trip_cache (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gps_ping_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);
}

export async function cacheTrip(id: string, data: any, ttlHours: number = 24) {
  if (!db) return;
  const jsonStr = JSON.stringify(data);
  const now = Date.now();
  const expiresAt = now + ttlHours * 60 * 60 * 1000;
  
  await db.runAsync(
    'INSERT OR REPLACE INTO offline_trip_cache (id, data, updated_at, expires_at) VALUES (?, ?, ?, ?)',
    id, jsonStr, now, expiresAt
  );
}

export async function getCachedTrip(id: string) {
  if (!db) return null;
  const now = Date.now();
  // Only return if it hasn't expired
  const result = await db.getFirstAsync<{ data: string }>(
    'SELECT data FROM offline_trip_cache WHERE id = ? AND expires_at > ?', 
    id, now
  );
  return result ? JSON.parse(result.data) : null;
}

export async function enqueueGpsPing(tripId: string, lat: number, lng: number, timestamp: number) {
  if (!db) return;
  await db.runAsync(
    'INSERT INTO gps_ping_queue (trip_id, latitude, longitude, timestamp, synced) VALUES (?, ?, ?, ?, 0)',
    tripId, lat, lng, timestamp
  );
}

export async function getUnsyncedPings() {
  if (!db) return [];
  return await db.getAllAsync('SELECT * FROM gps_ping_queue WHERE synced = 0');
}

export async function markPingsSynced(ids: number[]) {
  if (!db || ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE gps_ping_queue SET synced = 1 WHERE id IN (${placeholders})`, ...ids);
}

