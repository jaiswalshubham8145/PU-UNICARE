/**
 * AI Service
 * 
 * Intelligent features for the complaint system:
 * - Multilingual Auto-categorization (English, Hindi, Gujarati, Hinglish, Gujlish)
 * - Priority & Urgency detection from multilingual cues
 * - Location, Room & Department entity extraction
 * - Smart Title Generation
 * - Full Complaint Dossier Auto-Extraction
 */

import { matchCampusBuilding } from '@/data/campusBuildings';

// Category keywords mapping across English, Hindi (Devanagari + Romanized), Gujarati (Gujarati script + Romanized)
const categoryKeywords: Record<string, string[]> = {
    plumbing: [
        // English
        'leak', 'water', 'pipe', 'tap', 'faucet', 'drain', 'clog', 'toilet',
        'sink', 'bathroom', 'shower', 'sewer', 'flooding', 'drip', 'valve', 'washroom', 'flush', 'pipeline',
        // Hindi (Devanagari & Romanized Hinglish)
        'पानी', 'नल', 'पाइप', 'शौचालय', 'नाली', 'टपक', 'बह रहा', 'लीक',
        'paani', 'pani', 'nal', 'pipe fut gaya', 'beh raha hai', 'paani tapak raha', 'washroom jam', 'toilet block', 'choke',
        // Gujarati (Script & Romanized Gujlish)
        'પાણી', 'નળ', 'પાઇપ', 'જાજરૂ', 'શૌચાલય', 'ટપકે', 'લીકેજ',
        'paani tapke che', 'nal bandh nathi thato', 'pipe futi gayi', 'washroom block che', 'nal kharab', 'taki overflowing'
    ],
    electrical: [
        // English
        'light', 'power', 'electric', 'socket', 'switch', 'wire', 'bulb',
        'fan', 'heater', 'short circuit', 'fuse', 'voltage', 'current', 'outlet', 'spark', 'tubelight', 'mcb',
        // Hindi (Devanagari & Romanized Hinglish)
        'बिजली', 'पंखा', 'लाइट', 'स्विच', 'तार', 'बल्ब', 'शॉर्ट सर्किट', 'करंट',
        'bijli', 'pankha', 'batti', 'taar', 'chalu nahi ho raha', 'fuse udd gaya', 'spark ho raha', 'bijli chali gayi', 'mcb down',
        // Gujarati (Script & Romanized Gujlish)
        'વીજળી', 'પંખો', 'લાઈટ', 'સ્વિચ', 'તાર', 'બળેલું', 'સ્પાર્ક',
        'pankho', 'chalu nathi thato', 'light nathi', 'taar', 'spark thay che', 'current aave che', 'dhuwado nikle che', 'power nathi'
    ],
    carpentry: [
        // English
        'door', 'window', 'furniture', 'desk', 'chair', 'table', 'cabinet',
        'drawer', 'wood', 'broken', 'hinge', 'lock', 'handle', 'shelf', 'bench', 'podium', 'cupboard',
        // Hindi (Devanagari & Romanized Hinglish)
        'दरवाजा', 'खिड़की', 'ताला', 'कुर्सी', 'मेज', 'फर्नीचर', 'टूटा',
        'darwaza', 'khidki', 'taala', 'kursi', 'table tooti', 'handle toota', 'lakdi', 'hinge loose', 'bench toota',
        // Gujarati (Script & Romanized Gujlish)
        'બારણું', 'બારી', 'તાળું', 'ખુરશી', 'ટેબલ', 'લાકડું', 'તૂટેલું',
        'baarnu', 'baari', 'taalu', 'tuti gayu che', 'khursi', 'bench hale che', 'handle tuti gayu', 'darwajo bandh nathi thato'
    ],
    cleaning: [
        // English
        'clean', 'dirty', 'dust', 'garbage', 'trash', 'sweep', 'mop',
        'wash', 'stain', 'smell', 'odor', 'pest', 'insect', 'rat', 'cockroach', 'hygiene', 'bin',
        // Hindi (Devanagari & Romanized Hinglish)
        'सफाई', 'कचरा', 'गंदगी', 'बदबू', 'धूल', 'झाड़ू', 'कीड़ा', 'गंदा',
        'safai', 'kachra', 'gandagi', 'badbu', 'keeda', 'ganda', 'jhadu', 'safai nahi hui', 'saaf karo',
        // Gujarati (Script & Romanized Gujlish)
        'સફાઈ', 'કચરો', 'ગંદકી', 'વાસ', 'ધૂળ', 'જીવડાં', 'ગંદુ',
        'saaf nathi', 'kachro', 'gandagi', 'vaas aave che', 'jhadu nathi maryu', 'dhuvaad', 'gandu che'
    ],
    hvac: [
        // English
        'ac', 'air conditioner', 'cooling', 'heating', 'ventilation',
        'temperature', 'hot', 'cold', 'humid', 'vent', 'thermostat', 'compressor',
        // Hindi (Devanagari & Romanized Hinglish)
        'एसी', 'ठंडा', 'कूलिंग', 'गर्मी', 'हवा',
        'ac kharab hai', 'cooling nahi ho rahi', 'thanda nahi kar raha', 'garmi lag rahi', 'ac aawaz kar raha', 'ac band pad gaya',
        // Gujarati (Script & Romanized Gujlish)
        'એસી', 'ઠંડક', 'ગરમી', 'કૂલિંગ',
        'ac bandh che', 'thandu nathi thatu', 'cooling nathi aavti', 'garmi lage che', 'ac aavaj aave che', 'gas patyo'
    ],
    it_support: [
        // English
        'computer', 'internet', 'wifi', 'network', 'printer', 'projector',
        'software', 'login', 'password', 'email', 'server', 'lan', 'cable', 'hdmi', 'display', 'screen',
        // Hindi (Devanagari & Romanized Hinglish)
        'कंप्यूटर', 'इंटरनेट', 'वाईफाई', 'प्रोजेक्टर', 'प्रिंटर',
        'projector nahi chal raha', 'net band hai', 'display nahi aa raha', 'computer band hai', 'wifi connect nahi ho raha',
        // Gujarati (Script & Romanized Gujlish)
        'કોમ્પ્યુટર', 'ઈન્ટરનેટ', 'વાઈફાઈ', 'પ્રોજેક્ટર',
        'projector nathi chaltu', 'net nathi aavtu', 'display bandh che', 'wifi nathi pakadtu', 'screen kaali aave che'
    ],
    civil: [
        // English
        'wall', 'ceiling', 'floor', 'tile', 'crack', 'paint', 'plaster',
        'roof', 'leakage', 'construction', 'repair', 'damage', 'seepage', 'cement', 'glass',
        // Hindi (Devanagari & Romanized Hinglish)
        'दीवार', 'छत', 'फर्श', 'दरार', 'प्लास्टर', 'रंग',
        'deewar', 'chhat', 'plaster gir raha hai', 'tile tooti', 'darar aa gayi', 'chhat se paani tapak raha',
        // Gujarati (Script & Romanized Gujlish)
        'દીવાલ', 'છત', 'લાદી', 'તિરાડ', 'પ્લાસ્ટર',
        'deewal', 'chhaat', 'plaster pade che', 'tile tuti gayi', 'tirad padi che', 'chhat tapke che'
    ],
    security: [
        // English
        'cctv', 'camera', 'lock', 'key', 'theft', 'stolen', 'security',
        'access', 'gate', 'door', 'alarm', 'guard', 'trespass', 'unauthorized',
        // Hindi (Devanagari & Romanized Hinglish)
        'सीसीटीवी', 'कैमरा', 'चोरी', 'सुरक्षा', 'गार्ड', 'चाबी',
        'chori ho gayi', 'cctv band hai', 'gate lock nahi ho raha', 'guard nahi hai', 'chaabi kho gayi',
        // Gujarati (Script & Romanized Gujlish)
        'સીસીટીવી', 'કેમેરા', 'ચોરી', 'સુરક્ષા', 'ચાવી',
        'chori thai che', 'cctv nathi chaltu', 'chaavi nathi malti', 'gate khullo che', 'suraksha'
    ],
};

