import React, { useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { CONSTELLATIONS } from '../../utils/ConstellationData';

interface ConstellationRendererProps {
  stars: { id: string; x: number; y: number; size: number }[];
  isNightMode?: boolean;
  showConstellations?: boolean;
}

// Memoized line component for better performance
const ConstellationLine = memo(({
  line,
  isNightMode
}: {
  line: { id: string; x1: number; y1: number; x2: number; y2: number },
  isNightMode: boolean
}) => (
  <Line
    key={line.id}
    x1={line.x1}
    y1={line.y1}
    x2={line.x2}
    y2={line.y2}
    stroke={isNightMode ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
    strokeWidth={1}
  />
));

export default function ConstellationRenderer({
  stars,
  isNightMode = false,
  showConstellations = true
}: ConstellationRendererProps) {
  if (!showConstellations || stars.length === 0) return null;

  // Memoize the calculation of lines to draw
  const linesToDraw = useMemo(() => {
    // Create a map of star IDs to their screen coordinates
    const starMap = new Map(stars.map(star => [star.id, { x: star.x, y: star.y }]));

    // Calculate lines to draw
    const lines: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    CONSTELLATIONS.forEach(constellation => {
      constellation.lines.forEach((line, index) => {
        const startStar = starMap.get(line.startStarId);
        const endStar = starMap.get(line.endStarId);

        // Only draw lines if both stars are visible
        if (startStar && endStar) {
          lines.push({
            id: `${constellation.id}-${index}`,
            x1: startStar.x,
            y1: startStar.y,
            x2: endStar.x,
            y2: endStar.y
          });
        }
      });
    });

    return lines;
  }, [stars]);

  // Only re-render if there are lines to draw
  if (linesToDraw.length === 0) return null;

  return (
    <View style={styles.container}>
      <Svg height='100%' width='100%'>
        {linesToDraw.map(line => (
          <ConstellationLine
            key={line.id}
            line={line}
            isNightMode={isNightMode}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
