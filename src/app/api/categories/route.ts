import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Category } from "@/models/Category";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDB();
    const newCategory = await Category.create(body);
    return NextResponse.json({ ok: true, data: newCategory });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
