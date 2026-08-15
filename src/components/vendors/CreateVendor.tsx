"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const blank = () => ({
  name: "",
  phone: "",
  email: "",
  product: "",
  quantity: 0,
  pricePaid: 0,
  notes: "",
});

export function CreateVendor() {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank());

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        const name = form.name;
        setIsOpen(false);
        setForm(blank());
        toast(`Vendor "${name}" added`, "success");
        startTransition(() => router.refresh());
      } else {
        toast(data.error || "Failed to add vendor", "error");
      }
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
      >
        <Plus className="h-4 w-4" /> Add Vendor
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">New Vendor</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vendor Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Ramesh Traders"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="vendor@example.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product</label>
                <input
                  value={form.product}
                  onChange={(e) => set("product", e.target.value)}
                  placeholder="e.g. Hex Bolt M6 × 30"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Quantity + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => set("quantity", Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Paid (₹)</label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all">
                    <span className="text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={form.pricePaid}
                      onChange={(e) => set("pricePaid", Number(e.target.value))}
                      className="flex-1 bg-transparent outline-none text-sm text-slate-900 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Payment terms, delivery date, etc."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving…" : <><Save className="h-4 w-4" /> Save Vendor</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
