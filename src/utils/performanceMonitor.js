// src/utils/performanceMonitor.js
// Phase 2.3: Performance monitoring utilities for frontend

import { getPerformanceMetrics, clearPerformanceMetrics } from '../services/api';

/**
 * Performance Monitor Class
 * Tracks and reports on API performance metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.pageLoadTime = null;
    this.componentRenderTimes = new Map();
    this.apiMetrics = null;
  }

  /**
   * Record page load time
   */
  recordPageLoadTime() {
    if (window.performance && window.performance.timing) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      this.pageLoadTime = pageLoadTime;
      console.log(`📊 Page Load Time: ${pageLoadTime}ms`);
      return pageLoadTime;
    }
  }

  /**
   * Record component render time
   */
  recordComponentRenderTime(componentName, duration) {
    this.componentRenderTimes.set(componentName, duration);
    if (duration > 100) {
      console.warn(`⚠️ Slow component render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get API performance metrics
   */
  getAPIMetrics() {
    this.apiMetrics = getPerformanceMetrics();
    return this.apiMetrics;
  }

  /**
   * Print performance report
   */
  printReport() {
    const apiMetrics = this.getAPIMetrics();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE REPORT');
    console.log('='.repeat(60));
    
    // Page Load Time
    if (this.pageLoadTime) {
      console.log(`\n⏱️  Page Load Time: ${this.pageLoadTime}ms`);
      console.log(`   Status: ${this.pageLoadTime < 2000 ? '✅ GOOD' : '⚠️ SLOW'}`);
    }
    
    // API Metrics
    console.log(`\n🌐 API Metrics:`);
    console.log(`   Total Requests: ${apiMetrics.totalRequests}`);
    console.log(`   Average Response Time: ${apiMetrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Cache Hit Rate: ${apiMetrics.cacheHitRate}%`);
    console.log(`   Cache Hits: ${apiMetrics.cacheHits}`);
    console.log(`   Cache Misses: ${apiMetrics.cacheMisses}`);
    
    // Performance Status
    console.log(`\n✅ Performance Status:`);
    console.log(`   Response Time: ${apiMetrics.averageResponseTime < 50 ? '✅ EXCELLENT' : apiMetrics.averageResponseTime < 100 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
    console.log(`   Cache Hit Rate: ${apiMetrics.cacheHitRate > 80 ? '✅ EXCELLENT' : apiMetrics.cacheHitRate > 50 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
    
    // Slow Requests
    if (apiMetrics.slowRequests.length > 0) {
      console.log(`\n⚠️  Slow Requests (>500ms):`);
      apiMetrics.slowRequests.slice(-5).forEach(req => {
        console.log(`   ${req.url}: ${req.duration.toFixed(2)}ms`);
      });
    }
    
    // Component Render Times
    if (this.componentRenderTimes.size > 0) {
      console.log(`\n⚙️  Component Render Times:`);
      this.componentRenderTimes.forEach((duration, componentName) => {
        const status = duration < 100 ? '✅' : duration < 500 ? '⚠️' : '❌';
        console.log(`   ${status} ${componentName}: ${duration.toFixed(2)}ms`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.pageLoadTime = null;
    this.componentRenderTimes.clear();
    this.apiMetrics = null;
    clearPerformanceMetrics();
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const apiMetrics = this.getAPIMetrics();
    return {
      pageLoadTime: this.pageLoadTime,
      apiMetrics: {
        totalRequests: apiMetrics.totalRequests,
        averageResponseTime: apiMetrics.averageResponseTime.toFixed(2),
        cacheHitRate: apiMetrics.cacheHitRate,
      },
      componentRenderTimes: Object.fromEntries(this.componentRenderTimes),
    };
  }
}

/**
 * Hook to measure component render time
 */
export const useMeasureRender = (componentName) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const monitor = new PerformanceMonitor();
    monitor.recordComponentRenderTime(componentName, duration);
  };
};

/**
 * Measure async function execution time
 */
export const measureAsync = async (functionName, asyncFn) => {
  const startTime = performance.now();
  try {
    const result = await asyncFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⏱️  ${functionName} took ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`❌ ${functionName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;

