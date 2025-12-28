import { getProduct } from "@/lib/sample-data";
import { streamRecommendations } from "@/lib/ai-summary";
import { rateLimit, getClientKeyFromRequest } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const historyCsv = url.searchParams.get("history") || "";
  const slugs = historyCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) {
    return new Response("No history provided", { status: 400 });
  }

  const clientKey = getClientKeyFromRequest(request);
  const limit = rateLimit(`${clientKey}:recommendations`, 6, 60_000);
  if (!limit.ok) {
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter ?? 60) },
    });
  }

  let historyProducts;
  try {
    historyProducts = slugs.map((slug) => getProduct(slug));
  } catch {
    return new Response("Product not found in history", { status: 404 });
  }

  const result = await streamRecommendations(historyProducts);
  return result.toTextStreamResponse();
}
