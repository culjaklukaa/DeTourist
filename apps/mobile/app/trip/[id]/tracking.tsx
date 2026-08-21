import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography, Button, MapLegend } from '@/components/ui';
import { useTheme } from '@/theme';
import { Play, Square, Share } from 'lucide-react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { VisitedMapLayer } from '@/features/tracking/VisitedMapLayer';
import { startAdaptiveTracking, stopTracking } from '@/lib/location';

// Disable telemetry for MapLibre
MapLibreGL.setTelemetryEnabled(false);

const mockCoordinates = [
  [13.4050, 52.5200], // Berlin coords
  [13.4060, 52.5210],
  [13.4070, 52.5215],
  [13.4080, 52.5220],
  [13.4090, 52.5225]
];

export default function TrackingMapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, layout, spacing } = useTheme();
  
  const [isTracking, setIsTracking] = useState(false);
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [hasOptedIn, setHasOptedIn] = useState(false);

  useEffect(() => {
    const checkOptIn = async () => {
      const optInStatus = await AsyncStorage.getItem(`opt_in_${id}`);
      if (optInStatus === 'true') {
        setHasOptedIn(true);
      }
    };
    checkOptIn();
  }, [id]);

  const handleEndTrip = async () => {
    if (isTracking) {
      await stopTracking();
      setIsTracking(false);
    }
    // Navigate to the recap screen
    router.replace(`/trip/${id || 'active'}/recap`);
  };

  const handleStartTracking = async () => {
    if (!hasOptedIn) {
      setShowOptInModal(true);
      return;
    }
    try {
      await startAdaptiveTracking(id as string || 'active', 'dense');
      setIsTracking(true);
    } catch (e) {
      console.error('Failed to start tracking', e);
    }
  };

  const handleOptIn = async () => {
    await AsyncStorage.setItem(`opt_in_${id}`, 'true');
    setHasOptedIn(true);
    setShowOptInModal(false);
    handleStartTracking();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface.brand }]}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          zoomLevel={14}
          centerCoordinate={mockCoordinates[mockCoordinates.length - 1] || [0, 0]}
        />
        <MapLibreGL.UserLocation visible={true} />
        
        {/* Render the Visited / Not-Visited Layer */}
        <VisitedMapLayer coordinates={mockCoordinates} showFog={true} />
      </MapLibreGL.MapView>

      {/* Top action bar */}
      <View style={[styles.topBar, { padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop }]}>
        <View style={{ flex: 1 }} />
        <Button 
          label="End Trip" 
          variant="outline"
          size="sm"
          onPress={handleEndTrip}
          style={{ backgroundColor: colors.surface.card }}
        />
      </View>

      {/* Floating UI Elements */}
      <View style={styles.floatingUI}>
        <MapLegend />
        
        <View style={styles.controlsRow}>
          <Button
            label={isTracking ? "Stop Tracking" : "Start Tracking"}
            variant={isTracking ? "secondary" : "primary"}
            leftIcon={
              isTracking 
                ? <Square size={20} color={colors.text.primary} fill={colors.text.primary} /> 
                : <Play size={20} color={colors.text.inverse} fill={colors.text.inverse} />
            }
            onPress={async () => {
              try {
                if (isTracking) {
                  await stopTracking();
                  setIsTracking(false);
                } else {
                  await handleStartTracking();
                }
              } catch (e) {
                console.error('Failed to toggle tracking', e);
              }
            }}
            style={[{ flex: 1 }, shadows.lg]}
          />
        </View>
      </View>

      {/* Opt-In Modal */}
      <Modal visible={showOptInModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface.card }]}>
            <Typography variant="headingMd">Enable Trip Tracking?</Typography>
            <Typography variant="bodyMd" style={{ marginVertical: spacing[4] }}>
              DeTourist tracks your location only for this specific trip to automatically build your trip recap map. 
              Tracking is opt-in per trip and stops when you end the trip.
            </Typography>
            <View style={styles.modalActions}>
              <Button 
                label="Not Now" 
                variant="outline" 
                onPress={() => setShowOptInModal(false)} 
                style={{ flex: 1, marginRight: spacing[2] }} 
              />
              <Button 
                label="Allow Tracking" 
                variant="primary" 
                onPress={handleOptIn} 
                style={{ flex: 1, marginLeft: spacing[2] }} 
              />
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

import { shadows } from '@/theme/tokens';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 10,
  },
  floatingUI: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40, // Extra safe area for bottom
    zIndex: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    ...shadows.lg,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  }
});
