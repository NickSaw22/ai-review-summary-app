import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/sample-data";
import { Product } from "@/lib/types";
import { Reviews } from "@/components/reviews";
import { StreamingSummary } from "@/components/streaming-summary";
import { CompareSummary } from "@/components/compare-summary";
import { ReviewInsights } from "@/components/review-insights";
import { SentimentTrend } from "@/components/sentiment-trend";
import { Recommendations } from "@/components/recommendations";
import { TrackView } from "@/components/track-view";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
 
    let product: Product;
  try {
    product = await getProduct(productId);
  } catch (error) {
      return notFound();
  }
 
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <TrackView slug={product.slug} />
        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>

        <Recommendations />
          <p className="text-lg text-muted-foreground mt-2">
            {product.description}
          </p>
        </div>

        <StreamingSummary product={product} />
        <SentimentTrend product={product} />
        {/* Comparison */}
        <CompareSummary current={product} products={getProducts()} />
        <ReviewInsights product={product} />
        
        <Reviews product={product} />
      </div>
    </main>
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
 
  let product;
  try {
    product = getProduct(productId);
  } catch {
    return {
      title: "Product Not Found",
    };
  }
 
  return {
    title: `${product.name} - Customer Reviews`,
    description: product.description,
  };
}