import { NextResponse } from "next/server";
import { getProductsCombined } from "@/lib/products";

export async function GET() {
  try {
    const list = await getProductsCombined();
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
