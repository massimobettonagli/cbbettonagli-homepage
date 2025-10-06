import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 1800,         // ⏱️ 30 minuti in secondi
    updateAge: 300,       // 🔁 aggiorna il token ogni 5 minuti se attivo
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],

  callbacks: {
  async jwt({ token, user }) {
    if (user && user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.name = dbUser.name || ""; // <-- fallback
        token.email = dbUser.email || ""; // <-- fallback
        token.isAdmin = dbUser.isAdmin;
      }
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user && token) {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      (session.user as any).isAdmin = token.isAdmin;
    }

    return session;
  },

  async redirect({ url, baseUrl }) {
    return `${baseUrl}/dashboard-redirect`;
  },
},
  pages: {
    signIn: "/login",
  },
};