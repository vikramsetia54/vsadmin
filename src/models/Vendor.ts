import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    product: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    pricePaid: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor ||
  mongoose.model("Vendor", VendorSchema);
