import { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
    MessageSquare,
    X,
    Send,
    Minimize2,
    Bot,
    User,
    Loader2,
    Sparkles,
    LogIn,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const ChatWidget = () => {
    const { user } = useAuth();
    const {
        isOpen,
        setIsOpen,
        messages,
        sendMessage,
        isTyping,
        hasActiveChat,
        startNewChat
    } = useChatbot(user?.id);

    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Listen for custom event from site tour or navbar
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener("unicare:open-ai-chat", handleOpenChat);
        return () => window.removeEventListener("unicare:open-ai-chat", handleOpenChat);
    }, [setIsOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[360px] sm:w-[440px]"
                    >
                        <Card className="flex flex-col h-[520px] shadow-2xl border-amber-500/30 bg-background/98 backdrop-blur-xl overflow-hidden flex-1">
                            {/* Header */}
                            <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 flex items-center justify-between text-white shrink-0 shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm tracking-tight">UNICARE Assistant</h3>
                                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                                                {user ? "PU Account" : "Guest Mode"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-amber-100 flex items-center gap-1 font-medium">
                                            <Sparkles className="w-3 h-3 text-amber-200" />
                                            24/7 AI Campus Support
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-white hover:bg-white/20"
                                        onClick={() => startNewChat()}
                                        title="Clear and restart chat"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-white hover:bg-white/20"
                                        onClick={() => setIsOpen(false)}
                                        aria-label="Minimize Chat"
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Guest Notice Banner */}
                            {!user && (
                                <div className="px-3.5 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                                    <span>Browsing in Guest Mode</span>
                                    <Link to="/login" className="flex items-center gap-1 underline hover:text-white font-semibold">
                                        <LogIn className="w-3 h-3" />
                                        Log In
                                    </Link>
                                </div>
                            )}

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/60">
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex gap-3 max-w-[88%]",
                                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-amber-500 border-amber-600 text-white"
                                                    : "bg-white dark:bg-slate-800 border-amber-400/30 text-amber-500"
                                            )}>
                                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed whitespace-pre-line",
                                                msg.role === "user"
                                                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-none font-medium"
                                                    : "bg-white dark:bg-slate-800 border border-border rounded-tl-none text-foreground"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex gap-3 max-w-[85%] items-center text-muted-foreground text-xs italic">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-border flex items-center justify-center shrink-0 text-amber-500">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                            <div className="p-3 bg-white dark:bg-slate-800 border border-border rounded-2xl rounded-tl-none flex items-center gap-2">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                                                <span>AI is analyzing...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Form */}
                            <div className="p-3 bg-background border-t border-border flex gap-2 items-center">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything about campus, tickets, or buildings..."
                                    className="flex-1 focus-visible:ring-amber-500 text-xs sm:text-sm"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-md"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                data-tour="ai-chatbot-widget"
                id="ai-chatbot-widget"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center transition-all duration-300 relative group",
                    isOpen ? "bg-slate-800 text-white" : "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white hover:shadow-[0_0_40px_rgba(245,158,11,0.7)]"
                )}
                aria-label="Open UNICARE AI Chatbot"
                title="UNICARE AI Chatbot"
            >
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[8px] font-bold text-white items-center justify-center">AI</span>
                </span>

                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-7 h-7" />
                )}

                {/* Tooltip on hover */}
                {!isOpen && (
                    <div className="absolute right-[115%] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 font-medium">
                        🤖 UNICARE AI Chatbot
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
