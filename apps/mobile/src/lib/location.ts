import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';
export const BACKGROUND_GEOFENCE_TASK = 'BACKGROUND_GEOFENCE_TASK';

// Dense tracking options for active movement (§8.3)
export const DENSE_OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5000,          // 5 seconds
  distanceInterval: 10,        // 10 meters
  deferredUpdatesInterval: 5000,
  deferredUpdatesDistance: 10,
  showsBackgroundLocationIndicator: true,
  pausesUpdatesAutomatically: true,
  activityType: Location.LocationActivityType.Fitness, // Best for walking/exploring
  foregroundService: {
    notificationTitle: 'DeTourist is tracking your trip',
    notificationBody: 'Tap to return to the app',
  },
};

// Sparse tracking options for stationary periods to save battery (battery NFR §13)
export const SPARSE_OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 60000 * 5,     // 5 minutes
  distanceInterval: 100,       // 100 meters
  deferredUpdatesInterval: 60000 * 5,
  deferredUpdatesDistance: 100,
  showsBackgroundLocationIndicator: false,
  pausesUpdatesAutomatically: true,
  activityType: Location.LocationActivityType.Other,
};

import { enqueueGpsPing } from './storage';
import { syncGpsPings } from './syncQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error(`[BACKGROUND_LOCATION_TASK] Error:`, error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    try {
      const currentTripId = await AsyncStorage.getItem('CURRENT_TRIP_ID');
      if (!currentTripId) {
        console.warn('No active trip to record locations for');
        return;
      }

      for (const loc of locations) {
        await enqueueGpsPing(
          currentTripId,
          loc.coords.latitude,
          loc.coords.longitude,
          loc.timestamp
        );
      }
      
      console.log(`[BACKGROUND_LOCATION_TASK] Enqueued ${locations.length} locations`);
      
      // Attempt to sync immediately if online
      syncGpsPings();
    } catch (err) {
      console.error('Error processing background locations', err);
    }
  }
});

TaskManager.defineTask(BACKGROUND_GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error(`[BACKGROUND_GEOFENCE_TASK] Error:`, error);
    return;
  }
  if (data) {
    const { eventType, region } = data as { eventType: Location.GeofencingEventType, region: Location.LocationRegion };
    console.log(`[BACKGROUND_GEOFENCE_TASK] Geofence event:`, eventType, region.identifier);
    
    try {
      const currentTripId = await AsyncStorage.getItem('CURRENT_TRIP_ID');
      if (!currentTripId) {
        console.warn('Geofence event fired, but no active trip found');
        return;
      }
      
      // When leaving the hotel/stationary area, switch back to dense mode
      if (eventType === Location.GeofencingEventType.Exit) {
        console.log('Exited stationary geofence, switching to dense tracking');
        await startAdaptiveTracking(currentTripId, 'dense');
      } 
      // When returning to the hotel/stationary area, switch to sparse mode to save battery
      else if (eventType === Location.GeofencingEventType.Enter) {
        console.log('Entered stationary geofence, switching to sparse tracking');
        await startAdaptiveTracking(currentTripId, 'sparse');
      }
    } catch (err) {
      console.error('Error handling geofence event', err);
    }
  }
});

/**
 * Request necessary foreground and background location permissions.
 */
export const requestLocationPermissions = async () => {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;

  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === 'granted';
};

/**
 * Start background location tracking in either dense or sparse mode.
 */
export const startAdaptiveTracking = async (tripId: string, mode: 'dense' | 'sparse' = 'dense') => {
  const hasPermissions = await requestLocationPermissions();
  if (!hasPermissions) {
    throw new Error('Location permissions not granted');
  }

  await AsyncStorage.setItem('CURRENT_TRIP_ID', tripId);

  const options = mode === 'dense' ? DENSE_OPTIONS : SPARSE_OPTIONS;
  
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, options);
  console.log(`Started location tracking in ${mode} mode for trip ${tripId}`);
};

/**
 * Stop background location tracking.
 */
export const stopTracking = async () => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    console.log('Stopped location tracking');
  }
};

/**
 * Creates a geofence around a stationary location (e.g., a hotel).
 * While inside, tracking can be sparse. When leaving, it triggers an event
 * to switch to dense tracking automatically.
 */
export const setStationaryGeofence = async (latitude: number, longitude: number, radius = 200) => {
  const hasPermissions = await requestLocationPermissions();
  if (!hasPermissions) {
    throw new Error('Location permissions not granted');
  }

  const region: Location.LocationRegion = {
    identifier: 'STATIONARY_GEOFENCE',
    latitude,
    longitude,
    radius,
    notifyOnEnter: true,
    notifyOnExit: true,
  };

  await Location.startGeofencingAsync(BACKGROUND_GEOFENCE_TASK, [region]);
  console.log('Geofence activated for stationary location');
};

/**
 * Removes the stationary geofence.
 */
export const clearStationaryGeofence = async () => {
  const hasStarted = await Location.hasStartedGeofencingAsync(BACKGROUND_GEOFENCE_TASK);
  if (hasStarted) {
    await Location.stopGeofencingAsync(BACKGROUND_GEOFENCE_TASK);
    console.log('Geofence cleared');
  }
};
