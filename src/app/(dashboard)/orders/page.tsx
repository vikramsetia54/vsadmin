import { Search } from "lucide-react";
import connectToDB from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { OrderRow } from "@/components/orders/OrderRow";

export default async function OrdersPage() {
  await connectToDB();
  // Ensure Product model is initialized for populate
  Product.init();
  const rawOrders = await Order.find()
    .populate({ path: "items.product", model: Product, strictPopulate: false })
    .sort({ createdAt: -1 })
    .lean() as any[];
  const orders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} recorded</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <input
              type="text"
              className="bg-slate-50 border border-slate-100 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 block w-full pl-9 py-2.5 outline-none transition"
              placeholder="Search orders…"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <OrderRow
                    key={order._id.toString()}
                    order={{
                      _id: order._id.toString(),
                      shippingAddress: order.shippingAddress,
                      email: order.email,
                      createdAt: order.createdAt?.toString(),
                      status: order.status,
                      totalAmount: order.totalAmount,
                      subtotal: order.subtotal,
                      shippingCharges: order.shippingCharges,
                      transactionId: order.transactionId,
                      paymentMethod: order.paymentMethod,
                      paymentStatus: order.paymentStatus,
                      items: order.items ? JSON.parse(JSON.stringify(order.items)) : [],
                    }}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-50 text-[11px] text-slate-300 font-bold">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
