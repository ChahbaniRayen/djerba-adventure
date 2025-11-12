import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// Route pour nettoyer les comptes non vérifiés expirés
// À appeler périodiquement (cron job) ou manuellement
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Supprimer les comptes non vérifiés créés il y a plus de 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await User.deleteMany({
      emailVerified: { $exists: false },
      provider: "credentials",
      createdAt: { $lt: sevenDaysAgo },
    });

    // Supprimer aussi les comptes avec des tokens expirés depuis plus de 7 jours
    const result2 = await User.deleteMany({
      emailVerified: { $exists: false },
      emailVerificationExpires: { $lt: sevenDaysAgo },
      provider: "credentials",
    });

    const totalDeleted = result.deletedCount + result2.deletedCount;

    return NextResponse.json(
      {
        message: `${totalDeleted} compte(s) non vérifié(s) supprimé(s)`,
        deleted: totalDeleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cleaning up unverified accounts:", error);
    return NextResponse.json(
      { message: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier combien de comptes non vérifiés existent
export async function GET() {
  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unverifiedCount = await User.countDocuments({
      emailVerified: { $exists: false },
      provider: "credentials",
      $or: [
        { createdAt: { $lt: sevenDaysAgo } },
        { emailVerificationExpires: { $lt: sevenDaysAgo } },
      ],
    });

    return NextResponse.json(
      {
        unverifiedAccounts: unverifiedCount,
        message: `${unverifiedCount} compte(s) non vérifié(s) à nettoyer`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error counting unverified accounts:", error);
    return NextResponse.json(
      { message: "Erreur lors du comptage" },
      { status: 500 }
    );
  }
}