// Priority keywords mapping with Multilingual Urgency Signals
const priorityKeywords: Record<string, { keywords: string[]; weight: number }> = {
    critical: {
        keywords: [
            // English
            'emergency', 'urgent', 'fire', 'flood', 'danger', 'hazard', 'safety',
            'injury', 'accident', 'immediately', 'asap', 'critical', 'life threatening', 'sparking', 'smoke',
            // Hindi & Hinglish
            'आपातकालीन', 'आग', 'खतरा', 'तुरंत', 'धुआं', 'जल्दी',
            'aag', 'dhuvaan', 'jaldi', 'khatra', 'turant', 'short circuit', 'current lag gaya', 'fauran', 'blast', 'emergency che',
            // Gujarati & Gujlish
            'તાત્કાલિક', 'આગ', 'જોખમ', 'તાબડતોબ', 'ધૂમાડો',
            'dhuwado', 'dhuvaan aave che', 'aag laagi', 'jaldi karo', 'tatkal', 'dhoko che', 'emergency che', 'current lage che'
        ],
        weight: 100,
    },
    high: {
        keywords: [
            // English
            'not working', 'broken', 'failed', 'major', 'important', 'quickly',
            'soon', 'affecting many', 'class cancelled', 'exam', 'lecture', 'overflowing',
            // Hindi & Hinglish
            'काम नहीं कर रहा', 'टूटा हुआ', 'जल्दी करो', 'परीक्षा', 'क्लास',
            'chalu nahi hai', 'kharab ho gaya', 'kaam ruk gaya', 'exam chal raha hai', 'sirf paani hi paani', 'jaldi aao',
            // Gujarati & Gujlish
            'નથી ચાલતું', 'બગડી ગયું', 'પરીક્ષા',
            'nathi chaltu', 'tuti gayu che', 'bagdi gayu', 'jaldi thi', 'exam che', 'lecture atkyo', 'ghana loko'
        ],
        weight: 75,
    },
    medium: {
        keywords: [
            // English
            'issue', 'problem', 'need', 'require', 'please fix', 'maintenance',
            'repair needed', 'not functioning', 'malfunction', 'slow',
            // Hindi & Hinglish
            'समस्या', 'दिक्कत', 'मरम्मत', 'ठीक करो',
            'dikkat hai', 'problem hai', 'theek kar do', 'maintenance chahiye', 'aawaz kar raha hai',
            // Gujarati & Gujlish
            'સમસ્યા', 'તકલીફ', 'રિપેર',
            'takleef che', 'problem che', 'repair karvano che', 'aavaj aave che', 'dheemu chale che'
        ],
        weight: 50,
    },
    low: {
        keywords: [
            // English
            'minor', 'small', 'cosmetic', 'improvement', 'suggestion', 'would be nice',
            'whenever possible', 'no rush', 'convenience',
            // Hindi & Hinglish
            'छोटा', 'सुझाव', 'आराम से', 'जब हो सके',
            'chota issue', 'koi jaldi nahi hai', 'dekh lena', 'jab time mile',
            // Gujarati & Gujlish
            'નાનું', 'જ્યારે સમય મળે',
            'nani vaat che', 'koi jaldi nathi', 'jyare time male tyare'
        ],
        weight: 25,
    },
};

