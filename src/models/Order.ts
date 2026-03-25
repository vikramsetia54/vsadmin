import mongoose from "mongoose";

// strict: false so all existing fields are accessible as plain objects
const OrderSchema = new mongoose.Schema({
  gstno: String,
  invoicePdf: String,
  invoiceData: Buffer,
  invoiceMimeType: String,
  status: String,
  paymentStatus: String,
  transactionId: String,
}, { strict: false, timestamps: true });

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
