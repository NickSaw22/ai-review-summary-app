"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";

type Point = { label: string; value: number };

export function SentimentTrend({ product }: { product: Product }) {
  const points: Point[] = useMemo(() => {
    const buckets = new Map<string, number[]>();
    for (const r of product.reviews) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const arr = buckets.get(key) ?? [];
      arr.push(r.stars);
      buckets.set(key, arr);
    }
    const entries = Array.from(buckets.entries())
      .map(([label, arr]) => ({ label, value: arr.reduce((a, b) => a + b, 0) / arr.length }))
      .sort((a, b) => (a.label < b.label ? -1 : 1));
    return entries;
  }, [product.reviews]);

  const maxVal = 5;
  const minVal = 1;
  const padding = 4;
  const w = Math.max(180, points.length * 40);
  const h = 60;
  const path = useMemo(() => {
    if (points.length === 0) return "";
    const stepX = (w - padding * 2) / Math.max(1, points.length - 1);
    const toY = (v: number) => {
      const t = (v - minVal) / (maxVal - minVal);
      return h - padding - t * (h - padding * 2);
    };
    const cmds: string[] = points.map((p, i) => {
      const x = padding + i * stepX;
      const y = toY(p.value);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return cmds.join(" ");
  }, [points]);

  return (
    <Card className="w-full max-w-prose p-6">
      <CardHeader className="p-0 mb-3">
        <CardTitle className="text-lg">Sentiment Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-0 grid gap-4">
        {points.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews available.</p>
        ) : (
          <div className="grid gap-3">
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                points={path.replace(/L/g, " ").replace(/M/g, " ")}
              />
            </svg>
            <div className="flex flex-wrap gap-4">
              {points.map((p) => (
                <div key={p.label} className="text-xs text-muted-foreground">
                  <span className="font-medium">{p.label}:</span> {p.value.toFixed(2)} / 5
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
