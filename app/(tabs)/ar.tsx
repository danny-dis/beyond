import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

import ARCameraView from '../../components/AR/ARCameraView';
import StarRenderer from '../../components/AR/StarRenderer';
import { lazyLoad } from '../../utils/LazyLoadUtils';
import { throttle, getPerformanceSettings } from '../../utils/PerformanceUtils';

// Lazy load the constellation renderer for better initial load performance
const ConstellationRenderer = lazyLoad(() =>
  import('../../components/AR/ConstellationRenderer')
);

export default function ARScreen() {
  // Get performance settings based on device capabilities
  const perfSettings = useMemo(() => getPerformanceSettings(), []);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [orientation, setOrientation] = useState<{
    accelerometer: { x: number, y: number, z: number };
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };
  } | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showConstellations, setShowConstellations] = useState(true);

  // Throttled location change handler to reduce updates
  const handleLocationChange = useCallback(
    throttle((newLocation: Location.LocationObject) => {
      setLocation(newLocation);
    }, 1000), // Update location at most once per second
    []
  );

  // Throttled orientation change handler to reduce updates
  const handleOrientationChange = useCallback(
    throttle((newOrientation: {
      accelerometer: { x: number, y: number, z: number };
      gyroscope: { x: number, y: number, z: number };
      magnetometer: { x: number, y: number, z: number };
    }) => {
      setOrientation(newOrientation);
    }, perfSettings.updateInterval), // Use performance-based update interval
    [perfSettings.updateInterval]
  );

  const handleNightModeChange = useCallback((nightModeEnabled: boolean) => {
    setIsNightMode(nightModeEnabled);
  }, []);

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(() => {
    if (!location) return null;
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }, [location?.coords.latitude, location?.coords.longitude]);

  // Only render stars if we have both location and orientation data
  const shouldRenderStars = !!locationData && !!orientation;

  return (
    <View style={styles.container}>
      <ARCameraView
        onLocationChange={handleLocationChange}
        onOrientationChange={handleOrientationChange}
        onNightModeChange={handleNightModeChange}
      />

      {shouldRenderStars && (
        <>
          <StarRenderer
            location={locationData!}
            orientation={orientation!}
            isNightMode={isNightMode}
            maxStars={perfSettings.maxStars}
          />

          {showConstellations && (
            <ConstellationRenderer
              stars={[]} // This will be populated by the StarRenderer component
              isNightMode={isNightMode}
              showConstellations={showConstellations}
            />
          )}
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
