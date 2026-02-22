import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

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
        const msg = userMessage.toLowerCase();

        // Simulate thinking network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Capabilities / Help
        if (msg.includes("what can you do") || msg.includes("help") || msg.includes("who are you")) {
            return "I am the UNICARE Assistant. I can help you with:\n\n" +
                "• Registering new complaints (try 'how to register')\n" +
                "• Checking complaint status (try 'status of #123')\n" +
                "• Finding incomplete or pending complaints (try 'my pending complaints')\n" +
                "• Explaining SLAs and Priorities\n" +
                "• Navigating the system";
        }

        // 2. Navigation
        if (msg.includes("navigate") || msg.includes("go to")) {
            if (msg.includes("register") || msg.includes("file")) return "You can file a complaint by clicking 'Report Issue' in the menu or going to /register-complaint.";
            if (msg.includes("track")) return "Visit the Tracking page at /track to see live updates.";
            if (msg.includes("dashboard")) return "Your Dashboard is available in the menu (based on your role).";
            return "I can help you navigate. Try asking 'where is the contact page?' or 'how to register'.";
        }

        // 3. User Data Queries (Real Database Access)
        if (userId) {
            // "My Complaints" / "Pending"
            if (msg.includes("pending") || msg.includes("incomplete") || msg.includes("open")) {
                const { count, error } = await supabase
                    .from("complaints")
                    .select("*", { count: 'exact', head: true })
                    .eq("submitted_by", userId)
                    .in("status", ["pending", "in_progress", "acknowledged", "approved"]);

                if (error) return "I had trouble checking your complaints. Please try again later.";

                if (count === 0) return "You have no pending complaints at the moment. Great job!";
                return `You currently have ${count} pending or active complaints. You can view them on your Dashboard or the Track page.`;
            }

            // "Status of #..."
            // Extract number pattern if simple (e.g. "status of 1001" or just "1001")
            // This is complex to regex robustly, but let's try a simple check for "details of last"
            if (msg.includes("last complaint") || msg.includes("latest")) {
                const { data, error } = await supabase
                    .from("complaints")
                    .select("complaint_number, status, title")
                    .eq("submitted_by", userId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    return `Your latest complaint (#${data.complaint_number}) about '${data.title}' is currently '${data.status.replace('_', ' ')}'.`;
                } else {
                    return "You haven't submitted any complaints yet.";
                }
            }
        }

        // 4. How-To / Knowledge
        if (msg.includes("register") || msg.includes("create") || msg.includes("new complaint")) {
            return "To register a complaint:\n1. Go to 'Report Issue'.\n2. Fill in the details (Location, Category).\n3. Upload a photo if improved clarity is needed.\n4. Submit!";
        }

        if (msg.includes("sla") || msg.includes("time") || msg.includes("long")) {
            return "Our SLAs (Service Level Agreements) depend on priority:\n• Critical: 24 hours\n• High: 48 hours\n• Medium: 3 days\n• Low: 1 week.\nIf breached, it escalates automatically.";
        }

        if (msg.includes("contact") || msg.includes("support")) {
            return "You can reach the maintenance office at contact@unicare.pu.edu or visit the 'Contact' page.";
        }

        // 5. General / Fallback
        if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
            return `Hello${userId ? '' : ' there'}! How can I assist you with facility management today?`;
        }

        return "I'm not sure I understand that completely. Try asking about 'my pending complaints', 'how to register', or 'system features'.";
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
