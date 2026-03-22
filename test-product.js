const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await mongoose.connection.db.collection("products").findOne({});
  console.log("Sample product:", JSON.stringify(p, null, 2));
  process.exit();
}
check();
