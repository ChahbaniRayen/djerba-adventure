import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { auth } from "@/lib/auth/config";
import {
  sendBookingConfirmationEmail,
  sendBookingRejectionEmail,
} from "@/lib/email";

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
    const { status } = body;

    if (!["confirmed", "rejected", "cancelled"].includes(status)) {
      return NextResponse.json({ message: "Statut invalide" }, { status: 400 });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { message: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    booking.status = status;
    await booking.save();

    // Envoyer un email selon le statut
    let emailSent = false;
    let emailError = null;

    try {
      if (status === "confirmed") {
        await sendBookingConfirmationEmail(booking);
        emailSent = true;
      } else if (status === "rejected") {
        await sendBookingRejectionEmail(booking);
        emailSent = true;
      }
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      emailError = error instanceof Error ? error.message : "Erreur inconnue";
      // Continuer même si l'email échoue
    }

    return NextResponse.json({
      message: `Réservation ${
        status === "confirmed" ? "confirmée" : "rejetée"
      }${emailSent ? ". Email envoyé." : emailError ? `. ⚠️ Email non envoyé: ${emailError}` : ""}`,
      booking,
      emailSent,
      emailError: emailError || undefined,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de la réservation" },
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
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { message: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Réservation supprimée" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la réservation" },
      { status: 500 }
    );
  }
}
