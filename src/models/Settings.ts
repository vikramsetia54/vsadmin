import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    deliveryPrice: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
  },
  { strict: false }
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
