import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { auth } from "@/lib/auth/config";

export async function GET(req: Request) {
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

    // Statistiques générales
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const rejectedBookings = await Booking.countDocuments({
      status: "rejected",
    });

    // Activités les plus demandées
    const activitiesStats = await Booking.aggregate([
      {
        $group: {
          _id: "$activityName",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          activityName: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Statistiques par type
    const typeStats = await Booking.aggregate([
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Comptes non vérifiés
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unverifiedAccounts = await User.countDocuments({
      emailVerified: { $exists: false },
      provider: "credentials",
      $or: [
        { createdAt: { $lt: sevenDaysAgo } },
        { emailVerificationExpires: { $lt: sevenDaysAgo } },
      ],
    });

    const totalUnverified = await User.countDocuments({
      emailVerified: { $exists: false },
      provider: "credentials",
    });

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      rejectedBookings,
      activitiesStats,
      typeStats,
      unverifiedAccounts,
      totalUnverified,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
