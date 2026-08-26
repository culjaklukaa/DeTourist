import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Typography, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { useStore } from '@/store';
import { DEMO_MODE, MOCK_USER, INTEREST_CATEGORIES } from '@/lib/mockData';
import { LogOut, Mail, Clock, Compass, Shield } from 'lucide-react-native';

export default function ProfileScreen() {
  const { colors, spacing, layout } = useTheme();
  const signOut = useStore((s) => s.signOut);

  // In demo mode, use mock user; otherwise this would come from the user store
  const user = DEMO_MODE ? MOCK_USER : null;

  const email = user?.email || 'user@example.com';
  const initial = email.charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  // Demo preferences
  const selectedInterests = ['landmarks', 'food', 'attractions'];
  const selectedPace = 'balanced';

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
              {email}
            </Typography>
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
      </View>

      {/* App Info */}
      <View style={{ gap: spacing[3] }}>
        <Typography variant="headingMd" color="primary">
          About
        </Typography>
        <Card variant="flat">
          <View style={{ gap: spacing[3] }}>
            <View style={styles.infoRow}>
              <Typography variant="bodyMd" color="secondary">Version</Typography>
              <Typography variant="bodyMd" color="primary">1.0.0 (Demo)</Typography>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.infoRow}>
              <Typography variant="bodyMd" color="secondary">App</Typography>
              <Typography variant="bodyMd" color="primary">DeTourist</Typography>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.infoRow}>
              <Typography variant="bodyMd" color="secondary">Mode</Typography>
              <View style={[styles.chip, { backgroundColor: DEMO_MODE ? colors.warning.bg : colors.success.bg }]}>
                <Typography
                  variant="labelSm"
                  style={{ color: DEMO_MODE ? colors.warning.text : colors.success.text }}
                >
                  {DEMO_MODE ? 'Demo' : 'Live'}
                </Typography>
              </View>
            </View>
          </View>
        </Card>
      </View>

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
