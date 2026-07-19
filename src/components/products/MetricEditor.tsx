"use client";

import { useState } from "react";
import { Plus, X, Trash2, Ruler } from "lucide-react";
import {
  UNIT_PRESETS,
  newMetricKey,
  type VariantMetric,
} from "@/lib/variants";

/** Value chips + "type then Enter" input for a single metric. */
function ValueTags({
  values,
  placeholder,
  onChange,
}: {
  values: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1 empty:hidden">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 rounded-lg text-[11px] font-medium"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="px-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/** Unit dropdown with a "Custom…" escape hatch for anything not preset. */
function UnitPicker({
  unit,
  onChange,
}: {
  unit: string;
  onChange: (u: string) => void;
}) {
  const isCustom = unit !== "" && !UNIT_PRESETS.includes(unit);
  const [custom, setCustom] = useState(isCustom);

  if (custom) {
    return (
      <div className="flex gap-1">
        <input
          autoFocus
          value={unit}
          onChange={(e) => onChange(e.target.value)}
          placeholder="unit"
          className="w-20 px-2 py-1 text-[11px] bg-white border border-blue-300 rounded-md outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => {
            setCustom(false);
            onChange("");
          }}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Use a preset unit instead"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <select
      value={unit}
      onChange={(e) => {
        if (e.target.value === "__custom__") {
          setCustom(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className="w-24 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md outline-none focus:border-blue-400 transition-colors"
    >
      {UNIT_PRESETS.map((u) => (
        <option key={u || "none"} value={u}>
          {u === "" ? "no unit" : u}
        </option>
      ))}
      <option value="__custom__">Custom…</option>
    </select>
  );
}

/**
 * Editable list of variant metrics. Each metric has a renameable label, a
 * unit, and its own values; metrics can be added or removed freely.
 */
export function MetricEditor({
  metrics,
  onChange,
  disabled,
}: {
  metrics: VariantMetric[];
  onChange: (m: VariantMetric[]) => void;
  disabled?: boolean;
}) {
  const update = (idx: number, patch: Partial<VariantMetric>) =>
    onChange(metrics.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  const remove = (idx: number) => onChange(metrics.filter((_, i) => i !== idx));

  const addMetric = () =>
    onChange([
      ...metrics,
      { key: newMetricKey(), label: "", unit: "", values: [] },
    ]);

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Ruler className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Metrics</span>
        </div>
        <button
          type="button"
          onClick={addMetric}
          disabled={disabled}
          className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg hover:bg-blue-600 flex items-center gap-1 transition-all disabled:opacity-30"
        >
          <Plus className="h-3 w-3" /> Add Metric
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((m, idx) => (
          <div
            key={m.key}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
          >
            <div className="flex items-center gap-1.5">
              <input
                value={m.label}
                onChange={(e) => update(idx, { label: e.target.value })}
                placeholder="Metric name e.g. Diameters"
                className="min-w-0 flex-1 px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-md outline-none focus:border-blue-400 transition-colors"
              />
              <UnitPicker unit={m.unit} onChange={(u) => update(idx, { unit: u })} />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                title="Remove metric"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <ValueTags
              values={m.values}
              placeholder={m.unit ? `Type then Enter (${m.unit})` : "Type then Enter"}
              onChange={(v) => update(idx, { values: v })}
            />
          </div>
        ))}
      </div>

      {metrics.length === 0 && (
        <p className="py-6 text-center text-xs text-slate-400">
          No metrics yet — click Add Metric to define one (e.g. Diameter, Length, Colour).
        </p>
      )}
    </div>
  );
}
