import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Typography, Card, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { MapPin, Users, Plus } from 'lucide-react-native';

// Dummy POI data representing the Phase 1A feed output
const DUMMY_FEED = [
  {
    id: '1',
    name: 'Stari Most',
    category: 'Landmarks',
    categoryColor: 'cat-landmarks',
    crowdLabel: 'Moderate',
    crowdColor: 'crowd-moderate',
    image: 'https://images.unsplash.com/photo-1601058269736-22a4b8df78dc?auto=format&fit=crop&q=80&w=800',
    distance: '1.2 km',
  },
  {
    id: '2',
    name: 'Baščaršija Market',
    category: 'Shopping',
    categoryColor: 'cat-shopping',
    crowdLabel: 'Packed',
    crowdColor: 'crowd-packed',
    image: 'https://images.unsplash.com/photo-1596720426673-e4e14290f0cc?auto=format&fit=crop&q=80&w=800',
    distance: '0.4 km',
  },
  {
    id: '3',
    name: 'Vrelo Bosne',
    category: 'Parks',
    categoryColor: 'cat-parks',
    crowdLabel: 'Quiet',
    crowdColor: 'crowd-empty',
    image: 'https://images.unsplash.com/photo-1627814981755-901d84638706?auto=format&fit=crop&q=80&w=800',
    distance: '12 km',
  }
];

export default function DiscoverScreen() {
  const { colors, category, crowd, spacing, layout } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface.base }]}>
      <View style={{ padding: layout.screenPaddingX, paddingTop: layout.screenPaddingTop, gap: spacing[6] }}>
        
        <View style={{ gap: spacing[1] }}>
          <Typography variant="displayMd" color="primary">Discover</Typography>
          <Typography variant="bodyLg" color="secondary">Recommendations tailored to your pace.</Typography>
        </View>

        <View style={{ gap: spacing[4], paddingBottom: spacing[10] }}>
          {DUMMY_FEED.map((poi) => {
            // Resolve the semantic category/crowd colors safely from the theme
            const catColor = (category as any)[poi.categoryColor.replace('cat-', '')] || colors.primary.default;
            const crdColor = (crowd as any)[poi.crowdColor.replace('crowd-', '')] || colors.primary.default;

            return (
              <Card key={poi.id} variant="elevated" noPadding style={{ overflow: 'hidden' }}>
                <Image 
                  source={{ uri: poi.image }} 
                  style={{ width: '100%', height: 200, backgroundColor: colors.border.subtle }} 
                />
                
                <View style={{ padding: layout.cardPadding, gap: spacing[3] }}>
                  
                  <View style={styles.tagRow}>
                    <View style={[styles.chip, { backgroundColor: catColor + '15' }]}>
                      <Typography variant="labelMd" style={{ color: catColor }}>{poi.category}</Typography>
                    </View>
                    <View style={[styles.chip, { backgroundColor: crdColor + '15' }]}>
                      <Users size={14} color={crdColor} />
                      <Typography variant="labelMd" style={{ color: crdColor }}>{poi.crowdLabel}</Typography>
                    </View>
                  </View>

                  <View>
                    <Typography variant="headingLg" color="primary">{poi.name}</Typography>
                    <View style={[styles.tagRow, { marginTop: spacing[1] }]}>
                      <MapPin size={16} color={colors.icon.inactive} />
                      <Typography variant="bodySm" color="secondary">{poi.distance}</Typography>
                    </View>
                  </View>

                  <Button 
                    label="Add to Route" 
                    variant="secondary" 
                    leftIcon={<Plus size={18} color={colors.primary.default} />}
                    style={{ marginTop: spacing[2] }}
                  />
                  
                </View>
              </Card>
            );
          })}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
