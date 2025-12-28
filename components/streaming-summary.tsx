"use client";
 
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiveStarRating } from "./five-star-rating";
import { Product } from "@/lib/types";
 
export function StreamingSummary({ product }: { product: Product }) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
 
  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.stars, 0) /
    product.reviews.length;
 
  useEffect(() => {
    async function fetchStream() {
      setIsLoading(true);
      setSummary("");
 
      try {
        const response = await fetch(`/api/summary/${product.slug}`);
 
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
        setSummary("Unable to generate summary. Please try again.");
        setIsLoading(false);
      }
    }
 
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
        <p className="text-sm leading-loose text-gray-500 dark:text-gray-400 min-h-[4rem]">
          {isLoading ? (
            <span className="animate-pulse">Generating summary...</span>
          ) : (
            summary
          )}
        </p>
      </CardContent>
    </Card>
  );
}