// Location keywords for smart detection
const locationKeywords: Record<string, string[]> = {
    classroom: ['class', 'room', 'lecture hall', 'lab', 'laboratory', 'ક્લાસ', 'રૂમ', 'લેબ', 'कमरा', 'कक्षा'],
    office: ['office', 'cabin', 'chamber', 'department', 'ઓફિસ', 'કેબિન', 'દફતર', 'कार्यालय'],
    restroom: ['toilet', 'bathroom', 'washroom', 'restroom', 'lavatory', 'વોશરૂમ', 'શૌચાલય', 'शौचालय'],
    corridor: ['corridor', 'hallway', 'passage', 'lobby', 'entrance', 'લોબી', 'ગેલરી', 'गैलरी'],
    canteen: ['canteen', 'cafeteria', 'mess', 'food court', 'કેન્ટીન', 'કેફે', 'कैंटीन'],
    library: ['library', 'reading room', 'study hall', 'લાઈબ્રેરી', 'પુસ્તકાલય', 'लाइब्रेरी'],
    auditorium: ['auditorium', 'seminar hall', 'conference room', 'ઓડિટોરિયમ', 'હોલ', 'ऑडिटोरियम'],
    ground: ['ground', 'playground', 'sports', 'field', 'parking', 'ગ્રાઉન્ડ', 'મેદાન', 'पार्किंग'],
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
    extractedLocation?: string;
    suggestedTitle?: string;
    detectedLanguageHint?: 'en' | 'hi' | 'gu' | 'mixed';
}

