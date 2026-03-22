require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const order = await mongoose.connection.collection('orders').findOne({});
    console.log(JSON.stringify(order.items[0], null, 2));
    process.exit(0);
});
