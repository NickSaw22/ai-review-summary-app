import { streamReviewSummary } from "@/lib/ai-summary";
import { getProduct } from "@/lib/products";
import { rateLimit, getClientKeyFromRequest } from "@/lib/rate-limit";
 
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Basic per-IP rate limiting to protect the endpoint
  const clientKey = getClientKeyFromRequest(request);
  const limit = rateLimit(`${clientKey}:${slug}`, 10, 60_000);
  if (!limit.ok) {
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: {
        "Retry-After": String(limit.retryAfter ?? 60),
      },
    });
  }
 
  let product;
  try {
    product = await getProduct(slug);
  } catch {
    return new Response("Product not found", { status: 404 });
  }
 
  const result = await streamReviewSummary(product);
 
  return result.toTextStreamResponse();
}