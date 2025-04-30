import * as Astronomy from 'astronomy-engine';

/**
 * Converts equatorial coordinates (RA/Dec) to horizontal coordinates (Alt/Az)
 * for a given observer location and time
 */
export function equatorialToHorizontal(
  ra: number,  // Right ascension in hours
  dec: number, // Declination in degrees
  latitude: number,
  longitude: number,
  date: Date = new Date()
): { altitude: number; azimuth: number } {
  // Create an observer at the given location
  const observer = new Astronomy.Observer(
    latitude,
    longitude,
    0 // elevation in meters
  );
  
  // Convert RA from hours to degrees
  const raDegrees = ra * 15;
  
  // Calculate horizontal coordinates
  const horizontal = Astronomy.Horizon(date, observer, raDegrees, dec);
  
  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth
  };
}

/**
 * Converts horizontal coordinates (Alt/Az) to screen coordinates
 * based on device orientation
 */
export function horizontalToScreen(
  altitude: number,
  azimuth: number,
  screenWidth: number,
  screenHeight: number,
  deviceOrientation: {
    accelerometer: { x: number, y: number, z: number };
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };
  }
): { x: number; y: number } {
  // This is a simplified calculation that doesn't fully account for device orientation
  // A real implementation would use sensor fusion and proper 3D projection
  
  // Simple mapping of horizontal coordinates to screen coordinates
  // Azimuth: 0° (North) to 360° (clockwise)
  // Altitude: -90° (below horizon) to +90° (zenith)
  
  // Adjust azimuth based on magnetometer (compass) reading
  // This is a very simplified approach
  const compassHeading = Math.atan2(
    deviceOrientation.magnetometer.y,
    deviceOrientation.magnetometer.x
  ) * (180 / Math.PI);
  
  // Adjust azimuth based on device heading
  const adjustedAzimuth = (azimuth - compassHeading + 360) % 360;
  
  // Map azimuth to x-coordinate (0° = center, 90° = right, 270° = left)
  // This creates a 120° field of view centered on the device heading
  const fieldOfView = 120;
  const halfFov = fieldOfView / 2;
  
  // Calculate relative azimuth (-180 to +180 degrees from center)
  let relativeAzimuth = adjustedAzimuth;
  if (relativeAzimuth > 180) relativeAzimuth -= 360;
  
  // Only show objects within the field of view
  if (relativeAzimuth < -halfFov || relativeAzimuth > halfFov) {
    return { x: -1000, y: -1000 }; // Off-screen
  }
  
  // Map relative azimuth to x-coordinate
  const x = screenWidth * (0.5 + relativeAzimuth / fieldOfView);
  
  // Map altitude to y-coordinate (90° = top, -90° = bottom)
  // Adjust based on device tilt (accelerometer)
  const deviceTilt = Math.atan2(
    deviceOrientation.accelerometer.z,
    deviceOrientation.accelerometer.y
  ) * (180 / Math.PI);
  
  // Adjust altitude based on device tilt
  const adjustedAltitude = altitude - deviceTilt;
  
  // Map adjusted altitude to y-coordinate
  // Use a 90° vertical field of view
  const verticalFov = 90;
  const halfVerticalFov = verticalFov / 2;
  
  // Only show objects within the vertical field of view
  if (adjustedAltitude < -halfVerticalFov || adjustedAltitude > halfVerticalFov) {
    return { x: -1000, y: -1000 }; // Off-screen
  }
  
  const y = screenHeight * (0.5 - adjustedAltitude / verticalFov);
  
  return { x, y };
}

/**
 * Calculates the apparent size of a star based on its magnitude
 */
export function calculateStarSize(magnitude: number): number {
  // Brighter stars (lower magnitude) appear larger
  // Magnitude scale is logarithmic and inverse (lower is brighter)
  
  // Limit magnitude range for display purposes
  const clampedMagnitude = Math.max(-1.5, Math.min(6, magnitude));
  
  // Map magnitude to size (pixels)
  // -1.5 (brightest) -> 8 pixels
  // 6 (dimmest visible) -> 1 pixel
  const size = 8 - ((clampedMagnitude + 1.5) * 7) / 7.5;
  
  return Math.max(1, size);
}

/**
 * Determines if a celestial object is currently visible
 * based on its altitude and the time of day
 */
export function isObjectVisible(
  altitude: number,
  date: Date = new Date()
): boolean {
  // Objects below the horizon are not visible
  if (altitude < 0) {
    return false;
  }
  
  // During daytime, only very bright objects are visible
  // This is a simplified approach - a real implementation would
  // calculate sun position and sky brightness
  
  // Get hour of day (0-23)
  const hour = date.getHours();
  
  // Rough daytime check (6 AM to 6 PM)
  const isDaytime = hour >= 6 && hour <= 18;
  
  if (isDaytime) {
    // During daytime, only show objects with altitude > 15°
    // This is a very simplified approach
    return altitude > 15;
  }
  
  // At night, show all objects above the horizon
  return true;
}
