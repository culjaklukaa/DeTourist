import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { TripCard } from '@/features/trips/components/TripCard';
import { getTrips, Trip } from '@/features/trips/api';
import { DEMO_MODE, MOCK_TRIPS } from '@/lib/mockData';
import { Plus, MapPin } from 'lucide-react-native';

export default function TripScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      if (DEMO_MODE) {
        setTrips(MOCK_TRIPS as unknown as Trip[]);
      } else {
        const data = await getTrips();
        setTrips(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.base }]}>
        <ActivityIndicator size="large" color={colors.primary.default} />
        <Typography variant="bodyMd" color="secondary" style={{ marginTop: spacing[4] }}>
          Loading your trips...
        </Typography>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.base }]}>
        <Typography variant="headingMd" color="error">Something went wrong</Typography>
        <Typography variant="bodyMd" color="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
          {error}
        </Typography>
        <Button label="Retry" variant="outline" onPress={loadTrips} style={{ marginTop: spacing[4] }} />
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.base }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.primary.default + '15' }]}>
          <MapPin size={48} color={colors.primary.default} />
        </View>
        <Typography variant="headingLg" color="primary" style={{ marginTop: spacing[6] }}>
          No Trips Yet
        </Typography>
        <Typography
          variant="bodyMd"
          color="secondary"
          style={{ textAlign: 'center', marginTop: spacing[2], paddingHorizontal: spacing[8] }}
        >
          Start planning your adventure. DeTourist will help you discover hidden gems and avoid the crowds.
        </Typography>
        <Button
          label="Plan Your First Trip"
          onPress={() => router.push('/setup')}
          leftIcon={<Plus size={20} color={colors.text.inverse} />}
          style={{ marginTop: spacing[8] }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.base }]}>
      <ScrollView contentContainerStyle={{ padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop, gap: spacing[4], paddingBottom: spacing[20] }}>
        <View style={{ gap: spacing[1], marginBottom: spacing[2] }}>
          <Typography variant="displayMd" color="primary">My Trips</Typography>
          <Typography variant="bodyLg" color="secondary">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
          </Typography>
        </View>

        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onPress={() => router.push(`/trip/${trip.id}/tracking`)}
          />
        ))}
      </ScrollView>

      {/* Floating Create Button */}
      <View style={[styles.fab, { bottom: spacing[8], right: layout.screenPaddingX }]}>
        <Button
          label="New Trip"
          onPress={() => router.push('/setup')}
          leftIcon={<Plus size={20} color={colors.text.inverse} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
  },
});