/**
 * Detect language hint based on script characters and common words
 */
export function detectLanguageHint(text: string): 'en' | 'hi' | 'gu' | 'mixed' {
    const hasGujarati = /[\u0A80-\u0AFF]/.test(text) || /\b(che|nathi|chaltu|aave|tuti|ma|pase|karo|bahu|pani|aavaj)\b/i.test(text);
    const hasHindi = /[\u0900-\u097F]/.test(text) || /\b(hai|nahi|raha|hoga|khatra|jaldi|paani|kharab|deewar|karein)\b/i.test(text);
    const hasEnglish = /\b(the|is|in|room|fan|light|water|ac|broken|problem|floor|block|hall)\b/i.test(text);

    const matchCount = [hasGujarati, hasHindi, hasEnglish].filter(Boolean).length;
    if (matchCount > 1) return 'mixed';
    if (hasGujarati) return 'gu';
    if (hasHindi) return 'hi';
    return 'en';
}

/**
 * Extract physical room/location entities from speech (e.g. "Room 302", "CS Lab 2", "2nd Floor", "Mechanical Wing")
 */
export function extractSpecificLocation(text: string): string | null {
    // Patterns for Room, Lab, Floor, Wing, Block in English, Hindi & Gujarati
    const patterns = [
        /(?:room|rm|class|cabin|lab|no\.?)\s*(?:number|no|મા|મેં)?\s*([a-z0-9-]+)/i,
        /([a-z0-9-]+)\s*(?:room|lab|class)/i,
        /(?:floor|લેવલ|माले|તળિયે)\s*([0-9a-z]+)/i,
        /([0-9]+(?:st|nd|rd|th)?\s*floor)/i,
        /(?:block|wing|building|ડિપાર્ટમેન્ટ|विभाग)\s*([a-z0-9-]+)/i,
        /\b(?:ground floor|first floor|second floor|third floor|canteen|library|auditorium|workshop|reception)\b/i
    ];

    for (const pat of patterns) {
        const match = text.match(pat);
        if (match) {
            return match[0].trim();
        }
    }
    return null;
}

/**
 * Analyze complaint text and suggest category across multiple languages
 */
export function detectCategory(text: string): CategorySuggestion[] {
    const lowerText = text.toLowerCase();
    const results: CategorySuggestion[] = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const matchedKeywords = keywords.filter(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
            const confidence = Math.min(matchedKeywords.length / 2, 1); // 100% confidence with 2+ keyword matches
            results.push({
                category,
                confidence: Math.round(confidence * 100),
                matchedKeywords,
            });
        }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Detect priority level from multilingual text
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

    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (totalScore >= 100) priority = 'critical';
    else if (totalScore >= 65) priority = 'high';
    else if (totalScore >= 35) priority = 'medium';
    else priority = 'low';

    if (reasons.length === 0) {
        reasons.push('Standard maintenance request detected');
    }

    return {
        priority,
        score: Math.min(totalScore, 100),
        reasons,
    };
}

