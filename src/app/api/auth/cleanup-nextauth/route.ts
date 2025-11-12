import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// Route pour nettoyer les collections NextAuth pour permettre la connexion Google
export async function POST(req: NextRequest) {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { message: "MONGO_URI non configuré" },
        { status: 500 }
      );
    }

    await connectDB();
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    // Supprimer TOUS les utilisateurs NextAuth qui n'ont pas de compte Google
    // Cette approche agressive nettoie tout pour permettre la connexion Google
    const allNextAuthUsers = await db.collection("users").find({}).toArray();

    let cleaned = 0;

    for (const nextAuthUser of allNextAuthUsers) {
      // Vérifier s'il y a un compte Google associé
      const googleAccount = await db.collection("accounts").findOne({
        userId: nextAuthUser._id.toString(),
        provider: "google",
      });

      // Si aucun compte Google n'existe, supprimer l'utilisateur NextAuth
      if (!googleAccount) {
        // Supprimer tous les comptes associés (y compris Email magic link)
        await db.collection("accounts").deleteMany({
          userId: nextAuthUser._id.toString(),
        });
        // Supprimer aussi les sessions associées
        await db.collection("sessions").deleteMany({
          userId: nextAuthUser._id.toString(),
        });
        // Supprimer les tokens de vérification
        await db.collection("verification_tokens").deleteMany({
          identifier: nextAuthUser.email,
        });
        // Supprimer l'utilisateur NextAuth
        await db.collection("users").deleteOne({
          _id: nextAuthUser._id,
        });
        cleaned++;
      }
    }

    // Aussi supprimer tous les comptes "email" (magic link) qui pourraient bloquer
    const emailAccounts = await db
      .collection("accounts")
      .find({
        provider: "email",
      })
      .toArray();

    for (const emailAccount of emailAccounts) {
      const googleAccount = await db.collection("accounts").findOne({
        userId: emailAccount.userId,
        provider: "google",
      });

      if (!googleAccount) {
        await db.collection("accounts").deleteOne({
          _id: emailAccount._id,
        });
        cleaned++;
      }
    }

    await client.close();

    return NextResponse.json(
      {
        message: `${cleaned} utilisateur(s) NextAuth nettoyé(s). Vous pouvez maintenant vous connecter avec Google.`,
        cleaned,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cleaning NextAuth collections:", error);
    return NextResponse.json(
      { message: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
}
