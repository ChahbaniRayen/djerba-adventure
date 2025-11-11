import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { auth } from "@/lib/auth/config";
import { sendBookingNotificationToAdmin } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour effectuer une réservation" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const {
      activityId,
      activityName,
      activityType,
      date,
      time,
      participants,
      phone,
      notes,
    } = body;

    if (
      !activityId ||
      !activityName ||
      !activityType ||
      !date ||
      !time ||
      !participants
    ) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const User = (await import("@/lib/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const booking = await Booking.create({
      userId: user._id,
      activityId,
      activityName,
      activityType,
      date: new Date(date),
      time,
      participants: Number(participants),
      email: session.user.email,
      name: session.user.name || user.name,
      phone: phone || undefined,
      notes: notes || undefined,
      status: "pending",
    });

    // Envoyer un email de notification à l'admin
    try {
      await sendBookingNotificationToAdmin(booking);
    } catch (error) {
      // Ne pas bloquer la création de la réservation si l'email échoue
      console.error("Erreur lors de l'envoi de l'email à l'admin:", error);
    }

    return NextResponse.json(
      { message: "Demande de réservation créée avec succès", booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const User = (await import("@/lib/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Si admin, retourner toutes les réservations
    if (user.role === "admin") {
      const bookings = await Booking.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
      return NextResponse.json({ bookings });
    }

    // Sinon, retourner uniquement les réservations de l'utilisateur
    const bookings = await Booking.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}
