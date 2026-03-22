import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

export const Testimonial =
  mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
