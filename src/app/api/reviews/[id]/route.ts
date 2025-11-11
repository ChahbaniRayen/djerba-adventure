import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import { auth } from "@/lib/auth/config";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const User = (await import("@/lib/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { approved } = body;

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ message: "Avis non trouvé" }, { status: 404 });
    }

    review.approved = approved;
    await review.save();

    return NextResponse.json({
      message: `Avis ${approved ? "approuvé" : "désapprouvé"}`,
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de l'avis" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const User = (await import("@/lib/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return NextResponse.json({ message: "Avis non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Avis supprimé" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'avis" },
      { status: 500 }
    );
  }
}
