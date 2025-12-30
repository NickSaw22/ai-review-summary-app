"use server";
 
import { streamReviewSummary } from "@/lib/ai-summary";
import { getProduct } from "@/lib/products";
 
export async function getStreamingSummary(productSlug: string) {
  const product = await getProduct(productSlug);
  const result = await streamReviewSummary(product);
  return result.toTextStreamResponse();
}