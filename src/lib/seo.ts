/**
 * SEO Component
 * 
 * Comprehensive SEO implementation with:
 * - Dynamic meta tags
 * - Open Graph support
 * - Twitter cards
 * - JSON-LD structured data
 * - Canonical URLs
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ============================================
// Types
// ============================================

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    structuredData?: Record<string, unknown>;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

// ============================================
// Constants
// ============================================

const SITE_NAME = 'PU Unicare';
const DEFAULT_TITLE = 'PU Unicare - University Maintenance Management System';
const DEFAULT_DESCRIPTION = 'PU Unicare is the official campus maintenance complaint management system for Parul University. Report, track, and resolve facility issues with ease.';
const DEFAULT_IMAGE = '/og-image.png';
const BASE_URL = 'https://unicare.pu.edu';
const TWITTER_HANDLE = '@ParulUniversity';

// ============================================
// Utility Functions
// ============================================

/**
 * Set a meta tag, creating it if it doesn't exist
 */
function setMetaTag(
    attribute: 'name' | 'property',
    value: string,
    content: string
): void {
    let element = document.querySelector(`meta[${attribute}="${value}"]`);

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
}

/**
 * Set link tag (canonical, alternate, etc.)
 */
function setLinkTag(rel: string, href: string, hreflang?: string): void {
    let selector = `link[rel="${rel}"]`;
    if (hreflang) {
        selector += `[hreflang="${hreflang}"]`;
    }

    let element = document.querySelector(selector);

    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (hreflang) {
            element.setAttribute('hreflang', hreflang);
        }
        document.head.appendChild(element);
    }

    element.setAttribute('href', href);
}

/**
 * Remove meta tag
 */
function removeMetaTag(attribute: 'name' | 'property', value: string): void {
    const element = document.querySelector(`meta[${attribute}="${value}"]`);
    element?.remove();
}

// ============================================
// SEO Hook
// ============================================

/**
 * Main SEO hook for managing page meta tags
 */
export function useSEO(props: SEOProps = {}): void {
    const location = useLocation();

    useEffect(() => {
        const {
            title,
            description = DEFAULT_DESCRIPTION,
            keywords = [],
            image = DEFAULT_IMAGE,
            url,
            type = 'website',
            author,
            publishedTime,
            modifiedTime,
            noIndex = false,
            noFollow = false,
            structuredData
        } = props;

        // Full URL for current page
        const pageUrl = url || `${BASE_URL}${location.pathname}`;
        const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

        // Title
        const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
        document.title = fullTitle;

        // Basic Meta Tags
        setMetaTag('name', 'description', description);

        if (keywords.length > 0) {
            setMetaTag('name', 'keywords', keywords.join(', '));
        }

        if (author) {
            setMetaTag('name', 'author', author);
        }

        // Robots
        const robotsContent: string[] = [];
        robotsContent.push(noIndex ? 'noindex' : 'index');
        robotsContent.push(noFollow ? 'nofollow' : 'follow');
        setMetaTag('name', 'robots', robotsContent.join(', '));

        // Canonical URL
        setLinkTag('canonical', pageUrl);

        // Open Graph
        setMetaTag('property', 'og:title', fullTitle);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:image', fullImageUrl);
        setMetaTag('property', 'og:url', pageUrl);
        setMetaTag('property', 'og:type', type);
        setMetaTag('property', 'og:site_name', SITE_NAME);
        setMetaTag('property', 'og:locale', 'en_US');

        if (type === 'article') {
            if (publishedTime) {
                setMetaTag('property', 'article:published_time', publishedTime);
            }
            if (modifiedTime) {
                setMetaTag('property', 'article:modified_time', modifiedTime);
            }
            if (author) {
                setMetaTag('property', 'article:author', author);
            }
        }

        // Twitter Card
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:site', TWITTER_HANDLE);
        setMetaTag('name', 'twitter:title', fullTitle);
        setMetaTag('name', 'twitter:description', description);
        setMetaTag('name', 'twitter:image', fullImageUrl);

        // Structured Data (JSON-LD)
        if (structuredData) {
            let scriptElement = document.querySelector('script[type="application/ld+json"]');
            if (!scriptElement) {
                scriptElement = document.createElement('script');
                scriptElement.setAttribute('type', 'application/ld+json');
                document.head.appendChild(scriptElement);
            }
            scriptElement.textContent = JSON.stringify(structuredData);
        }

        // Cleanup function
        return () => {
            // In SPA, we don't typically remove meta tags on unmount
            // as they'll be overwritten by the next page
        };
    }, [location.pathname, props]);
}

