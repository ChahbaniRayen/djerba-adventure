import { Adapter } from "next-auth/adapters";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

// Variable pour accéder à clientPromise dans getUserByEmail
let clientPromise: Promise<MongoClient>;

// Adapter personnalisé qui ignore Credentials pour éviter les conflits
// Credentials n'a pas besoin de l'adapter car il n'utilise pas de tokens
export function createCustomAdapter(
  clientPromiseParam: Promise<MongoClient>
): Adapter {
  clientPromise = clientPromiseParam;
  const baseAdapter = MongoDBAdapter(clientPromise);

  return {
    ...baseAdapter,
    async createUser(user) {
      if (!baseAdapter.createUser) {
        throw new Error("createUser method not available in base adapter");
      }
      // IMPORTANT: Avant de créer un utilisateur NextAuth, vérifier si un utilisateur
      // existe déjà dans notre modèle User Mongoose avec le même email
      // Si oui, ne pas créer d'utilisateur NextAuth pour éviter les conflits
      if (user.email) {
        try {
          const { connectDB } = await import("@/lib/mongodb");
          const User = (await import("@/lib/models/User")).default;
          await connectDB();

          const existingUser = await User.findOne({
            email: user.email.toLowerCase(),
          });

          if (existingUser) {
            // L'utilisateur existe déjà dans notre modèle User
            // Ne pas créer d'utilisateur NextAuth pour éviter les conflits
            // Retourner un utilisateur NextAuth minimal basé sur notre modèle User
            const db = (await clientPromise).db();
            const nextAuthUser = {
              id: existingUser._id.toString(),
              email: existingUser.email,
              name: existingUser.name,
              image: existingUser.image || null,
              emailVerified: existingUser.emailVerified || null,
            };

            // Vérifier si l'utilisateur NextAuth existe déjà
            const existingNextAuthUser = await db.collection("users").findOne({
              email: user.email.toLowerCase(),
            });

            if (existingNextAuthUser) {
              return existingNextAuthUser as any;
            }

            // Créer l'utilisateur NextAuth basé sur notre modèle User
            const result = await db.collection("users").insertOne(nextAuthUser);
            return {
              ...nextAuthUser,
              _id: result.insertedId,
            } as any;
          }
        } catch (error) {
          console.error(
            "[ADAPTER] Erreur lors de la vérification de l'utilisateur:",
            error
          );
        }
      }

      // Si l'utilisateur n'existe pas dans notre modèle User, créer normalement
      return baseAdapter.createUser(user);
    },
    async getUser(id) {
      if (!baseAdapter.getUser) {
        throw new Error("getUser method not available in base adapter");
      }
      return baseAdapter.getUser(id);
    },
    async getUserByEmail(email) {
      const db = (await clientPromise).db();

      // Nettoyer UNIQUEMENT les utilisateurs NextAuth qui causent des conflits
      // pour cet email spécifique, et seulement s'il n'y a pas de compte Google
      const nextAuthUser = await db.collection("users").findOne({
        email: email.toLowerCase(),
      });

      if (nextAuthUser) {
        // Vérifier s'il y a un compte Google
        const googleAccount = await db.collection("accounts").findOne({
          userId: nextAuthUser._id.toString(),
          provider: "google",
        });

        // Si pas de compte Google ET que l'utilisateur essaie de se connecter avec Google
        // Supprimer uniquement les entrées NextAuth pour cet email spécifique
        // Cela permet à NextAuth de créer un nouveau compte avec Google
        // IMPORTANT: Cela ne touche PAS au modèle User Mongoose (rôle admin, etc.)
        if (!googleAccount) {
          // Supprimer uniquement les comptes non-Google pour cet utilisateur
          await db.collection("accounts").deleteMany({
            userId: nextAuthUser._id.toString(),
            provider: { $ne: "google" }, // Ne pas supprimer les comptes Google
          });
          // Supprimer les sessions (elles seront recréées)
          await db.collection("sessions").deleteMany({
            userId: nextAuthUser._id.toString(),
          });
          // Supprimer les tokens de vérification pour cet email
          await db.collection("verification_tokens").deleteMany({
            identifier: email.toLowerCase(),
          });
          // Supprimer l'utilisateur NextAuth (mais PAS le modèle User Mongoose)
          await db.collection("users").deleteOne({
            _id: nextAuthUser._id,
          });
          // Retourner null pour permettre la création d'un nouveau compte NextAuth avec Google
          return null;
        }
      }

      // Maintenant, appeler l'adapter de base
      if (!baseAdapter.getUserByEmail) {
        return null;
      }
      const user = await baseAdapter.getUserByEmail(email);
      return user;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      // Pour Credentials, ne pas chercher dans NextAuth
      if (provider === "credentials") {
        return null;
      }

      // Pour Google, chercher directement le compte sans nettoyer
      // Le cleanup ne se fait que si nécessaire dans getUserByEmail
      if (!baseAdapter.getUserByAccount) {
        return null;
      }
      return baseAdapter.getUserByAccount({ providerAccountId, provider });
    },
    async updateUser(user) {
      if (!baseAdapter.updateUser) {
        throw new Error("updateUser method not available");
      }
      return baseAdapter.updateUser(user);
    },
    async linkAccount(account) {
      // Pour Credentials, ne pas créer de lien dans NextAuth
      if (account.provider === "credentials") {
        return account as any;
      }
      if (!baseAdapter.linkAccount) {
        throw new Error("linkAccount method not available");
      }
      return baseAdapter.linkAccount(account);
    },
    async unlinkAccount({ providerAccountId, provider }) {
      if (!baseAdapter.unlinkAccount) {
        throw new Error("unlinkAccount method not available");
      }
      const result = await baseAdapter.unlinkAccount({
        providerAccountId,
        provider,
      });
      return result as any;
    },
    async createSession({ sessionToken, userId, expires }) {
      if (!baseAdapter.createSession) {
        throw new Error("createSession method not available");
      }
      return baseAdapter.createSession({ sessionToken, userId, expires });
    },
    async getSessionAndUser(sessionToken) {
      if (!baseAdapter.getSessionAndUser) {
        throw new Error("getSessionAndUser method not available");
      }
      return baseAdapter.getSessionAndUser(sessionToken);
    },
    async updateSession({ sessionToken, ...data }) {
      if (!baseAdapter.updateSession) {
        throw new Error("updateSession method not available");
      }
      return baseAdapter.updateSession({ sessionToken, ...data });
    },
    async deleteSession(sessionToken) {
      if (!baseAdapter.deleteSession) {
        throw new Error("deleteSession method not available");
      }
      const result = await baseAdapter.deleteSession(sessionToken);
      return result as any;
    },
    async createVerificationToken({ identifier, expires, token }) {
      if (!baseAdapter.createVerificationToken) {
        throw new Error("createVerificationToken method not available");
      }
      return baseAdapter.createVerificationToken({
        identifier,
        expires,
        token,
      });
    },
    async useVerificationToken({ identifier, token }) {
      if (!baseAdapter.useVerificationToken) {
        throw new Error("useVerificationToken method not available");
      }
      return baseAdapter.useVerificationToken({ identifier, token });
    },
  };
}
