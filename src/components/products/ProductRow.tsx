"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Save, X, Plus,
  Layers, Box, Settings2, Info, Ruler,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface PricingRow {
  _id?: string;
  diameter?: string;
  length?: string;
  material?: string;
  size?: string;
  price: number;
}

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
    pricingData?: PricingRow[];
  };
}

/* ─── Small helpers ──────────────────────────────── */
function Badge({ active, label, activeColor }: { active: boolean; label: string; activeColor: string }) {
  return active ? (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${activeColor}`}>
      <CheckCircle2 className="h-2.5 w-2.5" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border bg-slate-50 text-slate-400 border-slate-200">
      <XCircle className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

/* ─── Pill tag list editor ───────────────────────── */
function TagEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-black">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-blue-400 hover:text-red-500">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Type then Enter or +"
          className="flex-1 p-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-400"
        />
        <button type="button" onClick={add} className="px-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-blue-600"><Plus className="h-3 w-3" /></button>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
export function ProductRow({ product }: ProductRowProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [inStock, setInStock] = useState(product.inStock ?? true);
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [edit, setEdit] = useState({
    name: product.name || "",
    price: product.price || 0,
    description: product.description || "",
    unit: product.unit || "piece",
    onSale: product.onSale || false,
    bestSeller: product.bestSeller || false,
    newArrival: product.newArrival || false,
    inStock: product.inStock ?? true,
    isVariantProduct: product.isVariantProduct ?? false,
    variantOptions: product.variantOptions ?? { diameters: [], lengths: [], materials: [], sizes: [] },
    pricingData: product.pricingData ?? [],
  });

  /* helpers */
  const setVO = (key: keyof VariantOptions, vals: string[]) =>
    setEdit((prev) => ({ ...prev, variantOptions: { ...prev.variantOptions, [key]: vals } }));

  const addPriceRow = () =>
    setEdit((prev) => ({ ...prev, pricingData: [...prev.pricingData, { diameter: "", length: "", material: "", size: "", price: 0 }] }));

  const updateRow = (idx: number, field: keyof PricingRow, value: string | number) => {
    const rows = [...edit.pricingData];
    (rows[idx] as any)[field] = value;
    setEdit((prev) => ({ ...prev, pricingData: rows }));
  };

  const removeRow = (idx: number) =>
    setEdit((prev) => ({ ...prev, pricingData: prev.pricingData.filter((_, i) => i !== idx) }));

  const handleToggleStock = async () => {
    const next = !inStock;
    setInStock(next);
    await fetch(`/api/products/${product._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: next }),
    });
    startTransition(() => router.refresh());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      setIsEditing(false);
      setInStock(edit.inStock);
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${product._id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  };

  /* pricing table columns */
  const useDia = edit.variantOptions.diameters.length > 0;
  const useLen = edit.variantOptions.lengths.length > 0;
  const useMat = edit.variantOptions.materials.length > 0;
  const useSz  = edit.variantOptions.sizes.length > 0;

  /* read-only: same from product */
  const rdDia = (product.variantOptions?.diameters.length ?? 0) > 0;
  const rdLen = (product.variantOptions?.lengths.length ?? 0) > 0;
  const rdMat = (product.variantOptions?.materials.length ?? 0) > 0;
  const rdSz  = (product.variantOptions?.sizes.length ?? 0) > 0;

  return (
    <>
      {/* ── Main Row ── */}
      <tr className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${(expanded || isEditing) ? "bg-blue-50/20" : ""}`}>
        {/* Name */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
              {product.images?.[0]
                ? <img src={product.images[0]} className="h-full w-full object-cover" alt="" />
                : <Box className="h-5 w-5 text-slate-300" />}
            </div>
            {isEditing ? (
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="border rounded-lg p-1.5 text-sm font-bold w-full outline-none focus:ring-2 focus:ring-blue-500/20" />
            ) : (
              <div>
                <p className="font-bold text-slate-900 leading-tight">{product.name}</p>
                {product.isVariantProduct && (
                  <span className="text-[9px] text-blue-600 font-black uppercase tracking-tighter flex items-center gap-1">
                    <Layers className="h-2.5 w-2.5" /> VARIABLE PRICING
                  </span>
                )}
              </div>
            )}
          </div>
        </td>

        {/* Category */}
        <td className="px-6 py-4">
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 border">{product.categoryLabel || "—"}</span>
        </td>

        {/* Price */}
        <td className="px-6 py-4">
          {isEditing ? (
            <div className="flex items-center gap-1 border rounded-lg px-2 bg-white w-28">
              <span className="text-slate-400 text-xs">₹</span>
              <input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} className="p-1 text-sm font-bold outline-none w-full" />
            </div>
          ) : (
            <div>
              <p className="text-sm font-black text-slate-900">₹{Number(product.price || 0).toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-400">per {product.unit || "piece"}</p>
            </div>
          )}
        </td>

        {/* Stock */}
        <td className="px-6 py-4">
          <button onClick={handleToggleStock} disabled={isEditing}
            className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${inStock ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
            {inStock ? "IN STOCK" : "OUT OF STOCK"}
          </button>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Save"><Save className="h-4 w-4" /></button>
                <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg" title="Cancel"><X className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <button onClick={() => setExpanded(!expanded)} title="Expand" className={`p-1.5 rounded-lg transition-all ${expanded ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"}`}>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button onClick={() => { setIsEditing(true); setExpanded(true); }} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-lg" title="Edit"><Edit3 className="h-4 w-4" /></button>
                <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* ── Expanded / Edit Panel ── */}
      {(expanded || isEditing) && (
        <tr className="bg-slate-50/50 border-b border-slate-100">
          <td colSpan={5} className="px-8 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">

              {/* ── LEFT: General Info ── */}
              <div className="xl:col-span-2 space-y-6">
                {/* Images */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Box className="h-3 w-3" /> PHOTOS</h4>
                  <div className="flex flex-wrap gap-2">
                    {(product.images ?? []).map((src, i) => (
                      <div key={i} className="h-24 w-24 rounded-2xl border overflow-hidden shadow-sm bg-white ring-4 ring-white hover:scale-105 transition-transform">
                        <img src={src} className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {(product.images ?? []).length === 0 && (
                      <div className="h-24 w-full rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center text-xs italic">No images uploaded</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><Info className="h-3 w-3" /> DESCRIPTION</h4>
                  {isEditing ? (
                    <textarea rows={4} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                      className="w-full p-3 text-sm border rounded-xl bg-white outline-none focus:ring-4 focus:ring-blue-500/5" />
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">{product.description || "—"}</p>
                  )}
                </div>

                {/* Flags & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">UNIT / SKU</p>
                    {isEditing ? (
                      <input value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} className="text-sm font-bold w-full bg-slate-50 rounded p-1.5 border outline-none" placeholder="e.g. 100 pcs" />
                    ) : (
                      <p className="text-sm font-bold text-slate-800">per {product.unit || "piece"}</p>
                    )}
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1.5 items-start">
                    {isEditing ? (
                      <>
                        {(["newArrival", "bestSeller", "onSale"] as const).map((f) => (
                          <button key={f} type="button" onClick={() => setEdit({ ...edit, [f]: !edit[f] })}
                            className={`px-2 py-0.5 rounded text-[9px] font-black border transition-all ${edit[f] ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-300"}`}>
                            {f === "newArrival" ? "NEW" : f === "bestSeller" ? "BEST" : "SALE"}
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        <Badge active={product.newArrival ?? false}  label="NEW" activeColor="bg-blue-50 text-blue-600 border-blue-200" />
                        <Badge active={product.bestSeller ?? false} label="BEST" activeColor="bg-amber-50 text-amber-600 border-amber-200" />
                        <Badge active={product.onSale ?? false}      label="SALE" activeColor="bg-rose-50 text-rose-600 border-rose-200" />
                      </>
                    )}
                  </div>
                </div>

                {/* Toggle Variant Product */}
                {isEditing && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">Variable Pricing</p>
                      <p className="text-[10px] text-slate-400">Enable for DIA × LEN × GRADE pricing matrix</p>
                    </div>
                    <div className={`toggle-track${edit.isVariantProduct ? " on" : ""}`}
                      onClick={() => setEdit({ ...edit, isVariantProduct: !edit.isVariantProduct })}>
                      <span className="toggle-thumb" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Pricing Matrix ── */}
              <div className="xl:col-span-3 space-y-6">
                {(product.isVariantProduct || edit.isVariantProduct) ? (
                  <>
                    {/* Option builders (edit mode only) */}
                    {isEditing && (
                      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 gap-5">
                        <TagEditor label="Diameters (DIA)" values={edit.variantOptions.diameters} onChange={(v) => setVO("diameters", v)} />
                        <TagEditor label="Lengths (LEN)" values={edit.variantOptions.lengths} onChange={(v) => setVO("lengths", v)} />
                        <TagEditor label="Material Grades" values={edit.variantOptions.materials} onChange={(v) => setVO("materials", v)} />
                        <TagEditor label="Sizes (optional)" values={edit.variantOptions.sizes} onChange={(v) => setVO("sizes", v)} />
                      </div>
                    )}

                    {/* Pricing table */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Settings2 className="h-3 w-3" /> PRICING MATRIX (DIA × LEN × GRADE)</h4>
                        {isEditing && (
                          <button type="button" onClick={addPriceRow} className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 flex items-center gap-1 transition-all shadow-lg">
                            <Plus className="h-3 w-3" /> ADD ROW
                          </button>
                        )}
                      </div>
                      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                {(isEditing ? useDia : rdDia) && <th className="px-4 py-3">DIA</th>}
                                {(isEditing ? useLen : rdLen) && <th className="px-4 py-3">LENGTH</th>}
                                {(isEditing ? useMat : rdMat) && <th className="px-4 py-3">GRADE</th>}
                                {(isEditing ? useSz  : rdSz)  && <th className="px-4 py-3">SIZE</th>}
                                <th className="px-4 py-3 text-right">PRICE ₹</th>
                                {isEditing && <th className="px-4 py-3 w-8"></th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(isEditing ? edit.pricingData : (product.pricingData ?? [])).map((row, idx) =>
                                isEditing ? (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    {useDia && <td className="px-3 py-2">
                                      <select value={row.diameter || ""} onChange={(e) => updateRow(idx, "diameter", e.target.value)} className="w-full p-1 bg-slate-50 border rounded outline-none text-[11px] font-bold">
                                        <option value="">—</option>
                                        {edit.variantOptions.diameters.map((d) => <option key={d}>{d}</option>)}
                                      </select>
                                    </td>}
                                    {useLen && <td className="px-3 py-2">
                                      <select value={row.length || ""} onChange={(e) => updateRow(idx, "length", e.target.value)} className="w-full p-1 bg-slate-50 border rounded outline-none text-[11px] font-bold">
                                        <option value="">—</option>
                                        {edit.variantOptions.lengths.map((l) => <option key={l}>{l}</option>)}
                                      </select>
                                    </td>}
                                    {useMat && <td className="px-3 py-2">
                                      <select value={row.material || ""} onChange={(e) => updateRow(idx, "material", e.target.value)} className="w-full p-1 bg-slate-50 border rounded outline-none text-[11px] font-bold">
                                        <option value="">—</option>
                                        {edit.variantOptions.materials.map((m) => <option key={m}>{m}</option>)}
                                      </select>
                                    </td>}
                                    {useSz && <td className="px-3 py-2">
                                      <select value={row.size || ""} onChange={(e) => updateRow(idx, "size", e.target.value)} className="w-full p-1 bg-slate-50 border rounded outline-none text-[11px] font-bold">
                                        <option value="">—</option>
                                        {edit.variantOptions.sizes.map((s) => <option key={s}>{s}</option>)}
                                      </select>
                                    </td>}
                                    <td className="px-3 py-2">
                                      <input type="number" value={row.price} onChange={(e) => updateRow(idx, "price", Number(e.target.value))} className="w-full p-1 text-right font-black border rounded bg-slate-50 outline-none focus:bg-white" />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <button onClick={() => removeRow(idx)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={idx} className="hover:bg-slate-50/40">
                                    {rdDia && <td className="px-4 py-2.5 font-bold text-slate-700">{row.diameter || "—"}</td>}
                                    {rdLen && <td className="px-4 py-2.5 text-slate-600">{row.length ? `${row.length} mm` : "—"}</td>}
                                    {rdMat && <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-black text-[10px] border border-blue-100">AISI {row.material}</span></td>}
                                    {rdSz  && <td className="px-4 py-2.5 text-slate-600">{row.size || "—"}</td>}
                                    <td className="px-4 py-2.5 text-right font-black text-slate-900">₹{Number(row.price || 0).toLocaleString("en-IN")}</td>
                                  </tr>
                                )
                              )}
                              {(isEditing ? edit.pricingData : (product.pricingData ?? [])).length === 0 && (
                                <tr>
                                  <td colSpan={6} className="px-4 py-10 text-center text-[10px] text-slate-400 font-black uppercase italic">
                                    No pricing rows yet. Click ADD ROW to start.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Simple product — no variants */
                  <div className="p-8 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                    <Ruler className="h-10 w-10 text-slate-200" />
                    <p className="text-sm font-black text-slate-400">SIMPLE PRODUCT</p>
                    <p className="text-[11px] text-slate-300">This product has a single fixed price of <strong className="text-slate-500">₹{Number(product.price || 0).toLocaleString("en-IN")}</strong> per {product.unit || "piece"}.</p>
                    {isEditing && <p className="text-[10px] text-blue-400">Enable Variable Pricing (toggle on the left) to add a DIA × LEN × GRADE matrix.</p>}
                  </div>
                )}
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
