/**
 * AI Service
 * 
 * Intelligent features for the complaint system:
 * - Auto-categorization from description
 * - Priority detection from keywords
 * - Smart suggestions
 */

// Category keywords mapping
const categoryKeywords: Record<string, string[]> = {
    plumbing: [
        'leak', 'water', 'pipe', 'tap', 'faucet', 'drain', 'clog', 'toilet',
        'sink', 'bathroom', 'shower', 'sewer', 'flooding', 'drip', 'valve'
    ],
    electrical: [
        'light', 'power', 'electric', 'socket', 'switch', 'wire', 'bulb',
        'fan', 'ac', 'air conditioner', 'heater', 'short circuit', 'fuse',
        'voltage', 'current', 'outlet', 'spark'
    ],
    carpentry: [
        'door', 'window', 'furniture', 'desk', 'chair', 'table', 'cabinet',
        'drawer', 'wood', 'broken', 'hinge', 'lock', 'handle', 'shelf'
    ],
    cleaning: [
        'clean', 'dirty', 'dust', 'garbage', 'trash', 'sweep', 'mop',
        'wash', 'stain', 'smell', 'odor', 'pest', 'insect', 'rat', 'cockroach'
    ],
    hvac: [
        'ac', 'air conditioning', 'cooling', 'heating', 'ventilation',
        'temperature', 'hot', 'cold', 'humid', 'vent', 'thermostat'
    ],
    it_support: [
        'computer', 'internet', 'wifi', 'network', 'printer', 'projector',
        'software', 'login', 'password', 'email', 'server', 'lan', 'cable'
    ],
    civil: [
        'wall', 'ceiling', 'floor', 'tile', 'crack', 'paint', 'plaster',
        'roof', 'leakage', 'construction', 'repair', 'damage', 'broken'
    ],
    security: [
        'cctv', 'camera', 'lock', 'key', 'theft', 'stolen', 'security',
        'access', 'gate', 'door', 'alarm', 'guard'
    ],
};

// Priority keywords mapping
const priorityKeywords: Record<string, { keywords: string[]; weight: number }> = {
    critical: {
        keywords: [
            'emergency', 'urgent', 'fire', 'flood', 'danger', 'hazard', 'safety',
            'injury', 'accident', 'immediately', 'asap', 'critical', 'life threatening'
        ],
        weight: 100,
    },
    high: {
        keywords: [
            'not working', 'broken', 'failed', 'major', 'important', 'quickly',
            'soon', 'affecting many', 'class cancelled', 'exam', 'lecture'
        ],
        weight: 75,
    },
    medium: {
        keywords: [
            'issue', 'problem', 'need', 'require', 'please fix', 'maintenance',
            'repair needed', 'not functioning', 'malfunction'
        ],
        weight: 50,
    },
    low: {
        keywords: [
            'minor', 'small', 'cosmetic', 'improvement', 'suggestion', 'would be nice',
            'whenever possible', 'no rush', 'convenience'
        ],
        weight: 25,
    },
};

// Location keywords for smart detection
const locationKeywords: Record<string, string[]> = {
    classroom: ['class', 'room', 'lecture hall', 'lab', 'laboratory'],
    office: ['office', 'cabin', 'chamber', 'department'],
    restroom: ['toilet', 'bathroom', 'washroom', 'restroom', 'lavatory'],
    corridor: ['corridor', 'hallway', 'passage', 'lobby', 'entrance'],
    canteen: ['canteen', 'cafeteria', 'mess', 'food court'],
    library: ['library', 'reading room', 'study hall'],
    auditorium: ['auditorium', 'seminar hall', 'conference room'],
    ground: ['ground', 'playground', 'sports', 'field', 'parking'],
};

export interface CategorySuggestion {
    category: string;
    confidence: number;
    matchedKeywords: string[];
}

export interface PrioritySuggestion {
    priority: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    reasons: string[];
}

export interface LocationSuggestion {
    type: string;
    confidence: number;
}

