import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface InfoPanelProps {
  isVisible: boolean;
  title: string;
  description: string;
  additionalInfo?: {
    label: string;
    value: string;
  }[];
  onClose: () => void;
}

/**
 * Component for displaying information about celestial objects
 */
export default function InfoPanel({
  isVisible,
  title,
  description,
  additionalInfo = [],
  onClose
}: InfoPanelProps) {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.description}>{description}</Text>
          
          {additionalInfo.length > 0 && (
            <View style={styles.additionalInfo}>
              {additionalInfo.map((info, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{info.label}:</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  panel: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  description: {
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  additionalInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    width: 120,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
});

