import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { useSubmitRating, useComplaintRating } from "@/hooks/useRatings";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface RatingModalProps {
    complaintId: string | null;
    complaintNumber?: string;
    open: boolean;
    onClose: () => void;
    userId: string;
}

const RatingModal = ({ complaintId, complaintNumber, open, onClose, userId }: RatingModalProps) => {
    const { data: existingRating } = useComplaintRating(complaintId || undefined);
    const submitRating = useSubmitRating();

    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [serviceQuality, setServiceQuality] = useState(existingRating?.service_quality || 0);
    const [responseTime, setResponseTime] = useState(existingRating?.response_time || 0);
    const [staffProfessionalism, setStaffProfessionalism] = useState(existingRating?.staff_professionalism || 0);
    const [resolutionSatisfaction, setResolutionSatisfaction] = useState(existingRating?.resolution_satisfaction || 0);
    const [feedbackText, setFeedbackText] = useState(existingRating?.feedback_text || "");
    const [improvementSuggestions, setImprovementSuggestions] = useState(existingRating?.improvement_suggestions || "");
    const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(existingRating?.would_recommend ?? null);

    const handleSubmit = async () => {
        if (!complaintId || rating === 0) return;

        await submitRating.mutateAsync({
            id: existingRating?.id,
            complaint_id: complaintId,
            rated_by: userId,
            rating,
            service_quality: serviceQuality || null,
            response_time: responseTime || null,
            staff_professionalism: staffProfessionalism || null,
            resolution_satisfaction: resolutionSatisfaction || null,
            feedback_text: feedbackText || null,
            improvement_suggestions: improvementSuggestions || null,
            would_recommend: wouldRecommend,
        });

        onClose();
    };

    const StarRating = ({
        value,
        onChange,
        label,
    }: {
        value: number;
        onChange: (val: number) => void;
        label: string;
    }) => {
        const [hovered, setHovered] = useState(0);

        return (
            <div className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={cn(
                                    "w-8 h-8 transition-colors",
                                    (hovered >= star || value >= star)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>
                        Help us improve by rating your experience with complaint{" "}
                        {complaintNumber ? `#${complaintNumber}` : ""}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Overall Rating */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Overall Satisfaction *</Label>
                        <div className="flex gap-2 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={cn(
                                            "w-10 h-10 transition-colors",
                                            (hoveredRating >= star || rating >= star)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        )}
                                    />
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                    {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-accent/5 rounded-lg border">
                        <StarRating
                            value={serviceQuality}
                            onChange={setServiceQuality}
                            label="Service Quality"
                        />
                        <StarRating
                            value={responseTime}
                            onChange={setResponseTime}
                            label="Response Time"
                        />
                        <StarRating
                            value={staffProfessionalism}
                            onChange={setStaffProfessionalism}
                            label="Staff Professionalism"
                        />
                        <StarRating
                            value={resolutionSatisfaction}
                            onChange={setResolutionSatisfaction}
                            label="Resolution Quality"
                        />
                    </div>

                    {/* Would Recommend */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Would you recommend our service?</Label>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant={wouldRecommend === true ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setWouldRecommend(true)}
                            >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Yes
                            </Button>
                            <Button
                                type="button"
                                variant={wouldRecommend === false ? "destructive" : "outline"}
                                className="flex-1"
                                onClick={() => setWouldRecommend(false)}
                            >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                No
                            </Button>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <Label htmlFor="feedback">Additional Feedback</Label>
                        <Textarea
                            id="feedback"
                            placeholder="Tell us about your experience..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Improvement Suggestions */}
                    <div className="space-y-2">
                        <Label htmlFor="improvements">Suggestions for Improvement</Label>
                        <Textarea
                            id="improvements"
                            placeholder="How can we improve our service?"
                            value={improvementSuggestions}
                            onChange={(e) => setImprovementSuggestions(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitRating.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={rating === 0 || submitRating.isPending}>
                        {submitRating.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {existingRating ? "Update Rating" : "Submit Rating"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RatingModal;
