"use client";

import { Plus, Trash2, SlidersHorizontal } from "lucide-react";
import { activeMetrics, type PricingRow, type VariantMetric } from "@/lib/variants";

/**
 * Pricing matrix whose columns are derived from the product's metrics, so a
 * new admin-defined metric automatically gets a column.
 */
export function PricingMatrix({
  metrics,
  rows,
  onChange,
  readOnly,
}: {
  metrics: VariantMetric[];
  rows: PricingRow[];
  onChange: (rows: PricingRow[]) => void;
  readOnly?: boolean;
}) {
  const cols = activeMetrics(metrics);
  const noOptions = cols.length === 0;

  const addRow = () => onChange([...rows, { values: {}, price: 0 }]);

  const setCell = (idx: number, key: string, value: string) =>
    onChange(
      rows.map((r, i) =>
        i === idx ? { ...r, values: { ...r.values, [key]: value } } : r
      )
    );

  const setPrice = (idx: number, price: number) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, price } : r)));

  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">
            Pricing Matrix
            {cols.length > 0 && (
              <span className="text-slate-400 font-normal">
                {" "}
                ({cols.map((c) => c.label || c.key).join(" × ")})
              </span>
            )}
          </span>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addRow}
            disabled={noOptions}
            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-blue-600 flex items-center gap-1 transition-all shadow-sm disabled:opacity-30"
          >
            <Plus className="h-3 w-3" /> Add Row
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className="px-2 py-2 text-xs font-semibold text-slate-500 whitespace-nowrap"
                  >
                    {c.label || c.key}
                    {c.unit && (
                      <span className="text-slate-400 font-normal"> ({c.unit})</span>
                    )}
                  </th>
                ))}
                <th className="px-2 py-2 text-xs font-semibold text-slate-500 text-right">
                  Price ₹
                </th>
                {!readOnly && <th className="px-2 py-2 w-8" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {cols.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">
                      <select
                        value={row.values[c.key] ?? ""}
                        disabled={readOnly}
                        onChange={(e) => setCell(idx, c.key, e.target.value)}
                        className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium outline-none disabled:opacity-60"
                      >
                        <option value="">—</option>
                        {c.values.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.price}
                      disabled={readOnly}
                      onChange={(e) => setPrice(idx, Number(e.target.value))}
                      className="w-full p-1 text-right font-semibold border border-slate-200 rounded bg-slate-50 outline-none focus:bg-white text-xs disabled:opacity-60"
                    />
                  </td>
                  {!readOnly && (
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={cols.length + (readOnly ? 1 : 2)}
                    className="px-4 py-10 text-center text-xs text-slate-400"
                  >
                    {noOptions
                      ? "Add values to a metric above first"
                      : "Click Add Row to start building your pricing matrix"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
