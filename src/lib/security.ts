/**
 * Enterprise Security Module
 * 
 * Provides comprehensive client-side security utilities including:
 * - Input sanitization (XSS prevention)
 * - CSRF protection
 * - Rate limiting helpers
 * - Content Security Policy headers
 * - Secure data handling
 */

// ============================================
// Input Sanitization
// ============================================

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    
    // HTML entity encoding for dangerous characters
    const entityMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    
    return input.replace(/[&<>"'`=/]/g, (char) => entityMap[char] || char);
}

/**
 * Sanitize HTML content - removes dangerous tags and attributes
 */
export function sanitizeHTML(html: string): string {
    if (!html) return '';
    
    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove on* event handlers
    html = html.replace(/\s*on\w+\s*=\s*(['"])[^'"]*\1/gi, '');
    html = html.replace(/\s*on\w+\s*=[^\s>]*/gi, '');
    
    // Remove javascript: protocol
    html = html.replace(/javascript:/gi, '');
    
    // Remove data: protocol in URLs (potential XSS via data URIs)
    html = html.replace(/data:(?!image\/(png|jpg|jpeg|gif|webp))/gi, '');
    
    // Remove style attribute with expression (IE-specific XSS)
    html = html.replace(/style\s*=\s*(['"])[^'"]*expression[^'"]*\1/gi, '');
    
    return html;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
    if (!email) return null;
    
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    
    if (!emailRegex.test(trimmed)) {
        return null;
    }
    
    return trimmed;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string | null {
    if (!phone) return null;
    
    // Remove all non-numeric characters except + at start
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Validate format
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null;
    }
    
    return cleaned;
}

// ============================================
// CSRF Protection
// ============================================

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in sessionStorage
 */
export function storeCSRFToken(token: string): void {
    sessionStorage.setItem('csrf_token', token);
}

/**
 * Get stored CSRF token
 */
export function getCSRFToken(): string | null {
    return sessionStorage.getItem('csrf_token');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
    const storedToken = getCSRFToken();
    return storedToken !== null && storedToken === token;
}

// ============================================
// Rate Limiting
// ============================================

interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Client-side rate limiting helper
 */
export function checkClientRateLimit(
    action: string,
    maxRequests: number = 10,
    windowMs: number = 60000
): boolean {
    const now = Date.now();
    const key = action;
    const entry = rateLimitMap.get(key);
    
    if (!entry || now - entry.firstRequest > windowMs) {
        rateLimitMap.set(key, { count: 1, firstRequest: now });
        return true;
    }
    
    if (entry.count >= maxRequests) {
        return false;
    }
    
    entry.count++;
    return true;
}

/**
 * Get remaining requests for an action
 */
export function getRemainingRequests(
    action: string,
    maxRequests: number = 10,
    windowMs: number = 60000
): number {
    const now = Date.now();
    const entry = rateLimitMap.get(action);
    
    if (!entry || now - entry.firstRequest > windowMs) {
        return maxRequests;
    }
    
    return Math.max(0, maxRequests - entry.count);
}

// ============================================
// Secure Data Handling
// ============================================

/**
 * Securely clear sensitive data from memory
 */
export function secureClear(data: string | Uint8Array): void {
    if (typeof data === 'string') {
        // Can't directly clear strings in JS, but we can overwrite if mutable container
        return;
    }
    
    if (data instanceof Uint8Array) {
        crypto.getRandomValues(data);
        data.fill(0);
    }
}

/**
 * Hash sensitive data (for comparison purposes, not storage)
 */
export async function hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate secure random string (for tokens, IDs, etc.)
 */
export function generateSecureId(length: number = 16): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

// ============================================
// Content Security
// ============================================

/**
 * Check if URL is from trusted domain
 */
export function isTrustedUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const trustedDomains = [
            'unicare.pu.edu',
            'parul.edu.in',
            'supabase.co',
            'localhost'
        ];
        
        return trustedDomains.some(domain => 
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );
    } catch {
        return false;
    }
}

/**
 * Validate file upload (type and size)
 */
export function validateFileUpload(
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSizeMB: number = 5
): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
        return { 
            valid: false, 
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return { 
            valid: false, 
            error: `File size exceeds ${maxSizeMB}MB limit`
        };
    }
    
    return { valid: true };
}

// ============================================
// Session Security
// ============================================

/**
 * Check if session is still valid based on last activity
 */
export function isSessionValid(lastActivity: Date, maxIdleMinutes: number = 30): boolean {
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes < maxIdleMinutes;
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
    sessionStorage.setItem('last_activity', new Date().toISOString());
}

/**
 * Get last activity timestamp
 */
export function getLastActivity(): Date | null {
    const stored = sessionStorage.getItem('last_activity');
    return stored ? new Date(stored) : null;
}

// ============================================
// Logging & Monitoring
// ============================================

export interface SecurityEvent {
    type: 'auth_failure' | 'rate_limit_exceeded' | 'suspicious_input' | 'session_expired' | 'permission_denied';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}

const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS = 100;

/**
 * Log a security event
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
        ...event,
        timestamp: new Date()
    };
    
    securityEvents.push(fullEvent);
    
    // Keep only the last MAX_EVENTS
    if (securityEvents.length > MAX_EVENTS) {
        securityEvents.shift();
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
        console.warn(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, event);
    }
    
    // In production, send critical events to backend
    if (event.severity === 'critical' && !import.meta.env.DEV) {
        // This would send to your security monitoring service
        // sendToSecurityMonitor(fullEvent);
    }
}

/**
 * Get recent security events
 */
export function getSecurityEvents(): SecurityEvent[] {
    return [...securityEvents];
}

/**
 * Clear security events
 */
export function clearSecurityEvents(): void {
    securityEvents.length = 0;
}

// ============================================
// Export default security utilities
// ============================================

export default {
    sanitizeInput,
    sanitizeHTML,
    sanitizeEmail,
    sanitizePhone,
    generateCSRFToken,
    storeCSRFToken,
    getCSRFToken,
    validateCSRFToken,
    checkClientRateLimit,
    getRemainingRequests,
    hashData,
    generateSecureId,
    isTrustedUrl,
    validateFileUpload,
    isSessionValid,
    updateLastActivity,
    getLastActivity,
    logSecurityEvent,
    getSecurityEvents,
    clearSecurityEvents
};
