import mongoose from "mongoose";

// strict: false so all existing fields are accessible as plain objects
const OrderSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
