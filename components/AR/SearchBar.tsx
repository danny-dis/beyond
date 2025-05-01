import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Types for search results
export interface SearchResult {
  id: string;
  name: string;
  type: "star" | "constellation" | "planet" | "deepsky";
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onResultSelect: (result: SearchResult) => void;
  results: SearchResult[];
  isSearching: boolean;
}

/**
 * Search bar component for finding celestial objects
 */
export default function SearchBar({
  onSearch,
  onResultSelect,
  results,
  isSearching
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setIsExpanded(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsExpanded(false);
  };

  const handleSelect = (result: SearchResult) => {
    onResultSelect(result);
    setIsExpanded(false);
  };

  // Icon mapping for different celestial object types
  const getIconName = (type: string) => {
    switch (type) {
      case "star":
        return "star";
      case "constellation":
        return "grid";
      case "planet":
        return "planet";
      case "deepsky":
        return "cloud";
      default:
        return "star";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Search stars, constellations..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        
        {query.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClear}
          >
            <Ionicons name="close-circle" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      {isExpanded && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <Ionicons 
                    name={getIconName(item.type)} 
                    size={16} 
                    color="white" 
                    style={styles.resultIcon}
                  />
                  <Text style={styles.resultText}>{item.name}</Text>
                  <Text style={styles.resultType}>{item.type}</Text>
                </TouchableOpacity>
              )}
            />
          ) : query.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "white",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  clearButton: {
    padding: 10,
  },
  resultsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  loadingContainer: {
    padding: 15,
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  resultType: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    textTransform: "capitalize",
  },
  noResultsContainer: {
    padding: 15,
    alignItems: "center",
  },
  noResultsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
});
