import React, { useState, useEffect, Component, ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography, Button, MapLegend } from '@/components/ui';
import { useTheme } from '@/theme';
import { Play, Square, Share, MapPin } from 'lucide-react-native';
import { DEMO_MODE } from '@/lib/mockData';

// Conditionally import MapLibre — may fail in Expo Go
let MapLibre: any = null;
try {
  MapLibre = require('@maplibre/maplibre-react-native');
} catch (e) {
  console.warn('MapLibre not available:', e);
}

import { VisitedMapLayer } from '@/features/tracking/VisitedMapLayer';
import { startAdaptiveTracking, stopTracking } from '@/lib/location';

// Note: Telemetry is not included in maplibre-react-native

const mockCoordinates = [
  [13.4050, 52.5200], // Berlin coords
  [13.4060, 52.5210],
  [13.4070, 52.5215],
  [13.4080, 52.5220],
  [13.4090, 52.5225]
];

// ── Error Boundary for MapLibre ──────────────────────────────
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('MapLibre render error:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ── Map Fallback UI ──────────────────────────────────────────
function MapFallback() {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface.card }]}>
      <View style={{
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.primary.default + '15',
        justifyContent: 'center', alignItems: 'center',
      }}>
        <MapPin size={36} color={colors.primary.default} />
      </View>
      <Typography variant="headingSm" color="primary" style={{ marginTop: spacing[4] }}>
        Map Preview
      </Typography>
      <Typography variant="bodySm" color="secondary" style={{ textAlign: 'center', marginTop: spacing[2], paddingHorizontal: spacing[8] }}>
        Map rendering requires a development build.{'\n'}Use EAS Build for full map support.
      </Typography>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────
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
      if (!DEMO_MODE) {
        await stopTracking();
      }
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

    if (DEMO_MODE) {
      // Simulate tracking in demo mode — no real location APIs
      setIsTracking(true);
      return;
    }

    try {
      await startAdaptiveTracking(id as string || 'active', 'dense');
      setIsTracking(true);
    } catch (e) {
      console.error('Failed to start tracking', e);
      Alert.alert(
        'Tracking Error',
        'Failed to start tracking. Please check your location permissions and try again.'
      );
    }
  };

  const handleStopTracking = async () => {
    if (DEMO_MODE) {
      setIsTracking(false);
      return;
    }
    try {
      await stopTracking();
      setIsTracking(false);
    } catch (e) {
      console.error('Failed to stop tracking', e);
    }
  };

  const handleOptIn = async () => {
    await AsyncStorage.setItem(`opt_in_${id}`, 'true');
    setHasOptedIn(true);
    setShowOptInModal(false);
    handleStartTracking();
  };

  // Determine if we can render the native map
  const canRenderMap = MapLibre && MapLibre.MapView;
  const NativeMap = canRenderMap ? MapLibre.MapView : null;
  const NativeCamera = canRenderMap ? MapLibre.Camera : null;
  const NativeUserLocation = canRenderMap ? MapLibre.UserLocation : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface.brand }]}>
      {canRenderMap ? (
        <MapErrorBoundary fallback={<MapFallback />}>
          <NativeMap
            style={styles.map}
            mapStyle="https://demotiles.maplibre.org/style.json"
            logo={false}
          >
            <NativeCamera
              zoom={14}
              center={mockCoordinates[mockCoordinates.length - 1] as [number, number] || [0, 0]}
            />
            <NativeUserLocation />
            
            {/* Render the Visited / Not-Visited Layer */}
            <VisitedMapLayer coordinates={mockCoordinates} showFog={true} />
          </NativeMap>
        </MapErrorBoundary>
      ) : (
        <MapFallback />
      )}

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
              if (isTracking) {
                await handleStopTracking();
              } else {
                await handleStartTracking();
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
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
