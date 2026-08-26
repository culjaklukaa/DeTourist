import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { MapPin, Calendar, Footprints, Compass, Tent } from 'lucide-react-native';
import type { Trip } from '../api';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

const PACE_CONFIG: Record<string, { icon: any; label: string }> = {
  relaxed: { icon: Footprints, label: 'Relaxed' },
  balanced: { icon: Compass, label: 'Balanced' },
  moderate: { icon: Compass, label: 'Balanced' },
  packed: { icon: Tent, label: 'Packed' },
};

function formatDateRange(start?: string, end?: string): string {
  if (!start || !end) return 'Dates TBD';
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = s.toLocaleDateString('en-US', opts);
  const endStr = e.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

function getTripDays(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const { colors, spacing, layout } = useTheme();
  const pace = PACE_CONFIG[trip.pacing_tier || 'balanced'] || PACE_CONFIG.balanced;
  const PaceIcon = pace.icon;
  const days = getTripDays(trip.start_date, trip.end_date);

  return (
    <Card variant="elevated" onPress={onPress} style={styles.card}>
      {/* Accent strip */}
      <View style={[styles.accent, { backgroundColor: colors.primary.default }]} />

      <View style={[styles.body, { padding: layout.cardPadding, gap: spacing[3] }]}>
        {/* Title row */}
        <View>
          <Typography variant="headingLg" color="primary" numberOfLines={1}>
            {trip.title || trip.destination_name || 'Untitled Trip'}
          </Typography>
        </View>

        {/* Destination */}
        {trip.destination_name && (
          <View style={styles.row}>
            <MapPin size={16} color={colors.icon.inactive} />
            <Typography variant="bodyMd" color="secondary" numberOfLines={1}>
              {trip.destination_name}
            </Typography>
          </View>
        )}

        {/* Date + Duration */}
        <View style={styles.row}>
          <Calendar size={16} color={colors.icon.inactive} />
          <Typography variant="bodyMd" color="secondary">
            {formatDateRange(trip.start_date, trip.end_date)}
          </Typography>
          {days > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary.default + '15' }]}>
              <Typography variant="labelSm" style={{ color: colors.primary.default }}>
                {days} {days === 1 ? 'day' : 'days'}
              </Typography>
            </View>
          )}
        </View>

        {/* Pace + Interests */}
        <View style={[styles.row, { marginTop: spacing[1] }]}>
          <View style={[styles.chip, { backgroundColor: colors.secondary.default }]}>
            <PaceIcon size={14} color={colors.secondary.text} />
            <Typography variant="labelSm" style={{ color: colors.secondary.text }}>
              {pace.label}
            </Typography>
          </View>

          {trip.interests &&
            trip.interests.slice(0, 3).map((interest) => (
              <View
                key={interest}
                style={[styles.chip, { backgroundColor: colors.info.bg }]}
              >
                <Typography variant="labelSm" style={{ color: colors.info.text }}>
                  {interest}
                </Typography>
              </View>
            ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
});
