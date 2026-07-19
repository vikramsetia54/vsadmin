"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, Layers, Box, ChevronDown, Upload, Link, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MetricEditor } from "./MetricEditor";
import { PricingMatrix } from "./PricingMatrix";
import {
  buildVariantPayload,
  defaultMetrics,
  activeMetrics,
  type PricingRow,
  type VariantMetric,
} from "@/lib/variants";

interface AddProductProps {
  categories: { _id: string; label?: string; name?: string }[];
}

export function AddProduct({ categories }: AddProductProps) {
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const blankForm = () => ({
    name: "",
    description: "",
    price: 0,
    unit: "100 pcs",
    categoryId: "",
    images: [] as string[],
    inStock: true,
    newArrival: false,
    bestSeller: false,
    onSale: false,
    isVariantProduct: false,
    variantMetrics: defaultMetrics() as VariantMetric[],
    pricingData: [] as PricingRow[],
  });

  const [form, setForm] = useState(blankForm());
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setUploadingCount((n) => n + arr.length);
    await Promise.all(
      arr.map(async (file) => {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (data.ok) {
            setForm((p) => ({ ...p, images: [...p.images, data.url] }));
          } else {
            toast("Upload failed: " + data.error, "error");
          }
        } catch {
          toast("Upload failed. Please try again.", "error");
        } finally {
          setUploadingCount((n) => n - 1);
        }
      })
    );
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setForm((p) => ({ ...p, images: [...p.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const setMetrics = (metrics: VariantMetric[]) => {
    setForm((p) => {
      // Drop cells whose metric no longer has that value (renamed/removed).
      const valid = new Map(metrics.map((m) => [m.key, new Set(m.values)]));
      const pricingData = p.pricingData.map((row) => {
        const values: Record<string, string> = {};
        for (const [k, v] of Object.entries(row.values)) {
          if (valid.get(k)?.has(v)) values[k] = v;
        }
        return { ...row, values };
      });
      return { ...p, variantMetrics: metrics, pricingData };
    });
  };

  const setRows = (pricingData: PricingRow[]) =>
    setForm((p) => ({ ...p, pricingData }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId) return alert("Please fill Name and Category.");
    setSaving(true);
    try {
      const { variantMetrics, pricingData, ...rest } = form;
      // Persist the new metric shape plus a legacy mirror for older storefronts.
      const payload = form.isVariantProduct
        ? { ...rest, ...buildVariantPayload(variantMetrics, pricingData) }
        : { ...rest, variantMetrics: [], pricingData: [] };
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        const createdName = form.name;
        setIsOpen(false);
        setForm(blankForm());
        toast(`Product "${createdName}" added`, "success");
        startTransition(() => router.refresh());
      } else {
        toast(data.error || "Failed to save product", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  const noOptions = activeMetrics(form.variantMetrics).length === 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
      >
        <Plus className="h-4 w-4" /> Add Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-6xl bg-white sm:rounded-3xl rounded-2xl shadow-2xl border border-slate-200 my-2 sm:my-4 overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Box className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(100vh-120px)]">
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                {/* LEFT: Core Info */}
                <div className="lg:col-span-4 p-6 space-y-4">
                  <p className="text-xs font-semibold text-slate-500 pb-1 border-b border-slate-100">General Info</p>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Product Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Hex Bolt"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white appearance-none pr-10 transition-all"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.label || c.name || c._id}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Base Price (₹) *</label>
                      <input
                        required
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Unit</label>
                      <input
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        placeholder="100 pcs"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Material, standards, usage info…"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-slate-700">Product Images</label>
                      <div className="flex rounded-lg bg-slate-100 p-0.5">
                        <button
                          type="button"
                          onClick={() => setImageMode("upload")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            imageMode === "upload" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Upload className="h-3 w-3" /> Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode("url")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            imageMode === "url" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Link className="h-3 w-3" /> URL
                        </button>
                      </div>
                    </div>

                    {imageMode === "upload" ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={imageInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.length) uploadFiles(e.target.files);
                            e.target.value = "";
                          }}
                        />
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
                          }}
                          onClick={() => uploadingCount === 0 && imageInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-3 text-center transition-all mb-2 ${
                            isDragging
                              ? "border-blue-400 bg-blue-50/50"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          } ${uploadingCount > 0 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {uploadingCount > 0 ? (
                            <div className="flex items-center justify-center gap-2 py-1">
                              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                              <p className="text-xs text-blue-600 font-medium">Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}…</p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 py-1">
                              <Upload className="h-4 w-4 text-slate-400" />
                              <p className="text-xs font-medium text-slate-600">Drop images here or click to browse</p>
                              <span className="text-[11px] text-slate-400">PNG, JPG, WebP</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-2 mb-2">
                        <input
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
                          placeholder="Paste image URL then Enter"
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={addImageUrl}
                          className="px-3 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {form.images.map((src, i) => (
                        <div key={i} className="relative group h-14 w-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          <img src={src} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                            className="absolute inset-0 bg-red-500/75 text-white items-center justify-center hidden group-hover:flex text-xs font-semibold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Flags</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      {(["inStock", "newArrival", "bestSeller", "onSale"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setForm({ ...form, [f]: !form[f] })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset transition-all ${
                            form[f]
                              ? "bg-blue-50 ring-blue-200 text-blue-700 shadow-sm"
                              : "bg-white ring-slate-200 text-slate-400"
                          }`}
                        >
                          {f === "inStock" ? "In Stock" : f === "newArrival" ? "New" : f === "bestSeller" ? "Best" : "Sale"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Variant Pricing */}
                <div className="lg:col-span-8 p-6 space-y-5 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Pricing Configuration</p>
                      <p className="text-xs text-slate-400 mt-0.5">Simple product uses base price. Enable variable for DIA × LEN × Grade pricing.</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-slate-600">Variable</span>
                      <div
                        className={`toggle-track${form.isVariantProduct ? " on" : ""}`}
                        onClick={() => setForm({ ...form, isVariantProduct: !form.isVariantProduct })}
                      >
                        <span className="toggle-thumb" />
                      </div>
                    </div>
                  </div>

                  {form.isVariantProduct ? (
                    <>
                      <MetricEditor
                        metrics={form.variantMetrics}
                        onChange={setMetrics}
                      />

                      <PricingMatrix
                        metrics={form.variantMetrics}
                        rows={form.pricingData}
                        onChange={setRows}
                      />
                    </>
                  ) : (
                    <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-2">
                      <Layers className="h-8 w-8 text-slate-200" />
                      <p className="text-sm font-semibold text-slate-400">Simple fixed price</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        This product will use the base price above. Enable variable pricing to define per-dimension pricing.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-4 items-center bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 font-semibold text-slate-500 hover:text-slate-700 text-sm transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {saving ? "Publishing…" : <><Save className="h-4 w-4" /> Publish Product</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
