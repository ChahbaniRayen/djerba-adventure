import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, email, participants, activity } = body;

    if (!name || !email || !participants || !activity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      name,
      email,
      participants,
      activity,
    });

    return NextResponse.json({ message: "Booking saved", booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error creating booking" },
      { status: 500 }
    );
  }
}
