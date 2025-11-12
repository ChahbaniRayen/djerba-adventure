import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { hashPassword, generateResetToken } from "@/lib/auth/utils";
import { sendVerificationEmail } from "@/lib/email-verification";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
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

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // Si l'utilisateur existe mais l'email n'est pas vérifié et le token est expiré
      // On peut supprimer l'ancien compte et en créer un nouveau
      if (
        !existingUser.emailVerified &&
        existingUser.emailVerificationExpires &&
        existingUser.emailVerificationExpires < new Date()
      ) {
        // Supprimer l'ancien compte non vérifié
        await User.deleteOne({ _id: existingUser._id });
      } else if (existingUser.emailVerified) {
        // L'email est déjà vérifié, le compte existe vraiment
        return NextResponse.json(
          { message: "Un compte avec cet email existe déjà" },
          { status: 400 }
        );
      } else {
        // Le compte existe mais n'est pas vérifié et le token est encore valide
        return NextResponse.json(
          {
            message:
              "Un compte avec cet email existe déjà mais n'est pas vérifié. Veuillez vérifier votre boîte mail ou demander un nouvel email de vérification.",
          },
          { status: 400 }
        );
      }
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Générer un token de vérification
    const verificationToken = generateResetToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Valide pendant 24 heures

    // Créer l'utilisateur (sans emailVerified)
    const user = await User.create({
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      password: hashedPassword,
      provider: "credentials",
      role: "user",
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`;
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      // Ne pas bloquer la création du compte si l'email échoue
    }

    return NextResponse.json(
      {
        message:
          "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in register:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
