import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { connectDB } from "./lib/mongodb";
import { User } from "./models/User";

// --- TypeScript Module Augmentation ---
// This tells TypeScript that our session and token objects have an 'id' property
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
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
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

    // 1. JWT Callback (Fires when the token is created or updated)
    async jwt({ token, user }) {
      // The 'user' parameter is only populated on the initial sign-in.
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        
        if (dbUser) {
          // Attach the MongoDB _id to the JWT
          token.id = dbUser._id.toString(); 
        }
      }
      return token;
    },

    // 2. Session Callback (Fires whenever the session is checked)
    async session({ session, token }) {
      // No more database queries here! We just read the ID from the token.
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});