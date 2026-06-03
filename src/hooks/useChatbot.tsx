import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type ChatConversation = Database["public"]["Tables"]["chat_conversations"]["Row"];

export interface ChatState {
    isOpen: boolean;
    activeConversationId: string | null;
    isTyping: boolean;
}

export const useChatbot = (userId: string | undefined) => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Advanced AI Logic with Data Access
    const generateSmartResponse = async (userMessage: string): Promise<string> => {
        try {
            // First, let's fetch some context from the database if user is logged in
            let userContext = "";
            if (userId) {
                const { data, error } = await supabase
                    .from("complaints")
                    .select("complaint_number, status, title")
                    .eq("submitted_by", userId)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (data && data.length > 0) {
                    userContext = `\nThe user's recent complaints are:\n` + data.map(c => `- #${c.complaint_number}: ${c.title} (Status: ${c.status})`).join("\n");
                } else {
                    userContext = `\nThe user has no recent complaints.`;
                }
            }

            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                console.warn("Gemini API key is missing. Using fallback response.");
                return "I am currently undergoing maintenance and cannot access my AI brain. Please try again later or use the standard navigation menus.";
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const systemPrompt = `You are the UNICARE Assistant, an AI facility management chatbot for Parul University (PU).
Your job is to help users file complaints, check their complaint status, and understand the system.
Keep your answers brief, friendly, and helpful. Use markdown for formatting.
If they want to file a complaint, tell them to go to '/register-complaint'.
If they want to track a complaint, tell them to go to '/track'.
${userContext}

User Message: ${userMessage}`;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error generating AI response:", error);
            return "I encountered an error connecting to my AI brain. Please try again later.";
        }
    };

    // Fetch active conversation messages
    const messagesQuery = useQuery({
        queryKey: ["chat-messages", activeConversationId],
        queryFn: async () => {
            if (!activeConversationId) return [];
            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("conversation_id", activeConversationId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!activeConversationId,
    });

    // Start new conversation
    const startConversation = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from("chat_conversations")
                .insert({ user_id: userId, title: "New Chat" })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            setActiveConversationId(data.id);
            // Add initial greeting
            addMessage.mutate({
                conversationId: data.id,
                role: "assistant",
                content: "Hi! I'm UNICARE AI. How can I assist you today?"
            });
        },
    });

    // Add message
    const addMessage = useMutation({
        mutationFn: async ({ conversationId, role, content }: { conversationId: string; role: "user" | "assistant"; content: string }) => {
            const { data, error } = await supabase
                .from("chat_messages")
                .insert({ conversation_id: conversationId, role, content })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
        },
    });

    // Send message (User -> AI)
    const sendMessage = async (content: string) => {
        if (!content.trim() || !userId) return;

        let currentConversationId = activeConversationId;

        // Create conversation if none exists
        if (!currentConversationId) {
            const conv = await startConversation.mutateAsync();
            currentConversationId = conv.id;
        }

        // 1. Save User Message
        await addMessage.mutateAsync({
            conversationId: currentConversationId!,
            role: "user",
            content
        });

        // 2. Simulate AI Thinking
        setIsTyping(true);
        const aiResponse = await generateSmartResponse(content);
        setIsTyping(false);

        // 3. Save AI Response
        await addMessage.mutateAsync({
            conversationId: currentConversationId!,
            role: "assistant",
            content: aiResponse
        });
    };

    return {
        isOpen,
        setIsOpen,
        messages: messagesQuery.data || [],
        isLoading: messagesQuery.isLoading,
        sendMessage,
        isTyping,
        startNewChat: startConversation.mutate,
        hasActiveChat: !!activeConversationId,
    };
};