// ============================================
// Structured Data Generators
// ============================================

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Parul University',
        url: 'https://paruluniversity.ac.in',
        logo: `${BASE_URL}/logo.png`,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-2668-260300',
            contactType: 'customer service',
            availableLanguage: ['en', 'hi', 'gu']
        },
        sameAs: [
            'https://www.facebook.com/ParulUniversity',
            'https://twitter.com/ParulUniversity',
            'https://www.linkedin.com/school/parul-university'
        ]
    };
}

/**
 * Generate WebApplication structured data
 */
export function generateWebAppSchema(): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PU Unicare',
        description: DEFAULT_DESCRIPTION,
        url: BASE_URL,
        applicationCategory: 'Facility Management',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR'
        },
        provider: generateOrganizationSchema()
    };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
        }))
    };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(
    faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };
}

/**
 * Generate HowTo structured data (for complaint filing process)
 */
export function generateHowToSchema(
    title: string,
    description: string,
    steps: Array<{ name: string; text: string; image?: string }>
): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        description: description,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.image && { image: step.image })
        }))
    };
}

// ============================================
// Page-Specific SEO Presets
// ============================================

export const SEO_PRESETS = {
    home: {
        title: 'Campus Maintenance Made Simple',
        description: 'PU Unicare is Parul University\'s official maintenance complaint system. Report issues, track progress, and get timely resolutions.',
        keywords: ['campus maintenance', 'complaint system', 'parul university', 'facility management', 'issue tracking'],
        structuredData: generateWebAppSchema()
    },

    registerComplaint: {
        title: 'Register a New Complaint',
        description: 'Submit a maintenance complaint for your campus facility. Quick, easy, and trackable issue reporting.',
        keywords: ['register complaint', 'report issue', 'maintenance request', 'facility problem'],
        structuredData: generateHowToSchema(
            'How to Register a Maintenance Complaint',
            'Step-by-step guide to submit a maintenance issue',
            [
                { name: 'Login', text: 'Log in to your PU Unicare account' },
                { name: 'Fill Details', text: 'Describe the issue with title, category, and location' },
                { name: 'Add Photos', text: 'Upload images of the problem (optional)' },
                { name: 'Submit', text: 'Review and submit your complaint' }
            ]
        )
    },

    track: {
        title: 'Track Your Complaint',
        description: 'Check the status of your maintenance complaint in real-time. Get updates on progress and resolution.',
        keywords: ['track complaint', 'complaint status', 'check progress', 'maintenance update']
    },

    helpCenter: {
        title: 'Help Center',
        description: 'Find answers to common questions about using PU Unicare. Get help with complaints, tracking, and more.',
        keywords: ['help', 'faq', 'support', 'how to', 'guide']
    },

    about: {
        title: 'About PU Unicare',
        description: 'Learn about PU Unicare, the comprehensive maintenance management system for Parul University campus.',
        keywords: ['about', 'unicare', 'parul university', 'maintenance system']
    },

    contact: {
        title: 'Contact Us',
        description: 'Get in touch with the PU Unicare support team. We\'re here to help with your maintenance concerns.',
        keywords: ['contact', 'support', 'help', 'customer service']
    }
};

// ============================================
// Export
// ============================================

export default {
    useSEO,
    generateOrganizationSchema,
    generateWebAppSchema,
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    SEO_PRESETS
};
