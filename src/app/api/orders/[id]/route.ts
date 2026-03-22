import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  await connectToDB();
  const updated = await Order.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectToDB();
  await Order.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
