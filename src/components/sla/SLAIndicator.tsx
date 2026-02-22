import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSLATracking } from "@/hooks/useSLA";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface SLAIndicatorProps {
    complaintId: string;
    compact?: boolean;
}

const SLAIndicator = ({ complaintId, compact = false }: SLAIndicatorProps) => {
    const { data: tracking } = useSLATracking(complaintId);

    if (!tracking || !tracking.resolution_due_at) {
        return null;
    }

    const now = new Date();
    const dueDate = new Date(tracking.resolution_due_at);
    const createdDate = tracking.sla_rules?.resolution_time_hours
        ? new Date(dueDate.getTime() - tracking.sla_rules.resolution_time_hours * 60 * 60 * 1000)
        : now;

    const totalMs = dueDate.getTime() - createdDate.getTime();
    const elapsedMs = now.getTime() - createdDate.getTime();
    const remainingMs = dueDate.getTime() - now.getTime();

    const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
    const isOverdue = remainingMs < 0;
    const isCritical = !isOverdue && remainingMs < 4 * 60 * 60 * 1000; // Less than 4 hours
    const isWarning = !isOverdue && !isCritical && percentage > 70;

    const getStatus = () => {
        if (tracking.resolved_at) {
            return {
                label: "Resolved",
                color: "text-success",
                bgColor: "bg-success/10",
                icon: CheckCircle2,
            };
        }
        if (isOverdue) {
            return {
                label: "Overdue",
                color: "text-destructive",
                bgColor: "bg-destructive/10",
                icon: AlertTriangle,
            };
        }
        if (isCritical) {
            return {
                label: "Critical",
                color: "text-warning",
                bgColor: "bg-warning/10",
                icon: Clock,
            };
        }
        if (isWarning) {
            return {
                label: "Due Soon",
                color: "text-info",
                bgColor: "bg-info/10",
                icon: Clock,
            };
        }
        return {
            label: "On Track",
            color: "text-success",
            bgColor: "bg-success/10",
            icon: CheckCircle2,
        };
    };

    const status = getStatus();
    const Icon = status.icon;

    const getProgressColor = () => {
        if (tracking.resolved_at) return "bg-success";
        if (isOverdue) return "bg-destructive";
        if (isCritical) return "bg-warning";
        if (isWarning) return "bg-info";
        return "bg-primary";
    };

    const getTimeRemaining = () => {
        if (tracking.resolved_at) {
            const resolvedDate = new Date(tracking.resolved_at);
            if (resolvedDate > dueDate) {
                return `Resolved ${formatDistanceToNow(dueDate)} late`;
            }
            const timeAhead = dueDate.getTime() - resolvedDate.getTime();
            const hoursAhead = Math.floor(timeAhead / (60 * 60 * 1000));
            return `Resolved ${hoursAhead}h ahead of deadline`;
        }

        if (isOverdue) {
            return `Overdue by ${formatDistanceToNow(dueDate)}`;
        }

        const hours = Math.floor(remainingMs / (60 * 60 * 1000));
        const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} day${days > 1 ? "s" : ""} remaining`;
        }
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={cn("gap-1", status.bgColor, status.color)}>
                            <Icon className="w-3 h-3" />
                            <span className="text-xs">{status.label}</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="space-y-1">
                            <div className="font-medium">{getTimeRemaining()}</div>
                            <div className="text-xs text-muted-foreground">
                                Due: {dueDate.toLocaleString()}
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", status.color)} />
                    <span className={cn("font-medium", status.color)}>{status.label}</span>
                </div>
                <span className="text-muted-foreground">{getTimeRemaining()}</span>
            </div>
            <Progress value={tracking.resolved_at ? 100 : percentage} className="h-2">
                <div
                    className={cn("h-full rounded-full transition-all", getProgressColor())}
                    style={{ width: `${tracking.resolved_at ? 100 : percentage}%` }}
                />
            </Progress>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Created</span>
                <span>Due: {dueDate.toLocaleTimeString()}</span>
            </div>
        </div>
    );
};

export default SLAIndicator;
