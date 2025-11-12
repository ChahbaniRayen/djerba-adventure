import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { MongoClient } from "mongodb";

// Cette route nettoie les collections NextAuth pour permettre la liaison avec Google
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { message: "MONGO_URI ou MONGODB_URI doit être défini" },
        { status: 500 }
      );
    }

    await connectDB();
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    // Trouver l'utilisateur dans notre modèle User
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      await client.close();
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Trouver l'utilisateur dans les collections NextAuth
    const nextAuthUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (nextAuthUser) {
      // Supprimer tous les comptes OAuth existants pour cet utilisateur
      await db.collection("accounts").deleteMany({
        userId: nextAuthUser._id.toString(),
      });

      // Optionnel: supprimer aussi l'utilisateur NextAuth pour forcer la recréation
      await db.collection("users").deleteOne({
        email: email.toLowerCase(),
      });
    }

    await client.close();

    return NextResponse.json(
      {
        message:
          "Collections NextAuth nettoyées. Vous pouvez maintenant vous connecter avec Google.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error linking Google account:", error);
    return NextResponse.json(
      { message: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
}
