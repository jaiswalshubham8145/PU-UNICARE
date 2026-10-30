/**
 * Smart Category Detector Component
 * 
 * Multilingual AI-powered component that extracts category, priority, 
 * location, and title suggestions from mixed English/Hindi/Gujarati speech/text.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, MapPin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    analyzeComplaint,
    getSmartSuggestions,
    type CategorySuggestion,
    type PrioritySuggestion,
} from '@/services/AIService';

interface SmartCategoryDetectorProps {
    description: string;
    onCategorySelect?: (category: string) => void;
    onPrioritySelect?: (priority: string) => void;
    onTitleSuggestion?: (title: string) => void;
    onLocationDetected?: (location: string) => void;
}

export default function SmartCategoryDetector({
    description,
    onCategorySelect,
    onPrioritySelect,
    onTitleSuggestion,
    onLocationDetected,
}: SmartCategoryDetectorProps) {
    const [categories, setCategories] = useState<CategorySuggestion[]>([]);
    const [priority, setPriority] = useState<PrioritySuggestion | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
    const [langHint, setLangHint] = useState<string>('mixed');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        // Debounce the analysis
        const timer = setTimeout(() => {
            if (description.length >= 8) {
                setIsAnalyzing(true);

                // Analyze full dossier across multilingual keywords
                const analysis = analyzeComplaint(description);
                const titleSuggestions = getSmartSuggestions(description);

                setCategories(analysis.categories.slice(0, 3));
                setPriority(analysis.priority);
                setDetectedLocation(analysis.extractedLocation || null);
                setLangHint(analysis.detectedLanguageHint || 'mixed');
                setSuggestions(titleSuggestions);
                setIsAnalyzing(false);
            } else {
                setCategories([]);
                setPriority(null);
                setDetectedLocation(null);
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [description]);

    if (description.length < 8 && categories.length === 0) {
        return null;
    }

    const priorityColors = {
        low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
    };

    const categoryIcons: Record<string, string> = {
        plumbing: '🔧',
        electrical: '⚡',
        carpentry: '🪚',
        cleaning: '🧹',
        hvac: '❄️',
        it_support: '💻',
        civil: '🏗️',
        security: '🔒',
    };

    const langLabels: Record<string, string> = {
        mixed: 'Mixed (En/Hi/Gu)',
        gu: 'ગુજરાતી (Gujarati)',
        hi: 'हिन्दी (Hindi)',
        en: 'English',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
            >
                <Card className="border border-[#E0C88B]/30 bg-gradient-to-r from-[#0B1416]/90 via-[#101F24]/85 to-[#0B1416]/90 backdrop-blur-xl shadow-xl">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#E0C88B]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#E0C88B]">
                                    Multilingual AI Analysis
                                </span>
                                {isAnalyzing && (
                                    <span className="text-[11px] text-slate-400 animate-pulse">Extracting points...</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                                <Globe className="w-3 h-3 text-sky-400" />
                                <span>{langLabels[langHint] || 'Auto-Detected'}</span>
                            </div>
                        </div>

                        {/* Extracted Location Badge */}
                        {detectedLocation && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-emerald-500/30">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-xs text-slate-300">Detected Location:</span>
                                    <span className="text-xs font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-300">
                                        {detectedLocation}
                                    </span>
                                </div>
                                {onLocationDetected && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-[11px] text-[#E0C88B] hover:text-amber-300"
                                        onClick={() => onLocationDetected(detectedLocation)}
                                    >
                                        Apply to Location
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Category Suggestions */}
                        {categories.length > 0 && (
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                                    Detected Category:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat, index) => (
                                        <motion.div
                                            key={cat.category}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 bg-white/5 border-white/15 hover:border-[#E0C88B] hover:bg-[#E0C88B]/10 text-white transition-colors text-xs"
                                                onClick={() => onCategorySelect?.(cat.category)}
                                            >
                                                <span>{categoryIcons[cat.category] || '📋'}</span>
                                                <span className="capitalize">{cat.category.replace('_', ' ')}</span>
                                                <Badge variant="secondary" className="ml-1 text-[10px] bg-black/40 text-[#E0C88B] border-none">
                                                    {cat.confidence}% match
                                                </Badge>
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Priority Suggestion */}
                        {priority && (
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                                    Suggested Urgency / SLA:
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`h-7 gap-1.5 font-bold uppercase text-[11px] ${priorityColors[priority.priority]}`}
                                        onClick={() => onPrioritySelect?.(priority.priority)}
                                    >
                                        {priority.priority === 'critical' || priority.priority === 'high' ? (
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                        ) : (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        <span>{priority.priority}</span>
                                    </Button>
                                    <span className="text-xs text-slate-400 truncate max-w-xs">
                                        {priority.reasons[0]}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Title Suggestions */}
                        {suggestions.length > 0 && (
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3 text-[#E0C88B]" />
                                    One-Tap Title Formulations:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {suggestions.map((suggestion, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[11px] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5"
                                            onClick={() => onTitleSuggestion?.(suggestion)}
                                        >
                                            {suggestion}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
