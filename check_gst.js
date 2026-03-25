const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://localhost:27017/vsenterprises";

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function checkOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();
    
    // Check if any order has gstno or some variant
    orders.forEach(o => {
      console.log(`Order ID: ${o._id}`);
      console.log(`- gstno: ${o.gstno}`);
      console.log(`- shippingAddress.gstno: ${o.shippingAddress?.gstno}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
