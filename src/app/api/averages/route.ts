import { NextResponse } from "next/server";
import { fetchCategoryAverages } from "@/lib/cloud";

export async function GET() {
  try {
    const averages = await fetchCategoryAverages();
    return NextResponse.json(averages);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}
