import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, Wrench, Wifi, SprayCan, BookOpen, ThumbsUp, ThumbsDown, Loader2, type LucideIcon } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["knowledge_categories"]["Row"];
type Article = Database["public"]["Tables"]["knowledge_articles"]["Row"];

const iconMap: Record<string, LucideIcon> = {
    HelpCircle,
    Wrench,
    Wifi,
    SprayCan,
    BookOpen
};

const KnowledgeBase = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

    // Fetch Categories
    const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
        queryKey: ["kb-categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("knowledge_categories")
                .select("*")
                .order("display_order");

            if (error) throw error;
            return data;
        }
    });

    // Fetch Articles
    const { data: articles, isLoading: loadingArticles } = useQuery<Article[]>({
        queryKey: ["kb-articles", selectedCategory, searchQuery],
        queryFn: async () => {
            let query = supabase
                .from("knowledge_articles")
                .select("*")
                .eq("is_published", true)
                .order("helpful_count", { ascending: false });

            if (selectedCategory) {
                query = query.eq("category_id", selectedCategory);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Client-side search (for simplicity with small dataset)
            if (searchQuery) {
                return data.filter(article =>
                    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    article.content.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            return data;
        }
    });

    const handleFeedback = async (articleId: string, helpful: boolean) => {
        if (feedbackGiven[articleId]) return;

        // Optimistic UI update
        setFeedbackGiven(prev => ({ ...prev, [articleId]: true }));

        // In a real app, you'd call an RPC function to increment atomically
        // For now, we'll just acknowledge the interaction
    };

    return (
        <div className="min-h-screen transparency-medium noise-texture relative z-10">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">

                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-4">
                            How can we help you?
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Find answers to common questions about facility management, maintenance requests, and campus services.
                        </p>

                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for answers..."
                                className="pl-12 h-14 rounded-full bg-background/50 border-amber-500/30 focus-visible:ring-amber-500 text-lg shadow-lg hover:shadow-amber-500/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Categories Grid */}
                    {!searchQuery && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <Card
                                className={`p-6 cursor-pointer hover:border-amber-500/50 transition-all text-center group ${selectedCategory === null ? 'border-amber-500 bg-amber-500/10' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="font-semibold">All Topics</h3>
                            </Card>

                            {categories?.map((category) => {
                                const Icon = iconMap[category.icon || "HelpCircle"] || HelpCircle;
                                return (
                                    <Card
                                        key={category.id}
                                        className={`p-6 cursor-pointer hover:border-amber-500/50 transition-all text-center group ${selectedCategory === category.id ? 'border-amber-500 bg-amber-500/10' : ''}`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6 text-foreground" />
                                        </div>
                                        <h3 className="font-semibold">{category.name}</h3>
                                    </Card>
                                );
                            })}

                            {loadingCategories && Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="p-6 opacity-50">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3 animate-pulse" />
                                    <div className="h-4 w-24 bg-slate-200 rounded mx-auto animate-pulse" />
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Articles Section */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {searchQuery ? "Search Results" : "Frequently Asked Questions"}

                        </h2>

                        {loadingArticles ? (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="border border-border/50 rounded-xl p-5 bg-card/30 space-y-2.5">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : articles && articles.length > 0 ? (
                            <Accordion type="single" collapsible className="space-y-4">
                                {articles.map((article) => (
                                    <AccordionItem
                                        key={article.id}
                                        value={article.id}
                                        className="border border-border/50 rounded-lg px-4 bg-card/30 [&[data-state=open]]:border-amber-500/50 [&[data-state=open]]:bg-card/80"
                                    >
                                        <AccordionTrigger className="hover:text-amber-500 text-left font-medium text-lg py-4">
                                            {article.title}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                                            <div className="prose dark:prose-invert max-w-none text-sm">
                                                {article.content}
                                            </div>

                                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30">
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span className="bg-secondary px-2 py-1 rounded">
                                                        {categories?.find(c => c.id === article.category_id)?.name || "General"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground mr-2">Was this helpful?</span>
                                                    <Button
                                                        variant={feedbackGiven[article.id] ? "secondary" : "ghost"}
                                                        size="sm"
                                                        className="h-8 w-8 rounded-full p-0"
                                                        onClick={() => handleFeedback(article.id, true)}
                                                        disabled={!!feedbackGiven[article.id]}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-full p-0"
                                                        onClick={() => handleFeedback(article.id, false)}
                                                        disabled={!!feedbackGiven[article.id]}
                                                    >
                                                        <ThumbsDown className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-12">
                                <HelpCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">No articles found</h3>
                                <p className="text-sm text-muted-foreground/50">Try searching for something else or browse categories.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default KnowledgeBase;
