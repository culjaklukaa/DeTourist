import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Typography } from './Typography';

export function MapLegend() {
  const { crowd, colors, spacing, layout, shadows } = useTheme();

  const crowdLevels = [
    { label: 'Quiet', color: crowd.empty },
    { label: 'Calm', color: crowd.low },
    { label: 'Moderate', color: crowd.moderate },
    { label: 'Busy', color: crowd.busy },
    { label: 'Packed', color: crowd.packed },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface.elevated,
          borderRadius: layout.cardRadiusSm,
          padding: spacing[3],
          ...shadows.md,
        },
      ]}
    >
      <Typography variant="labelMd" color="secondary" style={{ marginBottom: spacing[2] }}>
        Crowd Index
      </Typography>
      <View style={[styles.row, { gap: spacing[3] }]}>
        {crowdLevels.map((level) => (
          <View key={level.label} style={[styles.item, { gap: spacing[1] }]}>
            <View style={[styles.dot, { backgroundColor: level.color }]} />
            <Typography variant="caption" color="primary">
              {level.label}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
