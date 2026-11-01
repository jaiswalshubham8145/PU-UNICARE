import type { ComplaintPriority, ComplaintStatus } from "@/types/complaint";

/**
 * Standard priority badge background and text colors
 */
export const priorityColors: Record<ComplaintPriority | string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-priority-high text-white",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

/**
 * Standard complaint status colors
 */
export const statusColors: Record<ComplaintStatus | string, string> = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  in_progress: "bg-info text-info-foreground",
  completed: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  on_hold: "bg-warning text-warning-foreground",
};

/**
 * Human-readable complaint status labels
 */
export const statusLabels: Record<ComplaintStatus | string, string> = {
  pending: "Pending",
  approved: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  rejected: "Rejected",
  on_hold: "On Hold",
};

/**
 * Get CSS class string for priority badge
 */
export function getPriorityBadgeClass(priority: string | null | undefined): string {
  if (!priority) return "bg-secondary text-secondary-foreground";
  return priorityColors[priority.toLowerCase()] || "bg-secondary text-secondary-foreground";
}

/**
 * Get CSS class string for status badge
 */
export function getStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-secondary text-secondary-foreground";
  return statusColors[status.toLowerCase()] || "bg-secondary text-secondary-foreground";
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return "Unknown";
  return statusLabels[status.toLowerCase()] || status.replace(/_/g, " ");
}
