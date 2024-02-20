import { AuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/libs/prismadb"
import { compare } from "bcrypt";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000, // wait for response time, because the local environment often login timeout, so change this configuration
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000, // wait for response time, because the local environment often login timeout, so change this configuration
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) {
          throw new Error("Missing username or password");
        }
        const user = await prisma.user.findUnique({
          where: {
            email: email
          },
        });
        // if user doesn't exist or password doesn't match
        if (!user || !(await compare(password, user.hashedPassword!))) {
          throw new Error("Invalid username or password");
        }
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV !== "development",
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) { 
      if (url.startsWith('/api/auth/signout')) {
        console.log(
          "Signout redirect initiated. Will go to URL:",
          url
        );
      }
      return 'http://localhost:3000';
      return baseUrl; // Or a modified redirect if needed
    },
    async jwt({ token, user, account, profile, isNewUser }) {
        if (user) {
          token.id = user.id;
        }
        if (account) {
          token.provider = account.provider;
          token.accessToken = account.access_token;
        }
        return ({ ...token, ...user });
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        session.user.favoriteIds = token.favoriteIds;
        session.user.accessToken = token.accessToken;
        session.user.provider = token.provider;
      }
      return session;
    }
  }
};
