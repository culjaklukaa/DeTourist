import React, { useMemo } from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as turf from '@turf/turf';
import { useTheme } from '@/theme';

export interface VisitedMapLayerProps {
  /** Array of [longitude, latitude] coordinates representing the trip path */
  coordinates: number[][];
  /** Visibility of the fog of war. Set to false to hide the unvisited area overlay. */
  showFog?: boolean;
}

export function VisitedMapLayer({ coordinates, showFog = true }: VisitedMapLayerProps) {
  const { colors } = useTheme();

  // Create the GeoJSON for the visited path and the fog area
  const features = useMemo(() => {
    // We need at least two points to draw a path
    if (!coordinates || coordinates.length < 2) {
      return { path: null, fog: null };
    }

    const lineString = turf.lineString(coordinates);
    
    // Create a buffered area around the path to represent the "visited" area
    // 50 meters buffer roughly represents line of sight / visited area
    const visitedPolygon = turf.buffer(lineString, 50, { units: 'meters' });
    
    // If we want a fog of war effect, we can create a large world polygon
    // and subtract the visited area from it, but a simpler approach for MapLibre
    // is just rendering the visited area and a dark overlay underneath,
    // or rendering the visited area on top of the map.
    
    // Actually, Mapbox/MapLibre doesn't support "inverted polygons" natively easily
    // without cutting a hole. Let's create a large bounding box covering the area
    // and cut a hole in it for the visited area using Turf.
    
    let fogFeature = null;
    if (showFog && visitedPolygon) {
      try {
        // Create a large bounding box around the path (expanded by 10km)
        const bbox = turf.bbox(lineString);
        // Expand the bbox [minX, minY, maxX, maxY]
        const expandedBbox = [
          bbox[0] - 0.1, bbox[1] - 0.1, 
          bbox[2] + 0.1, bbox[3] + 0.1
        ];
        const fogPolygon = turf.bboxPolygon(expandedBbox);
        
        // Cut out the visited area
        fogFeature = turf.difference(turf.featureCollection([fogPolygon, visitedPolygon]));
      } catch (e) {
        console.warn('Error calculating fog of war difference', e);
      }
    }

    return { 
      path: lineString,
      visitedArea: visitedPolygon,
      fog: fogFeature 
    };
  }, [coordinates, showFog]);

  if (!features.path) {
    return null;
  }

  return (
    <>
      {/* 1. Visited Area Path (Solid Line) */}
      <MapLibreGL.ShapeSource id="visited-path-source" shape={features.path}>
        <MapLibreGL.LineLayer 
          id="visited-path-layer" 
          style={{
            lineColor: colors.primary.main,
            lineWidth: 4,
            lineJoin: 'round',
            lineCap: 'round'
          }} 
        />
      </MapLibreGL.ShapeSource>

      {/* 2. Visited Area Buffer (Optional Highlight) */}
      {features.visitedArea && (
        <MapLibreGL.ShapeSource id="visited-area-source" shape={features.visitedArea}>
          <MapLibreGL.FillLayer 
            id="visited-area-layer" 
            style={{
              fillColor: colors.primary.main,
              fillOpacity: 0.1,
            }} 
          />
        </MapLibreGL.ShapeSource>
      )}

      {/* 3. Not-Visited Area (Fog of War) */}
      {showFog && features.fog && (
        <MapLibreGL.ShapeSource id="fog-of-war-source" shape={features.fog}>
          <MapLibreGL.FillLayer 
            id="fog-of-war-layer" 
            style={{
              fillColor: colors.surface.card,
              fillOpacity: 0.6, // Dim unvisited areas
            }} 
          />
        </MapLibreGL.ShapeSource>
      )}
    </>
  );
}
