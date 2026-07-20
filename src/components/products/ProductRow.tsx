"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Edit3, Trash2,
  CheckCircle2, XCircle, Save, X, Plus,
  Layers, Box, Info, Ruler, Upload, Link, Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MetricEditor } from "./MetricEditor";
import { PricingMatrix } from "./PricingMatrix";
import {
  buildVariantPayload,
  normalizeMetrics,
  normalizeRows,
  type PricingRow,
  type VariantMetric,
} from "@/lib/variants";

interface VariantOptions {
  diameters: string[];
  lengths: string[];
  materials: string[];
  sizes: string[];
}

interface ProductRowProps {
  product: {
    _id: string;
    name?: string;
    description?: string;
    images?: string[];
    price?: number;
    inStock?: boolean;
    onSale?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    categoryLabel?: string;
    unit?: string;
    isVariantProduct?: boolean;
    variantOptions?: VariantOptions;
    variantMetrics?: VariantMetric[];
    pricingData?: Array<Record<string, unknown>>;
  };
}

function Badge({ active, label, activeColor }: { active: boolean; label: string; activeColor: string }) {
  return active ? (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${activeColor}`}>
      <CheckCircle2 className="h-2.5 w-2.5" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-slate-50 text-slate-400 ring-slate-200">
      <XCircle className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

export function ProductRow({ product }: ProductRowProps) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [inStock, setInStock] = useState(product.inStock ?? true);
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Canonical metrics for the saved product (used by the read-only view and
  // as the starting point when editing). Legacy docs are upgraded here.
  const productMetrics = normalizeMetrics(product);

  const [edit, setEdit] = useState({
    name: product.name || "",
    price: product.price || 0,
    description: product.description || "",
    unit: product.unit || "piece",
    onSale: product.onSale || false,
    bestSeller: product.bestSeller || false,
    newArrival: product.newArrival || false,
    inStock: product.inStock ?? true,
    images: product.images ?? [],
    isVariantProduct: product.isVariantProduct ?? false,
    // Legacy documents are upgraded to the metric shape on open.
    variantMetrics: productMetrics,
    pricingData: normalizeRows(product, productMetrics),
  });

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
            setEdit((p) => ({ ...p, images: [...p.images, data.url] }));
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
      setEdit((p) => ({ ...p, images: [...p.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const isOpen = expanded || isEditing;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  const closeModal = () => {
    setExpanded(false);
    setIsEditing(false);
  };

  const setMetrics = (metrics: VariantMetric[]) =>
    setEdit((prev) => {
      // Drop cells whose metric no longer offers that value.
      const valid = new Map(metrics.map((m) => [m.key, new Set(m.values)]));
      const pricingData = prev.pricingData.map((row) => {
        const values: Record<string, string> = {};
        for (const [k, v] of Object.entries(row.values)) {
          if (valid.get(k)?.has(v)) values[k] = v;
        }
        return { ...row, values };
      });
      return { ...prev, variantMetrics: metrics, pricingData };
    });

  const setRows = (pricingData: PricingRow[]) =>
    setEdit((prev) => ({ ...prev, pricingData }));

  const handleToggleStock = async () => {
    const next = !inStock;
    setInStock(next);
    await fetch(`/api/products/${product._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: next }),
    });
    toast(next ? "Marked in stock" : "Marked out of stock", "success");
    startTransition(() => router.refresh());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { variantMetrics, pricingData, ...rest } = edit;
      // Persist the new metric shape plus a legacy mirror for older storefronts.
      const payload = edit.isVariantProduct
        ? { ...rest, ...buildVariantPayload(variantMetrics, pricingData) }
        : { ...rest, variantMetrics: [], pricingData: [] };
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setInStock(edit.inStock);
        closeModal();
        toast("Product updated", "success");
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

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${product._id}`, { method: "DELETE" });
    toast(`Product "${product.name}" deleted`, "success");
    startTransition(() => router.refresh());
  };

  return (
    <>
      <tr
        onClick={() => { if (!isOpen) { setIsEditing(false); setExpanded(true); } }}
        className={`border-b border-slate-50 transition-colors cursor-pointer ${
          isOpen ? "bg-blue-50/15" : "hover:bg-slate-50/60"
        }`}
      >
        {/* Name */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {product.images?.[0]
                ? <img src={product.images[0]} className="h-full w-full object-cover" alt="" />
                : <Box className="h-5 w-5 text-slate-300" />}
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight text-sm">{product.name}</p>
              {product.isVariantProduct && (
                <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                  <Layers className="h-2.5 w-2.5" /> Variable pricing
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="px-6 py-4">
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200">
            {product.categoryLabel || "—"}
          </span>
        </td>

        {/* Price */}
        <td className="px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">₹{Number(product.price || 0).toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-400">per {product.unit || "piece"}</p>
          </div>
        </td>

        {/* Stock */}
        <td className="px-6 py-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleStock(); }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ring-inset transition-all ${
              inStock
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-red-50 text-red-700 ring-red-200"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </button>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); setExpanded(true); }}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {isOpen && createPortal(
        <div
          onClick={closeModal}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {product.images?.[0]
                    ? <img src={product.images[0]} className="h-full w-full object-cover" alt="" />
                    : <Box className="h-4 w-4 text-slate-300" />}
                </div>
                <div className="min-w-0">
                  {isEditing ? (
                    <input
                      value={edit.name}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                      className="font-bold text-slate-900 leading-tight text-sm w-full border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white"
                      placeholder="Product name"
                    />
                  ) : (
                    <h3 className="font-bold text-slate-900 leading-tight">{product.name}</h3>
                  )}
                  {product.isVariantProduct && (
                    <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                      <Layers className="h-2.5 w-2.5" /> Variable pricing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

                {/* LEFT: General Info */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Box className="h-3 w-3 text-slate-400" /> Photos
                      </h4>
                      {isEditing && (
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
                      )}
                    </div>

                    {isEditing && imageMode === "upload" && (
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
                    )}

                    {isEditing && imageMode === "url" && (
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
                      {(isEditing ? edit.images : (product.images ?? [])).map((src, i) => (
                        <div
                          key={i}
                          className="relative group h-20 w-20 rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white"
                        >
                          <img src={src} className="h-full w-full object-cover" />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => setEdit((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                              className="absolute inset-0 bg-red-500/75 text-white items-center justify-center hidden group-hover:flex text-xs font-semibold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {(isEditing ? edit.images : (product.images ?? [])).length === 0 && !isEditing && (
                        <div className="h-20 w-full rounded-xl border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center text-xs">
                          No images uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                      <Info className="h-3 w-3 text-slate-400" /> Description
                    </h4>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={edit.description}
                        onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                        className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white"
                      />
                    ) : (
                      <p className="text-sm text-slate-600 leading-relaxed">{product.description || "—"}</p>
                    )}
                  </div>

                  {/* Flags & Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500 mb-2">Unit / SKU</p>
                      {isEditing ? (
                        <input
                          value={edit.unit}
                          onChange={(e) => setEdit({ ...edit, unit: e.target.value })}
                          className="text-sm font-semibold w-full bg-white rounded-lg p-1.5 border border-slate-200 outline-none focus:border-blue-400"
                          placeholder="e.g. 100 pcs"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800">per {product.unit || "piece"}</p>
                      )}
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 items-start">
                      {isEditing ? (
                        <>
                          {(["newArrival", "bestSeller", "onSale"] as const).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setEdit({ ...edit, [f]: !edit[f] })}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ring-1 ring-inset transition-all ${
                                edit[f]
                                  ? "bg-blue-50 ring-blue-200 text-blue-600"
                                  : "bg-white ring-slate-200 text-slate-400"
                              }`}
                            >
                              {f === "newArrival" ? "New" : f === "bestSeller" ? "Best" : "Sale"}
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          <Badge active={product.newArrival ?? false}  label="New"  activeColor="bg-blue-50 text-blue-700 ring-blue-200" />
                          <Badge active={product.bestSeller ?? false}  label="Best" activeColor="bg-amber-50 text-amber-700 ring-amber-200" />
                          <Badge active={product.onSale ?? false}      label="Sale" activeColor="bg-rose-50 text-rose-700 ring-rose-200" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Base price (edit mode) */}
                  {isEditing && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500 mb-2">Base Price (₹)</p>
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 bg-white w-full">
                        <span className="text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={edit.price}
                          onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })}
                          className="p-1.5 text-sm font-semibold outline-none w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Toggle Variant Product */}
                  {isEditing && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Variable Pricing</p>
                        <p className="text-xs text-slate-500 mt-0.5">Enable DIA × LEN × GRADE pricing matrix</p>
                      </div>
                      <div
                        className={`toggle-track${edit.isVariantProduct ? " on" : ""}`}
                        onClick={() => setEdit({ ...edit, isVariantProduct: !edit.isVariantProduct })}
                      >
                        <span className="toggle-thumb" />
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Pricing Matrix */}
                <div className="xl:col-span-3 space-y-6">
                  {(product.isVariantProduct || edit.isVariantProduct) ? (
                    <>
                      {isEditing && (
                        <MetricEditor
                          metrics={edit.variantMetrics}
                          onChange={setMetrics}
                        />
                      )}

                      <PricingMatrix
                        metrics={isEditing ? edit.variantMetrics : productMetrics}
                        rows={isEditing ? edit.pricingData : normalizeRows(product, productMetrics)}
                        onChange={setRows}
                        readOnly={!isEditing}
                      />
                    </>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                      <Ruler className="h-10 w-10 text-slate-200" />
                      <p className="text-sm font-semibold text-slate-400">Simple product</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Fixed price of{" "}
                        <strong className="text-slate-600">₹{Number(product.price || 0).toLocaleString("en-IN")}</strong>{" "}
                        per {product.unit || "piece"}.
                      </p>
                      {isEditing && (
                        <p className="text-xs text-blue-500">Enable Variable Pricing (toggle left) to add a DIA × LEN × Grade matrix.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
