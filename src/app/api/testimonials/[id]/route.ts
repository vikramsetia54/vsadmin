import connectToDB from "@/lib/mongoose";
import { Testimonial } from "@/models/Testimonial";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await req.json();
    await connectToDB();
    
    // Convert _id from body to string to prevent casting errors
    delete body._id;

    const updated = await Testimonial.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ ok: true, testimonial: updated });
  } catch (error) {
    console.error(`Testimonial [${context.params?.id}] PATCH error`, error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = context.params;
    await connectToDB();
    await Testimonial.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`Testimonial [${context.params?.id}] DELETE error`, error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
