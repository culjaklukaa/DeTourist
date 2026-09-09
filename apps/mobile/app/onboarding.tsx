import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Input, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { useStore } from '@/store';
import { INTEREST_CATEGORIES, DEMO_MODE } from '@/lib/mockData';
import { Compass, Footprints, Tent, Clock, User } from 'lucide-react-native';

const PACING_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed', icon: Footprints, desc: 'Take it easy, 1-2 places/day' },
  { id: 'balanced', label: 'Balanced', icon: Compass, desc: 'Moderate pace, 3-4 places/day' },
  { id: 'packed', label: 'Packed', icon: Tent, desc: 'See everything, 5+ places/day' },
] as const;

const STAY_TIME_OPTIONS = [
  { id: 'quick', label: 'Quick Visit', desc: '15-30 minutes per spot', icon: '⚡' },
  { id: 'standard', label: 'Standard', desc: '30-60 minutes per spot', icon: '⏱️' },
  { id: 'leisurely', label: 'Leisurely', desc: '1-2 hours per spot', icon: '☕' },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const updateProfile = useStore((s) => s.updateProfile);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [displayName, setDisplayName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [pacing, setPacing] = useState<string>('balanced');
  const [stayTime, setStayTime] = useState<string>('standard');
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 400));
      }

      await updateProfile({
        display_name: displayName.trim() || undefined,
        interests: selectedInterests,
        default_pace: pacing,
        default_stay_time: stayTime,
      });

      completeOnboarding();
      router.replace('/(tabs)/discover');
    } catch (err) {
      console.error('Onboarding error:', err);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.surface.base }]}
        contentContainerStyle={{
          padding: layout.screenPaddingX,
          paddingTop: spacing[8],
          paddingBottom: spacing[16],
          gap: spacing[8],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ gap: spacing[2] }}>
          <Typography variant="displayMd" color="primary">Welcome!</Typography>
          <Typography variant="bodyLg" color="secondary">
            Let's personalize your DeTourist experience. Tell us about yourself and how you like to travel.
          </Typography>
        </View>

        {/* 1. Display Name */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">1. What should we call you?</Typography>
          <Input
            placeholder="Your name or nickname"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        </View>

        {/* 2. Interests */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">2. What interests you?</Typography>
          <Typography variant="bodySm" color="secondary">
            Select all that apply — we'll tailor recommendations to match.
          </Typography>
          <View style={styles.chipGrid}>
            {INTEREST_CATEGORIES.map((cat) => {
              const isSelected = selectedInterests.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => toggleInterest(cat.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary.default : colors.surface.card,
                      borderColor: isSelected ? colors.primary.default : colors.border.default,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Typography
                    variant="labelMd"
                    style={{ color: isSelected ? colors.primary.text : colors.text.primary }}
                  >
                    {cat.emoji} {cat.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3. Default Pace */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">3. Your travel pace</Typography>
          <View style={{ gap: spacing[3] }}>
            {PACING_OPTIONS.map((opt) => {
              const isSelected = pacing === opt.id;
              const Icon = opt.icon;
              return (
                <Pressable key={opt.id} onPress={() => setPacing(opt.id)}>
                  <Card
                    variant={isSelected ? 'outline' : 'flat'}
                    style={{
                      borderColor: isSelected ? colors.primary.default : 'transparent',
                      backgroundColor: isSelected ? colors.primary.default + '08' : colors.surface.card,
                    }}
                  >
                    <View style={styles.paceRow}>
                      <View style={[
                        styles.iconCircle,
                        { backgroundColor: isSelected ? colors.primary.default : colors.surface.base }
                      ]}>
                        <Icon size={20} color={isSelected ? colors.primary.text : colors.icon.inactive} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="headingSm" color={isSelected ? 'primary' : 'secondary'}>
                          {opt.label}
                        </Typography>
                        <Typography variant="bodySm" color="tertiary">
                          {opt.desc}
                        </Typography>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Default Stay Time */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">4. How long do you like to stay?</Typography>
          <Typography variant="bodySm" color="secondary">
            Your preferred time to spend at each spot.
          </Typography>
          <View style={{ gap: spacing[3] }}>
            {STAY_TIME_OPTIONS.map((opt) => {
              const isSelected = stayTime === opt.id;
              return (
                <Pressable key={opt.id} onPress={() => setStayTime(opt.id)}>
                  <Card
                    variant={isSelected ? 'outline' : 'flat'}
                    style={{
                      borderColor: isSelected ? colors.primary.default : 'transparent',
                      backgroundColor: isSelected ? colors.primary.default + '08' : colors.surface.card,
                    }}
                  >
                    <View style={styles.paceRow}>
                      <View style={[
                        styles.iconCircle,
                        { backgroundColor: isSelected ? colors.primary.default : colors.surface.base }
                      ]}>
                        <Typography variant="headingSm">{opt.icon}</Typography>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="headingSm" color={isSelected ? 'primary' : 'secondary'}>
                          {opt.label}
                        </Typography>
                        <Typography variant="bodySm" color="tertiary">
                          {opt.desc}
                        </Typography>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Submit */}
        <Button
          label="Get Started"
          onPress={handleComplete}
          loading={isLoading}
          disabled={!displayName.trim()}
          style={{ marginTop: spacing[4] }}
        />

        {DEMO_MODE && (
          <Typography variant="caption" color="tertiary" style={{ textAlign: 'center' }}>
            Demo mode — preferences will be saved locally.
          </Typography>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  paceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
