import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

export const Blog =
  mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
