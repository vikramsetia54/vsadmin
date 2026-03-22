"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, Layers, Trash2, Box, ChevronDown } from "lucide-react";

interface AddProductProps {
  categories: { _id: string; label: string }[];
}

interface PricingRow {
  diameter: string;
  length: string;
  material: string;
  size: string;
  price: number;
}

/* ─── Tag editor (same as in ProductRow) ───────────── */
function TagEditor({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}><X className="h-2.5 w-2.5" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="flex-1 p-1.5 text-[11px] bg-slate-50 border rounded-lg outline-none focus:bg-white focus:border-blue-400" />
        <button type="button" onClick={add} className="px-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all"><Plus className="h-3 w-3" /></button>
      </div>
    </div>
  );
}

export function AddProduct({ categories }: AddProductProps) {
  const router = useRouter();
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
    variantOptions: { diameters: [] as string[], lengths: [] as string[], materials: [] as string[], sizes: [] as string[] },
    pricingData: [] as PricingRow[],
  });

  const [form, setForm] = useState(blankForm());
  const [imageUrl, setImageUrl] = useState("");

  const setVO = (key: string, vals: string[]) =>
    setForm((p) => ({ ...p, variantOptions: { ...p.variantOptions, [key]: vals } }));

  const addRow = () =>
    setForm((p) => ({ ...p, pricingData: [...p.pricingData, { diameter: "", length: "", material: "", size: "", price: 0 }] }));

  const updateRow = (idx: number, field: keyof PricingRow, value: string | number) => {
    const rows = [...form.pricingData];
    (rows[idx] as any)[field] = value;
    setForm((p) => ({ ...p, pricingData: rows }));
  };

  const removeRow = (idx: number) =>
    setForm((p) => ({ ...p, pricingData: p.pricingData.filter((_, i) => i !== idx) }));

  const addImage = () => { if (imageUrl.trim()) { setForm((p) => ({ ...p, images: [...p.images, imageUrl.trim()] })); setImageUrl(""); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId) return alert("Please fill Name and Category.");
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setIsOpen(false);
        setForm(blankForm());
        startTransition(() => router.refresh());
      }
    } finally {
      setSaving(false);
    }
  };

  const { diameters, lengths, materials, sizes } = form.variantOptions;
  const noOptions = !diameters.length && !lengths.length && !materials.length && !sizes.length;

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all">
        <Plus className="h-4 w-4" /> ADD PRODUCT
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white sm:rounded-3xl rounded-2xl shadow-2xl border border-slate-200 my-2 sm:my-8 overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl"><Box className="h-5 w-5 text-blue-600" /></div>
                <h3 className="text-xl font-black text-slate-900">Add New Product</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 max-h-[80vh] overflow-y-auto">

                {/* ── LEFT: Core Info ── */}
                <div className="lg:col-span-4 p-7 space-y-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">General Info</p>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Product Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Stainless Steel Hex Bolt"
                      className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white shadow-sm" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Category *</label>
                    <div className="relative">
                      <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white shadow-sm appearance-none pr-10">
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Base Price (₹) *</label>
                      <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Unit</label>
                      <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="100 pcs"
                        className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Description</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Material, standards, usage info..."
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white shadow-sm" />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Product Images</label>
                    <div className="flex gap-2 mb-2">
                      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => { if(e.key==="Enter") { e.preventDefault(); addImage(); } }}
                        placeholder="Paste image URL then Enter"
                        className="flex-1 border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 bg-white" />
                      <button type="button" onClick={addImage} className="px-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.images.map((src, i) => (
                        <div key={i} className="relative group h-16 w-16 rounded-xl overflow-hidden border bg-slate-50">
                          <img src={src} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                            className="absolute inset-0 bg-red-500/70 text-white items-center justify-center hidden group-hover:flex text-[10px] font-black">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Flags</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border">
                      {(["inStock", "newArrival", "bestSeller", "onSale"] as const).map((f) => (
                        <button key={f} type="button" onClick={() => setForm({ ...form, [f]: !form[f] })}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all ${form[f] ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" : "bg-white border-slate-200 text-slate-300"}`}>
                          {f === "inStock" ? "IN STOCK" : f === "newArrival" ? "NEW" : f === "bestSeller" ? "BEST SELLER" : "ON SALE"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: Variant Pricing ── */}
                <div className="lg:col-span-8 p-7 space-y-5 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Pricing Configuration</p>
                      <p className="text-xs text-slate-500 mt-0.5">Simple product uses base price. Enable variable for DIA × LEN × GRADE pricing.</p>
                    </div>
                    {/* Toggle */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-500">VARIABLE PRICING</span>
                      <div className={`toggle-track${form.isVariantProduct ? " on" : ""}`}
                        onClick={() => setForm({ ...form, isVariantProduct: !form.isVariantProduct })}>
                        <span className="toggle-thumb" />
                      </div>
                    </div>
                  </div>

                  {form.isVariantProduct ? (
                    <>
                      {/* Option builders */}
                      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-5">
                        <TagEditor label="Diameters (DIA)" placeholder="e.g. 6" values={diameters} onChange={(v) => setVO("diameters", v)} />
                        <TagEditor label="Lengths (LEN)" placeholder="e.g. 10" values={lengths} onChange={(v) => setVO("lengths", v)} />
                        <TagEditor label="Material Grades" placeholder="e.g. 304" values={materials} onChange={(v) => setVO("materials", v)} />
                        <TagEditor label="Sizes (optional)" placeholder="e.g. M6" values={sizes} onChange={(v) => setVO("sizes", v)} />
                      </div>

                      {/* Pricing table */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing Matrix</span>
                          <button type="button" onClick={addRow} disabled={noOptions}
                            className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 flex items-center gap-1 transition-all shadow-lg disabled:opacity-30">
                            <Plus className="h-3 w-3" /> ADD ROW
                          </button>
                        </div>
                        <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-slate-50 border-b text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                  {diameters.length > 0 && <th className="px-4 py-3">DIA</th>}
                                  {lengths.length > 0   && <th className="px-4 py-3">LENGTH</th>}
                                  {materials.length > 0 && <th className="px-4 py-3">GRADE</th>}
                                  {sizes.length > 0     && <th className="px-4 py-3">SIZE</th>}
                                  <th className="px-4 py-3 text-right">PRICE ₹</th>
                                  <th className="px-4 py-3 w-8"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.pricingData.map((row, idx) => (
                                  <tr key={idx}>
                                    {diameters.length > 0 && <td className="px-3 py-2">
                                      <select value={row.diameter} onChange={(e) => updateRow(idx, "diameter", e.target.value)} className="w-full p-1 bg-slate-50 border rounded text-[11px] font-bold outline-none">
                                        <option value="">—</option>
                                        {diameters.map((d) => <option key={d}>{d}</option>)}
                                      </select>
                                    </td>}
                                    {lengths.length > 0 && <td className="px-3 py-2">
                                      <select value={row.length} onChange={(e) => updateRow(idx, "length", e.target.value)} className="w-full p-1 bg-slate-50 border rounded text-[11px] font-bold outline-none">
                                        <option value="">—</option>
                                        {lengths.map((l) => <option key={l}>{l}</option>)}
                                      </select>
                                    </td>}
                                    {materials.length > 0 && <td className="px-3 py-2">
                                      <select value={row.material} onChange={(e) => updateRow(idx, "material", e.target.value)} className="w-full p-1 bg-slate-50 border rounded text-[11px] font-bold outline-none">
                                        <option value="">—</option>
                                        {materials.map((m) => <option key={m}>{m}</option>)}
                                      </select>
                                    </td>}
                                    {sizes.length > 0 && <td className="px-3 py-2">
                                      <select value={row.size} onChange={(e) => updateRow(idx, "size", e.target.value)} className="w-full p-1 bg-slate-50 border rounded text-[11px] font-bold outline-none">
                                        <option value="">—</option>
                                        {sizes.map((s) => <option key={s}>{s}</option>)}
                                      </select>
                                    </td>}
                                    <td className="px-3 py-2">
                                      <input type="number" value={row.price} onChange={(e) => updateRow(idx, "price", Number(e.target.value))} className="w-full p-1 text-right font-black border rounded bg-slate-50 outline-none focus:bg-white" />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <button type="button" onClick={() => removeRow(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </td>
                                  </tr>
                                ))}
                                {form.pricingData.length === 0 && (
                                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[10px] text-slate-400 italic">
                                    {noOptions ? "First add some Diameters / Lengths / Grades above" : "Click ADD ROW to start building your pricing matrix"}
                                  </td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                      <Layers className="h-10 w-10 text-slate-200" />
                      <p className="text-sm font-black text-slate-400">SIMPLE FIXED PRICE</p>
                      <p className="text-[11px] text-slate-300 max-w-xs">This product will use the base price above. Enable variable pricing to define per-dimension pricing (e.g. DIA × LENGTH × GRADE).</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t flex gap-4 items-center bg-white">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 text-sm">Discard</button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 disabled:opacity-50 transition-all active:scale-95">
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
