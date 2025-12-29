"use client";
 
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiveStarRating } from "./five-star-rating";
import { Product } from "@/lib/types";
import { useRef } from "react";
 
export function StreamingSummary({ product }: { product: Product }) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const didRunRef = useRef(false);
 
  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.stars, 0) /
    product.reviews.length;
 
  useEffect(() => {
    async function fetchStream() {
      setIsLoading(true);
      setSummary("");
      setError(null);
 
      try {
        // Abort any previous stream
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch(`/api/summary/${product.slug}`, {
          signal: controller.signal,
          cache: "no-store",
        });
 
        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }
 
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
 
        if (!reader) {
          throw new Error("No reader available");
        }
 
        setIsLoading(false);
 
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
 
          const chunk = decoder.decode(value, { stream: true });
          setSummary((prev) => prev + chunk);
        }
      } catch (error) {
        console.error("Stream error:", error);
        setError("Unable to generate summary. Please try again.");
        setIsLoading(false);
      }
    }
 
    // Guard to avoid duplicate fetch in dev Strict Mode
    if (didRunRef.current) return;
    didRunRef.current = true;
    fetchStream();
  }, [product.slug]);
 
  return (
    <Card className="w-full max-w-prose p-10 grid gap-10">
      <CardHeader className="items-center space-y-0 gap-4 p-0">
        <div className="grid gap-1 text-center">
          <CardTitle className="text-lg">AI Summary</CardTitle>
          <p className="text-xs text-muted-foreground">
            Based on {product.reviews.length} customer ratings
          </p>
        </div>
        <div className="bg-gray-100 px-3 rounded-full flex items-center py-2 dark:bg-gray-800">
          <FiveStarRating rating={Math.round(averageRating)} />
          <span className="text-sm ml-4 text-gray-500 dark:text-gray-400">
            {averageRating.toFixed(1)} out of 5
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 grid gap-4">
        <div className="min-h-[4rem]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm leading-loose text-gray-500 dark:text-gray-400">{summary}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={() => {
              didRunRef.current = false;
              // trigger fetch again
              setSummary("");
              setIsLoading(true);
              setError(null);
              // Abort any ongoing request before refetching
              abortControllerRef.current?.abort();
              // Re-run effect body manually
              (async () => {
                try {
                  const controller = new AbortController();
                  abortControllerRef.current = controller;
                  const response = await fetch(`/api/summary/${product.slug}`, {
                    signal: controller.signal,
                    cache: "no-store",
                  });
                  if (!response.ok) throw new Error("Failed to fetch summary");
                  const reader = response.body?.getReader();
                  const decoder = new TextDecoder();
                  if (!reader) throw new Error("No reader available");
                  setIsLoading(false);
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    setSummary((prev) => prev + chunk);
                  }
                } catch (err) {
                  console.error("Stream error:", err);
                  setError("Unable to generate summary. Please try again.");
                  setIsLoading(false);
                }
              })();
            }}
          >
            Regenerate
          </button>
        </div>
      </CardContent>
    </Card>
  );
}