import { renderHook } from '@testing-library/react';
import { usePerformanceMonitoring, useRenderPerformance, useAPIPerformance } from '../usePerformanceMonitoring';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn((callback) => callback({ name: 'CLS', value: 0.1, id: 'test-cls' })),
  getFID: jest.fn((callback) => callback({ name: 'FID', value: 100, id: 'test-fid' })),
  getFCP: jest.fn((callback) => callback({ name: 'FCP', value: 1500, id: 'test-fcp' })),
  getLCP: jest.fn((callback) => callback({ name: 'LCP', value: 2000, id: 'test-lcp' })),
  getTTFB: jest.fn((callback) => callback({ name: 'TTFB', value: 500, id: 'test-ttfb' })),
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 5000000,
    },
  },
  writable: true,
});

// Mock PerformanceObserver
class MockPerformanceObserver {
  constructor(callback: any) {
    this.callback = callback;
  }
  
  observe() {}
  
  disconnect() {}
  
  private callback: any;
}

Object.defineProperty(window, 'PerformanceObserver', {
  value: MockPerformanceObserver,
  writable: true,
});

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize performance monitoring', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    expect(result.current).toBeUndefined();
  });

  it('should not run in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true
    });

    renderHook(() => usePerformanceMonitoring());
    
    // Should not call web-vitals functions in development
    const webVitals = require('web-vitals');
    expect(webVitals.getCLS).not.toHaveBeenCalled();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true
    });
  });
});

describe('useRenderPerformance', () => {
  it('should measure component render time', () => {
    const componentName = 'TestComponent';
    
    const { unmount } = renderHook(() => useRenderPerformance(componentName));
    
    unmount();
    
    expect(window.performance.mark).toHaveBeenCalledWith(`${componentName}-render-end`);
    expect(window.performance.measure).toHaveBeenCalledWith(
      `${componentName}-render-time`,
      `${componentName}-render-start`,
      `${componentName}-render-end`
    );
  });
});

describe('useAPIPerformance', () => {
  it('should measure API call performance', async () => {
    const { result } = renderHook(() => useAPIPerformance());
    
    const mockAPICall = jest.fn().mockResolvedValue('success');
    const endpoint = 'test-endpoint';
    
    const apiResult = await result.current.measureAPICall(mockAPICall, endpoint);
    
    expect(apiResult).toBe('success');
    expect(window.performance.mark).toHaveBeenCalledWith(`${endpoint}-api-end`);
    expect(window.performance.measure).toHaveBeenCalledWith(
      `${endpoint}-api-time`,
      `${endpoint}-api-start`,
      `${endpoint}-api-end`
    );
  });

  it('should handle API call errors', async () => {
    const { result } = renderHook(() => useAPIPerformance());
    
    const mockAPICall = jest.fn().mockRejectedValue(new Error('API Error'));
    const endpoint = 'test-endpoint';
    
    await expect(result.current.measureAPICall(mockAPICall, endpoint)).rejects.toThrow('API Error');
    
    expect(window.performance.mark).toHaveBeenCalledWith(`${endpoint}-api-end`);
  });
});
