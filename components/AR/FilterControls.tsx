import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface FilterOptions {
  showStars: boolean;
  showConstellations: boolean;
  showPlanets: boolean;
  showDeepSky: boolean;
  brightStarsOnly: boolean;
}

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (newFilters: FilterOptions) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

/**
 * Component for filtering what celestial objects are displayed
 */
export default function FilterControls({
  filters,
  onFiltersChange,
  isVisible,
  onToggleVisibility
}: FilterControlsProps) {
  // Toggle a single filter
  const toggleFilter = (filterName: keyof FilterOptions) => {
    onFiltersChange({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };
  
  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={onToggleVisibility}
      >
        <Ionicons name="filter" size={24} color="white" />
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onToggleVisibility}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <FilterOption
          label="Stars"
          icon="star"
          isActive={filters.showStars}
          onToggle={() => toggleFilter("showStars")}
        />
        
        <FilterOption
          label="Constellations"
          icon="grid"
          isActive={filters.showConstellations}
          onToggle={() => toggleFilter("showConstellations")}
        />
        
        <FilterOption
          label="Planets"
          icon="planet"
          isActive={filters.showPlanets}
          onToggle={() => toggleFilter("showPlanets")}
        />
        
        <FilterOption
          label="Deep Sky Objects"
          icon="cloud"
          isActive={filters.showDeepSky}
          onToggle={() => toggleFilter("showDeepSky")}
        />
        
        <FilterOption
          label="Bright Stars Only"
          icon="sunny"
          isActive={filters.brightStarsOnly}
          onToggle={() => toggleFilter("brightStarsOnly")}
        />
      </ScrollView>
    </View>
  );
}

// Sub-component for individual filter options
interface FilterOptionProps {
  label: string;
  icon: string;
  isActive: boolean;
  onToggle: () => void;
}

function FilterOption({ label, icon, isActive, onToggle }: FilterOptionProps) {
  return (
    <TouchableOpacity 
      style={styles.optionContainer}
      onPress={onToggle}
    >
      <View style={styles.optionContent}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={isActive ? "#3498db" : "rgba(255, 255, 255, 0.5)"}
          style={styles.optionIcon}
        />
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      
      <View style={[
        styles.toggleIndicator,
        isActive ? styles.toggleActive : styles.toggleInactive
      ]}>
        <View style={[
          styles.toggleHandle,
          isActive ? styles.handleActive : styles.handleInactive
        ]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    right: 20,
    width: 250,
    maxHeight: 400,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 100,
  },
  toggleButton: {
    position: "absolute",
    top: 100,
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
    padding: 10,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: 10,
  },
  optionLabel: {
    color: "white",
    fontSize: 16,
  },
  toggleIndicator: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "rgba(52, 152, 219, 0.3)",
  },
  toggleInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  toggleHandle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  handleActive: {
    backgroundColor: "#3498db",
    marginLeft: 18,
  },
  handleInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginLeft: 0,
  },
});
