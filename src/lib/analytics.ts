import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { logger } from '@/services/logger';

const THRESHOLDS = {
  CLS: 0.1,
  FCP: 1800,
  LCP: 2500,
  TTFB: 800,
  INP: 200,
};

const sendToAnalytics = (metric: Metric) => {
  const { name, value, rating } = metric;
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      rating,
      threshold: THRESHOLDS[name as keyof typeof THRESHOLDS],
    });
  }

  // Log to our logger service
  logger.info(`Web Vital: ${name}`, { value, rating });

  // Check if metric exceeds threshold
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (threshold && value > threshold) {
    logger.warn(`⚠️ ${name} exceeds threshold`, {
      value: Math.round(value),
      threshold,
      delta: Math.round(value - threshold),
    });
  }

  // In production, you could send to analytics service
  // Example: gtag('event', name, { value: Math.round(value), metric_rating: rating });
};

export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  
  // Interaction metrics (INP replaces FID)
  onINP(sendToAnalytics);

  logger.info('Performance monitoring initialized');
};

export const trackCustomMetric = (name: string, value: number, additionalData?: Record<string, any>) => {
  logger.info(`Custom Metric: ${name}`, { value, ...additionalData });
};
