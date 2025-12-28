import { z } from "zod";
 
// Review schema
export const ReviewSchema = z.object({
  reviewer: z.string(),
  stars: z.number().min(1).max(5),
  review: z.string(),
  date: z.string(),
});
 
// Product schema
export const ProductSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  reviews: z.array(ReviewSchema),
});
 
// Infer TypeScript types
export type Review = z.infer<typeof ReviewSchema>;
export type Product = z.infer<typeof ProductSchema>;
 
// Review insights schema
export const ReviewInsightsSchema = z.object({
  pros: z.array(z.string()).describe("Positive aspects mentioned in reviews"),
  cons: z.array(z.string()).describe("Negative aspects or concerns"),
  themes: z.array(z.string()).describe("Key themes across all reviews"),
});
 
export type ReviewInsights = z.infer<typeof ReviewInsightsSchema>;