/**
 * Detect general location category
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
                confidence: 85,
            });
        }
    }

    return results;
}

/**
 * Generate standardized and descriptive ticket title
 */
export function generateTitle(description: string, category?: string, location?: string): string {
    const specificLoc = location || extractSpecificLocation(description);
    const cat = category || (detectCategory(description)[0]?.category);
    
    // Human readable category mapping
    const catNames: Record<string, string> = {
        electrical: "Electrical / Power Issue",
        plumbing: "Water / Plumbing Leakage",
        hvac: "AC / Climate Malfunction",
        carpentry: "Furniture / Door Repair",
        cleaning: "Sanitation / Cleaning Required",
        it_support: "IT / Projector Malfunction",
        civil: "Infrastructure / Civil Damage",
        security: "Security / Access Issue"
    };

    const categoryTitle = cat ? (catNames[cat] || cat.toUpperCase()) : "Maintenance Issue";

    if (specificLoc) {
        return `${specificLoc}: ${categoryTitle}`;
    }

    const words = description.trim().split(/\s+/);
    if (words.length <= 6) {
        return description.trim();
    }

    return `${categoryTitle} - ${words.slice(0, 5).join(' ')}...`;
}

/**
 * Full AI analysis of complaint text extracting all key data points
 */
export function analyzeComplaint(text: string): AIAnalysisResult {
    const categories = detectCategory(text);
    const priority = detectPriority(text);
    const locations = detectLocation(text);
    const extractedLocation = extractSpecificLocation(text) || undefined;
    const suggestedTitle = generateTitle(text, categories[0]?.category, extractedLocation);
    const detectedLanguageHint = detectLanguageHint(text);

    return {
        categories,
        priority,
        locations,
        extractedLocation,
        suggestedTitle,
        detectedLanguageHint,
    };
}

/**
 * Common partial suggestions
 */
export function getSmartSuggestions(partialText: string): string[] {
    const suggestions: string[] = [];
    const lowerText = partialText.toLowerCase();

    const patterns = [
        { trigger: 'pankho', suggestion: 'Ceiling fan not working / making loud noise' },
        { trigger: 'light', suggestion: 'Tubelight or bulb flickering/not turning on' },
        { trigger: 'paani', suggestion: 'Water leakage or washroom tap dripping' },
        { trigger: 'ac', suggestion: 'Air Conditioner not cooling properly in room' },
        { trigger: 'toilet', suggestion: 'Toilet flush broken or pipeline clogged' },
        { trigger: 'darwaza', suggestion: 'Door lock or handle broken' },
        { trigger: 'wifi', suggestion: 'WiFi / LAN network not connecting' },
        { trigger: 'projector', suggestion: 'Classroom projector display not working' },
        { trigger: 'safai', suggestion: 'Classroom or laboratory requires thorough cleaning' },
        { trigger: 'khursi', suggestion: 'Damaged desk or broken student chair' },
    ];

    for (const pattern of patterns) {
        if (lowerText.includes(pattern.trigger)) {
            suggestions.push(pattern.suggestion);
        }
    }

    return suggestions;
}

export interface ExtractedComplaintPayload {
    departmentId?: string;
    departmentName?: string;
    buildingId?: string;
    buildingName?: string;
    categoryId?: string;
    categoryName?: string;
    location?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    missingFields: ('department' | 'building' | 'category' | 'location')[];
    isComplete: boolean;
    detectedLanguage: 'en' | 'hi' | 'gu' | 'mixed';
}

/**
 * Intelligent Multi-Entity Matcher & Dossier Builder for Automated Filing
 */
