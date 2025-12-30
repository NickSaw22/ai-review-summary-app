import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { getProduct, getProducts } from "@/lib/products";
import { Product } from "@/lib/types";
import { Reviews } from "@/components/reviews";
import { StreamingSummary } from "@/components/streaming-summary";
import { CompareSummary } from "@/components/compare-summary";
import { ReviewInsights } from "@/components/review-insights";
import { SentimentTrend } from "@/components/sentiment-trend";
import { Recommendations } from "@/components/recommendations";
import { TrackView } from "@/components/track-view";

function priceLabel(p: Product) {
  const sale = Number.isFinite(p.salePrice) ? p.salePrice : undefined;
  const regular = Number.isFinite(p.regularPrice) ? p.regularPrice : undefined;
  const onSale = Boolean(p.onSale) && sale !== undefined;
  if (onSale && regular) return `$${sale!.toFixed(2)} (was $${regular.toFixed(2)})`;
  if (sale !== undefined) return `$${sale.toFixed(2)}`;
  if (regular !== undefined) return `$${regular.toFixed(2)}`;
  return "";
}

async function ProductContent({ productId }: { productId: string }) {
  let product: Product | null = null;
  try {
    product = await getProduct(productId);
  } catch {}
  if (!product) {
    return notFound();
  }

  return (
    <main className="min-h-screen p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="lg:col-span-8">
            <TrackView slug={product.slug} />
            <h1 className="text-4xl font-bold leading-tight">{product.name}</h1>
            <p className="text-lg text-muted-foreground mt-3">{product.shortDescription || product.longDescription || product.description}</p>
            <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
              {product.manufacturer ? <span className="px-2 py-1 rounded border">{product.manufacturer}</span> : null}
              {product.modelNumber ? <span className="px-2 py-1 rounded border">Model {product.modelNumber}</span> : null}
              {product.sku ? <span className="px-2 py-1 rounded border">SKU {product.sku}</span> : null}
              {product.color ? <span className="px-2 py-1 rounded border">{product.color}</span> : null}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-lg border bg-card p-4 grid place-items-center">
              {product.image || product.thumbnailImage ? (
                <Image
                  src={(product.image || product.thumbnailImage) as string}
                  alt={product.name}
                  width={256}
                  height={256}
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="h-40 w-full grid place-items-center text-sm text-muted-foreground">No Image</div>
              )}
              <div className="w-full mt-4 flex items-center justify-between">
                <div className="text-xl font-semibold">{priceLabel(product)}</div>
                <div className="flex gap-2 text-xs">
                  {product.onSale ? <span className="px-2 py-1 rounded bg-green-100 text-green-700">On Sale</span> : null}
                  {product.onlineAvailability ? <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">Online</span> : null}
                  {product.inStoreAvailability ? <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">In Store</span> : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <ReviewInsights product={product} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
              <Reviews product={product} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
              <CompareSummary current={product} products={getProducts()} />
            </div>
          </div>
          {/* Right column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <Recommendations />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
              <StreamingSummary product={product} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
              <SentimentTrend product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ParamsGate({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  return <ProductContent productId={productId} />;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-screen p-6 lg:p-10"><div className="max-w-6xl mx-auto">Loading…</div></main>}>
      {/* Fetch product within Suspense to avoid route blocking */}
      <ParamsGate params={params} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const products = getProducts();
  return products.map((product) => ({
    productId: product.slug,
  }));
}
 
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  try {
    const product = await getProduct(productId);
    return {
      title: `${product.name} - Customer Reviews`,
      description: product.description,
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}