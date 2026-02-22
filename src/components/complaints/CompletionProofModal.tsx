import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, X, CheckCircle, Camera, FileImage } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { motion, Variants } from "framer-motion";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";

type ComplaintStatus = Database['public']['Enums']['complaint_status'];
type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
};

interface CompletionProofModalProps {
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

const CompletionProofModal = ({ complaint, open, onClose }: CompletionProofModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const uploadFiles = async (): Promise<string[]> => {
    if (!user || files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `completion/${complaint.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("complaint-images")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("complaint-images")
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const markComplete = useMutation({
    mutationFn: async () => {
      if (!user || !complaint) throw new Error("Invalid data");
      if (files.length === 0) throw new Error("Please upload at least one proof photo");

      const imageUrls = await uploadFiles();

      // Update complaint status to completed
      const { error: updateError } = await supabase
        .from(TABLES.COMPLAINTS)
        .update({
          status: "completed" as ComplaintStatus,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      // Add completion update with proof
      const { error: insertError } = await supabase
        .from(TABLES.COMPLAINT_UPDATES)
        .insert({
          complaint_id: complaint.id,
          status: "completed" as ComplaintStatus,
          updated_by: user.id,
          note: `Task completed successfully.\n\n${completionNote}\n\nCompletion proof attached: ${imageUrls.join(", ")}`,
        });

      if (insertError) throw insertError;

      // Send completion and verification request emails
      const emailData: ComplaintEmailData = {
        id: complaint.id,
        complaint_number: complaint.complaint_number,
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        status: "completed",
        location: complaint.location,
        department_id: complaint.department_id,
        submitted_by: complaint.submitted_by,
        assigned_to: complaint.assigned_to,
        department_name: complaint.departments?.name,
        category_name: complaint.maintenance_categories?.name,
      };
      // Notify submitter and HOD about completion
      sendComplaintEmail("completion", emailData, { note: completionNote }).catch(console.error);
      // Request verification from submitter
      sendComplaintEmail("verification_requested", emailData, { note: completionNote }).catch(console.error);
    },
    onSuccess: () => {
      toast.success("Completion proof submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
      resetForm();
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to complete task";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setCompletionNote("");
    setFiles([]);
    setPreviews([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024;
      if (!isValid) toast.error(`${file.name} is too large (max 10MB)`);
      return isValid;
    });

    const newFiles = [...files, ...validFiles].slice(0, 5);
    setFiles(newFiles);

    // Create previews
    newFiles.forEach((file, index) => {
      if (previews[index]) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = e.target?.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  if (!complaint) return null;

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
                Complete Task with Proof
              </DialogTitle>
            </DialogHeader>
          </motion.div>

          <div className="space-y-6 py-4">
            <motion.div variants={itemVariants} className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-foreground">{complaint.title}</p>
              <p className="text-xs text-muted-foreground">{complaint.complaint_number} • {complaint.location}</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label className="mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent" />
                Completion Photos *
              </Label>
              <p className="text-xs text-muted-foreground mb-3">Upload photos showing the completed work as proof</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors cursor-pointer hover-luxury"
              >
                <FileImage className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload completion photos</p>
                <p className="text-xs text-muted-foreground mt-1">Max 5 images, 10MB each</p>
              </div>

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label className="mb-2">Completion Notes</Label>
              <Textarea
                placeholder="Describe the work completed, materials used, any follow-up needed..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={4}
                className="hover-luxury"
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="hover-luxury">Cancel</Button>
              <Button
                variant="success"
                onClick={() => markComplete.mutate()}
                disabled={files.length === 0 || markComplete.isPending}
                className="hover-luxury"
              >
                {markComplete.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionProofModal;
