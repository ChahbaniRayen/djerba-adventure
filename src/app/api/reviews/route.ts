import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import { auth } from "@/lib/auth/config";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour laisser un avis" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const { activityId, activityType, rating, comment } = body;

    if (!activityId || !activityType || !rating || !comment) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour cette activité
    const User = (await import("@/lib/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const existingReview = await Review.findOne({
      userId: user._id,
      activityId,
      activityType,
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "Vous avez déjà laissé un avis pour cette activité" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      userId: user._id,
      activityId,
      activityType,
      rating: Number(rating),
      comment,
      userName: session.user.name || user.name,
      userEmail: session.user.email,
      approved: true, // Publié immédiatement
    });

    return NextResponse.json(
      {
        message: "Avis publié avec succès !",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de l'avis" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activityId");
    const activityType = searchParams.get("activityType");
    const approved = searchParams.get("approved");

    await connectDB();

    const query: {
      activityId?: string;
      activityType?: string;
      approved?: boolean;
    } = {};
    if (activityId) query.activityId = activityId;
    if (activityType) query.activityType = activityType;
    if (approved !== null) query.approved = approved === "true";

    const reviews = await Review.find(query)
      .populate("userId", "name email image")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}
