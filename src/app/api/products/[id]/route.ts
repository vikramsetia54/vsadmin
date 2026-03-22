import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Product } from "@/models/Product";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  await connectToDB();
  const updated = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectToDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
