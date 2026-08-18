// Web mock for storage since expo-sqlite doesn't fully support web out of the box

export async function initDB() {
  console.log('[Web Mock] initDB called');
}

export async function cacheTrip(id: string, data: any, ttlHours: number = 24) {
  console.log('[Web Mock] cacheTrip called', id);
}

export async function getCachedTrip(id: string) {
  console.log('[Web Mock] getCachedTrip called', id);
  return null;
}

export async function enqueueGpsPing(tripId: string, lat: number, lng: number, timestamp: number) {
  console.log('[Web Mock] enqueueGpsPing called', tripId);
}

export async function getUnsyncedPings() {
  console.log('[Web Mock] getUnsyncedPings called');
  return [];
}

export async function markPingsSynced(ids: number[]) {
  console.log('[Web Mock] markPingsSynced called', ids);
}
