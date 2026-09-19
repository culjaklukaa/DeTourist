import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { useStore } from '@/store';
import { DEMO_MODE, MOCK_USER, INTEREST_CATEGORIES } from '@/lib/mockData';
import { LogOut, Mail, Clock, Compass, Shield } from 'lucide-react-native';
import { TripCard } from '@/features/trips/components/TripCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const signOut = useStore((s) => s.signOut);
  const trips = useStore((s) => s.trips);
  const fetchTrips = useStore((s) => s.fetchTrips);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // In demo mode, use mock user; otherwise this would come from the user store
  const user = DEMO_MODE ? MOCK_USER : null;

  const pastTrips = trips.filter((t) => t.end_date ? new Date(t.end_date) < new Date() : false);

  const email = user?.email || 'user@example.com';
  const displayName = (user as any)?.display_name || email.split('@')[0];
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  // Demo preferences
  const selectedInterests = (user as any)?.interests || ['landmarks', 'food', 'attractions'];
  const selectedPace = (user as any)?.default_pace || 'balanced';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface.base }]}
      contentContainerStyle={{
        padding: layout.screenPaddingX,
        paddingTop: layout.screenPaddingTop,
        paddingBottom: spacing[16],
        gap: spacing[6],
      }}
    >
      {/* Header */}
      <View style={{ gap: spacing[1] }}>
        <Typography variant="displayMd" color="primary">Profile</Typography>
      </View>

      {DEMO_MODE && (
        <Card variant="flat" style={{ backgroundColor: colors.warning.bg }}>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Shield size={20} color={colors.warning.default} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, gap: 4 }}>
              <Typography variant="labelLg" style={{ color: colors.warning.default }}>
                Demo Mode Active
              </Typography>
              <Typography variant="bodySm" style={{ color: colors.warning.text }}>
                You are viewing mock data. Changes to your profile will be saved locally on your device.
              </Typography>
            </View>
          </View>
        </Card>
      )}

      {/* Avatar + Info */}
      <Card variant="elevated">
        <View style={[styles.profileHeader, { gap: spacing[4] }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary.default },
            ]}
          >
            <Typography variant="displayMd" color="inverse">
              {initial}
            </Typography>
          </View>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Typography variant="headingLg" color="primary" numberOfLines={1}>
              {displayName}
            </Typography>
            <View style={styles.row}>
              <Mail size={14} color={colors.icon.inactive} />
              <Typography variant="bodySm" color="secondary">
                {email}
              </Typography>
            </View>
            <View style={styles.row}>
              <Clock size={14} color={colors.icon.inactive} />
              <Typography variant="bodySm" color="secondary">
                Member since {memberSince}
              </Typography>
            </View>
          </View>
        </View>
      </Card>

      {/* Travel Preferences */}
      <View style={{ gap: spacing[3] }}>
        <Typography variant="headingMd" color="primary">
          Travel Preferences
        </Typography>
        <Card variant="flat">
          <View style={{ gap: spacing[4] }}>
            {/* Pacing */}
            <View style={{ gap: spacing[2] }}>
              <Typography variant="labelLg" color="secondary">
                Default Pace
              </Typography>
              <View style={[styles.chip, { backgroundColor: colors.primary.default + '15' }]}>
                <Compass size={16} color={colors.primary.default} />
                <Typography variant="labelMd" style={{ color: colors.primary.default }}>
                  {selectedPace.charAt(0).toUpperCase() + selectedPace.slice(1)}
                </Typography>
              </View>
            </View>

            {/* Interests */}
            <View style={{ gap: spacing[2] }}>
              <Typography variant="labelLg" color="secondary">
                Interests
              </Typography>
              <View style={styles.chipRow}>
                {INTEREST_CATEGORIES.filter((c) =>
                  selectedInterests.includes(c.id)
                ).map((cat) => (
                  <View
                    key={cat.id}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.info.bg },
                    ]}
                  >
                    <Typography variant="labelMd" style={{ color: colors.info.text }}>
                      {cat.emoji} {cat.label}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Card>
        <Button
          label="Edit Preferences"
          variant="outline"
          onPress={() => router.push('/onboarding')}
          style={{ marginTop: spacing[2] }}
        />
      </View>

      {/* Past Trips */}
      <View style={{ gap: spacing[3] }}>
        <Typography variant="headingMd" color="primary">
          Past Trips
        </Typography>
        {pastTrips.length === 0 ? (
          <Card variant="flat">
            <Typography variant="bodyMd" color="secondary" style={{ textAlign: 'center' }}>
              No past trips yet.
            </Typography>
          </Card>
        ) : (
          <View style={{ gap: spacing[4] }}>
            {pastTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push(`/trip/${trip.id}/recap`)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Settings */}
      <Button
        label="Settings"
        variant="outline"
        leftIcon={<Shield size={20} color={colors.text.primary} />}
        onPress={() => router.push('/settings')}
        style={{ marginTop: spacing[2], borderColor: colors.border.default }}
      />

      {/* Sign Out */}
      <Button
        label="Sign Out"
        variant="outline"
        leftIcon={<LogOut size={20} color={colors.error.default} />}
        onPress={handleSignOut}
        style={{
          borderColor: colors.error.default,
          marginTop: spacing[4],
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
});
