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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography, Input, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { useStore } from '@/store';
import { INTEREST_CATEGORIES, DEMO_MODE } from '@/lib/mockData';
import { Calendar, Compass, Footprints, Tent } from 'lucide-react-native';

const PACING_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed', icon: Footprints, desc: 'Take it easy, 1-2 places/day' },
  { id: 'balanced', label: 'Balanced', icon: Compass, desc: 'Moderate pace, 3-4 places/day' },
  { id: 'packed', label: 'Packed', icon: Tent, desc: 'See everything, 5+ places/day' },
] as const;

export default function SetupScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const createTrip = useStore((s) => s.createTrip);

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  // Default end date to 3 days after start date
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [pacing, setPacing] = useState<string>('balanced');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination.');
      return;
    }
    
    if (startDate > endDate) {
      setError('End date must be after start date.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tripData = {
        title: `${destination} Trip`,
        destination_name: destination,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        interests: selectedInterests,
        pacing_tier: pacing,
      };

      await createTrip(tripData);
      
      // Navigate to the trips tab where the new trip will appear
      router.replace('/(tabs)/trip');
    } catch (err: any) {
      setError(err.message || 'Failed to create trip.');
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        <View style={{ gap: spacing[2] }}>
          <Typography variant="displayMd" color="primary">Plan Your Trip</Typography>
          <Typography variant="bodyLg" color="secondary">
            Tell us where you're going and what you love. We'll handle the rest.
          </Typography>
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error.bg }]}>
            <Typography variant="bodySm" color="error">{error}</Typography>
          </View>
        )}

        {/* 1. Destination */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">1. Where to?</Typography>
          <Input
            placeholder="e.g., Paris, Tokyo, New York"
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {/* 2. Dates */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">2. When?</Typography>
          <View style={styles.row}>
            <Pressable style={{ flex: 1 }} onPress={() => setShowStartPicker(true)}>
              <View pointerEvents="none" style={styles.dateInputWrapper}>
                <Calendar size={20} color={colors.icon.inactive} style={styles.dateIcon} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Start Date"
                    value={formatDate(startDate)}
                    editable={false}
                  />
                </View>
              </View>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => setShowEndPicker(true)}>
              <View pointerEvents="none" style={styles.dateInputWrapper}>
                <Calendar size={20} color={colors.icon.inactive} style={styles.dateIcon} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="End Date"
                    value={formatDate(endDate)}
                    editable={false}
                  />
                </View>
              </View>
            </Pressable>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              minimumDate={startDate}
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        {/* 3. Interests */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">3. What do you like?</Typography>
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

        {/* 4. Pacing */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">4. Travel Pace</Typography>
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

        <Button
          label="Create Trip"
          onPress={handleCreate}
          loading={isLoading}
          disabled={!destination.trim()}
          style={{ marginTop: spacing[4] }}
        />
        
        {DEMO_MODE && (
          <Typography variant="caption" color="tertiary" style={{ textAlign: 'center' }}>
            Demo mode — trip will be created locally.
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
  errorBanner: {
    padding: 12,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateIcon: {
    marginTop: 16, // Align with input text visually if there's a label
  },
});
