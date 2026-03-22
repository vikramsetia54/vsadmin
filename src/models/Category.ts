import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({}, { strict: false, timestamps: true });

export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
