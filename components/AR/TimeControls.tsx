import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Slider } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimeControlsProps {
  onTimeChange: (date: Date) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

/**
 * Component for controlling the time for star viewing
 */
export default function TimeControls({
  onTimeChange,
  isVisible,
  onToggleVisibility
}: TimeControlsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0); // Hours offset from current time
  const [isRealTime, setIsRealTime] = useState(true);
  
  // Format the date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  
  // Handle slider change
  const handleSliderChange = (value: number) => {
    setTimeOffset(value);
    setIsRealTime(value === 0);
    
    // Calculate new date based on offset
    const newDate = new Date();
    newDate.setHours(newDate.getHours() + value);
    setCurrentDate(newDate);
    onTimeChange(newDate);
  };
  
  // Reset to current time
  const handleReset = () => {
    setTimeOffset(0);
    setIsRealTime(true);
    const now = new Date();
    setCurrentDate(now);
    onTimeChange(now);
  };
  
  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={onToggleVisibility}
      >
        <Ionicons name="time-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Controls</Text>
        <TouchableOpacity onPress={onToggleVisibility}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>-24h</Text>
          <Slider
            style={styles.slider}
            minimumValue={-24}
            maximumValue={24}
            step={1}
            value={timeOffset}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#ffffff50"
            thumbTintColor={isRealTime ? "#2ecc71" : "#3498db"}
          />
          <Text style={styles.sliderLabel}>+24h</Text>
        </View>
        
        <View style={styles.statusContainer}>
          {isRealTime ? (
            <Text style={[styles.statusText, styles.realTimeText]}>
              Real-time
            </Text>
          ) : (
            <Text style={styles.statusText}>
              {timeOffset > 0 ? "+" : ""}{timeOffset} hours from now
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset to Current Time</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 100,
  },
  toggleButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 15,
  },
  dateText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  sliderLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    width: 40,
    textAlign: "center",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  statusContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
  },
  realTimeText: {
    color: "#2ecc71",
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "rgba(52, 152, 219, 0.7)",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
  },
});
