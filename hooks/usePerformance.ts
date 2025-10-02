// hooks/usePerformance.ts
import { useEffect } from 'react';

export function usePerformance() {
  useEffect(() => {
    // Monitor long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 50ms threshold
          console.warn('Long task detected:', entry);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  }, []);
}