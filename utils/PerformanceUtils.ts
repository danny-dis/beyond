/**
 * Utilities for optimizing performance in the Beyond AR Star Gazing app
 */

/**
 * Throttle function to limit how often a function can be called
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

/**
 * Debounce function to delay execution until after a period of inactivity
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @param immediate Whether to call the function immediately
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
}

/**
 * Batch updates to reduce render cycles
 */
export class BatchUpdateManager {
  private updateQueue: Map<string, () => void> = new Map();
  private timeoutId: NodeJS.Timeout | null = null;
  private batchTime: number;

  constructor(batchTimeMs = 100) {
    this.batchTime = batchTimeMs;
  }

  /**
   * Queue an update to be processed in the next batch
   * @param key Unique identifier for this update
   * @param updateFn Function to call when processing the batch
   */
  queueUpdate(key: string, updateFn: () => void): void {
    // Store only the most recent update for each key
    this.updateQueue.set(key, updateFn);

    // Schedule batch processing if not already scheduled
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.processBatch(), this.batchTime);
    }
  }

  /**
   * Process all queued updates
   */
  private processBatch(): void {
    this.timeoutId = null;
    
    // Execute all queued updates
    this.updateQueue.forEach(updateFn => {
      try {
        updateFn();
      } catch (error) {
        console.error('Error processing batched update:', error);
      }
    });
    
    // Clear the queue
    this.updateQueue.clear();
  }

  /**
   * Cancel all pending updates
   */
  cancelUpdates(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.updateQueue.clear();
  }
}

/**
 * Memory usage optimization - clear caches when memory pressure is high
 * @param cacheMap Map or object to clear
 * @param maxSize Maximum size before clearing
 */
export function manageCacheSize<K, V>(
  cacheMap: Map<K, V>,
  maxSize = 100
): void {
  if (cacheMap.size > maxSize) {
    // Remove oldest entries (first 25%)
    const entriesToRemove = Math.floor(cacheMap.size * 0.25);
    const keys = Array.from(cacheMap.keys()).slice(0, entriesToRemove);
    keys.forEach(key => cacheMap.delete(key));
  }
}

/**
 * Check if the device is likely to be low-end based on performance metrics
 * This is a simple heuristic and could be improved with more sophisticated detection
 */
export function isLowEndDevice(): boolean {
  // Check if the device has limited memory
  if (typeof performance !== 'undefined' && performance.memory) {
    const memory = (performance as any).memory;
    if (memory.jsHeapSizeLimit < 200000000) { // Less than ~200MB
      return true;
    }
  }
  
  // Check if the device has a slow CPU
  let isSlowCPU = false;
  const startTime = Date.now();
  
  // Perform a simple benchmark
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // If the benchmark took more than 100ms, consider it a slow device
  if (duration > 100) {
    isSlowCPU = true;
  }
  
  return isSlowCPU;
}

/**
 * Get performance settings based on device capabilities
 */
export function getPerformanceSettings(): {
  updateInterval: number;
  maxStars: number;
  enableEffects: boolean;
} {
  const lowEnd = isLowEndDevice();
  
  return {
    updateInterval: lowEnd ? 500 : 200, // ms between sensor updates
    maxStars: lowEnd ? 500 : 2000,      // maximum stars to render
    enableEffects: !lowEnd,             // whether to enable visual effects
  };
}
