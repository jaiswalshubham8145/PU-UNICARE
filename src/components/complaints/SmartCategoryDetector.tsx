/**
 * Smart Category Detector Component
 * 
 * AI-powered component that suggests categories and priority
 * based on the complaint description.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    detectCategory,
    detectPriority,
    getSmartSuggestions,
    type CategorySuggestion,
    type PrioritySuggestion,
} from '@/services/AIService';

interface SmartCategoryDetectorProps {
    description: string;
    onCategorySelect?: (category: string) => void;
    onPrioritySelect?: (priority: string) => void;
    onTitleSuggestion?: (title: string) => void;
}

export default function SmartCategoryDetector({
    description,
    onCategorySelect,
    onPrioritySelect,
    onTitleSuggestion,
}: SmartCategoryDetectorProps) {
    const [categories, setCategories] = useState<CategorySuggestion[]>([]);
    const [priority, setPriority] = useState<PrioritySuggestion | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        // Debounce the analysis
        const timer = setTimeout(() => {
            if (description.length >= 10) {
                setIsAnalyzing(true);

                // Simulate slight delay for AI processing feel
                setTimeout(() => {
                    const detectedCategories = detectCategory(description);
                    const detectedPriority = detectPriority(description);
                    const titleSuggestions = getSmartSuggestions(description);

                    setCategories(detectedCategories.slice(0, 3));
                    setPriority(detectedPriority);
                    setSuggestions(titleSuggestions);
                    setIsAnalyzing(false);
                }, 300);
            } else {
                setCategories([]);
                setPriority(null);
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [description]);

    if (description.length < 10 && categories.length === 0) {
        return null;
    }

    const priorityColors = {
        low: 'bg-green-100 text-green-700 border-green-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        high: 'bg-orange-100 text-orange-700 border-orange-200',
        critical: 'bg-red-100 text-red-700 border-red-200',
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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
            >
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
                            {isAnalyzing && (
                                <span className="text-xs text-gray-400 animate-pulse">Analyzing...</span>
                            )}
                        </div>

                        {/* Category Suggestions */}
                        {categories.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Detected Categories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat, index) => (
                                        <motion.div
                                            key={cat.category}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 hover:bg-primary hover:text-white transition-colors"
                                                onClick={() => onCategorySelect?.(cat.category)}
                                            >
                                                <span>{categoryIcons[cat.category] || '📋'}</span>
                                                <span className="capitalize">{cat.category.replace('_', ' ')}</span>
                                                <Badge variant="secondary" className="ml-1 text-xs">
                                                    {cat.confidence}%
                                                </Badge>
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Priority Suggestion */}
                        {priority && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Suggested Priority:</p>
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 gap-1.5 ${priorityColors[priority.priority]}`}
                                        onClick={() => onPrioritySelect?.(priority.priority)}
                                    >
                                        {priority.priority === 'critical' || priority.priority === 'high' ? (
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                        ) : (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        <span className="capitalize">{priority.priority}</span>
                                    </Button>
                                    <span className="text-xs text-gray-500">
                                        {priority.reasons[0]}
                                    </span>
                                </motion.div>
                            </div>
                        )}

                        {/* Title Suggestions */}
                        {suggestions.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    Quick Suggestions:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs bg-gray-100 hover:bg-gray-200"
                                                onClick={() => onTitleSuggestion?.(suggestion)}
                                            >
                                                {suggestion}
                                            </Button>
                                        </motion.div>
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
