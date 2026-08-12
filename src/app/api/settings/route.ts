import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Settings from "@/models/Settings";

const SINGLETON_KEY = "global";

export async function GET() {
  await connectToDB();
  const doc = await Settings.findOne({ key: SINGLETON_KEY }).lean();
  return NextResponse.json({
    deliveryPrice: (doc as any)?.deliveryPrice ?? 0,
    freeDeliveryThreshold: (doc as any)?.freeDeliveryThreshold ?? 0,
  });
}

export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const update: Record<string, number> = {};
    if (typeof body.deliveryPrice === "number") update.deliveryPrice = body.deliveryPrice;
    if (typeof body.freeDeliveryThreshold === "number") update.freeDeliveryThreshold = body.freeDeliveryThreshold;

    await Settings.findOneAndUpdate(
      { key: SINGLETON_KEY },
      { $set: update },
      { upsert: true, new: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to save settings" }, { status: 500 });
  }
}
