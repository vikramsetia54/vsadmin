"use client";

import { useState } from "react";
import { Save, Truck, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Props {
  initial: { deliveryPrice: number; freeDeliveryThreshold: number };
}

export function SettingsForm({ initial }: Props) {
  const toast = useToast();
  const [deliveryPrice, setDeliveryPrice] = useState(initial.deliveryPrice);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(initial.freeDeliveryThreshold);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPrice, freeDeliveryThreshold }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("Settings saved", "success");
      } else {
        toast(data.error || "Failed to save settings", "error");
      }
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Truck className="h-4 w-4 text-slate-400" /> Delivery Settings
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Delivery price */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Delivery Charge (₹)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Amount charged for delivery when the order total is below the free-delivery threshold.
          </p>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-400 focus-within:bg-white transition-all w-48">
            <span className="text-slate-400 text-sm font-medium">₹</span>
            <input
              type="number"
              min={0}
              value={deliveryPrice}
              onChange={(e) => setDeliveryPrice(Number(e.target.value))}
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Free delivery threshold */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Free Delivery Above (₹)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Orders at or above this amount get free delivery. Set to <strong>0</strong> to always charge delivery.
          </p>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-400 focus-within:bg-white transition-all w-48">
            <span className="text-slate-400 text-sm font-medium">₹</span>
            <input
              type="number"
              min={0}
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
          <ShoppingBag className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            {freeDeliveryThreshold > 0
              ? <>Customers pay <strong>₹{deliveryPrice}</strong> for delivery. Orders of <strong>₹{freeDeliveryThreshold}+</strong> get free delivery.</>
              : deliveryPrice > 0
              ? <>Customers always pay <strong>₹{deliveryPrice}</strong> for delivery (no free-delivery threshold set).</>
              : "Free delivery for all orders."}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
