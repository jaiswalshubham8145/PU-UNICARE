import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SatisfactionSurvey = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idParam = searchParams.get('id');
    if (idParam) setComplaintId(idParam);
  }, [location.search]);

  const handleSubmit = async () => {
    if (!complaintId) {
      toast.error("Invalid complaint ID");
      return;
    }
    if (rating === 0) {
      toast.error("Please provide a rating (1-5 stars)");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let updatedBy = user?.id;
      if (!updatedBy) {
        const { data: complaintData } = await supabase
          .from("complaints")
          .select("submitted_by")
          .eq("id", complaintId)
          .single();
        updatedBy = complaintData?.submitted_by;
      }

      if (!updatedBy) {
        toast.error("Could not determine user for survey submission");
        return;
      }

      // For this MVP, we save feedback in complaint_updates
      const { error } = await supabase
        .from("complaint_updates")
        .insert({
          complaint_id: complaintId,
          status: "closed",
          note: `User Satisfaction Rating: ${rating}/5 Stars.\nFeedback: ${feedback}`,
          updated_by: updatedBy,
        });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-16">
          <div className="max-w-md w-full p-8 text-center glass-panel-track rounded-2xl mx-4">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-8">Your feedback has been submitted successfully and helps us improve our services.</p>
            <Button onClick={() => navigate("/")} className="w-full">Return Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16">
        <div className="max-w-md w-full p-8 glass-panel-track rounded-2xl mx-4">
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Service Feedback</h1>
          <p className="text-muted-foreground text-center mb-8">
            Please rate the resolution of your complaint {complaintId ? `(${complaintId.split('-').pop()})` : ''}
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-10 h-10 cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Additional Comments (Optional)</label>
            <Textarea 
              placeholder="Tell us what we did well or how we can improve..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold" 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SatisfactionSurvey;
