import Link from "next/link";
 
export default function NotFound() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground">
          The product you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Back to Products
        </Link>
      </div>
    </main>
  );
}