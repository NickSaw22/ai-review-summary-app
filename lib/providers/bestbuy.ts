import type { Product, Review } from "../types";
import type { ProductProvider } from "./types";

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`BestBuy API error: ${res.status}`);
  return res.json() as Promise<unknown>;
}

type Options = {
  skus?: string[];
  search?: string;
  pageSize?: number;
};

// Minimal Best Buy response types
type BestBuyReviewItem = {
  userNickname?: string;
  nickName?: string;
  reviewer?: string;
  userNicknameText?: string;
  rating?: number;
  comment?: string;
  text?: string;
  title?: string;
  submissionTime?: string;
  date?: string;
  [key: string]: unknown;
};

type BestBuyReviewsResponse = {
  reviews?: BestBuyReviewItem[];
};

type BestBuyProductItem = {
  sku?: string | number;
  modelNumber?: string;
  upc?: string;
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  image?: string;
  thumbnailImage?: string;
  regularPrice?: number | string;
  salePrice?: number | string;
  onSale?: boolean;
  percentSavings?: number | string;
  dollarSavings?: number | string;
  condition?: string;
  customerReviewAverage?: number | string;
  customerReviewCount?: number | string;
  onlineAvailability?: boolean;
  onlineAvailabilityText?: string;
  inStoreAvailability?: boolean;
  inStoreAvailabilityText?: string;
  manufacturer?: string;
  type?: string;
  url?: string;
  mobileUrl?: string;
  addToCartUrl?: string;
  color?: string;
  [key: string]: unknown;
};

type BestBuyProductsResponse = {
  products?: BestBuyProductItem[];
};

// Fetch and map Best Buy reviews to existing Review type
async function fetchBestBuyReviews(apiKey: string, sku: string, pageSize = 5): Promise<Review[]> {
  const base = "https://api.bestbuy.com/v1";
  try {
    const data = (await fetchJson(
      `${base}/reviews(sku=${encodeURIComponent(sku)})?apiKey=${apiKey}&format=json&pageSize=${pageSize}`
    )) as BestBuyReviewsResponse;
    const items: BestBuyReviewItem[] = Array.isArray(data.reviews) ? data.reviews! : [];
    const clamp = (n: number) => Math.max(1, Math.min(5, n));
    const pickString = (...candidates: unknown[]): string => {
      for (const c of candidates) {
        if (typeof c === "string" && c.trim()) return c.trim();
        if (c && typeof c === "object") {
          const keys = ["displayName", "name", "nickname", "userNickname", "title", "text", "comment"];
          for (const k of keys) {
            const v = (c as Record<string, unknown>)[k];
            if (typeof v === "string" && v.trim()) return v.trim();
          }
        }
      }
      return "";
    };

    return items.map((r: BestBuyReviewItem): Review => ({
      reviewer: pickString(r.userNickname, r.nickName, r.reviewer, r.userNicknameText) || "Anonymous",
      stars: clamp(Number(r.rating ?? 0) || 1),
      review: pickString(r.comment, r.text, r.title) || "",
      date: pickString(r.submissionTime, r.date) || "",
    }));
  } catch {
    return [];
  }
}

