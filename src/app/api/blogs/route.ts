import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Blog } from "@/models/Blog";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDB();
    const newBlog = await Blog.create(body);
    return NextResponse.json({ ok: true, data: newBlog });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
