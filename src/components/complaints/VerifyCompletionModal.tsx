import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Star, MessageSquare } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { motion, Variants } from "framer-motion";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";
import type { ComplaintWithJoins } from "@/types/complaint";

type ComplaintStatus = Database['public']['Enums']['complaint_status'];


interface VerifyCompletionModalProps {
  complaint: ComplaintWithJoins;
  open: boolean;
  onClose: () => void;
}

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
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

const VerifyCompletionModal = ({ complaint, open, onClose }: VerifyCompletionModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [isRejecting, setIsRejecting] = useState(false);

  const verifyCompletion = useMutation({
    mutationFn: async (verified: boolean) => {
      if (!user || !complaint) throw new Error("Invalid data");

      const newStatus: ComplaintStatus = verified ? "closed" : "in_progress";
      const note = verified
        ? `Completion verified by faculty.\n\nRating: ${rating}/5 stars\nFeedback: ${feedback || "No feedback provided"}`
        : `Completion rejected by faculty. Sending back for rework.\n\nReason: ${feedback}`;

      // Update complaint status
      const { error: updateError } = await supabase
        .from(TABLES.COMPLAINTS)
        .update({
          status: newStatus,
          resolved_at: verified ? complaint.resolved_at : null,
        })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      // Add verification update
      const { error: insertError } = await supabase
        .from(TABLES.COMPLAINT_UPDATES)
        .insert({
          complaint_id: complaint.id,
          status: newStatus,
          updated_by: user.id,
          note,
        });

      if (insertError) throw insertError;

      // Send verification email
      const emailData: ComplaintEmailData = {
        id: complaint.id,
        complaint_number: complaint.complaint_number,
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        status: newStatus,
        location: complaint.location,
        department_id: complaint.department_id,
        submitted_by: complaint.submitted_by,
        assigned_to: complaint.assigned_to,
        department_name: complaint.departments?.name,
        category_name: complaint.maintenance_categories?.name,
      };

      if (verified) {
        sendComplaintEmail("verification_approved", emailData, { rating, feedback }).catch(console.error);
      } else {
        sendComplaintEmail("verification_rejected", emailData, { feedback }).catch(console.error);
      }
    },
    onSuccess: (_, verified) => {
      toast.success(verified ? "Completion verified successfully" : "Sent back for rework");
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
      resetForm();
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to verify completion";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFeedback("");
    setRating(0);
    setIsRejecting(false);
  };

  if (!complaint) return null;

  // Find completion update with proof
  const completionUpdate = complaint.complaint_updates?.find(
    (u: Database['public']['Tables']['complaint_updates']['Row']) => u.status === "completed" && u.note?.includes("Completion proof")
  );

  // Extract image URLs from note
  const proofImages = completionUpdate?.note?.match(/https?:\/\/[^\s,]+/g) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Verify Completion
              </DialogTitle>
            </DialogHeader>
          </motion.div>

          <div className="space-y-6 py-4">
            <motion.div variants={itemVariants} className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm font-medium text-foreground">{complaint.title}</p>
              <p className="text-xs text-muted-foreground">{complaint.complaint_number} • {complaint.location}</p>
            </motion.div>

            {proofImages.length > 0 && (
              <motion.div variants={itemVariants}>
                <Label className="mb-2">Completion Proof Photos</Label>
                <div className="grid grid-cols-3 gap-3">
                  {proofImages.map((url: string, index: number) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer transform hover:scale-105 duration-300"
                      />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {!isRejecting ? (
              <>
                <motion.div variants={itemVariants}>
                  <Label className="mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    Rate the Work Quality
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-110 ${star <= rating
                          ? "bg-warning text-warning-foreground shadow-lg"
                          : "bg-secondary text-muted-foreground hover:bg-warning/30"
                          }`}
                      >
                        <Star className={`w-5 h-5 mx-auto ${star <= rating ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label className="mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    Feedback (Optional)
                  </Label>
                  <Textarea
                    placeholder="Share your feedback about the work quality..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="hover-luxury"
                  />
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants}>
                <Label className="mb-2 text-destructive">Reason for Rejection *</Label>
                <Textarea
                  placeholder="Explain what needs to be fixed or why the work is not satisfactory..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="border-destructive/50 hover-luxury"
                />
              </motion.div>
            )}
          </div>

          <motion.div variants={itemVariants}>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {!isRejecting ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsRejecting(true)}
                    className="text-destructive border-destructive/50 hover:bg-destructive/10 transition-colors duration-300"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject & Rework
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => verifyCompletion.mutate(true)}
                    disabled={rating === 0 || verifyCompletion.isPending}
                    className="hover-luxury transform transition-transform"
                  >
                    {verifyCompletion.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Close
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsRejecting(false)} className="hover-luxury">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => verifyCompletion.mutate(false)}
                    disabled={!feedback.trim() || verifyCompletion.isPending}
                    className="hover-luxury"
                  >
                    {verifyCompletion.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Send Back for Rework
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyCompletionModal;
