import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import { Typography, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { DEMO_MODE, MOCK_RECAP, MockRecapData } from '@/lib/mockData';
import { shareRecapImage } from '@/lib/share';
import { Share as ShareIcon, Check, Footprints, MapPin, Clock, Award } from 'lucide-react-native';

import { api } from '@/lib/api';

export default function RecapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();

  const [data, setData] = useState<MockRecapData | null>(null);

  useEffect(() => {
    async function loadData() {
      if (DEMO_MODE && id && MOCK_RECAP[id as string]) {
        setData(MOCK_RECAP[id as string]);
        return;
      }
      try {
        const response = await api.get(`/trips/${id}/recap`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load real recap data:', error);
        // Fallback dummy data if not found
        setData({
          trip_title: 'My Trip',
          destination: 'Destination',
          start_date: '2026-01-01',
          end_date: '2026-01-03',
          km_walked: 12,
          places_visited: 5,
          hours_active: 8,
          top_category: 'Landmarks',
          quietest_visit: 'Local Park (CrowdIndex 0.10)',
        });
      }
    }
    loadData();
  }, [id]);

  const viewShotRef = useRef<any>(null);

  const handleShare = async () => {
    if (!data) return;
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await shareRecapImage(uri);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      // Fallback to text sharing
      try {
        const days = Math.max(1, Math.ceil((new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24)));
        const message = `Check out my trip to ${data.destination}! I visited ${data.places_visited} places and walked ${data.km_walked}km over ${days} days. #DeTourist`;
        
        await Share.share({
          message,
          title: `${data.trip_title} Recap`,
        });
      } catch (fallbackError) {
        console.error('Fallback sharing failed:', fallbackError);
      }
    }
  };

  if (!data) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface.base }]}
      contentContainerStyle={{
        padding: layout.screenPaddingX,
        paddingTop: layout.screenPaddingTop + spacing[8],
        paddingBottom: spacing[16],
        gap: spacing[8],
      }}
    >
      <View style={styles.header}>
        <Typography variant="displaySm" color="primary">Trip Recap</Typography>
        <Typography variant="bodyLg" color="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
          Your journey through {data.destination}
        </Typography>
      </View>

      {/* The "Wrapped" Style Card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={{ width: '100%' }}>
        <View style={[
          styles.recapCard,
          { 
            backgroundColor: colors.primary.default, 
            borderRadius: layout.cardRadius,
            padding: spacing[6],
            shadowColor: colors.primary.default,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
            overflow: 'hidden',
          }
        ]}>
          <Typography variant="headingLg" style={{ color: colors.text.inverse, marginBottom: spacing[4] }}>
            {data.trip_title}
          </Typography>

          <View style={styles.imagePlaceholder}>
            <MapPin size={32} color={colors.text.inverse} style={{ opacity: 0.5 }} />
            <Typography variant="labelSm" style={{ color: colors.text.inverse, opacity: 0.8, marginTop: spacing[2] }}>
              Trip Map & Highlights
            </Typography>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MapPin size={24} color={colors.text.inverse} style={{ opacity: 0.8 }} />
              <Typography variant="displaySm" style={{ color: colors.text.inverse, marginTop: spacing[2] }}>
                {data.places_visited}
              </Typography>
              <Typography variant="labelSm" style={{ color: colors.text.inverse, opacity: 0.8 }}>
                Places Visited
              </Typography>
            </View>

            <View style={styles.statBox}>
              <Footprints size={24} color={colors.text.inverse} style={{ opacity: 0.8 }} />
              <Typography variant="displaySm" style={{ color: colors.text.inverse, marginTop: spacing[2] }}>
                {data.km_walked}
              </Typography>
              <Typography variant="labelSm" style={{ color: colors.text.inverse, opacity: 0.8 }}>
                KM Walked
              </Typography>
            </View>
          </View>

          <View style={[styles.statsGrid, { marginTop: spacing[6] }]}>
            <View style={styles.statBox}>
              <Clock size={24} color={colors.text.inverse} style={{ opacity: 0.8 }} />
              <Typography variant="displaySm" style={{ color: colors.text.inverse, marginTop: spacing[2] }}>
                {data.hours_active}
              </Typography>
              <Typography variant="labelSm" style={{ color: colors.text.inverse, opacity: 0.8 }}>
                Hours Active
              </Typography>
            </View>

            <View style={styles.statBox}>
              <Award size={24} color={colors.text.inverse} style={{ opacity: 0.8 }} />
              <Typography variant="headingLg" style={{ color: colors.text.inverse, marginTop: spacing[2] }}>
                {data.top_category}
              </Typography>
              <Typography variant="labelSm" style={{ color: colors.text.inverse, opacity: 0.8 }}>
                Top Vibe
              </Typography>
            </View>
          </View>
        </View>
      </ViewShot>

      <Card variant="flat" style={{ backgroundColor: colors.success.bg }}>
        <Typography variant="labelSm" style={{ color: colors.success.text }}>HIDDEN GEM UNLOCKED</Typography>
        <Typography variant="bodyMd" color="primary" style={{ marginTop: spacing[1] }}>
          You experienced the quietest moment at {data.quietest_visit}. Masterful crowd dodging!
        </Typography>
      </Card>

      <View style={{ gap: spacing[4], marginTop: spacing[4] }}>
        <Button
          label="Share Recap"
          onPress={handleShare}
          leftIcon={<ShareIcon size={20} color={colors.primary.text} />}
        />
        <Button
          label="Done"
          variant="outline"
          onPress={() => router.replace('/(tabs)/discover')}
          leftIcon={<Check size={20} color={colors.primary.default} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
  },
  recapCard: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
});
