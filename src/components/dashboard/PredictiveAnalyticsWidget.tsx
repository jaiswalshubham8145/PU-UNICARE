import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useComplaints } from "@/hooks/useComplaints";

export const PredictiveAnalyticsWidget = () => {
  const { allComplaints, loadingAllComplaints } = useComplaints();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAllComplaints || !allComplaints) return;

    const generatePrediction = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Gemini API key is not configured.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Format historical data for the model
        const recentComplaints = allComplaints.slice(0, 50).map(c => ({
          department: c.departments?.name || "Unknown",
          category: c.maintenance_categories?.name || "Unknown",
          priority: c.priority,
          date: c.created_at
        }));

        const prompt = `You are an AI analyzing facility management data. 
Here are the recent complaints filed at the university:
${JSON.stringify(recentComplaints, null, 2)}

Based on this historical data, provide a very short predictive analysis (max 3 bullet points) focusing on:
1. Which department or category is likely to see the most issues next week.
2. Any alarming trends (e.g., too many critical issues).
3. A preventative recommendation for the maintenance team.

Format the response strictly in bullet points without markdown bolding, just plain text bullets.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        setPrediction(response.text());
      } catch (err: any) {
        console.error("Prediction Error:", err);
        setError("Failed to generate AI predictions.");
      } finally {
        setIsLoading(false);
      }
    };

    generatePrediction();
  }, [allComplaints, loadingAllComplaints]);

  return (
    <Card className="border-amber-500/20 shadow-md bg-gradient-to-br from-card to-amber-50/10 dark:to-amber-900/10">
      <CardHeader className="pb-3 border-b bg-muted/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI Predictive Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading || loadingAllComplaints ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-sm">Analyzing historical data patterns...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive py-4 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {prediction?.split('\n').filter(line => line.trim().length > 0).map((line, i) => {
              const text = line.replace(/^[\s•*-]+/, '').trim();
              if (!text) return null;
              return (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
