import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiveStarRating } from "@/components/five-star-rating";
import { getProducts } from "@/lib/sample-data";
 
export default function Home() {
  const products = getProducts();
 
  function averageRating(reviews: { stars: number }[]) {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
  }
 
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Product Reviews</h1>
 
        <div className="grid gap-4">
          {products.map((product) => (
            <Link key={product.slug} href={`/${product.slug}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <FiveStarRating rating={Math.round(averageRating(product.reviews))} />
                    <span className="text-sm text-muted-foreground">
                      {product.reviews.length} reviews
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}