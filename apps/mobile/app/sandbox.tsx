import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Typography, Button, Card, Input, MapLegend } from '@/components/ui';
import { useTheme } from '@/theme';
import { Search, Info, MapPin } from 'lucide-react-native';

export default function SandboxScreen() {
  const { colors, spacing, layout } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface.base }}>
      <View style={{ padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop, gap: spacing[6] }}>
        
        <Typography variant="displayMd" color="primary">UI Sandbox</Typography>
        
        {/* Buttons */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="secondary">Buttons</Typography>
          <Button label="Primary Button" />
          <Button label="Primary Loading" loading />
          <Button label="With Icon" leftIcon={<Search size={18} color={colors.text.inverse} />} />
          <Button label="Secondary Button" variant="secondary" />
          <Button label="Outline Button" variant="outline" />
        </View>

        {/* Inputs */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="secondary">Inputs</Typography>
          <Input 
            label="Standard Input" 
            placeholder="Type here..." 
          />
          <Input 
            label="Search POI" 
            placeholder="Search..." 
            leftAccessory={<Search size={18} color={colors.icon.inactive} />}
          />
          <Input 
            label="Error Input" 
            placeholder="Invalid value" 
            error="This field is required."
          />
        </View>

        {/* Cards */}
        <View style={{ gap: spacing[3] }}>
          <Typography variant="headingMd" color="secondary">Cards</Typography>
          <Card variant="elevated">
            <Typography variant="headingSm" color="primary">Elevated Card</Typography>
            <Typography variant="bodySm" color="secondary" style={{ marginTop: spacing[1] }}>
              Used for floating elements and standard feed items.
            </Typography>
          </Card>
          <Card variant="outline">
            <Typography variant="headingSm" color="primary">Outline Card</Typography>
            <Typography variant="bodySm" color="secondary" style={{ marginTop: spacing[1] }}>
              Used for selected states or border-only emphasis.
            </Typography>
          </Card>
        </View>

        {/* Map Legend */}
        <View style={{ gap: spacing[3], paddingBottom: spacing[10] }}>
          <Typography variant="headingMd" color="secondary">Map Legend</Typography>
          {/* We wrap it in a relative view because MapLegend is absolute positioned by default */}
          <View style={{ height: 100, position: 'relative' }}>
            <MapLegend />
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
