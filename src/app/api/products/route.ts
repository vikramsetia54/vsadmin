import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Product } from "@/models/Product";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDB();
    const newProduct = await Product.create(body);
    return NextResponse.json({ ok: true, data: newProduct });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
