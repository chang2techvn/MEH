import { useState, useEffect } from 'react'

// Performance Testing Utilities
// Real-world performance measurement tools

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Load Time
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

// Core Web Vitals measurement
export function measureCoreWebVitals(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    const metrics: Partial<PerformanceMetrics> = {};

    // Measure FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
        fcpObserver.disconnect();
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Measure LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (lcpEntry) {
        metrics.lcp = lcpEntry.startTime;
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fidEntry = entries[0] as PerformanceEntry & { processingStart: number; startTime: number };
      if (fidEntry) {
        metrics.fid = fidEntry.processingStart - fidEntry.startTime;
        fidObserver.disconnect();
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Measure CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.cls = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Get navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.domLoad = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        };
      }

      // Wait a bit for all observers to complete
      setTimeout(() => {
        clsObserver.disconnect();
        lcpObserver.disconnect();
        resolve(metrics as PerformanceMetrics);
      }, 1000);
    });
  });
}

// Performance budget checker
export interface PerformanceBudget {
  fcp: number; // Target FCP in ms
  lcp: number; // Target LCP in ms
  fid: number; // Target FID in ms
  cls: number; // Target CLS score
  ttfb: number; // Target TTFB in ms
  bundleSize: number; // Target bundle size in KB
  memoryUsage: number; // Target memory usage in MB
}

export const defaultBudget: PerformanceBudget = {
  fcp: 1200, // 1.2s
  lcp: 2000, // 2.0s
  fid: 80, // 80ms
  cls: 0.05, // 0.05
  ttfb: 200, // 200ms
  bundleSize: 250, // 250KB
  memoryUsage: 45, // 45MB
};

export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget = defaultBudget
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.fcp > budget.fcp) {
    violations.push(`FCP: ${metrics.fcp}ms exceeds budget of ${budget.fcp}ms`);
  }
  
  if (metrics.lcp > budget.lcp) {
    violations.push(`LCP: ${metrics.lcp}ms exceeds budget of ${budget.lcp}ms`);
  }
  
  if (metrics.fid > budget.fid) {
    violations.push(`FID: ${metrics.fid}ms exceeds budget of ${budget.fid}ms`);
  }
  
  if (metrics.cls > budget.cls) {
    violations.push(`CLS: ${metrics.cls} exceeds budget of ${budget.cls}`);
  }
  
  if (metrics.ttfb > budget.ttfb) {
    violations.push(`TTFB: ${metrics.ttfb}ms exceeds budget of ${budget.ttfb}ms`);
  }

  if (metrics.memoryUsage && metrics.memoryUsage.used > budget.memoryUsage) {
    violations.push(`Memory: ${metrics.memoryUsage.used}MB exceeds budget of ${budget.memoryUsage}MB`);
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

// Network quality detection
export function getNetworkQuality(): Promise<{ effectiveType: string; downlink: number; rtt: number }> {
  return new Promise((resolve) => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      resolve({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
      });
    } else {
      // Fallback: measure with a small resource
      const startTime = performance.now();
      fetch('/favicon.ico', { cache: 'no-cache' })
        .then(() => {
          const endTime = performance.now();
          const rtt = endTime - startTime;
          resolve({
            effectiveType: rtt < 50 ? '4g' : rtt < 150 ? '3g' : '2g',
            downlink: rtt < 50 ? 10 : rtt < 150 ? 1.5 : 0.5,
            rtt: rtt,
          });
        })
        .catch(() => {
          resolve({
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0,
          });
        });
    }
  });
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [budget, setBudget] = useState<PerformanceBudget>(defaultBudget);
  const [budgetCheck, setBudgetCheck] = useState<{ passed: boolean; violations: string[] } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      measureCoreWebVitals().then((measuredMetrics) => {
        setMetrics(measuredMetrics);
        const check = checkPerformanceBudget(measuredMetrics, budget);
        setBudgetCheck(check);
        
        // Log results
        console.group('📊 Performance Metrics');
        console.log('FCP:', `${measuredMetrics.fcp}ms`);
        console.log('LCP:', `${measuredMetrics.lcp}ms`);
        console.log('FID:', `${measuredMetrics.fid}ms`);
        console.log('CLS:', measuredMetrics.cls);
        console.log('TTFB:', `${measuredMetrics.ttfb}ms`);
        console.log('DOM Load:', `${measuredMetrics.domLoad}ms`);
        if (measuredMetrics.memoryUsage) {
          console.log('Memory:', `${measuredMetrics.memoryUsage.used}MB`);
        }
        console.groupEnd();

        if (!check.passed) {
          console.group('❌ Performance Budget Violations');
          check.violations.forEach(violation => console.warn(violation));
          console.groupEnd();
        } else {
          console.log('✅ All performance budgets passed!');
        }
      });
    }
  }, [budget]);

  return {
    metrics,
    budget,
    setBudget,
    budgetCheck,
  };
}

// Real device testing simulator
export function simulateDeviceConditions(device: 'mobile' | 'tablet' | 'desktop', network: 'slow' | 'fast') {
  if (typeof window === 'undefined') return;

  // Simulate viewport
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  };

  const viewport = viewports[device];
  
  // This would typically be done in a testing environment
  console.log(`🧪 Simulating ${device} device (${viewport.width}x${viewport.height}) with ${network} network`);
  
  // In a real testing environment, you would:
  // 1. Set viewport size
  // 2. Throttle network
  // 3. Limit CPU
  // 4. Measure performance
}

// Accessibility performance check
export function checkAccessibilityPerformance(): Promise<{ score: number; issues: string[] }> {
  return new Promise((resolve) => {
    const issues: string[] = [];
    let score = 100;

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push('Image missing alt text');
        score -= 5;
      }
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push('Heading hierarchy skipped');
        score -= 3;
      }
      lastLevel = level;
    });

    // Check for focus indicators
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]'
    );
    // This is a simplified check - in reality you'd need to test actual focus styles
    if (focusableElements.length > 0) {
      score += 0; // Placeholder for focus indicator check
    }    resolve({
      score: Math.max(0, score),
      issues
    });
  });
}
