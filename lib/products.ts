import { Product } from "./types";
import { getProduct as getSampleProduct, getProducts as getSampleProducts } from "./sample-data";
import { bestBuyProvider } from "./providers/bestbuy";

function getProvider() {
  const source = process.env.PRODUCTS_DATA_SOURCE?.toLowerCase();
  if (source === "bestbuy" && process.env.BESTBUY_API_KEY) {
    const skus = (process.env.BESTBUY_SKUS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const search = process.env.BESTBUY_QUERY || undefined;
    const pageSizeRaw = process.env.BESTBUY_PAGE_SIZE || "9";
    const pageSize = Number.parseInt(pageSizeRaw, 10);
    return bestBuyProvider(String(process.env.BESTBUY_API_KEY), {
      skus: skus.length ? skus : undefined,
      search,
      pageSize: Number.isFinite(pageSize) ? pageSize : 9,
    });
  }
  return null;
}

export function getProducts(): Product[] {
  // Synchronous sample listing for backwards compatibility
  return getSampleProducts();
}

function mergeProducts(primary: Product[], fallback: Product[]): Product[] {
  const bySlug = new Map<string, Product>();
  for (const p of fallback) bySlug.set(p.slug, p);
  for (const p of primary) bySlug.set(p.slug, p);
  console.log(`Merged ${bySlug.size} products`);
  return Array.from(bySlug.values());
}

export async function getProductsCombined(page?: number, pageSize?: number, search?: string): Promise<Product[]> {
  const provider = getProvider();
  const sample = getSampleProducts();
  console.log(`Loaded ${sample.length} sample products`);
  console.log("Fetching products from provider if available...", provider ? "yes" : "no");
  if (provider && typeof provider.getProducts === "function") {
    console.log("Fetching products from provider...");
    try {
      const remote = await provider.getProducts(page, pageSize, search);
      console.log(`Fetched ${remote.length} products from provider`);
      // If paginating, return only remote page to respect pagination
      if (Number.isFinite(page as number)) {
        return remote.length ? remote : sample;
      }
      // Otherwise merge to enrich with sample
      return mergeProducts(remote, sample);
    } catch {
      // If provider listing fails, fall back to sample
    }
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    return sample.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  return sample;
}

// Convenience alias for callers who want the combined list
export async function getAllProducts(): Promise<Product[]> {
  return getProductsCombined();
}

export async function getProduct(slug: string): Promise<Product> {
  const provider = getProvider();
  if (provider) {
    try {
      const p = await provider.getProduct(slug);
      // Always return provider product if available, even without reviews
      return p;
    } catch {}
  }
  return getSampleProduct(slug);
}
