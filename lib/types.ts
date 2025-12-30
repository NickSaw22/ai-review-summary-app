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
  // Optional BestBuy product attributes to enhance UI
  image: z.string().optional(),
  thumbnailImage: z.string().optional(),
  regularPrice: z.number().optional(),
  salePrice: z.number().optional(),
  onSale: z.boolean().optional(),
  percentSavings: z.number().optional(),
  dollarSavings: z.number().optional(),
  condition: z.string().optional(),
  customerReviewAverage: z.number().optional(),
  customerReviewCount: z.number().optional(),
  onlineAvailability: z.boolean().optional(),
  onlineAvailabilityText: z.string().optional(),
  inStoreAvailability: z.boolean().optional(),
  inStoreAvailabilityText: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  sku: z.string().optional(),
  type: z.string().optional(),
  upc: z.string().optional(),
  url: z.string().optional(),
  mobileUrl: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  addToCartUrl: z.string().optional(),
  color: z.string().optional(),
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