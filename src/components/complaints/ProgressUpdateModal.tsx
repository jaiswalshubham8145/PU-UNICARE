import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload, X, MessageSquare, Camera } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { motion, Variants } from "framer-motion";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";
import type { ComplaintWithJoins } from "@/types/complaint";



interface ProgressUpdateModalProps {
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

const ProgressUpdateModal = ({ complaint, open, onClose }: ProgressUpdateModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(50);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (): Promise<string[]> => {
    if (!user || files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `progress/${complaint.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

  const submitUpdate = useMutation({
    mutationFn: async () => {
      if (!user || !complaint) throw new Error("Invalid data");

      setUploading(true);
      const imageUrls = await uploadFiles();

      const updateNote = `Progress: ${progress}%\n${note}${imageUrls.length > 0 ? `\n\nAttached images: ${imageUrls.join(", ")}` : ""}`;

      const { error } = await supabase
        .from(TABLES.COMPLAINT_UPDATES)
        .insert({
          complaint_id: complaint.id,
          status: complaint.status,
          updated_by: user.id,
          note: updateNote,
        });

      if (error) throw error;

      // Send progress update email
      const emailData: ComplaintEmailData = {
        id: complaint.id,
        complaint_number: complaint.complaint_number,
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        status: complaint.status,
        location: complaint.location,
        department_id: complaint.department_id,
        submitted_by: complaint.submitted_by,
        assigned_to: complaint.assigned_to,
        department_name: complaint.departments?.name,
        category_name: complaint.maintenance_categories?.name,
      };
      sendComplaintEmail("progress_update", emailData, { note: updateNote, progress }).catch(console.error);
    },
    onSuccess: () => {
      toast.success("Progress update submitted");
      queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
      resetForm();
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to submit update";
      toast.error(message);
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const resetForm = () => {
    setNote("");
    setProgress(50);
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024);
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
                <MessageSquare className="w-5 h-5 text-accent" />
                Update Progress
              </DialogTitle>
            </DialogHeader>
          </motion.div>

          <div className="space-y-6 py-4">
            <motion.div variants={itemVariants} className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm font-medium text-foreground">{complaint.title}</p>
              <p className="text-xs text-muted-foreground">{complaint.complaint_number} • {complaint.location}</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label className="mb-2 flex items-center justify-between">
                <span>Work Progress</span>
                <span className="text-accent font-semibold">{progress}%</span>
              </Label>
              <Slider
                value={[progress]}
                onValueChange={(v) => setProgress(v[0])}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label className="mb-2">Progress Notes</Label>
              <Textarea
                placeholder="Describe the work done, any issues encountered, or next steps..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="hover-luxury"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label className="mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent" />
                Attach Photos (Optional)
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer hover-luxury"
              />
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="hover-luxury">Cancel</Button>
              <Button
                variant="accent"
                onClick={() => submitUpdate.mutate()}
                disabled={!note.trim() || submitUpdate.isPending || uploading}
                className="hover-luxury"
              >
                {(submitUpdate.isPending || uploading) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Update
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

export default ProgressUpdateModal;
