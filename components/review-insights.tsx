import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";
import { getReviewInsights } from "@/lib/ai-summary";
 
export async function ReviewInsights({ product }: { product: Product }) {
  let insights;
  try {
    insights = await getReviewInsights(product);
  } catch (error) {
    console.error("AI insights failed:", error);
    return null; // Silently fail - summary is more important
  }
 
  return (
    <Card className="w-full max-w-prose">
      <CardHeader>
        <CardTitle className="text-lg">Key Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pros and Cons Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pros */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-green-700 dark:text-green-400">
              Pros
            </h3>
            <ul className="space-y-2">
              {insights.pros.map((pro, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Cons */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-red-700 dark:text-red-400">
              Cons
            </h3>
            <ul className="space-y-2">
              {insights.cons.map((con, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✗</span>
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
 
        {/* Themes */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Key Themes</h3>
          <div className="flex flex-wrap gap-2">
            {insights.themes.map((theme, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}