export function extractComplaintPayload(
    rawText: string,
    departments?: { id: string; name: string }[] | null,
    buildings?: { id: string; name: string }[] | null,
    categories?: { id: string; name: string }[] | null,
    currentPayload?: Partial<ExtractedComplaintPayload>
): ExtractedComplaintPayload {
    const textLower = rawText.toLowerCase();

    // 1. Category Matching
    let categoryId = currentPayload?.categoryId;
    let categoryName = currentPayload?.categoryName;
    const catSuggestions = detectCategory(rawText);
    if (!categoryId && catSuggestions.length > 0 && categories) {
        const topCat = catSuggestions[0].category;
        const matchedCat = categories.find(c => 
            c.name.toLowerCase().includes(topCat.replace('_', ' ')) ||
            topCat.includes(c.name.toLowerCase().replace(' ', '_'))
        );
        if (matchedCat) {
            categoryId = matchedCat.id;
            categoryName = matchedCat.name;
        }
    }

    // 2. Department Matching
    let departmentId = currentPayload?.departmentId;
    let departmentName = currentPayload?.departmentName;
    if (!departmentId && departments) {
        // Look for department mentions like "civil", "mechanical", "computer", "electrical", "it", "applied", "pharmacy"
        for (const dept of departments) {
            const deptLower = dept.name.toLowerCase();
            const words = deptLower.split(/\s+/).filter(w => w.length > 2 && !['department', 'of', 'engineering', 'science', 'and'].includes(w));
            const hasMatch = words.some(w => textLower.includes(w));
            if (hasMatch) {
                departmentId = dept.id;
                departmentName = dept.name;
                break;
            }
        }
    }

    // 3. Building Matching with Parul University campus map awareness
    let buildingId = currentPayload?.buildingId;
    let buildingName = currentPayload?.buildingName;
    if (!buildingId && buildings) {
        // Try specialized Parul University campus building matcher first (detects A1, A23, PIET, Kalam Bhawan, Central Food Court, Mummy n Yummy, etc.)
        const campusMatch = matchCampusBuilding(rawText);
        if (campusMatch) {
            const matchedInList = buildings.find(b => 
                b.name.toLowerCase().includes(campusMatch.code.toLowerCase()) ||
                b.name.toLowerCase().includes(campusMatch.shortName.toLowerCase()) ||
                b.id === campusMatch.id
            );
            if (matchedInList) {
                buildingId = matchedInList.id;
                buildingName = matchedInList.name;
            }
        }

        // Fallback to substring matching across buildings list
        if (!buildingId) {
            for (const bld of buildings) {
                const bldLower = bld.name.toLowerCase();
                const words = bldLower.split(/\s+/).filter(w => w.length > 2 && !['block', 'building', 'wing', 'institute', 'facilities', 'centre'].includes(w));
                const hasMatch = words.some(w => textLower.includes(w)) || textLower.includes(bldLower);
                if (hasMatch) {
                    buildingId = bld.id;
                    buildingName = bld.name;
                    break;
                }
            }
        }
    }

    // 4. Location / Room Extraction
    let location = currentPayload?.location;
    const extractedLoc = extractSpecificLocation(rawText);
    if (extractedLoc) {
        location = extractedLoc;
    }

    // 5. Priority Detection
    const prioritySuggestion = detectPriority(rawText);
    const priority = currentPayload?.priority || prioritySuggestion.priority;

    // 6. Title Generation
    const title = currentPayload?.title || generateTitle(rawText, catSuggestions[0]?.category, location);

    // 7. Check for Missing Required Fields
    const missingFields: ('department' | 'building' | 'category' | 'location')[] = [];
    if (!departmentId) missingFields.push('department');
    if (!buildingId) missingFields.push('building');
    if (!categoryId) missingFields.push('category');
    if (!location) missingFields.push('location');

    return {
        departmentId,
        departmentName,
        buildingId,
        buildingName,
        categoryId,
        categoryName,
        location,
        priority,
        title,
        description: rawText.trim(),
        missingFields,
        isComplete: missingFields.length === 0,
        detectedLanguage: detectLanguageHint(rawText),
    };
}

export default {
    detectCategory,
    detectPriority,
    detectLocation,
    extractSpecificLocation,
    detectLanguageHint,
    generateTitle,
    analyzeComplaint,
    getSmartSuggestions,
    extractComplaintPayload,
};

