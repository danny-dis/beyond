import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ARCameraView from "../../components/AR/ARCameraView";
import StarRenderer from "../../components/AR/StarRenderer";
import SearchBar, { SearchResult } from "../../components/AR/SearchBar";
import TimeControls from "../../components/AR/TimeControls";
import FilterControls, { FilterOptions } from "../../components/AR/FilterControls";

export default function AREnhancedScreen() {    
  // Location and orientation state
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [orientation, setOrientation] = useState<{
    accelerometer: { x: number, y: number, z: number };     
    gyroscope: { x: number, y: number, z: number };
    magnetometer: { x: number, y: number, z: number };      
  } | null>(null);
  
  // UI state
  const [isNightMode, setIsNightMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimeControls, setShowTimeControls] = useState(false);
  const [showFilterControls, setShowFilterControls] = useState(false);
  
  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedObject, setSelectedObject] = useState<SearchResult | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    showStars: true,
    showConstellations: true,
    showPlanets: true,
    showDeepSky: true,
    brightStarsOnly: false
  });

  // Event handlers
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
  
  const handleSearch = (query: string) => {
    setIsSearching(true);
    
    // Simulate search with a timeout
    setTimeout(() => {
      // Mock search results based on the sample stars in StarRenderer
      const results: SearchResult[] = [
        { id: "1", name: "Sirius", type: "star" },
        { id: "2", name: "Canopus", type: "star" },
        { id: "3", name: "Rigil Kentaurus", type: "star" },
        { id: "UMA", name: "Ursa Major", type: "constellation" },
        { id: "ORI", name: "Orion", type: "constellation" },
        { id: "CRU", name: "Southern Cross", type: "constellation" }
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };
  
  const handleResultSelect = (result: SearchResult) => {
    setSelectedObject(result);
  };
  
  const handleTimeChange = (date: Date) => {
    setCurrentTime(date);
  };
  
  const toggleTimeControls = () => {
    setShowTimeControls(!showTimeControls);
  };
  
  const toggleFilterControls = () => {
    setShowFilterControls(!showFilterControls);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
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
          showConstellations={filters.showConstellations}
          currentTime={currentTime}
          filters={filters}
          selectedObject={selectedObject}
        />
      )}
      
      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onResultSelect={handleResultSelect}
        results={searchResults}
        isSearching={isSearching}
      />
      
      {/* Time Controls */}
      <TimeControls
        onTimeChange={handleTimeChange}
        isVisible={showTimeControls}
        onToggleVisibility={toggleTimeControls}
      />
      
      {/* Filter Controls */}
      <FilterControls
        filters={filters}
        onFiltersChange={setFilters}
        isVisible={showFilterControls}
        onToggleVisibility={toggleFilterControls}
      />

      <StatusBar style="auto" />        
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({      
  container: {      
    flex: 1,        
    backgroundColor: "black",
  },
});
