import { useState, useRef, useEffect } from "react";
import { useChatbot, ChatMessage } from "@/hooks/useChatbot";
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
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

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

    if (!user) return null; // Don't show for non-logged in users

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[380px] sm:w-[450px]"
                    >
                        <Card className="flex flex-col h-[500px] shadow-2xl border-amber-500/20 bg-background/95 backdrop-blur-md overflow-hidden flex-1">
                            {/* Header */}
                            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-between text-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">UNICARE Assistant</h3>
                                        <p className="text-[10px] text-amber-100 flex items-center gap-1">
                                            <Sparkles className="w-2 h-2" />
                                            AI Powered
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-white hover:bg-white/20"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="space-y-4">
                                    {messages.length === 0 && !hasActiveChat && (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 mx-auto flex items-center justify-center">
                                                <Bot className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Welcome to Unicare!</h4>
                                                <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                                                    I can help you file complaints, track status, or answer questions.
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => startNewChat()}
                                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                            >
                                                Start Conversation
                                            </Button>
                                        </div>
                                    )}

                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex gap-3 max-w-[85%]",
                                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                                msg.role === "user"
                                                    ? "bg-amber-500 border-amber-600 text-white"
                                                    : "bg-white dark:bg-slate-800 border-border text-amber-600"
                                            )}>
                                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-2xl text-sm shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-amber-500 text-white rounded-tr-none"
                                                    : "bg-white dark:bg-slate-800 border border-border rounded-tl-none text-foreground"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex gap-3 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-border flex items-center justify-center shrink-0 text-amber-600">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border border-border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-10">
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-3 bg-background border-t">
                                <div className="flex gap-2">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your message..."
                                        className="flex-1 focus-visible:ring-amber-500"
                                        disabled={!hasActiveChat && messages.length === 0}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isTyping || (!hasActiveChat && messages.length === 0)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 relative group",
                    isOpen ? "bg-slate-800 text-white" : "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                )}
            >
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>

                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-7 h-7" />
                )}

                {/* Tooltip on hover */}
                {!isOpen && (
                    <div className="absolute right-[110%] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Chat with AI
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
