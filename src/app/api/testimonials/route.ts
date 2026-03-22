import connectToDB from "@/lib/mongoose";
import { Testimonial } from "@/models/Testimonial";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDB();
    const newTestimonial = await Testimonial.create(body);
    return NextResponse.json({ ok: true, testimonial: newTestimonial });
  } catch (error) {
    console.error("Testimonial POST error", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Testimonial GET error", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
