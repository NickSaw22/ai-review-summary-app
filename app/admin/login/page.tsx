"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(formData: FormData) {
    const provided = String(formData.get("token") || "");
    setLoading(true);
    try {
      await signIn("credentials", {
        token: provided,
        redirect: true,
        callbackUrl: "/admin",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {!(process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD) ? (
          <p className="text-sm text-red-600">
            ADMIN_TOKEN not set. Define an environment variable ADMIN_TOKEN to enable admin access.
          </p>
        ) : null}
        <form action={onSubmit} className="grid gap-3">
          <label className="text-sm">Access Token</label>
          <input
            name="token"
            type="password"
            placeholder="Enter admin token"
            className="text-sm border rounded px-2 py-1 bg-transparent"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
