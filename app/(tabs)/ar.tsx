import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';

import ARCameraView from '../../components/AR/ARCameraView';
import StarRenderer from '../../components/AR/StarRenderer';
import { lazyLoad } from '../../utils/LazyLoadUtils';
import { throttle } from '../../utils/PerformanceUtils';
import { getMobilePerformanceSettings } from '../../utils/MobilePerformanceUtils';

// Lazy load the constellation renderer for better initial load performance
const ConstellationRenderer = lazyLoad(() =>
  import('../../components/AR/ConstellationRenderer')
);

export default function ARScreen() {
  // State for mobile performance settings
  const [mobileSettings, setMobileSettings] = useState<any>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [deviceInfo, setDeviceInfo] = useState<{
    modelName: string;
    osVersion: string;
    isLowPowerMode: boolean;
  } | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [orientation, setOrientation] = useState<{
    accelerometer: { x: number, y: number, z: number };
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };
  } | null>(null);
  const [isNightMode, setIsNightMode] = useState(true); // Default to night mode on mobile
  const [showConstellations, setShowConstellations] = useState(true);

  // Load mobile performance settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getMobilePerformanceSettings();
        setMobileSettings(settings);

        // Get device info for optimization
        const modelName = await Device.modelNameAsync();
        const isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();

        setDeviceInfo({
          modelName,
          osVersion: Platform.Version.toString(),
          isLowPowerMode
        });
      } catch (error) {
        console.warn('Failed to load mobile settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Monitor app state for mobile optimization
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Throttled location change handler optimized for mobile
  const handleLocationChange = useCallback(
    throttle((newLocation: Location.LocationObject) => {
      setLocation(newLocation);
    }, mobileSettings?.sensorUpdateInterval || 1000), // Use mobile-optimized interval
    [mobileSettings?.sensorUpdateInterval]
  );

  // Throttled orientation change handler optimized for mobile
  const handleOrientationChange = useCallback(
    throttle((newOrientation: {
      accelerometer: { x: number, y: number, z: number };
      gyroscope: { x: number, y: number, z: number };
      magnetometer: { x: number, y: number, z: number };
    }) => {
      // Only update if app is active to save battery
      if (appState === 'active') {
        setOrientation(newOrientation);
      }
    }, mobileSettings?.sensorUpdateInterval || 200),
    [appState, mobileSettings?.sensorUpdateInterval]
  );

  // Handle night mode changes with mobile optimization
  const handleNightModeChange = useCallback((nightModeEnabled: boolean) => {
    setIsNightMode(nightModeEnabled);
  }, []);

  // Handle performance settings changes from mobile optimization
  const handlePerformanceSettingsChange = useCallback((settings: any) => {
    setMobileSettings(settings);
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

  // Get the appropriate number of stars based on mobile performance settings
  const maxStars = useMemo(() => {
    if (!mobileSettings) return 2000; // Default
    return mobileSettings.maxStars;
  }, [mobileSettings]);

  // Get the appropriate number of constellations based on mobile performance settings
  const maxConstellations = useMemo(() => {
    if (!mobileSettings) return 15; // Default
    return mobileSettings.maxConstellations;
  }, [mobileSettings]);

  return (
    <View style={styles.container}>
      <ARCameraView
        onLocationChange={handleLocationChange}
        onOrientationChange={handleOrientationChange}
        onNightModeChange={handleNightModeChange}
        onPerformanceSettingsChange={handlePerformanceSettingsChange}
        initialNightMode={isNightMode}
        enableHapticFeedback={mobileSettings?.enableHaptics !== false}
      />

      {shouldRenderStars && (
        <>
          <StarRenderer
            location={locationData!}
            orientation={orientation!}
            isNightMode={isNightMode}
            maxStars={maxStars}
          />

          {showConstellations && mobileSettings?.enableEffects !== false && (
            <ConstellationRenderer
              stars={[]} // This will be populated by the StarRenderer component
              isNightMode={isNightMode}
              showConstellations={showConstellations}
            />
          )}
        </>
      )}

      <StatusBar style="auto" hidden={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
