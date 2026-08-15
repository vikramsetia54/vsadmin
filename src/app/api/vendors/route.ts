import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Vendor from "@/models/Vendor";

export async function GET() {
  await connectToDB();
  const vendors = await Vendor.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: vendors });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();
    const vendor = await Vendor.create(body);
    return NextResponse.json({ ok: true, data: vendor });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to create vendor" }, { status: 500 });
  }
}
