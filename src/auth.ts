import NextAuth, { DefaultSession } from "next-auth";
import { connectDB } from "./lib/mongodb";
import { User } from "./models/User";
import { authConfig } from "./auth.config";

// --- TypeScript Module Augmentation ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          provider: account?.provider,
          providerId: account?.providerAccountId,
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        
        if (dbUser) {
          token.id = dbUser._id.toString(); 
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});