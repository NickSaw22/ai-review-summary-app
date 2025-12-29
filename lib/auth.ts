import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Admin Token",
      credentials: {
        token: { label: "Token", type: "password" },
      },
      async authorize(credentials) {
        const expected = process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD;
        const provided = credentials?.token as string | undefined;
        if (expected && provided && provided === expected) {
          return { id: "admin", name: "Admin" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  // NEXTAUTH_SECRET must be set in env for JWT
  secret: process.env.NEXTAUTH_SECRET,
};
