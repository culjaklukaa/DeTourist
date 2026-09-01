import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Map, Camera } from '@maplibre/maplibre-react-native';
import { OfflineMapManager } from './OfflineMapManager';

interface MapViewProps {
  regionId: string;
}

export function OfflineMapView({ regionId }: MapViewProps) {
  const [styleJSON, setStyleJSON] = useState<string | null>(null);

  useEffect(() => {
    async function loadStyle() {
      // Check if region is downloaded
      const isDownloaded = OfflineMapManager.isRegionDownloaded(regionId);
      
      let tileUrl = '';
      if (isDownloaded) {
        const localUri = OfflineMapManager.getLocalUri(regionId);
        // MapLibre reads via pmtiles://file:/// protocol
        tileUrl = `pmtiles://${localUri}`;
      } else {
        // Fallback to online tiles if not downloaded
        tileUrl = 'https://example.com/tiles/{z}/{x}/{y}.pbf'; 
      }

      // Minimal style JSON that uses the PMTiles source
      const style = {
        version: 8,
        name: 'DeTourist Offline Style',
        // MapLibre RN resolves asset:// to Android assets/ and iOS main bundle
        // These fonts and sprites should be copied via an Expo config plugin or placed in native directories
        glyphs: 'asset://map-assets/fonts/{fontstack}/{range}.pbf',
        sprite: 'asset://map-assets/sprites/sprite',
        sources: {
          'detourist-tiles': {
            type: 'vector',
            url: tileUrl
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f8f4f0'
            }
          }
        ]
      };
      
      setStyleJSON(JSON.stringify(style));
    }
    
    loadStyle();
  }, [regionId]);

  if (!styleJSON) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={styleJSON}
        logo={false}
        attribution={false}
      >
        <Camera
          zoom={6}
          center={[17.679, 43.856]} // Approx Bosnia center
        />
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
