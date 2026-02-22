import { format } from "date-fns";
import { CheckCircle2, Clock, User, AlertCircle, FileText, ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

// Type defs
type ComplaintUpdate = Database["public"]["Tables"]["complaint_updates"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface TimelineEvent {
    id: string;
    type: "created" | "update" | "resolved" | "reopened";
    status?: string;
    title: string;
    description?: string;
    date: string;
    user?: string;
    icon: LucideIcon;
    color: string;
}

interface ComplaintTimelineProps {
    created_at: string;
    resolved_at?: string | null;
    updates?: (ComplaintUpdate & { updated_by_profile?: Profile | null })[];
    currentStatus: string;
    className?: string;
}

const ComplaintTimeline = ({
    created_at,
    resolved_at,
    updates = [],
    currentStatus,
    className
}: ComplaintTimelineProps) => {

    // 1. Build Timeline Events
    const events: TimelineEvent[] = [];

    // Start Event
    events.push({
        id: "start",
        type: "created",
        title: "Complaint Registered",
        description: "Complaint was submitted to the system.",
        date: created_at,
        icon: FileText,
        color: "bg-blue-500",
    });

    // Update Events
    updates.forEach((update) => {
        events.push({
            id: update.id,
            type: "update",
            status: update.status,
            title: `Status changed to ${update.status.replace("_", " ")}`,
            description: update.note || undefined,
            date: update.created_at,
            user: update.updated_by_profile?.full_name, // You might need to join this in your query
            icon: Clock,
            color: "bg-amber-500",
        });
    });

    // Resolved Event (if resolved)
    if (resolved_at || currentStatus === "completed" || currentStatus === "closed") {
        events.push({
            id: "end",
            type: "resolved",
            title: "Complaint Resolved",
            description: "Issue has been marked as completed.",
            date: resolved_at || new Date().toISOString(), // Fallback if resolved_at is missing but status is completed
            icon: CheckCircle2,
            color: "bg-green-500",
        });
    }

    // Sort by date descending (newest first)
    const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className={cn("relative pl-6 border-l border-border space-y-8", className)}>
            {sortedEvents.map((event, index) => (
                <div key={event.id} className="relative group">
                    {/* Dot */}
                    <div className={cn(
                        "absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-background ring-4 ring-background transition-transform group-hover:scale-125 shadow-sm",
                        event.color
                    )} />

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            {format(new Date(event.date), "MMM d, h:mm a")}
                        </span>

                        <div className="bg-card/40 border border-border/50 rounded-lg p-3 group-hover:bg-card/80 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <event.icon className={cn("w-4 h-4", event.color.replace("bg-", "text-"))} />
                                <h4 className="text-sm font-semibold capitalize text-foreground">
                                    {event.title}
                                </h4>
                            </div>

                            {event.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {event.description}
                                </p>
                            )}

                            {event.user && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-full">
                                    <User className="w-3 h-3" />
                                    <span>Updated by {event.user}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ComplaintTimeline;
