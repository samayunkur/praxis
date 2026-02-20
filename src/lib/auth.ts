import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Praxis Login",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string)?.trim();
        if (!username) return null;
        let user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              username,
              name: username,
              email: `${username}@praxis.app`,
            },
          });
        }
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { username: true },
        });
        (session.user as any).username = dbUser?.username ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
