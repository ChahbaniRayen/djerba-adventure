import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { MongoClient } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { hashPassword, verifyPassword } from "./utils";
import { sendMagicLinkEmail } from "@/lib/email-magic";
import { createCustomAdapter } from "./custom-adapter";

// Créer un client MongoDB pour l'adaptateur NextAuth
// L'adaptateur est nécessaire pour le provider Email (magic link)
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Utiliser MONGO_URI pour être cohérent avec mongodb.ts
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";

// Ne pas vérifier au build, seulement au runtime lors de la connexion
// La vérification se fera dans connectDB() et lors de la création du client

if (process.env.NODE_ENV === "development") {
  // En développement, utiliser une variable globale pour éviter les multiples connexions
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(mongoUri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En production, créer une nouvelle connexion
  client = new MongoClient(mongoUri);
  clientPromise = client.connect();
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Utiliser un adapter personnalisé qui ignore Credentials
  // Cela évite les conflits entre Credentials et Google
  adapter: createCustomAdapter(clientPromise),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user || !user.password) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Vérifier que l'email est vérifié pour les comptes credentials
          if (user.provider === "credentials" && !user.emailVerified) {
            // Retourner null pour bloquer la connexion
            // L'erreur sera gérée côté client
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in Credentials authorize:", error);
          return null;
        }
      },
    }),
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          await sendMagicLinkEmail(identifier, url);
        } catch (error) {
          console.error("Error sending magic link:", error);
          throw error;
        }
      },
    }),
  ],
  events: {
    async linkAccount({ user, account }) {
      // Cet événement est appelé quand NextAuth lie un compte
      // On peut mettre à jour notre modèle User ici
      if (account?.provider === "google" && user.email) {
        try {
          await connectDB();
          const existingUser = await User.findOne({
            email: user.email.toLowerCase(),
          });
          if (existingUser) {
            // Utiliser updateOne pour préserver le rôle admin
            const updateData: any = {
              providerId: account.providerAccountId,
            };

            if (user.image) updateData.image = user.image;
            if (!existingUser.emailVerified) {
              updateData.emailVerified = new Date();
            }
            if (existingUser.provider === "credentials") {
              updateData.provider = "google";
            }

            // IMPORTANT: Utiliser updateOne pour ne pas toucher au rôle
            const roleBeforeUpdate = existingUser.role;
            await User.updateOne(
              { _id: existingUser._id },
              { $set: updateData }
            );

            // Vérifier que le rôle admin n'a pas été écrasé
            const userAfterUpdate = await User.findOne({
              _id: existingUser._id,
            });
            if (
              userAfterUpdate &&
              roleBeforeUpdate === "admin" &&
              userAfterUpdate.role !== "admin"
            ) {
              console.error(
                `[AUTH] ALERTE: Rôle admin écrasé dans linkAccount pour ${user.email}, restauration...`
              );
              await User.updateOne(
                { _id: existingUser._id },
                { $set: { role: "admin" } }
              );
            }
          }
        } catch (error) {
          console.error("Error in linkAccount event:", error);
        }
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        await connectDB();
        const db = (await clientPromise).db();

        // Si connexion avec Google, synchroniser avec notre modèle User
        // IMPORTANT: Ne PAS nettoyer les collections NextAuth ici
        // Le cleanup se fait uniquement dans getUserByEmail si nécessaire
        if (account?.provider === "google") {
          // Vérifier dans notre modèle User avec plusieurs tentatives pour éviter les problèmes de timing
          let existingUser = await User.findOne({
            email: user.email.toLowerCase(),
          });

          // Si pas trouvé, réessayer une fois après un court délai (problème de synchronisation)
          if (!existingUser) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            existingUser = await User.findOne({
              email: user.email.toLowerCase(),
            });
          }

          // Log pour debug
          if (existingUser) {
            console.log(
              `[AUTH] Utilisateur trouvé: ${existingUser.email}, rôle: ${existingUser.role}`
            );
          } else {
            console.log(`[AUTH] Utilisateur non trouvé pour: ${user.email}`);
          }

          if (existingUser) {
            // CRITIQUE: Sauvegarder le rôle AVANT toute opération
            const savedRole = existingUser.role;
            console.log(
              `[AUTH] Rôle sauvegardé avant mise à jour: ${savedRole} pour ${user.email}`
            );

            // Mettre à jour notre modèle User SANS toucher au rôle
            // Préserver le rôle admin si il existe
            // Utiliser updateOne avec $set pour ne modifier que les champs nécessaires
            const updateData: any = {
              providerId: account.providerAccountId,
            };

            if (user.image) updateData.image = user.image;
            if (user.name && !existingUser.name) updateData.name = user.name;
            if (!existingUser.emailVerified) {
              updateData.emailVerified = new Date();
            }

            // CRITIQUE: Utiliser updateOne avec $set UNIQUEMENT pour les champs à mettre à jour
            // NE JAMAIS inclure le rôle dans $set pour préserver le rôle admin
            // Utiliser une requête MongoDB directe sur app_users pour être absolument sûr
            const db = (await clientPromise).db();
            await db.collection("app_users").updateOne(
              { _id: existingUser._id },
              {
                $set: updateData,
                // NE PAS toucher au champ "role" - il reste inchangé
              }
            );

            // Vérifier immédiatement que le rôle n'a pas changé
            const checkUser = await db.collection("app_users").findOne({
              _id: existingUser._id,
            });

            if (
              checkUser &&
              savedRole === "admin" &&
              checkUser.role !== "admin"
            ) {
              // Le rôle admin a été écrasé ! Le restaurer immédiatement
              console.error(
                `[AUTH] CRITIQUE: Rôle admin écrasé pour ${user.email}, restauration immédiate...`
              );
              await db
                .collection("app_users")
                .updateOne(
                  { _id: existingUser._id },
                  { $set: { role: "admin" } }
                );
            }

            // Vérifier APRÈS la mise à jour que le rôle n'a pas changé
            // Faire plusieurs vérifications pour être sûr (via MongoDB direct)
            for (let i = 0; i < 3; i++) {
              await new Promise((resolve) => setTimeout(resolve, 50));
              const userAfterUpdate = await db.collection("app_users").findOne({
                _id: existingUser._id,
              });

              if (userAfterUpdate) {
                if (savedRole === "admin" && userAfterUpdate.role !== "admin") {
                  // Le rôle admin a été écrasé ! Le restaurer immédiatement
                  console.error(
                    `[AUTH] ALERTE: Rôle admin écrasé pour ${user.email}, restauration (tentative ${i + 1})...`
                  );
                  await db
                    .collection("app_users")
                    .updateOne(
                      { _id: existingUser._id },
                      { $set: { role: "admin" } }
                    );
                } else if (
                  savedRole === "admin" &&
                  userAfterUpdate.role === "admin"
                ) {
                  // Le rôle est correct, on peut arrêter
                  console.log(`[AUTH] Rôle admin préservé pour ${user.email}`);
                  break;
                }
              }
            }
          } else {
            // CRITIQUE: Vérifier une dernière fois avant de créer un nouvel utilisateur
            // pour éviter d'écraser un utilisateur existant avec un rôle admin
            // Utiliser findOneAndUpdate avec upsert: false pour être sûr de ne pas créer accidentellement
            const finalCheck = await User.findOneAndUpdate(
              { email: user.email.toLowerCase() },
              {
                $set: {
                  providerId: account.providerAccountId,
                  ...(user.image && { image: user.image }),
                  ...(user.name && { name: user.name }),
                  emailVerified: new Date(),
                },
                // IMPORTANT: Ne pas toucher au rôle - utiliser $setOnInsert seulement pour les nouveaux
                $setOnInsert: {
                  role: "user", // Seulement si c'est vraiment un nouvel utilisateur
                },
              },
              {
                upsert: false, // Ne PAS créer si l'utilisateur n'existe pas
                new: true,
                runValidators: true,
              }
            );

            if (!finalCheck) {
              // Vraiment un nouvel utilisateur - créer avec role: "user"
              // Mais d'abord, vérifier une dernière fois pour être absolument sûr
              const absoluteFinalCheck = await User.findOne({
                email: user.email.toLowerCase(),
              });

              if (!absoluteFinalCheck) {
                // Vraiment un nouvel utilisateur - créer avec role: "user"
                // Mais utiliser try/catch pour éviter les erreurs de duplication
                try {
                  await User.create({
                    email: user.email.toLowerCase(),
                    name: user.name || user.email.split("@")[0],
                    image: user.image,
                    provider: "google",
                    providerId: account.providerAccountId,
                    role: "user",
                    emailVerified: new Date(),
                  });
                  console.log(`[AUTH] Nouvel utilisateur créé: ${user.email}`);
                } catch (error: any) {
                  // Si erreur de duplication (utilisateur existe déjà), le trouver et mettre à jour
                  if (
                    error.code === 11000 ||
                    error.message?.includes("duplicate")
                  ) {
                    console.log(
                      `[AUTH] Utilisateur existe déjà (duplication détectée), mise à jour: ${user.email}`
                    );
                    const duplicateUser = await User.findOne({
                      email: user.email.toLowerCase(),
                    });
                    if (duplicateUser) {
                      const roleBeforeUpdate = duplicateUser.role;
                      await User.updateOne(
                        { _id: duplicateUser._id },
                        {
                          $set: {
                            providerId: account.providerAccountId,
                            ...(user.image && { image: user.image }),
                            ...(user.name && { name: user.name }),
                            emailVerified: new Date(),
                          },
                        }
                      );

                      // Vérifier que le rôle admin n'a pas été écrasé
                      const userAfterUpdate = await User.findOne({
                        _id: duplicateUser._id,
                      });
                      if (
                        userAfterUpdate &&
                        roleBeforeUpdate === "admin" &&
                        userAfterUpdate.role !== "admin"
                      ) {
                        console.error(
                          `[AUTH] ALERTE: Rôle admin écrasé (duplication) pour ${user.email}, restauration...`
                        );
                        await User.updateOne(
                          { _id: duplicateUser._id },
                          { $set: { role: "admin" } }
                        );
                      }
                    }
                  } else {
                    throw error;
                  }
                }
              } else {
                // L'utilisateur existe finalement - mettre à jour sans toucher au rôle
                const roleBeforeUpdate = absoluteFinalCheck.role;
                await User.updateOne(
                  { _id: absoluteFinalCheck._id },
                  {
                    $set: {
                      providerId: account.providerAccountId,
                      ...(user.image && { image: user.image }),
                      ...(user.name && { name: user.name }),
                      emailVerified: new Date(),
                    },
                  }
                );

                // Vérifier que le rôle admin n'a pas été écrasé
                const userAfterUpdate = await User.findOne({
                  _id: absoluteFinalCheck._id,
                });
                if (
                  userAfterUpdate &&
                  roleBeforeUpdate === "admin" &&
                  userAfterUpdate.role !== "admin"
                ) {
                  console.error(
                    `[AUTH] ALERTE: Rôle admin écrasé pour ${user.email}, restauration...`
                  );
                  await User.updateOne(
                    { _id: absoluteFinalCheck._id },
                    { $set: { role: "admin" } }
                  );
                }
              }
            }
          }
        } else {
          // Pour les autres providers (email, credentials)
          const existingUser = await User.findOne({
            email: user.email.toLowerCase(),
          });

          if (!existingUser) {
            const provider =
              account?.provider === "email" ? "email" : "credentials";

            const newUser = await User.create({
              email: user.email.toLowerCase(),
              name: user.name || user.email.split("@")[0],
              image: user.image,
              provider: provider as any,
              providerId: account?.providerAccountId,
              role: "user",
              emailVerified:
                account?.provider === "email" ? new Date() : undefined,
            });

            // Ne pas créer d'entrée dans la collection users de NextAuth pour credentials
            // Cela évite les conflits lors de la connexion avec Google

            // IMPORTANT: Supprimer toute entrée NextAuth existante pour credentials
            // pour éviter les conflits avec Google
            if (account?.provider === "credentials") {
              const nextAuthUser = await db.collection("users").findOne({
                email: user.email.toLowerCase(),
              });
              if (nextAuthUser) {
                // Supprimer l'utilisateur NextAuth créé par l'adapter
                await db.collection("accounts").deleteMany({
                  userId: nextAuthUser._id.toString(),
                });
                await db.collection("users").deleteOne({
                  email: user.email.toLowerCase(),
                });
              }
            }
          } else {
            // Pour les utilisateurs existants, mettre à jour uniquement ce qui est nécessaire
            // IMPORTANT: Préserver le rôle admin
            if (account?.provider === "email" && !existingUser.emailVerified) {
              // Utiliser updateOne pour ne pas toucher au rôle
              await User.updateOne(
                { _id: existingUser._id },
                { $set: { emailVerified: new Date() } }
              );
            }

            // IMPORTANT: Supprimer toute entrée NextAuth existante pour credentials
            // pour éviter les conflits avec Google
            if (account?.provider === "credentials") {
              const nextAuthUser = await db.collection("users").findOne({
                email: user.email.toLowerCase(),
              });
              if (nextAuthUser) {
                // Supprimer l'utilisateur NextAuth créé par l'adapter
                await db.collection("accounts").deleteMany({
                  userId: nextAuthUser._id.toString(),
                });
                await db.collection("users").deleteOne({
                  email: user.email.toLowerCase(),
                });
              }
            }
          }
        }

        // IMPORTANT: Après chaque connexion avec Credentials, supprimer IMMÉDIATEMENT
        // l'entrée NextAuth créée par l'adapter pour éviter les conflits avec Google
        if (account?.provider === "credentials") {
          // Attendre que l'adapter finisse (si jamais il crée quelque chose)
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Supprimer TOUTE entrée NextAuth pour cet email (sauf si Google existe)
          const nextAuthUser = await db.collection("users").findOne({
            email: user.email.toLowerCase(),
          });

          if (nextAuthUser) {
            const googleAccount = await db.collection("accounts").findOne({
              userId: nextAuthUser._id.toString(),
              provider: "google",
            });

            // Si pas de compte Google, supprimer complètement l'entrée NextAuth
            if (!googleAccount) {
              await db.collection("accounts").deleteMany({
                userId: nextAuthUser._id.toString(),
              });
              await db.collection("sessions").deleteMany({
                userId: nextAuthUser._id.toString(),
              });
              await db.collection("users").deleteOne({
                email: user.email.toLowerCase(),
              });
            }
          }
        }

        // Toujours retourner true pour permettre la connexion
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        // En cas d'erreur, permettre quand même la connexion
        return true;
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        await connectDB();
        // Vérifier et restaurer le rôle admin si nécessaire
        const db = (await clientPromise).db();
        const userDoc = await db.collection("app_users").findOne({
          email: session.user.email.toLowerCase(),
        });

        if (userDoc) {
          // Si l'utilisateur a le rôle admin dans la base, s'assurer qu'il est préservé
          if (userDoc.role === "admin") {
            (session.user as any).id = userDoc._id.toString();
            (session.user as any).role = "admin";
            console.log(
              `[SESSION] Rôle admin confirmé pour ${session.user.email}`
            );
          } else {
            (session.user as any).id = userDoc._id.toString();
            (session.user as any).role = userDoc.role || "user";
          }
        } else {
          // Fallback vers Mongoose si le document n'existe pas dans app_users
          const user = await User.findOne({ email: session.user.email });
          if (user) {
            (session.user as any).id = user._id.toString();
            (session.user as any).role = user.role;
          }
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Définir la date d'expiration (1 heure à partir de maintenant)
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + 60 * 60; // 1 heure en secondes

      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.exp = expiresAt;
      }

      // Vérifier si le token a expiré
      if (token.exp && token.exp < now) {
        // Token expiré, retourner null pour forcer la déconnexion
        return null as any;
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      // Sur Vercel, utiliser NEXTAUTH_URL si disponible, sinon baseUrl
      const vercelUrl = process.env.NEXTAUTH_URL || baseUrl;

      // Si l'URL est relative, la convertir en absolue
      if (url.startsWith("/")) {
        // S'assurer que vercelUrl ne se termine pas par un slash
        const cleanBaseUrl = vercelUrl.replace(/\/$/, "");
        return `${cleanBaseUrl}${url}`;
      }

      // Si l'URL est absolue, vérifier qu'elle est sur le même domaine
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(vercelUrl);

        // Si même origine, autoriser
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
      } catch (error) {
        // Si l'URL n'est pas valide, utiliser la base
        console.error("[AUTH] Erreur lors de la validation de l'URL:", error);
      }

      // Par défaut, rediriger vers la page d'accueil
      return vercelUrl.replace(/\/$/, "") || "/";
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 heure en secondes (3600 secondes)
  },
  jwt: {
    maxAge: 60 * 60, // 1 heure en secondes (3600 secondes)
  },
  secret: process.env.NEXTAUTH_SECRET,
});
