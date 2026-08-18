import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Typography, Card, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { MapPin, Users, Plus, Star } from 'lucide-react-native';
import { RecommendedPOI } from '../api';

interface RecommendationCardProps {
  poi: RecommendedPOI;
  onAddPress?: () => void;
}

export function RecommendationCard({ poi, onAddPress }: RecommendationCardProps) {
  const { colors, category, spacing, layout } = useTheme();

  // Generic placeholder since backend doesn't provide image URLs yet
  const placeholderImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';

  // Format the score to a percentage or readable number
  const formattedScore = (poi.score * 10).toFixed(1);

  // Fallback to a default color if category color isn't defined in theme
  const catColorKey = poi.category.toLowerCase().replace(/[^a-z0-9]/g, '');
  const catColor = (category as any)[catColorKey] || colors.primary.default;

  return (
    <Card variant="elevated" noPadding style={{ overflow: 'hidden' }}>
      <Image 
        source={{ uri: placeholderImage }} 
        style={{ width: '100%', height: 200, backgroundColor: colors.border.subtle }} 
      />
      
      <View style={{ padding: layout.cardPadding, gap: spacing[3] }}>
        
        <View style={styles.tagRow}>
          <View style={[styles.chip, { backgroundColor: catColor + '15' }]}>
            <Typography variant="labelMd" style={{ color: catColor }}>{poi.category}</Typography>
          </View>
          
          <View style={[styles.chip, { backgroundColor: colors.warning.default + '15' }]}>
            <Star size={14} color={colors.warning.default} />
            <Typography variant="labelMd" style={{ color: colors.warning.default }}>
              Score: {formattedScore}
            </Typography>
          </View>

          {poi.significance_tier && poi.significance_tier >= 4 && (
             <View style={[styles.chip, { backgroundColor: colors.primary.default + '15' }]}>
               <Typography variant="labelMd" style={{ color: colors.primary.default }}>Top Landmark</Typography>
             </View>
          )}
        </View>

        <View>
          <Typography variant="headingLg" color="primary">{poi.name}</Typography>
          {/* We don't have exact distance yet in RecommendedPOI, but leaving the UI pattern */}
          <View style={[styles.tagRow, { marginTop: spacing[1] }]}>
            <MapPin size={16} color={colors.icon.inactive} />
            <Typography variant="bodySm" color="secondary">
              Near destination
            </Typography>
          </View>
        </View>

        {/* Display Score Breakdown summary */}
        <View style={{ marginTop: spacing[1], gap: spacing[1] }}>
           <Typography variant="labelSm" color="secondary">
             Interest Match: {(poi.score_breakdown.interest_match * 100).toFixed(0)}%
           </Typography>
           <Typography variant="labelSm" color="secondary">
             Crowd Avoidance: {(poi.score_breakdown.crowd_avoidance * 100).toFixed(0)}%
           </Typography>
        </View>

        <Button 
          label="Add to Route" 
          variant="secondary" 
          leftIcon={<Plus size={18} color={colors.primary.default} />}
          style={{ marginTop: spacing[2] }}
          onPress={onAddPress}
        />
        
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
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
