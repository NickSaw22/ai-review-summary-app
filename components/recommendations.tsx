"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Recommendations() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    try {
      const raw = localStorage.getItem("viewedProducts");
      const slugs: string[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(slugs) || slugs.length === 0) {
        setError("No viewing history yet.");
        return;
      }
      setIsLoading(true);
      setError(null);
      setText("");

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch(`/api/recommendations?history=${encodeURIComponent(slugs.join(","))}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setText((prev) => prev + chunk);
      }
    } catch (err) {
      console.error("Recommendations stream error:", err);
      setError("Unable to generate recommendations. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-prose p-10 grid gap-6">
      <CardHeader className="items-center space-y-0 gap-4 p-0">
        <div className="grid gap-1 text-center">
          <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
          <p className="text-xs text-muted-foreground">Based on your viewing history</p>
        </div>
      </CardHeader>
      <CardContent className="p-0 grid gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={run}
          >
            Generate
          </button>
        </div>
        <div className="min-h-[4rem]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : text ? (
            <pre className="text-sm leading-loose text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{text}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">Click Generate to get suggestions.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
