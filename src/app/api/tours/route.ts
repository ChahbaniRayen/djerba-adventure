import { NextResponse } from "next/server";
import { getTours } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const tours = await getTours();
    return NextResponse.json({ tours });
  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des tours" },
      { status: 500 }
    );
  }
}
