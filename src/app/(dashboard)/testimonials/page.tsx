import { MessageSquare } from "lucide-react";
import connectToDB from "@/lib/mongoose";
import { Testimonial } from "@/models/Testimonial";
import { TestimonialRow } from "@/components/testimonials/TestimonialRow";
import { CreateTestimonial } from "@/components/testimonials/CreateTestimonial";

export default async function TestimonialsPage() {
  await connectToDB();
  const rawTestimonials = await Testimonial.find().sort({ createdAt: -1 }).lean() as any[];
  const testimonials = JSON.parse(JSON.stringify(rawTestimonials));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Testimonials</h1>
          <p className="text-sm text-slate-400 mt-0.5">{testimonials.length} reviews from customers</p>
        </div>
        <CreateTestimonial />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MessageSquare className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <input
              type="text"
              className="bg-slate-50 border border-slate-100 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 block w-full pl-9 py-2.5 outline-none transition"
              placeholder="Search testimonials…"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {testimonials.length > 0 ? (
            testimonials.map((testim: any) => (
              <TestimonialRow
                key={testim._id.toString()}
                testimonial={{
                  _id: testim._id.toString(),
                  name: testim.name,
                  role: testim.role,
                  content: testim.content,
                  rating: testim.rating,
                  image: testim.image,
                }}
              />
            ))
          ) : (
            <div className="p-12 text-center text-[11px] font-bold text-slate-300">
              No testimonials found.
            </div>
          )}
        </div>

        {testimonials.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-50 text-[11px] text-slate-300 font-bold">
            {testimonials.length} review{testimonials.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
