import { getProduct } from "@/lib/products";
import { streamComparison } from "@/lib/ai-summary";
import { rateLimit, getClientKeyFromRequest } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const x = url.searchParams.get("x");
  const y = url.searchParams.get("y");

  if (!x || !y) {
    return new Response("Missing x or y query params", { status: 400 });
  }

  // Basic rate limiting (per IP per pair)
  const clientKey = getClientKeyFromRequest(request);
  const limit = rateLimit(`${clientKey}:compare:${x}:${y}`, 8, 60_000);
  if (!limit.ok) {
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter ?? 60) },
    });
  }

  let a, b;
  try {
    [a, b] = await Promise.all([getProduct(x), getProduct(y)]);
  } catch {
    return new Response("Product not found", { status: 404 });
  }

  const result = await streamComparison(a, b);
  return result.toTextStreamResponse();
}
