"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Star, Edit } from "lucide-react";

interface TestimonialType {
  _id: string;
  name: string;
  role?: string;
  content: string;
  rating?: number;
  image?: string;
}

export function TestimonialRow({ testimonial }: { testimonial: TestimonialType }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    setIsDeleting(true);
    await fetch(`/api/testimonials/${testimonial._id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  };

  return (
    <div className={`p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Avatar/Initials */}
      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex justify-center items-center flex-shrink-0">
        {testimonial.image ? (
          <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-blue-700 font-bold tracking-widest uppercase">
            {testimonial.name.slice(0, 2)}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight">{testimonial.name}</h3>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{testimonial.role || "Customer"}</p>
          </div>
          <div className="flex gap-1 text-amber-400">
            {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400" />
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3 py-1">
          "{testimonial.content}"
        </p>
      </div>

      <div className="flex gap-1 flex-shrink-0 self-end md:self-auto">
        <button
          onClick={handleDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Testimonial"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
