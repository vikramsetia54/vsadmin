import mongoose from "mongoose";

const PricingDataSchema = new mongoose.Schema({
  diameter: String,
  length: String,
  material: String,
  size: String,
  price: Number,
});

const VariantOptionsSchema = new mongoose.Schema({
  diameters: { type: [String], default: [] },
  lengths:   { type: [String], default: [] },
  materials: { type: [String], default: [] },
  sizes:     { type: [String], default: [] },
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    name:              { type: String, required: true },
    description:       { type: String, default: "" },
    images:            { type: [String], default: [] },
    price:             { type: Number, default: 0 },
    unit:              { type: String, default: "piece" },
    categoryId:        { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    inStock:           { type: Boolean, default: true },
    onSale:            { type: Boolean, default: false },
    bestSeller:        { type: Boolean, default: false },
    newArrival:        { type: Boolean, default: false },
    rating:            { type: Number, default: 0 },
    // Variant product fields
    isVariantProduct:  { type: Boolean, default: false },
    variantOptions:    { type: VariantOptionsSchema, default: () => ({ diameters: [], lengths: [], materials: [], sizes: [] }) },
    pricingData:       { type: [PricingDataSchema], default: [] },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
