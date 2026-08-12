import { SettingsForm } from "@/components/settings/SettingsForm";
import connectToDB from "@/lib/mongoose";
import Settings from "@/models/Settings";

async function getSettings() {
  await connectToDB();
  const doc = await Settings.findOne({ key: "global" }).lean();
  return {
    deliveryPrice: (doc as any)?.deliveryPrice ?? 0,
    freeDeliveryThreshold: (doc as any)?.freeDeliveryThreshold ?? 0,
  };
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure store-wide delivery options.</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
