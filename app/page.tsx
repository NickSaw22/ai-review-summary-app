import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiveStarRating } from "@/components/five-star-rating";
import { getProductsCombined } from "@/lib/products";
import type { Product } from "@/lib/types";

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

function ProductsShell({ searchParamsPromise }: { searchParamsPromise: Promise<{ page?: string; q?: string }> }) {
  const sp = React.use(searchParamsPromise);
  const page = Number(sp?.page ?? "1");
  const q = sp?.q ? String(sp.q) : "";
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-bold">Products</h1>
        <div className="text-sm text-muted-foreground">Page {currentPage}</div>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button type="submit" className="px-3 py-2 rounded bg-primary text-primary-foreground">Search</button>
      </form>

      <Suspense
        fallback={
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 border rounded bg-muted/40 animate-pulse" />
            ))}
          </div>
        }
      >
        <ProductsContent currentPage={currentPage} search={q} />
      </Suspense>

      <div className="flex items-center justify-between pt-4">
          <Link
            href={currentPage > 1 ? `/?page=${currentPage - 1}&q=${encodeURIComponent(q)}` : `/?page=1&q=${encodeURIComponent(q)}`}
            aria-disabled={currentPage <= 1}
            className={`px-3 py-1 rounded border ${currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
          >
            Previous
          </Link>
          <Link href={`/?page=${currentPage + 1}&q=${encodeURIComponent(q)}`} className="px-3 py-1 rounded border">
            Next
          </Link>
      </div>
    </div>
  );
}

async function ProductsContent({ currentPage, search }: { currentPage: number; search: string }) {
  const products = await getProductsCombined(currentPage, undefined, search);
  console.log("Products loaded:", products.length, "page:", currentPage);

  function displayRating(p: Product) {
    if (Number.isFinite(p.customerReviewAverage)) return Math.round(p.customerReviewAverage ?? 0);
    const reviews: { stars: number }[] = Array.isArray(p.reviews) ? p.reviews : [];
    if (reviews.length === 0) return 0;
    const avg = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
    return Math.round(avg);
  }

  function priceLabel(p: Product) {
    const sale = Number.isFinite(p.salePrice) ? p.salePrice : undefined;
    const regular = Number.isFinite(p.regularPrice) ? p.regularPrice : undefined;
    const onSale = Boolean(p.onSale) && sale !== undefined;
    if (onSale && regular) {
      return `$${sale!.toFixed(2)} (was $${regular.toFixed(2)})`;
    }
    if (sale !== undefined) return `$${sale.toFixed(2)}`;
    if (regular !== undefined) return `$${regular.toFixed(2)}`;
    return "Price unavailable";
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <Card
          key={product.slug}
          className="hover:border-primary hover-lift transition-colors animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Link href={`/${product.slug}`} className="block">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 shrink-0 rounded border bg-muted overflow-hidden">
                  {product.thumbnailImage || product.image ? (
                    <Image
                      src={(product.thumbnailImage || product.image) as string}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">No Image</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                    <div className="text-right">
                      <div className="font-semibold">{priceLabel(product)}</div>
                      {product.percentSavings ? (
                        <div className="text-xs text-green-600">Save {product.percentSavings}%</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiveStarRating rating={displayRating(product)} />
                    <span className="text-sm text-muted-foreground">
                      {(product.customerReviewCount ?? product.reviews.length) || 0} reviews
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.shortDescription || product.longDescription || product.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {product.onSale ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700">On Sale</span>
                    ) : null}
                    {product.onlineAvailability ? (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">Online</span>
                    ) : null}
                    {product.inStoreAvailability ? (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">In Store</span>
                    ) : null}
                    {product.condition ? (
                      <span className="px-2 py-1 rounded border">{product.condition}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {product.manufacturer ? <span>By {product.manufacturer}</span> : null}
                    {product.modelNumber ? <span>Model {product.modelNumber}</span> : null}
                    {product.sku ? <span>SKU {product.sku}</span> : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
          <CardHeader className="pt-0">
            <div className="flex items-center justify-between">
              <Link href={`/${product.slug}`} className="text-sm text-primary hover:underline">View details</Link>
              {product.addToCartUrl ? (
                <a
                  href={product.addToCartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground"
                >
                  Add to Cart
                </a>
              ) : null}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default function Home({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-28 border rounded bg-muted/40 animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <ProductsShell searchParamsPromise={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}