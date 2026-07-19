import mongoose from "mongoose";

// `values` maps metric key -> selected value for user-defined metrics. The
// flat diameter/length/material/size fields are kept as a legacy mirror so a
// storefront running older code still resolves prices during rollout.
const PricingDataSchema = new mongoose.Schema({
  values: { type: Map, of: String, default: () => ({}) },
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

// User-defined variant dimensions (label + unit + values), replacing the
// previously hard-coded four. Built-ins remain as editable defaults.
const VariantMetricSchema = new mongoose.Schema({
  key:    { type: String, required: true },
  label:  { type: String, default: "" },
  unit:   { type: String, default: "" },
  values: { type: [String], default: [] },
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
    variantMetrics:    { type: [VariantMetricSchema], default: [] },
    pricingData:       { type: [PricingDataSchema], default: [] },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
