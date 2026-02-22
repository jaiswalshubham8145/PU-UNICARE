import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, Building, Tag, Clock, CheckCircle, AlertTriangle, XCircle, Loader2, Image as ImageIcon, LucideIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { motion, Variants } from "framer-motion";
import ComplaintTimeline from "./ComplaintTimeline";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  building_id?: string | null;
  departments?: { name: string } | null;
  maintenance_categories?: { name: string } | null;
  buildings?: { name: string } | null;
  complaint_updates?: Database['public']['Tables']['complaint_updates']['Row'][];
};

interface ComplaintDetailsModalProps {
  complaint: ComplaintWithJoins;
  open: boolean;
  onClose: () => void;
}

type StatusConfig = Record<string, { icon: LucideIcon; color: string; label: string }>;

const statusConfig: StatusConfig = {
  pending: { icon: Clock, color: "bg-warning/10 text-warning border-warning/30", label: "Pending" },
  acknowledged: { icon: CheckCircle, color: "bg-info/10 text-info border-info/30", label: "Acknowledged" },
  approved: { icon: CheckCircle, color: "bg-success/10 text-success border-success/30", label: "Approved" },
  in_progress: { icon: Loader2, color: "bg-accent/10 text-accent border-accent/30", label: "In Progress" },
  completed: { icon: CheckCircle, color: "bg-success/10 text-success border-success/30", label: "Completed" },
  rejected: { icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/30", label: "Rejected" },
  on_hold: { icon: AlertTriangle, color: "bg-warning/10 text-warning border-warning/30", label: "On Hold" },
  closed: { icon: CheckCircle, color: "bg-muted text-muted-foreground border-muted", label: "Closed" },
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-orange-500/10 text-orange-500",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const ComplaintDetailsModal = ({ complaint, open, onClose }: ComplaintDetailsModalProps) => {
  if (!complaint) return null;

  const status = statusConfig[complaint.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-lg font-bold">{complaint.complaint_number}</span>
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </DialogTitle>
            </DialogHeader>
          </motion.div>

          <div className="space-y-6 py-4">
            {/* Title and Description */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-foreground mb-2">{complaint.title}</h3>
              <p className="text-muted-foreground">{complaint.description}</p>
            </motion.div>

            {/* Meta Information */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{complaint.departments?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{complaint.maintenance_categories?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Building:</span>
                <span className="font-medium">{complaint.buildings?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{complaint.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Priority:</span>
                <Badge className={priorityColors[complaint.priority] || "bg-secondary"}>
                  {complaint.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{format(new Date(complaint.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
              {complaint.expected_resolution && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">Expected Resolution:</span>
                  <span className="font-medium">{format(new Date(complaint.expected_resolution), "MMM d, yyyy")}</span>
                </div>
              )}
            </motion.div>

            {/* Attached Images */}
            {complaint.image_urls && complaint.image_urls.length > 0 && (
              <motion.div variants={itemVariants}>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-accent" />
                  Attached Images ({complaint.image_urls.length})
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {complaint.image_urls.map((url: string, idx: number) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-border hover-luxury"
                    >
                      <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-semibold text-foreground mb-3">Timeline</h4>
              <ComplaintTimeline
                created_at={complaint.created_at}
                resolved_at={complaint.resolved_at}
                updates={complaint.complaint_updates}
                currentStatus={complaint.status}
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetailsModal;