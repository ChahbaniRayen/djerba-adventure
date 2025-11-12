import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { hashPassword, generateResetToken } from "@/lib/auth/utils";
import { sendResetPasswordEmail } from "@/lib/email-reset";

// Demander une réinitialisation de mot de passe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Ne pas révéler si l'email existe ou non pour la sécurité
      return NextResponse.json(
        {
          message:
            "Si cet email existe, un lien de réinitialisation a été envoyé",
        },
        { status: 200 }
      );
    }

    // Générer un token de réinitialisation
    const resetToken = generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Valide pendant 1 heure

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Envoyer l'email
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    return NextResponse.json(
      {
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset password request:", error);
    return NextResponse.json(
      { message: "Erreur lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
}

// Réinitialiser le mot de passe avec le token
export async function PUT(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe
    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { message: "Erreur lors de la réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
}
