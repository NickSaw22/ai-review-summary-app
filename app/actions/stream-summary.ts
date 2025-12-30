"use server";
 
import { streamReviewSummary } from "@/lib/ai-summary";
import { getProduct } from "@/lib/products";
 
export async function getStreamingSummary(productSlug: string) {
  const product = getProduct(productSlug);
  const result = await streamReviewSummary(product);
  return result.toTextStreamResponse();
}