import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography, Button, MapLegend } from '@/components/ui';
import { useTheme } from '@/theme';
import { Play, Square, Share } from 'lucide-react-native';

export default function TrackingMapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, layout, spacing } = useTheme();
  
  const [isTracking, setIsTracking] = useState(false);

  const handleEndTrip = () => {
    // Navigate to the recap screen
    router.replace(`/trip/${id || 'active'}/recap`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface.brand }]}>
      {/* 
        This is a placeholder for the MapLibre MapView. 
        In Phase 1A, this entire background will be the map.
      */}
      <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface.brand }]}>
        <Typography variant="headingLg" color="primary">MapLibre View</Typography>
        <Typography variant="bodyMd" color="secondary" style={{ marginTop: spacing[2] }}>
          (Phase 1A map implementation goes here)
        </Typography>
      </View>

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
            onPress={() => setIsTracking(!isTracking)}
            style={[{ flex: 1 }, shadows.lg]}
          />
        </View>
      </View>

    </SafeAreaView>
  );
}

import { shadows } from '@/theme/tokens';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  }
});
