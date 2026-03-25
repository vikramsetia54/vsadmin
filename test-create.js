const mongoose = require("mongoose");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }
  await mongoose.connect(uri);
  
  const productData = {
    name: "Test Add 3",
    description: "test",
    price: 0,
    unit: "100 pcs",
    categoryId: new mongoose.Types.ObjectId(),
    images: [],
    inStock: true,
    newArrival: false,
    bestSeller: false,
    onSale: false,
    isVariantProduct: true,
    variantOptions: { diameters: [], lengths: ["10"], materials: [], sizes: [] },
    pricingData: [{ diameter: "", length: "10", material: "", size: "", price: 100 }],
  };

  try {
    const res = await mongoose.connection.db.collection("products").insertOne(productData);
    console.log("Success", res.insertedId);
  } catch (err) {
    console.error("Error creating:", err);
  }
  process.exit(0);
}

run();