export function bestBuyProvider(apiKey: string, options?: Options): ProductProvider {
  return {
    async getProduct(sku: string): Promise<Product> {
      const base = "https://api.bestbuy.com/v1";
      const productData = (await fetchJson(
        `${base}/products(sku=${encodeURIComponent(sku)})?apiKey=${apiKey}&format=json`
      )) as BestBuyProductsResponse;

      const item = Array.isArray(productData.products)
        ? productData.products[0]
        : undefined;
      if (!item) throw new Error("Product not found");

      const p: Product = {
        slug: String(sku),
        name: String(item.name || sku),
        description: String(item.shortDescription || item.longDescription || ""),
        reviews: [],
        image: item.image ? String(item.image) : undefined,
        thumbnailImage: item.thumbnailImage ? String(item.thumbnailImage) : undefined,
        regularPrice: Number.isFinite(Number(item.regularPrice)) ? Number(item.regularPrice) : undefined,
        salePrice: Number.isFinite(Number(item.salePrice)) ? Number(item.salePrice) : undefined,
        onSale: Boolean(item.onSale),
        percentSavings: Number.isFinite(Number(item.percentSavings)) ? Number(item.percentSavings) : undefined,
        dollarSavings: Number.isFinite(Number(item.dollarSavings)) ? Number(item.dollarSavings) : undefined,
        condition: item.condition ? String(item.condition) : undefined,
        customerReviewAverage: Number.isFinite(Number(item.customerReviewAverage)) ? Number(item.customerReviewAverage) : undefined,
        customerReviewCount: Number.isFinite(Number(item.customerReviewCount)) ? Number(item.customerReviewCount) : undefined,
        onlineAvailability: Boolean(item.onlineAvailability),
        onlineAvailabilityText: item.onlineAvailabilityText ? String(item.onlineAvailabilityText) : undefined,
        inStoreAvailability: Boolean(item.inStoreAvailability),
        inStoreAvailabilityText: item.inStoreAvailabilityText ? String(item.inStoreAvailabilityText) : undefined,
        manufacturer: item.manufacturer ? String(item.manufacturer) : undefined,
        modelNumber: item.modelNumber ? String(item.modelNumber) : undefined,
        sku: item.sku ? String(item.sku) : undefined,
        type: item.type ? String(item.type) : undefined,
        upc: item.upc ? String(item.upc) : undefined,
        url: item.url ? String(item.url) : undefined,
        mobileUrl: item.mobileUrl ? String(item.mobileUrl) : undefined,
        shortDescription: item.shortDescription ? String(item.shortDescription) : undefined,
        longDescription: item.longDescription ? String(item.longDescription) : undefined,
        addToCartUrl: item.addToCartUrl ? String(item.addToCartUrl) : undefined,
        color: item.color ? String(item.color) : undefined,
      };
      const reviews = await fetchBestBuyReviews(apiKey, sku, 5);
      return { ...p, reviews };
    },
    async getProducts(page?: number, pageSizeOverride?: number, searchOverride?: string): Promise<Product[]> {
      const base = "https://api.bestbuy.com/v1";
      const out: Product[] = [];
      const mapItem = (item: BestBuyProductItem): Product => ({
        slug: String(item.sku ?? item.modelNumber ?? item.upc ?? Math.random().toString(36).slice(2)),
        name: String(item.name || "Unnamed Product"),
        description: String(item.shortDescription || item.longDescription || ""),
        reviews: [],
        image: item.image ? String(item.image) : undefined,
        thumbnailImage: item.thumbnailImage ? String(item.thumbnailImage) : undefined,
        regularPrice: Number.isFinite(Number(item.regularPrice)) ? Number(item.regularPrice) : undefined,
        salePrice: Number.isFinite(Number(item.salePrice)) ? Number(item.salePrice) : undefined,
        onSale: Boolean(item.onSale),
        percentSavings: Number.isFinite(Number(item.percentSavings)) ? Number(item.percentSavings) : undefined,
        dollarSavings: Number.isFinite(Number(item.dollarSavings)) ? Number(item.dollarSavings) : undefined,
        condition: item.condition ? String(item.condition) : undefined,
        customerReviewAverage: Number.isFinite(Number(item.customerReviewAverage)) ? Number(item.customerReviewAverage) : undefined,
        customerReviewCount: Number.isFinite(Number(item.customerReviewCount)) ? Number(item.customerReviewCount) : undefined,
        onlineAvailability: Boolean(item.onlineAvailability),
        onlineAvailabilityText: item.onlineAvailabilityText ? String(item.onlineAvailabilityText) : undefined,
        inStoreAvailability: Boolean(item.inStoreAvailability),
        inStoreAvailabilityText: item.inStoreAvailabilityText ? String(item.inStoreAvailabilityText) : undefined,
        manufacturer: item.manufacturer ? String(item.manufacturer) : undefined,
        modelNumber: item.modelNumber ? String(item.modelNumber) : undefined,
        sku: item.sku ? String(item.sku) : undefined,
        type: item.type ? String(item.type) : undefined,
        upc: item.upc ? String(item.upc) : undefined,
        url: item.url ? String(item.url) : undefined,
        mobileUrl: item.mobileUrl ? String(item.mobileUrl) : undefined,
        shortDescription: item.shortDescription ? String(item.shortDescription) : undefined,
        longDescription: item.longDescription ? String(item.longDescription) : undefined,
        addToCartUrl: item.addToCartUrl ? String(item.addToCartUrl) : undefined,
        color: item.color ? String(item.color) : undefined,
      });

      // If specific SKUs are provided, hydrate those first
      const skus = options?.skus?.filter(Boolean) ?? [];
      if (skus.length > 0) {
        const results = await Promise.all(
          skus.map(async (sku) => {
            try {
              const data = (await fetchJson(
                `${base}/products(sku=${encodeURIComponent(sku)})?apiKey=${apiKey}&format=json`
              )) as BestBuyProductsResponse;
              const item = Array.isArray(data.products) ? data.products![0] : undefined;
              return item ? mapItem(item) : null;
            } catch {
              return null;
            }
          })
        );
        out.push(...results.filter((p): p is Product => Boolean(p)));
      }

      // If a search query is provided, fetch a small page of results
      const q = (searchOverride ?? options?.search)?.trim();
      const pageSize = Number.isFinite(pageSizeOverride as number)
        ? Number(pageSizeOverride)
        : (Number.isFinite(options?.pageSize as number) ? Number(options?.pageSize) : 5);
      const pageNum = Number.isFinite(page as number) && Number(page) > 0 ? Number(page) : 1;
      if (q) {
        try {
          const url = `${base}/products(search=${encodeURIComponent(q)})?apiKey=${apiKey}&format=json&pageSize=${pageSize}&page=${pageNum}`;
          const data = (await fetchJson(url)) as BestBuyProductsResponse;
          const items: BestBuyProductItem[] = Array.isArray(data.products) ? data.products! : [];
          out.push(...items.map(mapItem));
        } catch {
          // ignore search failures
        }
      }
      else{
        // If no search query, fetch a general listing
        try {
          const url = `${base}/products?apiKey=${apiKey}&format=json&pageSize=${pageSize}&page=${pageNum}`;
          const data = (await fetchJson(url)) as BestBuyProductsResponse;
          const items: BestBuyProductItem[] = Array.isArray(data.products) ? data.products! : [];
          out.push(...items.map(mapItem));
        } catch {
          // ignore listing failures
        }
      }

      return out;
    },
  };
}
