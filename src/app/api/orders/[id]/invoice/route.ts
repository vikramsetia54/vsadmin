import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await connectToDB();
    const updated = await Order.findByIdAndUpdate(id, {
      invoiceData: buffer,
      invoiceMimeType: file.type,
      invoicePdf: `/api/orders/${id}/invoice` 
    }, { new: true });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, url: `/api/orders/${id}/invoice` });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDB();
    const order = await Order.findById(id);

    if (!order || !order.invoiceData) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    return new NextResponse(order.invoiceData, {
      headers: {
        "Content-Type": order.invoiceMimeType || "application/pdf",
        "Content-Disposition": "inline"
      }
    });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
