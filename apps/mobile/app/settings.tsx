import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Card, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { DEMO_MODE } from '@/lib/mockData';
import { MapPin, Bell, Map, ChevronLeft } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [offlineMapsEnabled, setOfflineMapsEnabled] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.base }]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: layout.screenPaddingTop + spacing[2], paddingHorizontal: layout.screenPaddingX }]}>
        <Button
          label=""
          variant="ghost"
          leftIcon={<ChevronLeft size={24} color={colors.text.primary} />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Typography variant="headingLg" color="primary">
          Settings
        </Typography>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: layout.screenPaddingX,
          paddingBottom: spacing[16],
          gap: spacing[6],
        }}
      >
        {/* Permissions */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="primary">
            Permissions & Features
          </Typography>
          <Card variant="flat">
            <View style={{ gap: spacing[4] }}>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <MapPin size={20} color={colors.icon.inactive} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Typography variant="labelLg" color="primary">Location Tracking</Typography>
                    <Typography variant="bodySm" color="secondary">Allow background location for trip tracking</Typography>
                  </View>
                </View>
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: colors.border.default, true: colors.primary.default }}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color={colors.icon.inactive} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Typography variant="labelLg" color="primary">Notifications</Typography>
                    <Typography variant="bodySm" color="secondary">Receive alerts for nearby points of interest</Typography>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border.default, true: colors.primary.default }}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Map size={20} color={colors.icon.inactive} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Typography variant="labelLg" color="primary">Offline Maps</Typography>
                    <Typography variant="bodySm" color="secondary">Download regional data before your trip</Typography>
                  </View>
                </View>
                <Switch
                  value={offlineMapsEnabled}
                  onValueChange={setOfflineMapsEnabled}
                  trackColor={{ false: colors.border.default, true: colors.primary.default }}
                />
              </View>

            </View>
          </Card>
        </View>

        {/* App Info (Moved from Profile) */}
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

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
  },
  backButton: {
    paddingHorizontal: 0,
    minWidth: 40,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
