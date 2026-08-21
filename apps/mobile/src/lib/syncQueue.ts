import * as Network from 'expo-network';
import { getUnsyncedPings, markPingsSynced } from './storage';
import { api } from './api';

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

export async function syncGpsPings() {
  if (isSyncing) return;
  
  try {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return; // Offline, abort sync
    }

    isSyncing = true;
    const unsyncedPings = await getUnsyncedPings();
    
    if (unsyncedPings.length === 0) {
      isSyncing = false;
      return;
    }

    // Group pings by trip_id
    const pingsByTrip: Record<string, any[]> = {};
    for (const ping of unsyncedPings as any[]) {
      if (!pingsByTrip[ping.trip_id]) {
        pingsByTrip[ping.trip_id] = [];
      }
      pingsByTrip[ping.trip_id].push({
        id: ping.id, // Keep local ID to mark as synced later
        latitude: ping.latitude,
        longitude: ping.longitude,
        timestamp: new Date(ping.timestamp).toISOString(),
      });
    }

    // Attempt to sync each trip's pings
    for (const tripId in pingsByTrip) {
      const pings = pingsByTrip[tripId];
      // Map back to backend structure (or bulk insert if supported)
      // Usually POST /trips/{id}/visits accepts an array or singular. We'll assume bulk or sequential
      try {
        // Send bulk data if backend supports it:
        await api.post(`/trips/${tripId}/visits/bulk`, { visits: pings });
        
        // Alternatively, if it only supports one by one:
        // for (const ping of pings) {
        //   await api.post(`/trips/${tripId}/visits`, ping);
        // }

        const syncedIds = pings.map((p) => p.id);
        await markPingsSynced(syncedIds);
        console.log(`Successfully synced ${syncedIds.length} visits for trip ${tripId}`);
      } catch (err) {
        console.error(`Failed to sync visits for trip ${tripId}`, err);
        // We will try again next sync cycle
      }
    }
  } catch (error) {
    console.error('Error during sync process', error);
  } finally {
    isSyncing = false;
  }
}

/**
 * Start a periodic background sync worker that checks for unsynced
 * visits/pings and pushes them to the server if online.
 */
export function startSyncWorker(intervalMs = 30000) {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Initial sync attempt
  syncGpsPings();
  
  // Set interval to periodically sync
  syncInterval = setInterval(() => {
    syncGpsPings();
  }, intervalMs);
}

export function stopSyncWorker() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
