import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/ui';
import { useTheme } from '@/theme';
import { getTrips } from '@/features/trips/api';
import { getDiscoveryRecommendations, RecommendedPOI } from '@/features/discovery/api';
import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';

export default function DiscoverScreen() {
  const { colors, spacing, layout } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedPOI[]>([]);
  const [pacingTier, setPacingTier] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch user trips
        const trips = await getTrips();
        if (!trips || trips.length === 0) {
          setLoading(false);
          // Handled by empty state below
          return;
        }

        // 2. Take the first trip (MVP behavior)
        const tripId = trips[0].id;

        // 3. Fetch recommendations for this trip
        const data = await getDiscoveryRecommendations(tripId);
        setRecommendations(data.recommendations);
        setPacingTier(data.pacing_tier);
        
      } catch (err: any) {
        console.error('Failed to load discovery feed:', err);
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.base }]}>
        <ActivityIndicator size="large" color={colors.primary.default} />
        <Typography variant="bodyMd" color="secondary" style={{ marginTop: spacing[4] }}>
          Curating your feed...
        </Typography>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.base }]}>
        <Typography variant="headingMd" color="error">Oops!</Typography>
        <Typography variant="bodyMd" color="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
          {error}
        </Typography>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.base }]}>
        <Typography variant="headingMd" color="primary">No Trips Yet</Typography>
        <Typography variant="bodyMd" color="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
          Create a trip to get personalized recommendations tailored to your interests and pace.
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface.base }]}>
      <View style={{ padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop, gap: spacing[6] }}>
        
        <View style={{ gap: spacing[1] }}>
          <Typography variant="displayMd" color="primary">Discover</Typography>
          <Typography variant="bodyLg" color="secondary">
            Recommendations tailored to your {pacingTier} pace.
          </Typography>
        </View>

        <View style={{ gap: spacing[4], paddingBottom: spacing[10] }}>
          {recommendations.map((poi) => (
            <RecommendationCard 
              key={poi.id} 
              poi={poi} 
              onAddPress={() => console.log('Add to route', poi.id)}
            />
          ))}
        </View>

      </View>
    </ScrollView>
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
  }
});
