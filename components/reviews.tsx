import { Product } from "@/lib/types";
import { Review } from "./review";
import { Separator } from "./ui/separator";
 
export function Reviews({ product }: { product: Product }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>
 
      <div className="space-y-6">
        {product.reviews.map((review, index) => (
          <div key={index}>
            <Review review={review} />
            {index < product.reviews.length - 1 && (
              <Separator className="mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}