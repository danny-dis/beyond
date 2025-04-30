import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

import ARCameraView from '../../components/AR/ARCameraView';
import StarRenderer from '../../components/AR/StarRenderer';

export default function ARScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [orientation, setOrientation] = useState<{
    accelerometer: { x: number, y: number, z: number };
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };
  } | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);

  const handleLocationChange = (newLocation: Location.LocationObject) => {
    setLocation(newLocation);
  };

  const handleOrientationChange = (newOrientation: {
    accelerometer: { x: number, y: number, z: number };
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };
  }) => {
    setOrientation(newOrientation);
  };

  const handleNightModeChange = (nightModeEnabled: boolean) => {
    setIsNightMode(nightModeEnabled);
  };

  return (
    <View style={styles.container}>
      <ARCameraView
        onLocationChange={handleLocationChange}
        onOrientationChange={handleOrientationChange}
        onNightModeChange={handleNightModeChange}
      />

      {location && orientation && (
        <StarRenderer
          location={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          orientation={orientation}
          isNightMode={isNightMode}
        />
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
