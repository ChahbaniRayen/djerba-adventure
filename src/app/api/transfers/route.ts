import { NextResponse } from "next/server";
import { getTransfers } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const transfers = await getTransfers();
    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des transferts" },
      { status: 500 }
    );
  }
}
