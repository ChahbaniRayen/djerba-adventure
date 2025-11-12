import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token de vérification requis" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // Vérifier l'email
    user.emailVerified = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email vérifié avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify email:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification de l'email" },
      { status: 500 }
    );
  }
}
