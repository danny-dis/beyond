import React, { Suspense, lazy, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Default loading component shown while lazy-loaded components are being loaded
 */
export const DefaultLoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
  </View>
);

/**
 * Lazy load a component with a custom loading component
 * @param importFunc Function that imports the component
 * @param LoadingComponent Component to show while loading
 * @returns Lazy-loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  LoadingComponent: React.ComponentType = DefaultLoadingComponent
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
