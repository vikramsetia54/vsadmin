import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Vendor from "@/models/Vendor";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  await connectToDB();
  const updated = await Vendor.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectToDB();
  await Vendor.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
