"use client";

import { useEffect } from "react";

export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const key = "viewedProducts";
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const set = new Set<string>(Array.isArray(arr) ? arr : []);
      set.add(slug);
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {
      // ignore storage errors
    }
  }, [slug]);

  return null;
}
