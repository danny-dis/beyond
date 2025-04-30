import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Astronomy from 'astronomy-engine';

import {
  equatorialToHorizontal,
  horizontalToScreen,
  calculateStarSize,
  isObjectVisible
} from '../../utils/AstronomyUtils';

// Define a star object
interface Star {
  id: string;
  name?: string;
  ra: number;  // Right ascension in hours
  dec: number; // Declination in degrees
  mag: number; // Magnitude (brightness)
  x: number;   // Screen X coordinate
  y: number;   // Screen Y coordinate
  size: number; // Display size based on magnitude
}

interface StarRendererProps {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  orientation: {
    accelerometer: { x: number, y: number, z: number };
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };
  } | null;
  isNightMode?: boolean;
}

// Sample star data (brightest stars)
// In a real app, this would be loaded from a database
const SAMPLE_STARS: Omit<Star, 'x' | 'y' | 'size'>[] = [
  { id: '1', name: 'Sirius', ra: 6.7525, dec: -16.7161, mag: -1.46 },
  { id: '2', name: 'Canopus', ra: 6.3992, dec: -52.6956, mag: -0.74 },
  { id: '3', name: 'Rigil Kentaurus', ra: 14.6577, dec: -60.8332, mag: -0.27 },
  { id: '4', name: 'Arcturus', ra: 14.2612, dec: 19.1824, mag: -0.05 },
  { id: '5', name: 'Vega', ra: 18.6156, dec: 38.7836, mag: 0.03 },
  { id: '6', name: 'Capella', ra: 5.2781, dec: 45.9999, mag: 0.08 },
  { id: '7', name: 'Rigel', ra: 5.2422, dec: -8.2016, mag: 0.13 },
  { id: '8', name: 'Procyon', ra: 7.6553, dec: 5.2249, mag: 0.34 },
  { id: '9', name: 'Achernar', ra: 1.6285, dec: -57.2367, mag: 0.46 },
  { id: '10', name: 'Betelgeuse', ra: 5.9195, dec: 7.4071, mag: 0.50 },
  { id: '11', name: 'Hadar', ra: 14.0637, dec: -60.3726, mag: 0.61 },
  { id: '12', name: 'Altair', ra: 19.8465, dec: 8.8683, mag: 0.76 },
  { id: '13', name: 'Acrux', ra: 12.4433, dec: -63.0989, mag: 0.77 },
  { id: '14', name: 'Aldebaran', ra: 4.5987, dec: 16.5093, mag: 0.85 },
  { id: '15', name: 'Spica', ra: 13.4198, dec: -11.1613, mag: 1.04 },
  { id: '16', name: 'Antares', ra: 16.4901, dec: -26.4319, mag: 1.06 },
  { id: '17', name: 'Pollux', ra: 7.7553, dec: 28.0262, mag: 1.14 },
  { id: '18', name: 'Fomalhaut', ra: 22.9608, dec: -29.6222, mag: 1.16 },
  { id: '19', name: 'Deneb', ra: 20.6905, dec: 45.2803, mag: 1.25 },
  { id: '20', name: 'Mimosa', ra: 12.7953, dec: -59.6886, mag: 1.25 },
  // Add more stars as needed
];

export default function StarRenderer({
  location,
  orientation,
  isNightMode = false
}: StarRendererProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate star positions based on device orientation and location
  useEffect(() => {
    if (!location || !orientation) return;

    // Get current date and time
    const date = new Date();

    // Calculate horizontal coordinates for each star
    const visibleStars = SAMPLE_STARS.map(star => {
      // Convert equatorial coordinates (RA/Dec) to horizontal (Alt/Az)
      const { altitude, azimuth } = equatorialToHorizontal(
        star.ra,
        star.dec,
        location.latitude,
        location.longitude,
        date
      );

      // Check if the star is visible
      if (!isObjectVisible(altitude, date)) {
        return null;
      }

      // Convert horizontal coordinates to screen coordinates
      const { x, y } = horizontalToScreen(
        altitude,
        azimuth,
        screenWidth,
        screenHeight,
        orientation
      );

      // Skip stars that are off-screen
      if (x < 0 || y < 0 || x > screenWidth || y > screenHeight) {
        return null;
      }

      // Calculate display size based on magnitude
      const size = calculateStarSize(star.mag);

      return {
        ...star,
        x,
        y,
        size
      };
    }).filter(Boolean) as Star[];

    setStars(visibleStars);
  }, [location, orientation, screenWidth, screenHeight]);

  return (
    <View style={styles.container}>
      {stars.map(star => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              backgroundColor: isNightMode ? 'red' : 'white',
              opacity: isNightMode ? 0.8 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  star: {
    position: 'absolute',
    borderRadius: 50,
  },
});
