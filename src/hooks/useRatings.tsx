import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComplaintRating } from "@/integrations/supabase/phase1-types";
import { toast } from "sonner";

// Hook to fetch rating for a specific complaint
export const useComplaintRating = (complaintId: string | undefined) => {
    return useQuery({
        queryKey: ["complaint-rating", complaintId],
        queryFn: async () => {
            if (!complaintId) return null;

            const { data, error } = await supabase
                .from("complaint_ratings")
                .select("*")
                .eq("complaint_id", complaintId)
                .maybeSingle();

            if (error) throw error;
            return data as ComplaintRating | null;
        },
        enabled: !!complaintId,
    });
};

// Hook to submit or update a rating
export const useSubmitRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rating: Omit<ComplaintRating, "id" | "created_at" | "updated_at"> & { id?: string }) => {
            const { id, ...ratingData } = rating;

            if (id) {
                // Update existing rating
                const { data, error } = await supabase
                    .from("complaint_ratings")
                    .update(ratingData)
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Insert new rating
                const { data, error } = await supabase
                    .from("complaint_ratings")
                    .insert(ratingData)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["complaint-rating", variables.complaint_id] });
            queryClient.invalidateQueries({ queryKey: ["staff-ratings"] });
            queryClient.invalidateQueries({ queryKey: ["department-analytics"] });
            toast.success(variables.id ? "Rating updated successfully" : "Thank you for your feedback!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to submit rating");
        },
    });
};

// Hook to get average rating for staff
export const useStaffRatings = (staffId: string | undefined) => {
    return useQuery({
        queryKey: ["staff-ratings", staffId],
        queryFn: async () => {
            if (!staffId) return null;

            const { data: complaints, error: complaintsError } = await supabase
                .from("complaints")
                .select(`
          id,
          complaint_ratings (
            rating,
            service_quality,
            response_time,
            staff_professionalism,
            resolution_satisfaction
          )
        `)
                .eq("assigned_to", staffId)
                .not("complaint_ratings", "is", null);

            if (complaintsError) throw complaintsError;

            if (!complaints || complaints.length === 0) {
                return {
                    total_ratings: 0,
                    avg_rating: 0,
                    avg_service_quality: 0,
                    avg_response_time: 0,
                    avg_staff_professionalism: 0,
                    avg_resolution_satisfaction: 0,
                };
            }

            const ratings = complaints
                .map((c) => c.complaint_ratings)
                .flat()
                .filter((r) => r !== null);

            const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

            return {
                total_ratings: ratings.length,
                avg_rating: avg(ratings.map((r) => r.rating)),
                avg_service_quality: avg(ratings.map((r) => r.service_quality || 0).filter((r) => r > 0)),
                avg_response_time: avg(ratings.map((r) => r.response_time || 0).filter((r) => r > 0)),
                avg_staff_professionalism: avg(ratings.map((r) => r.staff_professionalism || 0).filter((r) => r > 0)),
                avg_resolution_satisfaction: avg(ratings.map((r) => r.resolution_satisfaction || 0).filter((r) => r > 0)),
            };
        },
        enabled: !!staffId,
    });
};

// Hook to get department ratings statistics
export const useDepartmentRatings = (departmentId: string | undefined) => {
    return useQuery({
        queryKey: ["department-ratings", departmentId],
        queryFn: async () => {
            if (!departmentId) return null;

            const { data: complaints, error } = await supabase
                .from("complaints")
                .select(`
          id,
          complaint_ratings (
            rating,
            service_quality,
            response_time,
            staff_professionalism,
            resolution_satisfaction,
            would_recommend
          )
        `)
                .eq("department_id", departmentId)
                .not("complaint_ratings", "is", null);

            if (error) throw error;

            if (!complaints || complaints.length === 0) {
                return {
                    total_ratings: 0,
                    avg_rating: 0,
                    recommendation_rate: 0,
                    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                };
            }

            const ratings = complaints
                .map((c) => c.complaint_ratings)
                .flat()
                .filter((r) => r !== null);

            const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            ratings.forEach((r) => {
                if (r.rating >= 1 && r.rating <= 5) {
                    ratingDist[r.rating as keyof typeof ratingDist]++;
                }
            });

            const recommendCount = ratings.filter((r) => r.would_recommend === true).length;

            return {
                total_ratings: ratings.length,
                avg_rating: ratings.length > 0
                    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                    : 0,
                recommendation_rate: ratings.length > 0
                    ? (recommendCount / ratings.length) * 100
                    : 0,
                rating_distribution: ratingDist,
            };
        },
        enabled: !!departmentId,
    });
};

// Hook to get overall system ratings
export interface SystemRatingsStats {
    total_ratings: number;
    avg_rating: number;
    recommendation_rate: number;
    rating_distribution: Record<number, number>;
}

export const useSystemRatings = () => {
    return useQuery<SystemRatingsStats>({
        queryKey: ["system-ratings"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("complaint_ratings")
                .select("rating, would_recommend");

            if (error) throw error;

            if (!data || data.length === 0) {
                return {
                    total_ratings: 0,
                    avg_rating: 0,
                    recommendation_rate: 0,
                    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                };
            }

            const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.forEach((r) => {
                const rating = Number(r.rating);
                if (rating >= 1 && rating <= 5) {
                    ratingDist[rating]++;
                }
            });

            const recommendCount = data.filter((r) => r.would_recommend === true).length;

            return {
                total_ratings: data.length,
                avg_rating: data.reduce((sum, r) => sum + Number(r.rating), 0) / data.length,
                recommendation_rate: (recommendCount / data.length) * 100,
                rating_distribution: ratingDist,
            };
        },
    });
};

// Hook to get recent feedback
export const useRecentFeedback = (limit: number = 10) => {
    return useQuery({
        queryKey: ["recent-feedback", limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("complaint_ratings")
                .select(`
          *,
          complaints (
            complaint_number,
            title,
            departments (
              name
            )
          )
        `)
                .not("feedback_text", "is", null)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        },
    });
};
