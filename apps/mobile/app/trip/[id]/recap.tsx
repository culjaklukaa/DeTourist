import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Card, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { Share, Map, Navigation, Clock } from 'lucide-react-native';

export default function TripRecapScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();

  const handleShare = () => {
    // Native share sheet logic goes here
  };

  const handleDone = () => {
    // Return to the main discovery feed or trip list
    router.replace('/(tabs)/discover');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface.base }]}>
      <View style={{ padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop + spacing[6], gap: spacing[8] }}>
        
        <View style={{ alignItems: 'center', gap: spacing[2] }}>
          <Typography variant="displayLg" color="primary">Trip Complete!</Typography>
          <Typography variant="bodyLg" color="secondary">Here's a look back at your journey.</Typography>
        </View>

        {/* The highly stylized "Spotify Wrapped" style card */}
        <Card variant="elevated" noPadding style={{ overflow: 'hidden', backgroundColor: colors.primary.default }}>
          <View style={[styles.recapGraphic, { backgroundColor: colors.primary.default }]}>
            <View style={{ alignItems: 'center', gap: spacing[2], marginBottom: spacing[6] }}>
              <Typography variant="headingMd" color="inverse">Sarajevo Explorer</Typography>
              <Typography variant="bodySm" color="inverse" style={{ opacity: 0.8 }}>Oct 12 - Oct 15, 2026</Typography>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Navigation size={24} color={colors.text.inverse} />
                <Typography variant="displayMd" color="inverse">24</Typography>
                <Typography variant="caption" color="inverse">KM WALKED</Typography>
              </View>
              <View style={[styles.statBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Map size={24} color={colors.text.inverse} />
                <Typography variant="displayMd" color="inverse">12</Typography>
                <Typography variant="caption" color="inverse">PLACES VISITED</Typography>
              </View>
            </View>

            <View style={[styles.statRow, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: spacing[3] }]}>
              <Clock size={24} color={colors.text.inverse} />
              <View style={{ flex: 1 }}>
                <Typography variant="headingLg" color="inverse">14 hrs</Typography>
                <Typography variant="caption" color="inverse">ACTIVE TRACKING</Typography>
              </View>
            </View>
          </View>
        </Card>

        <View style={{ gap: spacing[4], marginTop: spacing[4], paddingBottom: spacing[10] }}>
          <Button 
            label="Share Recap" 
            onPress={handleShare}
            leftIcon={<Share size={20} color={colors.text.inverse} />}
          />
          <Button 
            label="Done" 
            variant="ghost" 
            onPress={handleDone}
          />
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recapGraphic: {
    padding: 32,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  }
});
