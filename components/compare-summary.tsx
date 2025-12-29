"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";

export function CompareSummary({
  current,
  products,
}: {
  current: Product;
  products: Product[];
}) {
  const [otherSlug, setOtherSlug] = useState<string>("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const options = useMemo(
    () => products.filter((p) => p.slug !== current.slug),
    [products, current.slug]
  );

  useEffect(() => {
    if (options.length && !otherSlug) {
      setOtherSlug(options[0].slug);
    }
  }, [options, otherSlug]);

  async function runCompare() {
    if (!otherSlug) return;
    setIsLoading(true);
    setError(null);
    setText("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`/api/compare?x=${current.slug}&y=${otherSlug}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch comparison");

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
      console.error("Compare stream error:", err);
      setError("Unable to generate comparison. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-prose p-10 grid gap-6">
      <CardHeader className="items-center space-y-0 gap-4 p-0">
        <div className="grid gap-1 text-center">
          <CardTitle className="text-lg">Product Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">
            Compare {current.name} with another product
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0 grid gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm">Compare with</label>
          <select
            className="text-sm border rounded px-2 py-1 bg-transparent"
            value={otherSlug}
            onChange={(e) => setOtherSlug(e.target.value)}
          >
            {options.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={runCompare}
          >
            Compare
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
            <p className="text-sm leading-loose text-gray-500 dark:text-gray-400">{text}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Select a product and click Compare.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
