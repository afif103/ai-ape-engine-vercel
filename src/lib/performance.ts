import React from 'react';

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRenderTime: (componentName: string, startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Log slow renders (>16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('component_render', {
      //   component: componentName,
      //   renderTime: renderTime
      // });
    }
  },

  // Measure API call performance
  measureApiCall: async (apiName: string, apiCall: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`${apiName} took ${duration.toFixed(2)}ms`);

      // Track slow API calls
      if (duration > 1000) {
        console.warn(`Slow API call: ${apiName} (${duration.toFixed(2)}ms)`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`${apiName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Memory usage monitoring
  logMemoryUsage: () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('Memory Usage:', {
        used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  React.useEffect(() => {
    performanceMonitor.measureRenderTime(componentName, startTime);
  });
};