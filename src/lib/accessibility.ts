/**
 * Accessibility Utilities Module
 * 
 * Ensures WCAG 2.1 AA compliance with:
 * - Screen reader support
 * - Keyboard navigation
 * - Focus management
 * - Color contrast validation
 * - Reduced motion preferences
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================
// Focus Management
// ============================================

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>): void {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [containerRef]);
}

/**
 * Hook to restore focus when component unmounts
 */
export function useRestoreFocus(): void {
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        previousActiveElement.current = document.activeElement as HTMLElement;

        return () => {
            previousActiveElement.current?.focus();
        };
    }, []);
}

/**
 * Focus on element when condition is met
 */
export function useFocusOnCondition(
    ref: React.RefObject<HTMLElement>,
    condition: boolean
): void {
    useEffect(() => {
        if (condition && ref.current) {
            ref.current.focus();
        }
    }, [condition, ref]);
}

// ============================================
// Keyboard Navigation
// ============================================

interface UseArrowNavigationOptions {
    onSelect?: (index: number) => void;
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
}

/**
 * Hook for arrow key navigation in lists
 */
export function useArrowNavigation(
    itemCount: number,
    options: UseArrowNavigationOptions = {}
): {
    activeIndex: number;
    setActiveIndex: (index: number) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
} {
    const [activeIndex, setActiveIndex] = useState(0);
    const { onSelect, loop = true, orientation = 'vertical' } = options;

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const isVerticalKey = e.key === 'ArrowUp' || e.key === 'ArrowDown';
        const isHorizontalKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight';

        const shouldHandle =
            (orientation === 'vertical' && isVerticalKey) ||
            (orientation === 'horizontal' && isHorizontalKey) ||
            (orientation === 'both' && (isVerticalKey || isHorizontalKey));

        if (!shouldHandle) return;

        e.preventDefault();

        const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
        const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';

        setActiveIndex((current) => {
            if (isPrev) {
                if (current === 0) {
                    return loop ? itemCount - 1 : 0;
                }
                return current - 1;
            }
            if (isNext) {
                if (current === itemCount - 1) {
                    return loop ? 0 : itemCount - 1;
                }
                return current + 1;
            }
            return current;
        });

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(activeIndex);
        }
    }, [itemCount, loop, orientation, onSelect, activeIndex]);

    return { activeIndex, setActiveIndex, handleKeyDown };
}

/**
 * Skip link component helper
 */
export function createSkipLink(targetId: string, label: string = 'Skip to main content'): {
    id: string;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
} {
    const jumpToTarget = () => {
        const target = document.getElementById(targetId);
        if (target) {
            target.tabIndex = -1;
            target.focus();
        }
    };

    return {
        id: `skip-to-${targetId}`,
        onClick: jumpToTarget,
        onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                jumpToTarget();
            }
        }
    };
}

// ============================================
// Screen Reader Announcements
// ============================================

let announcerElement: HTMLDivElement | null = null;

/**
 * Initialize screen reader announcer element
 */
function ensureAnnouncer(): HTMLDivElement {
    if (announcerElement) return announcerElement;

    announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.setAttribute('role', 'status');
    announcerElement.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    `;
    document.body.appendChild(announcerElement);

    return announcerElement;
}

/**
 * Announce message to screen readers
 */
export function announce(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
): void {
    const announcer = ensureAnnouncer();
    announcer.setAttribute('aria-live', priority);

    // Clear and re-set to trigger announcement
    announcer.textContent = '';
    requestAnimationFrame(() => {
        announcer.textContent = message;
    });
}

/**
 * Hook for screen reader announcements
 */
export function useAnnounce(): (message: string, priority?: 'polite' | 'assertive') => void {
    return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        announce(message, priority);
    }, []);
}

// ============================================
// Reduced Motion
// ============================================

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 */
export function getAnimationDuration(
    standardDuration: number,
    reducedMotion: boolean
): number {
    return reducedMotion ? 0 : standardDuration;
}

// ============================================
// Color Contrast
// ============================================

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 */
export function meetsContrastRequirements(
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
): boolean {
    const ratio = getContrastRatio(color1, color2);

    if (level === 'AAA') {
        return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }
    // AA level
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// ============================================
// ARIA Helpers
// ============================================

/**
 * Generate unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook for generating consistent ARIA IDs
 */
export function useAriaId(prefix: string = 'aria'): string {
    const idRef = useRef<string>();

    if (!idRef.current) {
        idRef.current = generateAriaId(prefix);
    }

    return idRef.current;
}

/**
 * Build ARIA describedby string from multiple sources
 */
export function buildAriaDescribedBy(...ids: (string | undefined | null)[]): string | undefined {
    const validIds = ids.filter((id): id is string => Boolean(id));
    return validIds.length > 0 ? validIds.join(' ') : undefined;
}

// ============================================
// Form Accessibility
// ============================================

interface FormFieldA11yProps {
    id: string;
    label: string;
    error?: string;
    description?: string;
    required?: boolean;
}

/**
 * Generate accessible form field props
 */
export function getFormFieldA11yProps(props: FormFieldA11yProps): {
    labelProps: Record<string, string>;
    inputProps: Record<string, string | boolean | undefined>;
    errorProps: Record<string, string>;
    descriptionProps: Record<string, string>;
} {
    const errorId = props.error ? `${props.id}-error` : undefined;
    const descriptionId = props.description ? `${props.id}-description` : undefined;

    return {
        labelProps: {
            htmlFor: props.id,
        },
        inputProps: {
            id: props.id,
            'aria-required': props.required,
            'aria-invalid': props.error ? 'true' : undefined,
            'aria-describedby': buildAriaDescribedBy(errorId, descriptionId),
        },
        errorProps: {
            id: errorId || '',
            role: 'alert',
            'aria-live': 'polite',
        },
        descriptionProps: {
            id: descriptionId || '',
        },
    };
}

// ============================================
// High Contrast Mode
// ============================================

/**
 * Hook to detect high contrast mode
 */
export function useHighContrastMode(): boolean {
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        // Check for forced-colors media query (Windows High Contrast)
        const mediaQuery = window.matchMedia('(forced-colors: active)');
        setIsHighContrast(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setIsHighContrast(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isHighContrast;
}

// ============================================
// Visible Focus
// ============================================

/**
 * Hook to show focus ring only for keyboard navigation
 */
export function useVisibleFocus(): boolean {
    const [isKeyboardUser, setIsKeyboardUser] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                setIsKeyboardUser(true);
            }
        };

        const handleMouseDown = () => {
            setIsKeyboardUser(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return isKeyboardUser;
}

// ============================================
// Export
// ============================================

export default {
    useFocusTrap,
    useRestoreFocus,
    useFocusOnCondition,
    useArrowNavigation,
    createSkipLink,
    announce,
    useAnnounce,
    useReducedMotion,
    getAnimationDuration,
    getContrastRatio,
    meetsContrastRequirements,
    generateAriaId,
    useAriaId,
    buildAriaDescribedBy,
    getFormFieldA11yProps,
    useHighContrastMode,
    useVisibleFocus
};
