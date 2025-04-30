import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';

interface ARCameraViewProps {
  onLocationChange?: (location: Location.LocationObject) => void;
  onOrientationChange?: (orientation: {
    accelerometer: { x: number, y: number, z: number },
    gyroscope: { x: number, y: number, z: number },
    magnetometer: { x: number, y: number, z: number }
  }) => void;
  onNightModeChange?: (isNightMode: boolean) => void;
}

export default function ARCameraView({
  onLocationChange,
  onOrientationChange,
  onNightModeChange
}: ARCameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isNightMode, setIsNightMode] = useState(false);

  const cameraRef = useRef<Camera>(null);

  // Request permissions and initialize sensors
  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();

      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      setHasPermission(
        cameraStatus === 'granted' &&
        locationStatus === 'granted'
      );

      // Start location updates if permission granted
      if (locationStatus === 'granted') {
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 1, // update every 1 meter
            timeInterval: 1000, // update every 1 second
          },
          (newLocation) => {
            setLocation(newLocation);
            if (onLocationChange) {
              onLocationChange(newLocation);
            }
          }
        );

        return () => {
          locationSubscription.remove();
        };
      }
    })();
  }, [onLocationChange]);

  // Set up sensor subscriptions
  useEffect(() => {
    // Configure sensor update intervals
    Accelerometer.setUpdateInterval(100); // 10 updates per second
    Gyroscope.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);

    // Subscribe to accelerometer updates
    const accelerometerSubscription = Accelerometer.addListener(data => {
      setAccelerometerData(data);
      updateOrientation(data, gyroscopeData, magnetometerData);
    });

    // Subscribe to gyroscope updates
    const gyroscopeSubscription = Gyroscope.addListener(data => {
      setGyroscopeData(data);
      updateOrientation(accelerometerData, data, magnetometerData);
    });

    // Subscribe to magnetometer updates
    const magnetometerSubscription = Magnetometer.addListener(data => {
      setMagnetometerData(data);
      updateOrientation(accelerometerData, gyroscopeData, data);
    });

    // Cleanup function to unsubscribe from sensors
    return () => {
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
      magnetometerSubscription.remove();
    };
  }, [onOrientationChange]);

  // Update orientation when sensor data changes
  const updateOrientation = (
    accelerometer: { x: number, y: number, z: number },
    gyroscope: { x: number, y: number, z: number },
    magnetometer: { x: number, y: number, z: number }
  ) => {
    if (onOrientationChange) {
      onOrientationChange({
        accelerometer,
        gyroscope,
        magnetometer
      });
    }
  };

  // Toggle night mode
  const toggleNightMode = () => {
    const newNightModeState = !isNightMode;
    setIsNightMode(newNightModeState);

    // Notify parent component of night mode change
    if (onNightModeChange) {
      onNightModeChange(newNightModeState);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera or location</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
      >
        <View style={styles.overlay}>
          {/* This is where we'll render stars and celestial objects */}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, isNightMode && styles.buttonActive]}
            onPress={toggleNightMode}
          >
            <Text style={[styles.buttonText, isNightMode && styles.buttonTextActive]}>
              Night Mode
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonTextActive: {
    fontWeight: 'bold',
  },
});
