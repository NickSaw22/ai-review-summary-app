"use client";
import { signOut } from "next-auth/react";

export default function AdminSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="px-3 py-1.5 text-xs rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
    >
      Sign Out
    </button>
  );
}
