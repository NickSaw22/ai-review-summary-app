import { streamReviewSummary } from "@/lib/ai-summary";
import { getProduct } from "@/lib/sample-data";
 
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
 
  let product;
  try {
    product = getProduct(slug);
  } catch {
    return new Response("Product not found", { status: 404 });
  }
 
  const result = await streamReviewSummary(product);
 
  return result.toTextStreamResponse();
}