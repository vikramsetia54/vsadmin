"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2, Save, X, Phone, Mail, Package, IndianRupee } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface VendorType {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  product?: string;
  quantity?: number;
  pricePaid?: number;
  notes?: string;
  createdAt?: string;
}

export function VendorRow({ vendor }: { vendor: VendorType }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [edit, setEdit] = useState({
    name: vendor.name || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    product: vendor.product || "",
    quantity: vendor.quantity ?? 0,
    pricePaid: vendor.pricePaid ?? 0,
    notes: vendor.notes || "",
  });

  const set = (k: string, v: string | number) => setEdit((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isEditing]);

  const handleDelete = async () => {
    if (!confirm(`Delete vendor "${vendor.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/vendors/${vendor._id}`, { method: "DELETE" });
    toast(`Vendor "${vendor.name}" deleted`, "success");
    startTransition(() => router.refresh());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/vendors/${vendor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (data.ok) {
        setIsEditing(false);
        toast("Vendor updated", "success");
        startTransition(() => router.refresh());
      } else {
        toast(data.error || "Failed to update vendor", "error");
      }
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (deleting) return null;

  return (
    <>
      <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
        {/* Vendor */}
        <td className="px-6 py-4">
          <p className="font-semibold text-slate-900 text-sm">{vendor.name}</p>
          {vendor.notes && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{vendor.notes}</p>
          )}
        </td>

        {/* Contact */}
        <td className="px-6 py-4">
          <div className="flex flex-col gap-0.5">
            {vendor.phone && (
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Phone className="h-3 w-3 text-slate-400" /> {vendor.phone}
              </span>
            )}
            {vendor.email && (
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Mail className="h-3 w-3 text-slate-400" /> {vendor.email}
              </span>
            )}
            {!vendor.phone && !vendor.email && <span className="text-xs text-slate-400">—</span>}
          </div>
        </td>

        {/* Product */}
        <td className="px-6 py-4">
          {vendor.product ? (
            <span className="flex items-center gap-1.5 text-sm text-slate-700">
              <Package className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              {vendor.product}
            </span>
          ) : (
            <span className="text-sm text-slate-400">—</span>
          )}
        </td>

        {/* Quantity */}
        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
          {vendor.quantity ?? "—"}
        </td>

        {/* Price Paid */}
        <td className="px-6 py-4">
          <span className="flex items-center gap-0.5 text-sm font-semibold text-slate-900">
            <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
            {Number(vendor.pricePaid ?? 0).toLocaleString("en-IN")}
          </span>
        </td>

        {/* Date */}
        <td className="px-6 py-4 text-xs text-slate-400">
          {vendor.createdAt
            ? new Date(vendor.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Edit modal */}
      {isEditing && (
        <tr>
          <td colSpan={7} className="p-0">
            <div
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                  <h3 className="font-bold text-slate-900">Edit Vendor</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vendor Name *</label>
                    <input
                      value={edit.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={edit.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={edit.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product</label>
                    <input
                      value={edit.product}
                      onChange={(e) => set("product", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
                      <input
                        type="number"
                        min={0}
                        value={edit.quantity}
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
                          value={edit.pricePaid}
                          onChange={(e) => set("pricePaid", Number(e.target.value))}
                          className="flex-1 bg-transparent outline-none text-sm text-slate-900 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                    <textarea
                      rows={2}
                      value={edit.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-none"
                    />
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
