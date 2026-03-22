"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, ChevronUp, Package } from "lucide-react";

const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled", "Pending"] as const;

const statusColors: Record<string, string> = {
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped:    "bg-purple-50 text-purple-700 border-purple-200",
  Delivered:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled:  "bg-red-50 text-red-700 border-red-200",
  Pending:    "bg-amber-50 text-amber-600 border-amber-200",
};

interface OrderItem {
  name?: string;
  price?: number;
  quantity?: number;
  images?: string[];
}

interface ShippingAddress {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface OrderRowProps {
  order: {
    _id: string;
    shippingAddress?: ShippingAddress;
    email?: string;
    createdAt?: string;
    status?: string;
    totalAmount?: number;
    subtotal?: number;
    shippingCharges?: number;
    transactionId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    items?: OrderItem[];
  };
}

export function OrderRow({ order }: OrderRowProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status ?? "Processing");
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await fetch(`/api/orders/${order._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    startTransition(() => router.refresh());
  };

  const handleDelete = async () => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/orders/${order._id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  };

  const statusClass = statusColors[status] ?? "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <>
      <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${deleting ? "opacity-40 pointer-events-none" : ""} ${expanded ? "bg-blue-50/30" : ""}`}>
        <td className="px-6 py-4 font-medium text-slate-900">
          #{order._id.slice(-6).toUpperCase()}
        </td>
        <td className="px-6 py-4">{order.shippingAddress?.name ?? "—"}</td>
        <td className="px-6 py-4">{order.email ?? "—"}</td>
        <td className="px-6 py-4">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—"}
        </td>
        <td className="px-6 py-4">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className={`text-xs font-semibold rounded-full px-2.5 py-1 border outline-none cursor-pointer ${statusClass}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4 font-medium text-slate-900">
          ₹{Number(order.totalAmount ?? 0).toLocaleString("en-IN")}
        </td>
        <td className="px-6 py-4 font-mono text-xs text-slate-600">
          {order.transactionId ?? <span className="text-slate-300">—</span>}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete order"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* ── Expanded detail row ── */}
      {expanded && (
        <tr className="border-b border-slate-100 bg-slate-50/70">
          <td colSpan={8} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Order items */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Items Ordered
                </h4>
                <div className="flex flex-col gap-2">
                  {(order.items ?? []).length > 0 ? (
                    order.items!.map((item, i) => {
                      const dbImage = (item as any).product?.images?.[0];
                      const itemImage = typeof item.images === "string" ? item.images : Array.isArray(item.images) ? item.images[0] : (item as any).image;
                      const photoUrl = dbImage || itemImage;
                      return (
                      <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg p-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                          {photoUrl ? (
                            <img src={photoUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-300">IMG</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.name ?? "—"}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity ?? 1}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 flex-shrink-0">
                          ₹{Number((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })
                  ) : (
                    <p className="text-sm text-slate-400">No items recorded.</p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="mt-3 border-t border-slate-200 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{Number(order.subtotal ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>
                    <span>{order.shippingCharges === 0 ? "Free" : `₹${Number(order.shippingCharges ?? 0).toLocaleString("en-IN")}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total</span>
                    <span>₹{Number(order.totalAmount ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Shipping + payment info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Shipping Address</h4>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 text-sm text-slate-700 space-y-0.5">
                    <p className="font-medium">{order.shippingAddress?.name ?? "—"}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}</p>
                    <p>{order.shippingAddress?.country}</p>
                    {order.shippingAddress?.phone && (
                      <p className="text-slate-500 text-xs pt-1">📞 {order.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Payment</h4>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 text-sm text-slate-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Method</span>
                      <span className="font-medium uppercase">{order.paymentMethod ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Status</span>
                      <span className={`font-semibold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                        {order.paymentStatus ?? "—"}
                      </span>
                    </div>
                    {order.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transaction ID</span>
                        <span className="font-mono text-xs">{order.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
