import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { encryptToken } from "./encryption";
import prisma from "@/lib/prisma";

const customAdapter = {
  ...PrismaAdapter(prisma),
  linkAccount: async (account: any) => {
    // Encrypt the tokens before saving to DB
    if (account.access_token) {
      account.access_token = encryptToken(account.access_token);
    }
    if (account.refresh_token) {
      account.refresh_token = encryptToken(account.refresh_token);
    }
    
    // Prisma throws if we pass unknown fields, and Google recently started
    // returning refresh_token_expires_in which isn't in our schema
    delete account.refresh_token_expires_in;
    
    return PrismaAdapter(prisma).linkAccount!(account);
  }
} as any;

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt" // We use JWT for fast session checks
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};
