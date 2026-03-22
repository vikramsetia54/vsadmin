import connectToDB from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDB();
  const order = await Order.findOne();
  return NextResponse.json(order?.items[0] || { empty: true });
}
