import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
import { SessionStrategy } from "next-auth";

interface CustomUser extends User {
  image?: string;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findFirst({ 
          where: { email: credentials.email } 
        });

        const isValid = await bcrypt.compare(
          credentials.password,
          user?.password || "$2a$10$abcdefghijklmnopqrstuv" 
        );

        if (!user || !user.password || !isValid) return null;
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    jwt: ({ token, user }: { token: JWT; user?: CustomUser }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? "";
        token.image = user.image ?? null;
      }
      return token;
    },
    session: ({ session, token }: { session: Session; token: JWT }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? "Guest";
        session.user.image = token.image as string | undefined;
      }
      return session;
    },
  },
};