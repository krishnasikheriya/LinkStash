import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { connectDB } from "./lib/mongodb";
import { User } from "./models/User";


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      // Check if user exists in the database
      const existingUser = await User.findOne({ email: user.email });

      // If they don't exist, create a new record
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

    async session({ session, token }) {
      await connectDB();
      
      // Fetch the MongoDB user to get the _id
      if (session.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email });
        
        if (dbUser) {
          // Append the MongoDB user ID to the session object
          session.user.id = dbUser._id.toString();
        }
      }

      return session;
    }
  }
})