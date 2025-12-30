import { revalidateTag } from "next/cache";
import { getProducts } from "@/lib/products";
import { getRateLimitStats, resetRateLimit } from "@/lib/rate-limit";
import AdminSignOut from "@/components/admin-signout";

export default function AdminPage() {
  const products = getProducts();
  const limiterStats = getRateLimitStats();

  async function revalidateProductTags(formData: FormData) {
    "use server";
    const slug = String(formData.get("slug") || "");
    if (!slug) return;
    revalidateTag(`product-summary-${slug}`, "max");
    revalidateTag(`product-insights-${slug}`, "max");
  }

  async function revalidateAllTags() {
    "use server";
    const products = getProducts();
    for (const p of products) {
      revalidateTag(`product-summary-${p.slug}`, "max");
      revalidateTag(`product-insights-${p.slug}`, "max");
    }
  }

  async function resetLimiter(formData: FormData) {
    "use server";
    const key = String(formData.get("key") || "");
    resetRateLimit(key || undefined);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Tools</h1>
          <AdminSignOut />
        </div>

        {/* Cache tag revalidation */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Cache Management</h2>
          <form action={revalidateProductTags} className="flex items-center gap-3">
            <label className="text-sm">Product</label>
            <select name="slug" className="text-sm border rounded px-2 py-1 bg-transparent">
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            <button type="submit" className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900">
              Revalidate Tags
            </button>
          </form>
          <form action={revalidateAllTags}>
            <button type="submit" className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900">
              Revalidate All Product Tags
            </button>
          </form>
        </section>

        {/* Rate limiter */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Rate Limiter</h2>
          <div className="grid gap-2">
            {limiterStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No limiter entries yet.</p>
            ) : (
              limiterStats.map((s) => (
                <div key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.key}</span>
                  <span>{s.count} hits</span>
                </div>
              ))
            )}
          </div>
          <form action={resetLimiter} className="flex items-center gap-3">
            <input
              name="key"
              placeholder="Limiter key (optional)"
              className="text-sm border rounded px-2 py-1 bg-transparent w-64"
            />
            <button type="submit" className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900">
              Reset Limiter
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
