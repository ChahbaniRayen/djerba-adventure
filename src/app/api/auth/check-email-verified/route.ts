import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { verified: false, message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        verified: !!user.emailVerified,
        message: user.emailVerified ? "Email vérifié" : "Email non vérifié",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking email verification:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