export interface AIAnalysisResult {
    categories: CategorySuggestion[];
    priority: PrioritySuggestion;
    locations: LocationSuggestion[];
    suggestedTitle?: string;
}

/**
 * Analyze complaint text and suggest category
 */
export function detectCategory(text: string): CategorySuggestion[] {
    const lowerText = text.toLowerCase();
    const results: CategorySuggestion[] = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const matchedKeywords = keywords.filter(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
            const confidence = Math.min(matchedKeywords.length / 3, 1); // Max 100% at 3+ matches
            results.push({
                category,
                confidence: Math.round(confidence * 100),
                matchedKeywords,
            });
        }
    }

    // Sort by confidence descending
    return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Detect priority level from text
 */
export function detectPriority(text: string): PrioritySuggestion {
    const lowerText = text.toLowerCase();
    let totalScore = 0;
    const reasons: string[] = [];

    for (const [priority, config] of Object.entries(priorityKeywords)) {
        const matchedKeywords = config.keywords.filter(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
            totalScore += config.weight * matchedKeywords.length;
            reasons.push(`Contains "${matchedKeywords[0]}" indicating ${priority} priority`);
        }
    }

    // Determine final priority based on score
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (totalScore >= 200) priority = 'critical';
    else if (totalScore >= 100) priority = 'high';
    else if (totalScore >= 50) priority = 'medium';
    else priority = 'low';

    // Add default reason if none found
    if (reasons.length === 0) {
        reasons.push('No urgent keywords detected, defaulting to medium priority');
    }

    return {
        priority,
        score: Math.min(totalScore, 100),
        reasons,
    };
}

/**
 * Detect location type from text
 */
export function detectLocation(text: string): LocationSuggestion[] {
    const lowerText = text.toLowerCase();
    const results: LocationSuggestion[] = [];

    for (const [locationType, keywords] of Object.entries(locationKeywords)) {
        const matched = keywords.some(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );

        if (matched) {
            results.push({
                type: locationType,
                confidence: 80, // High confidence if keyword found
            });
        }
    }

    return results;
}

/**
 * Generate suggested title from description
 */
export function generateTitle(description: string): string {
    const words = description.trim().split(/\s+/);

    if (words.length <= 8) {
        return description.trim();
    }

    // Take first 6-8 meaningful words
    const titleWords = words.slice(0, 8);
    return titleWords.join(' ') + '...';
}

/**
 * Full AI analysis of complaint text
 */
export function analyzeComplaint(text: string): AIAnalysisResult {
    return {
        categories: detectCategory(text),
        priority: detectPriority(text),
        locations: detectLocation(text),
        suggestedTitle: generateTitle(text),
    };
}

/**
 * Get smart suggestions based on partial input
 */
export function getSmartSuggestions(partialText: string): string[] {
    const suggestions: string[] = [];
    const lowerText = partialText.toLowerCase();

    // Common complaint patterns
    const patterns = [
        { trigger: 'light', suggestion: 'Light not working in room' },
        { trigger: 'water', suggestion: 'Water leakage from pipe' },
        { trigger: 'ac', suggestion: 'AC not cooling properly' },
        { trigger: 'toilet', suggestion: 'Toilet not flushing' },
        { trigger: 'door', suggestion: 'Door lock broken' },
        { trigger: 'wifi', suggestion: 'WiFi not working' },
        { trigger: 'fan', suggestion: 'Ceiling fan not working' },
        { trigger: 'clean', suggestion: 'Room needs cleaning' },
        { trigger: 'chair', suggestion: 'Chair broken/damaged' },
        { trigger: 'window', suggestion: 'Window glass broken' },
    ];

    for (const pattern of patterns) {
        if (lowerText.includes(pattern.trigger)) {
            suggestions.push(pattern.suggestion);
        }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
}

export default {
    detectCategory,
    detectPriority,
    detectLocation,
    generateTitle,
    analyzeComplaint,
    getSmartSuggestions,
};
