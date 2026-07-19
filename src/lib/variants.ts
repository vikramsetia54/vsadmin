/**
 * Variant metrics: shared definitions + legacy compatibility.
 *
 * Historically a product had exactly four hard-coded dimensions
 * (diameters / lengths / materials / sizes) stored in `variantOptions`, and
 * pricing rows carried flat `{ diameter, length, material, size, price }`
 * fields. Metrics are now user-defined: each has a label, a unit and its own
 * list of values, and pricing rows key their selections by metric `key`.
 *
 * The four originals are kept as *editable defaults* so existing products keep
 * working: `normalizeMetrics` upgrades legacy documents on read, and
 * `buildVariantPayload` writes the legacy shape alongside the new one so a
 * storefront running older code keeps rendering correctly.
 */

export interface VariantMetric {
  key: string;
  label: string;
  unit: string;
  values: string[];
}

export interface PricingRow {
  values: Record<string, string>;
  price: number;
  // Legacy mirror, written for the four built-in keys only.
  diameter?: string;
  length?: string;
  material?: string;
  size?: string;
}

/** Built-in metric keys, mapped to their legacy `variantOptions` array name. */
export const BUILTIN_KEYS = {
  diameter: "diameters",
  length: "lengths",
  material: "materials",
  size: "sizes",
} as const;

export type BuiltinKey = keyof typeof BUILTIN_KEYS;

/** Unit presets offered in the dropdown. Admins can also type a custom unit. */
export const UNIT_PRESETS = [
  "",
  "mm",
  "cm",
  "m",
  "inch",
  "ft",
  "kg",
  "g",
  "sq mm",
  "AWG",
  "A",
  "V",
  "W",
];

/** Metrics pre-filled for a brand new product. Fully editable/removable. */
export function defaultMetrics(): VariantMetric[] {
  return [
    { key: "diameter", label: "Diameters (DIA)", unit: "mm", values: [] },
    { key: "length", label: "Lengths (LEN)", unit: "mm", values: [] },
    { key: "material", label: "Material Grades", unit: "", values: [] },
    { key: "size", label: "Sizes", unit: "", values: [] },
  ];
}

/** Stable-ish unique key for an admin-created metric. */
export function newMetricKey(): string {
  return `m_${Math.random().toString(36).slice(2, 9)}`;
}

interface LegacyProduct {
  variantMetrics?: VariantMetric[];
  variantOptions?: {
    diameters?: string[];
    lengths?: string[];
    materials?: string[];
    sizes?: string[];
  };
  pricingData?: Array<Record<string, unknown>>;
}

/**
 * Canonical metric list for a product, upgrading legacy documents.
 * Returns metrics in a stable order with their values.
 */
export function normalizeMetrics(product: LegacyProduct | null | undefined): VariantMetric[] {
  if (!product) return [];

  if (Array.isArray(product.variantMetrics) && product.variantMetrics.length > 0) {
    return product.variantMetrics.map((m) => ({
      key: m.key,
      label: m.label ?? m.key,
      unit: m.unit ?? "",
      values: Array.isArray(m.values) ? m.values : [],
    }));
  }

  const opts = (product.variantOptions ?? {}) as Record<string, string[] | undefined>;
  return defaultMetrics()
    .map((m) => ({
      ...m,
      values: opts[BUILTIN_KEYS[m.key as BuiltinKey]] ?? [],
    }))
    .filter((m) => m.values.length > 0);
}

/** Canonical pricing rows, upgrading legacy flat rows to a keyed `values` map. */
export function normalizeRows(
  product: LegacyProduct | null | undefined,
  metrics: VariantMetric[]
): PricingRow[] {
  const raw = product?.pricingData;
  if (!Array.isArray(raw)) return [];

  return raw.map((row) => {
    const price = Number(row.price ?? 0);
    const existing = row.values as Record<string, string> | undefined;
    if (existing && typeof existing === "object") {
      return { values: { ...existing }, price };
    }
    // Legacy flat row -> keyed map, limited to metrics actually in use.
    const values: Record<string, string> = {};
    for (const m of metrics) {
      const v = row[m.key];
      if (typeof v === "string" && v !== "") values[m.key] = v;
    }
    return { values, price };
  });
}

/**
 * Build the payload to persist. Writes the new `variantMetrics` / keyed rows
 * *and* mirrors the legacy `variantOptions` + flat row fields so older
 * storefront code continues to work during rollout.
 */
export function buildVariantPayload(metrics: VariantMetric[], rows: PricingRow[]) {
  const variantOptions: Record<string, string[]> = {
    diameters: [],
    lengths: [],
    materials: [],
    sizes: [],
  };
  for (const m of metrics) {
    const legacyName = BUILTIN_KEYS[m.key as BuiltinKey];
    if (legacyName) variantOptions[legacyName] = m.values;
  }

  const pricingData = rows.map((row) => {
    const out: Record<string, unknown> = {
      values: { ...row.values },
      price: Number(row.price) || 0,
    };
    for (const key of Object.keys(BUILTIN_KEYS) as BuiltinKey[]) {
      out[key] = row.values[key] ?? "";
    }
    return out;
  });

  return {
    variantMetrics: metrics.map((m) => ({
      key: m.key,
      label: m.label,
      unit: m.unit,
      values: m.values,
    })),
    variantOptions,
    pricingData,
  };
}

/** Metrics that actually have values — the ones that form the pricing matrix. */
export function activeMetrics(metrics: VariantMetric[]): VariantMetric[] {
  return metrics.filter((m) => m.values.length > 0);
}

/** Display helper: "10 mm", or just "10" when the metric has no unit. */
export function formatValue(value: string, unit?: string): string {
  if (!value) return "";
  return unit ? `${value} ${unit}` : value;
}
