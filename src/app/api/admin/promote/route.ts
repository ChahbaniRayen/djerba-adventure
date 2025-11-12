import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// Route API pour promouvoir un utilisateur en admin
// Seul un admin existant peut promouvoir un autre utilisateur
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Seul un admin peut promouvoir un autre utilisateur
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { message: "Cet utilisateur est déjà admin" },
        { status: 400 }
      );
    }

    user.role = "admin";
    await user.save();

    return NextResponse.json({
      message: `${email} est maintenant admin`,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { message: "Erreur lors de la promotion" },
      { status: 500 }
    );
  }
}

// Route pour rétrograder un admin en utilisateur normal
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Seul un admin peut rétrograder un autre utilisateur
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    // Empêcher de se rétrograder soi-même
    if (email.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas vous rétrograder vous-même" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Cet utilisateur n'est pas admin" },
        { status: 400 }
      );
    }

    user.role = "user";
    await user.save();

    return NextResponse.json({
      message: `${email} n'est plus admin`,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error demoting user:", error);
    return NextResponse.json(
      { message: "Erreur lors de la rétrogradation" },
      { status: 500 }
    );
  }
}
