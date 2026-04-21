"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InsightsCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const response = await fetch("/api/ai-insights", { cache: "no-store" });
      const payload = await response.json();

      if (payload.insight) {
        setInsight(payload.insight);
      } else if (payload.error) {
        setError(payload.error);
      } else {
        setError("No insights available.");
      }
    } catch {
      setError("AI temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="glass-card rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
        </div>
        {!loading && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={load}
            aria-label="Refresh insights"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Personalized analysis based on your recent transactions.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating insights...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {insight && !loading && (
        <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {insight}
        </div>
      )}
    </div>
  );
}
