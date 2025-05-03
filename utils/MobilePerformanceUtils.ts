import { Platform, Dimensions, PixelRatio } from 'react-native';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { throttle, debounce } from './PerformanceUtils';

/**
 * Mobile device performance tiers
 */
export enum DevicePerformanceTier {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Mobile-specific performance settings
 */
export interface MobilePerformanceSettings {
  sensorUpdateInterval: number;      // Milliseconds between sensor updates
  maxStars: number;                  // Maximum number of stars to render
  maxConstellations: number;         // Maximum number of constellations to render
  enableEffects: boolean;            // Whether to enable visual effects
  enableParallax: boolean;           // Whether to enable parallax effects
  enableHaptics: boolean;            // Whether to enable haptic feedback
  useLowPowerMode: boolean;          // Whether to use low power mode
  renderDistance: number;            // Distance to render stars (0-1)
  textureQuality: 'low' | 'medium' | 'high'; // Quality of textures
  useHardwareAcceleration: boolean;  // Whether to use hardware acceleration
  preloadAssets: boolean;            // Whether to preload assets
  useProgressiveLoading: boolean;    // Whether to use progressive loading
}

// Cache for device information
let devicePerformanceTier: DevicePerformanceTier | null = null;
let batteryLevel: number | null = null;
let isLowPowerModeEnabled: boolean | null = null;

/**
 * Get the device's screen dimensions
 */
export function getScreenDimensions() {
  const { width, height } = Dimensions.get('window');
  const pixelDensity = PixelRatio.get();
  
  return {
    width,
    height,
    pixelDensity,
    isHighResolution: pixelDensity >= 2,
  };
}

/**
 * Determine if the device is a tablet
 */
export function isTablet(): boolean {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // Tablets typically have aspect ratios closer to 4:3
  return aspectRatio < 1.6;
}

/**
 * Get the device's performance tier based on various factors
 */
export async function getDevicePerformanceTier(): Promise<DevicePerformanceTier> {
  // Return cached value if available
  if (devicePerformanceTier !== null) {
    return devicePerformanceTier;
  }
  
  // Get device information
  const deviceType = await Device.getDeviceTypeAsync();
  const totalMemory = await Device.getTotalMemoryAsync();
  const modelName = await Device.modelNameAsync();
  
  // Check for known high-end devices
  const highEndDevices = [
    'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15',
    'iPad Pro', 'Galaxy S21', 'Galaxy S22', 'Galaxy S23',
    'Pixel 6', 'Pixel 7', 'Pixel 8',
  ];
  
  const isHighEndDevice = highEndDevices.some(device => 
    modelName.includes(device)
  );
  
  // Determine performance tier based on device characteristics
  if (
    isHighEndDevice || 
    totalMemory > 4 * 1024 * 1024 * 1024 || // More than 4GB RAM
    (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 14) ||
    (Platform.OS === 'android' && Platform.Version >= 30) // Android 11+
  ) {
    devicePerformanceTier = DevicePerformanceTier.HIGH;
  } else if (
    totalMemory > 2 * 1024 * 1024 * 1024 || // More than 2GB RAM
    (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 12) ||
    (Platform.OS === 'android' && Platform.Version >= 26) // Android 8+
  ) {
    devicePerformanceTier = DevicePerformanceTier.MEDIUM;
  } else {
    devicePerformanceTier = DevicePerformanceTier.LOW;
  }
  
  return devicePerformanceTier;
}

/**
 * Get the device's battery level
 */
export async function getBatteryLevel(): Promise<number> {
  try {
    batteryLevel = await Battery.getBatteryLevelAsync();
    return batteryLevel;
  } catch (error) {
    console.warn('Failed to get battery level:', error);
    return 1; // Assume full battery if we can't get the level
  }
}

/**
 * Check if the device is in low power mode
 */
export async function isLowPowerMode(): Promise<boolean> {
  try {
    isLowPowerModeEnabled = await Battery.isLowPowerModeEnabledAsync();
    return isLowPowerModeEnabled;
  } catch (error) {
    console.warn('Failed to check low power mode:', error);
    return false;
  }
}

/**
 * Get battery-aware performance settings
 */
export async function getBatteryAwareSettings(): Promise<{
  useLowPowerMode: boolean;
  reduceSensorFrequency: boolean;
  reduceVisualEffects: boolean;
}> {
  const level = await getBatteryLevel();
  const lowPowerMode = await isLowPowerMode();
  
  return {
    useLowPowerMode: lowPowerMode || level < 0.2, // Low power mode or less than 20% battery
    reduceSensorFrequency: lowPowerMode || level < 0.3, // Low power mode or less than 30% battery
    reduceVisualEffects: lowPowerMode || level < 0.15, // Low power mode or less than 15% battery
  };
}

/**
 * Get performance settings optimized for mobile devices
 */
export async function getMobilePerformanceSettings(): Promise<MobilePerformanceSettings> {
  const performanceTier = await getDevicePerformanceTier();
  const batterySettings = await getBatteryAwareSettings();
  const { isHighResolution } = getScreenDimensions();
  
  // Base settings by performance tier
  const baseSettings: Record<DevicePerformanceTier, MobilePerformanceSettings> = {
    [DevicePerformanceTier.LOW]: {
      sensorUpdateInterval: 500, // 2 updates per second
      maxStars: 500,
      maxConstellations: 5,
      enableEffects: false,
      enableParallax: false,
      enableHaptics: false,
      useLowPowerMode: true,
      renderDistance: 0.6,
      textureQuality: 'low',
      useHardwareAcceleration: true,
      preloadAssets: false,
      useProgressiveLoading: true,
    },
    [DevicePerformanceTier.MEDIUM]: {
      sensorUpdateInterval: 250, // 4 updates per second
      maxStars: 1500,
      maxConstellations: 15,
      enableEffects: true,
      enableParallax: true,
      enableHaptics: true,
      useLowPowerMode: false,
      renderDistance: 0.8,
      textureQuality: 'medium',
      useHardwareAcceleration: true,
      preloadAssets: true,
      useProgressiveLoading: false,
    },
    [DevicePerformanceTier.HIGH]: {
      sensorUpdateInterval: 100, // 10 updates per second
      maxStars: 5000,
      maxConstellations: 30,
      enableEffects: true,
      enableParallax: true,
      enableHaptics: true,
      useLowPowerMode: false,
      renderDistance: 1.0,
      textureQuality: 'high',
      useHardwareAcceleration: true,
      preloadAssets: true,
      useProgressiveLoading: false,
    },
  };
  
  // Get base settings for the device's performance tier
  let settings = { ...baseSettings[performanceTier] };
  
  // Adjust settings based on battery level
  if (batterySettings.useLowPowerMode) {
    settings = {
      ...settings,
      sensorUpdateInterval: Math.max(settings.sensorUpdateInterval, 500),
      maxStars: Math.min(settings.maxStars, 1000),
      maxConstellations: Math.min(settings.maxConstellations, 10),
      enableEffects: false,
      enableParallax: false,
      useLowPowerMode: true,
      renderDistance: Math.min(settings.renderDistance, 0.7),
      textureQuality: 'low' as const,
      preloadAssets: false,
      useProgressiveLoading: true,
    };
  } else if (batterySettings.reduceSensorFrequency) {
    settings.sensorUpdateInterval = Math.max(settings.sensorUpdateInterval, 250);
  }
  
  // Adjust settings based on screen resolution
  if (isHighResolution && performanceTier !== DevicePerformanceTier.LOW) {
    settings.maxStars = Math.min(settings.maxStars * 1.5, 7500);
  }
  
  return settings;
}

/**
 * Create a throttled function optimized for mobile touch events
 */
export function createTouchThrottle<T extends (...args: any[]) => any>(
  func: T,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  // Use a shorter throttle time for touch events to maintain responsiveness
  return throttle(func, 16, options); // ~60fps (1000ms / 60 = 16.67ms)
}

/**
 * Create a debounced function optimized for mobile orientation changes
 */
export function createOrientationDebounce<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  // Use a longer debounce time for orientation changes to avoid excessive updates
  return debounce(func, 100);
}

/**
 * Monitor battery level changes and adjust performance settings
 * @param callback Function to call when performance settings should be updated
 */
export function monitorBatteryForPerformance(
  callback: (settings: MobilePerformanceSettings) => void
): () => void {
  // Subscribe to battery level changes
  const subscription = Battery.addBatteryLevelListener(async () => {
    // Update settings when battery level changes
    const newSettings = await getMobilePerformanceSettings();
    callback(newSettings);
  });
  
  // Return cleanup function
  return () => {
    subscription.remove();
  };
}
