import { NextResponse } from "next/server";
import { getActivities } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const activities = await getActivities();
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des activités" },
      { status: 500 }
    );
  }
}
