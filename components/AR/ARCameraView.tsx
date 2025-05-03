import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, AppState } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { getMobilePerformanceSettings, monitorBatteryForPerformance } from '../../utils/MobilePerformanceUtils';

interface ARCameraViewProps {
  onLocationChange?: (location: Location.LocationObject) => void;
  onOrientationChange?: (orientation: {
    accelerometer: { x: number, y: number, z: number },
    gyroscope: { x: number, y: number, z: number },
    magnetometer: { x: number, y: number, z: number }
  }) => void;
  onNightModeChange?: (isNightMode: boolean) => void;
  onPerformanceSettingsChange?: (settings: any) => void;
  initialNightMode?: boolean;
  enableHapticFeedback?: boolean;
}

export default function ARCameraView({
  onLocationChange,
  onOrientationChange,
  onNightModeChange,
  onPerformanceSettingsChange,
  initialNightMode = false,
  enableHapticFeedback = true
}: ARCameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isNightMode, setIsNightMode] = useState(initialNightMode);
  const [performanceSettings, setPerformanceSettings] = useState<any>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isSensorActive, setIsSensorActive] = useState(true);

  const cameraRef = useRef<Camera>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const sensorUpdateInterval = useRef<number>(200); // Default value, will be updated

  // Load performance settings
  useEffect(() => {
    const loadPerformanceSettings = async () => {
      try {
        const settings = await getMobilePerformanceSettings();
        setPerformanceSettings(settings);
        sensorUpdateInterval.current = settings.sensorUpdateInterval;

        // Notify parent component of performance settings
        if (onPerformanceSettingsChange) {
          onPerformanceSettingsChange(settings);
        }
      } catch (error) {
        console.warn('Failed to load performance settings:', error);
      }
    };

    loadPerformanceSettings();

    // Monitor battery level for performance adjustments
    const unsubscribe = monitorBatteryForPerformance((newSettings) => {
      setPerformanceSettings(newSettings);
      sensorUpdateInterval.current = newSettings.sensorUpdateInterval;

      // Notify parent component of performance settings change
      if (onPerformanceSettingsChange) {
        onPerformanceSettingsChange(newSettings);
      }
    });

    return unsubscribe;
  }, [onPerformanceSettingsChange]);

  // Handle app state changes (active, background, inactive)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // When app comes back to foreground
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Re-activate sensors that might have been paused
        setIsSensorActive(true);
      } else if (nextAppState.match(/inactive|background/)) {
        // Pause sensors when app goes to background to save battery
        setIsSensorActive(false);
      }

      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Lock screen orientation for better AR experience
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } catch (error) {
        console.warn('Failed to lock screen orientation:', error);
      }
    };

    lockOrientation();

    return () => {
      // Unlock orientation when component unmounts
      ScreenOrientation.unlockAsync();
    };
  }, []);

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
        try {
          // Configure location accuracy based on performance settings
          const accuracy = performanceSettings?.useLowPowerMode
            ? Location.Accuracy.Balanced
            : Location.Accuracy.High;

          const distanceInterval = performanceSettings?.useLowPowerMode ? 20 : 10;
          const timeInterval = performanceSettings?.useLowPowerMode ? 10000 : 5000;

          locationSubscription.current = await Location.watchPositionAsync(
            {
              accuracy,
              distanceInterval, // update based on performance settings
              timeInterval, // update based on performance settings
            },
            (newLocation) => {
              setLocation(newLocation);
              if (onLocationChange) {
                onLocationChange(newLocation);
              }
            }
          );
        } catch (error) {
          console.warn('Error setting up location tracking:', error);
        }
      }
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [performanceSettings, onLocationChange]);

  // Set up sensor subscriptions with mobile optimizations
  useEffect(() => {
    if (!isSensorActive) {
      return; // Don't activate sensors when app is in background
    }

    // Configure sensor update intervals based on performance settings
    const updateInterval = sensorUpdateInterval.current;
    Accelerometer.setUpdateInterval(updateInterval);
    Gyroscope.setUpdateInterval(updateInterval);
    Magnetometer.setUpdateInterval(updateInterval);

    // Use a debounce timer for orientation updates to reduce CPU usage
    let orientationUpdateTimer: NodeJS.Timeout | null = null;
    let pendingAccData = accelerometerData;
    let pendingGyroData = gyroscopeData;
    let pendingMagData = magnetometerData;
    let isUpdatePending = false;

    // Debounced orientation update function
    const debouncedUpdateOrientation = () => {
      if (orientationUpdateTimer) {
        clearTimeout(orientationUpdateTimer);
      }

      if (!isUpdatePending) {
        isUpdatePending = true;
      }

      orientationUpdateTimer = setTimeout(() => {
        setAccelerometerData(pendingAccData);
        setGyroscopeData(pendingGyroData);
        setMagnetometerData(pendingMagData);
        updateOrientation(pendingAccData, pendingGyroData, pendingMagData);
        isUpdatePending = false;
      }, 50); // 50ms debounce time
    };

    // Subscribe to accelerometer updates
    const accelerometerSubscription = Accelerometer.addListener(data => {
      pendingAccData = data;
      debouncedUpdateOrientation();
    });

    // Subscribe to gyroscope updates
    const gyroscopeSubscription = Gyroscope.addListener(data => {
      pendingGyroData = data;
      debouncedUpdateOrientation();
    });

    // Subscribe to magnetometer updates
    const magnetometerSubscription = Magnetometer.addListener(data => {
      pendingMagData = data;
      debouncedUpdateOrientation();
    });

    // Cleanup function to unsubscribe from sensors
    return () => {
      if (orientationUpdateTimer) {
        clearTimeout(orientationUpdateTimer);
      }
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
      magnetometerSubscription.remove();
    };
  }, [isSensorActive, sensorUpdateInterval.current, onOrientationChange]);

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

  // Toggle night mode with haptic feedback
  const toggleNightMode = useCallback(() => {
    const newNightModeState = !isNightMode;
    setIsNightMode(newNightModeState);

    // Provide haptic feedback if enabled
    if (enableHapticFeedback) {
      Haptics.impactAsync(
        newNightModeState
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    // Notify parent component of night mode change
    if (onNightModeChange) {
      onNightModeChange(newNightModeState);
    }
  }, [isNightMode, enableHapticFeedback, onNightModeChange]);

  // Toggle flashlight for better visibility in dark environments
  const toggleFlashlight = useCallback(() => {
    const newFlashMode = flashMode === FlashMode.off ? FlashMode.torch : FlashMode.off;
    setFlashMode(newFlashMode);

    // Provide haptic feedback if enabled
    if (enableHapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [flashMode, enableHapticFeedback]);

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
        flashMode={flashMode}
      >
        <View style={styles.overlay}>
          {/* This is where we'll render stars and celestial objects */}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, isNightMode && styles.buttonActive]}
            onPress={toggleNightMode}
            activeOpacity={0.7} // Better touch feedback
          >
            <Text style={[styles.buttonText, isNightMode && styles.buttonTextActive]}>
              Night Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, flashMode === FlashMode.torch && styles.buttonActive]}
            onPress={toggleFlashlight}
            activeOpacity={0.7} // Better touch feedback
          >
            <Text style={[styles.buttonText, flashMode === FlashMode.torch && styles.buttonTextActive]}>
              Flashlight
            </Text>
          </TouchableOpacity>
        </View>

        {/* Battery-aware indicator */}
        {performanceSettings?.useLowPowerMode && (
          <View style={styles.batteryWarning}>
            <Text style={styles.batteryWarningText}>
              Low Power Mode
            </Text>
          </View>
        )}
      </Camera>
      <StatusBar style="auto" hidden={true} />
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
    bottom: Platform.OS === 'ios' ? 50 : 30, // Account for iOS home indicator
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker for better visibility
    padding: Platform.OS === 'ios' ? 15 : 12, // Adjust for platform
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 10,
    // Add shadow for better visibility
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
  },
  buttonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 16 : 14, // Adjust for platform
    fontWeight: '500',
  },
  buttonTextActive: {
    fontWeight: 'bold',
  },
  batteryWarning: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30, // Account for iOS notch
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  batteryWarningText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
