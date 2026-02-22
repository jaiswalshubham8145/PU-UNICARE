/**
 * Performance Optimization Utilities
 * 
 * Comprehensive performance optimization module including:
 * - React Component optimization hooks
 * - Image optimization utilities
 * - Lazy loading helpers
 * - Memory management
 * - Bundle size optimization
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// ============================================
// Debounce & Throttle
// ============================================

/**
 * Debounce function for rate limiting rapid events
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function for limiting execution frequency
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook for debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(
        debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
        [delay]
    );
}

// ============================================
// Intersection Observer for Lazy Loading
// ============================================

interface IntersectionOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
}

/**
 * Hook for detecting element visibility (lazy loading, infinite scroll, etc.)
 */
export function useIntersectionObserver(
    options: IntersectionOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsIntersecting(entry.isIntersecting),
            {
                root: options.root || null,
                rootMargin: options.rootMargin || '0px',
                threshold: options.threshold || 0
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [options.root, options.rootMargin, options.threshold]);

    return [elementRef, isIntersecting];
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(src: string, placeholder?: string): {
    imageSrc: string;
    isLoaded: boolean;
    ref: React.RefObject<HTMLDivElement>;
} {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [ref, isIntersecting] = useIntersectionObserver({ rootMargin: '50px' });

    useEffect(() => {
        if (isIntersecting && !isLoaded) {
            const img = new Image();
            img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
            };
            img.src = src;
        }
    }, [isIntersecting, isLoaded, src]);

    return { imageSrc, isLoaded, ref };
}

// ============================================
// Virtual List for Large Data Sets
// ============================================

interface VirtualListOptions {
    itemHeight: number;
    overscan?: number;
}

/**
 * Hook for virtualized list rendering (for large data sets)
 */
export function useVirtualList<T>(
    items: T[],
    containerHeight: number,
    options: VirtualListOptions
): {
    virtualItems: { item: T; index: number; style: React.CSSProperties }[];
    totalHeight: number;
    onScroll: (scrollTop: number) => void;
    scrollTop: number;
} {
    const [scrollTop, setScrollTop] = useState(0);
    const { itemHeight, overscan = 3 } = options;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const virtualItems = useMemo(() => {
        const result = [];
        for (let i = startIndex; i < endIndex; i++) {
            result.push({
                item: items[i],
                index: i,
                style: {
                    position: 'absolute' as const,
                    top: i * itemHeight,
                    height: itemHeight,
                    width: '100%'
                }
            });
        }
        return result;
    }, [items, startIndex, endIndex, itemHeight]);

    return {
        virtualItems,
        totalHeight: items.length * itemHeight,
        onScroll: setScrollTop,
        scrollTop
    };
}

// ============================================
// Memory Management
// ============================================

/**
 * Hook for cleaning up resources on unmount
 */
export function useUnmountCleanup(cleanup: () => void): void {
    const cleanupRef = useRef(cleanup);
    cleanupRef.current = cleanup;

    useEffect(() => {
        return () => cleanupRef.current();
    }, []);
}

/**
 * Object pool for reducing garbage collection
 */
export class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;
    private reset: (obj: T) => void;
    private maxSize: number;

    constructor(
        factory: () => T,
        reset: (obj: T) => void,
        maxSize: number = 100
    ) {
        this.factory = factory;
        this.reset = reset;
        this.maxSize = maxSize;
    }

    acquire(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }
        return this.factory();
    }

    release(obj: T): void {
        if (this.pool.length < this.maxSize) {
            this.reset(obj);
            this.pool.push(obj);
        }
    }

    clear(): void {
        this.pool = [];
    }
}

// ============================================
// Image Optimization
// ============================================

/**
 * Generate optimized image srcset
 */
