import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Input, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { MapPin, Calendar, Compass, Footprints, Tent } from 'lucide-react-native';

const PACING_TIERS = [
  { id: 'relaxed', label: 'Relaxed', icon: Footprints, desc: 'Fewer stops, deep exploration.' },
  { id: 'balanced', label: 'Balanced', icon: Compass, desc: 'Mix of highlights and hidden gems.' },
  { id: 'packed', label: 'Packed', icon: Tent, desc: 'Maximize sights per day.' },
];

export default function TripSetupScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const [selectedPace, setSelectedPace] = useState('balanced');

  const handleCreate = () => {
    // Phase 1A: Save to local storage & POST to backend, then redirect
    router.replace('/(tabs)/trip');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface.base }]}>
      <View style={[styles.content, { padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop + spacing[6], gap: spacing[8] }]}>
        
        <View style={{ gap: spacing[2] }}>
          <Typography variant="displayMd" color="primary">Plan Your Trip</Typography>
          <Typography variant="bodyLg" color="secondary">Tell us where you're going and how you like to travel.</Typography>
        </View>

        <View style={{ gap: spacing[4] }}>
          <Input 
            label="Destination"
            placeholder="e.g. Sarajevo, Bosnia and Herzegovina"
            leftAccessory={<MapPin size={20} color={colors.icon.inactive} />}
          />
          <View style={styles.row}>
            <Input 
              style={{ flex: 1 }}
              label="Start Date"
              placeholder="Select date"
              leftAccessory={<Calendar size={20} color={colors.icon.inactive} />}
            />
            <Input 
              style={{ flex: 1 }}
              label="End Date"
              placeholder="Select date"
              leftAccessory={<Calendar size={20} color={colors.icon.inactive} />}
            />
          </View>
        </View>

        <View style={{ gap: spacing[4] }}>
          <Typography variant="labelLg" color="primary">Travel Pace</Typography>
          <View style={{ gap: spacing[3] }}>
            {PACING_TIERS.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedPace === tier.id;
              return (
                <Card 
                  key={tier.id}
                  variant={isSelected ? 'outline' : 'flat'}
                  onPress={() => setSelectedPace(tier.id)}
                  style={[
                    styles.paceCard,
                    isSelected && { borderColor: colors.primary.default, backgroundColor: colors.primary.default + '10' }
                  ]}
                >
                  <View style={[styles.paceIcon, { backgroundColor: isSelected ? colors.primary.default : colors.surface.base }]}>
                    <Icon size={24} color={isSelected ? colors.text.inverse : colors.icon.inactive} />
                  </View>
                  <View style={{ flex: 1, gap: spacing[1] }}>
                    <Typography variant="headingSm" color="primary">{tier.label}</Typography>
                    <Typography variant="bodySm" color="secondary">{tier.desc}</Typography>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <Button 
          label="Create Trip" 
          onPress={handleCreate}
          style={{ marginTop: spacing[4], marginBottom: spacing[10] }}
        />
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16, // using hardcoded gap for row split, handled by styles
  },
  paceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
