import { useEffect } from 'react';

// Performance metrics interface for future use
// interface PerformanceMetrics {
//   fcp?: number; // First Contentful Paint
//   lcp?: number; // Largest Contentful Paint
//   fid?: number; // First Input Delay
//   cls?: number; // Cumulative Layout Shift
//   ttfb?: number; // Time to First Byte
// }

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      // Send to analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {

      }
    };

    // Import and initialize web-vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });

    // Performance observer for custom metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            // Log custom performance measures

          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });
    }

    // Memory usage monitoring
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
        
        // Log memory usage if it's getting high
        const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        if (usagePercentage > 80) {

        }
      }
    };

    // Check memory usage every 30 seconds
    const memoryInterval = setInterval(checkMemoryUsage, 30000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    // const startTime = performance.now();
    
    return () => {
      // const endTime = performance.now();
      // const renderTime = endTime - startTime;
      
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render-time`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
      
      if (process.env.NODE_ENV === 'development') {

      }
    };
  });
};

// Hook for measuring API call performance
export const useAPIPerformance = () => {
  const measureAPICall = async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    // const startTime = performance.now();
    
    try {
      const result = await apiCall();
      // const endTime = performance.now();
      // const duration = endTime - startTime;
      
      performance.mark(`${endpoint}-api-end`);
      performance.measure(
        `${endpoint}-api-time`,
        `${endpoint}-api-start`,
        `${endpoint}-api-end`
      );
      
      if (process.env.NODE_ENV === 'development') {

      }
      
      return result;
    } catch (error) {
      // const endTime = performance.now();
      // const duration = endTime - startTime;

      throw error;
    }
  };

  return { measureAPICall };
};
