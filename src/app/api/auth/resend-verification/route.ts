import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateResetToken } from "@/lib/auth/utils";
import { sendVerificationEmail } from "@/lib/email-verification";

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
            "Si cet email existe et n'est pas vérifié, un nouvel email de vérification a été envoyé",
        },
        { status: 200 }
      );
    }

    // Si l'email est déjà vérifié, ne rien faire
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Cet email est déjà vérifié" },
        { status: 200 }
      );
    }

    // Générer un nouveau token
    const verificationToken = generateResetToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Envoyer l'email
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`;
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      return NextResponse.json(
        { message: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Si cet email existe et n'est pas vérifié, un nouvel email de vérification a été envoyé",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in resend verification:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'envoi de l'email de vérification" },
      { status: 500 }
    );
  }
}