export function generateSrcSet(
    baseUrl: string,
    widths: number[] = [320, 640, 960, 1280, 1920]
): string {
    return widths
        .map(width => {
            const url = baseUrl.includes('?')
                ? `${baseUrl}&w=${width}`
                : `${baseUrl}?w=${width}`;
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Get optimal image width based on container
 */
export function getOptimalImageWidth(containerWidth: number): number {
    const breakpoints = [320, 640, 960, 1280, 1920];
    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const targetWidth = containerWidth * devicePixelRatio;

    return breakpoints.find(bp => bp >= targetWidth) || breakpoints[breakpoints.length - 1];
}

/**
 * Convert image to WebP format URL (for Supabase storage)
 */
export function toWebPUrl(url: string): string {
    if (!url || url.includes('.webp')) return url;

    // For Supabase storage URLs, add transformation parameters
    if (url.includes('supabase')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}format=webp`;
    }

    return url;
}

// ============================================
// Request Caching
// ============================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class RequestCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private maxEntries: number;

    constructor(maxEntries: number = 100) {
        this.maxEntries = maxEntries;
    }

    set<T>(key: string, data: T, ttlMs: number = 60000): void {
        const now = Date.now();

        // Evict oldest entries if at capacity
        if (this.cache.size >= this.maxEntries) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttlMs
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidatePattern(pattern: RegExp): void {
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }
}

export const requestCache = new RequestCache();

/**
 * Hook for cached data fetching
 */
export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 60000
): {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
} {
    const [data, setData] = useState<T | null>(requestCache.get<T>(key));
    const [isLoading, setIsLoading] = useState(!data);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher();
            requestCache.set(key, result, ttlMs);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [key, fetcher, ttlMs]);

    useEffect(() => {
        if (!data) {
            fetchData();
        }
    }, [data, fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ============================================
// Performance Monitoring
// ============================================

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
}

const performanceMetrics: PerformanceMetric[] = [];
const MAX_METRICS = 1000;

/**
 * Measure execution time of a function
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    performanceMetrics.push({
        name,
        duration,
        timestamp: Date.now()
    });

    if (performanceMetrics.length > MAX_METRICS) {
        performanceMetrics.shift();
    }

    if (import.meta.env.DEV && duration > 16) {
        console.warn(`[PERF] ${name} took ${duration.toFixed(2)}ms (> 16ms frame budget)`);
    }

    return result;
}

/**
 * Async version of performance measurement
 */
export async function measurePerformanceAsync<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    performanceMetrics.push({
        name,
        duration,
        timestamp: Date.now()
    });

    if (performanceMetrics.length > MAX_METRICS) {
        performanceMetrics.shift();
    }

    return result;
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): {
    metrics: PerformanceMetric[];
    averages: Record<string, number>;
    slowest: PerformanceMetric[];
} {
    const averages: Record<string, { total: number; count: number }> = {};

    for (const metric of performanceMetrics) {
        if (!averages[metric.name]) {
            averages[metric.name] = { total: 0, count: 0 };
        }
        averages[metric.name].total += metric.duration;
        averages[metric.name].count++;
    }

    const avgResults: Record<string, number> = {};
    for (const [name, data] of Object.entries(averages)) {
        avgResults[name] = data.total / data.count;
    }

    const slowest = [...performanceMetrics]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

    return {
        metrics: performanceMetrics,
        averages: avgResults,
        slowest
    };
}

// ============================================
// Preloading
// ============================================

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
        case 'image':
            link.as = 'image';
            break;
        case 'script':
            link.as = 'script';
            break;
        case 'style':
            link.as = 'style';
            break;
        case 'font':
            link.as = 'font';
            link.crossOrigin = 'anonymous';
            break;
    }

    document.head.appendChild(link);
}

/**
 * Prefetch page for faster navigation
 */
export function prefetchPage(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Preconnect to external origins
 */
export function preconnect(origin: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
}

// Initialize preconnections for known external services
if (typeof window !== 'undefined') {
    // Preconnect to Supabase
    preconnect('https://your-project.supabase.co');
    // Preconnect to Google Fonts
    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');
}

// ============================================
// Export
// ============================================

export default {
    debounce,
    throttle,
    useDebounce,
    useDebouncedCallback,
    useIntersectionObserver,
    useLazyImage,
    useVirtualList,
    useUnmountCleanup,
    ObjectPool,
    generateSrcSet,
    getOptimalImageWidth,
    toWebPUrl,
    requestCache,
    useCachedFetch,
    measurePerformance,
    measurePerformanceAsync,
    getPerformanceStats,
    preloadResource,
    prefetchPage,
    preconnect
};
