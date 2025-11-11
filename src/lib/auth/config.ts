import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // L'URL de callback par défaut est : {NEXTAUTH_URL}/api/auth/callback/google
      // Assurez-vous que cette URL est configurée dans Google Cloud Console
    }),
    // Note: Email provider nécessite un adaptateur dans NextAuth v5
    // Pour l'activer, il faut configurer un adaptateur MongoDB
    // Pour l'instant, seul Google est activé
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name || "",
            image: user.image,
            provider: account?.provider === "google" ? "google" : "email",
            providerId: account?.providerAccountId,
            role: "user",
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          (session.user as any).id = user._id.toString();
          (session.user as any).role = user.role;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
