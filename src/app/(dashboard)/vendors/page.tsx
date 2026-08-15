import connectToDB from "@/lib/mongoose";
import Vendor from "@/models/Vendor";
import { CreateVendor } from "@/components/vendors/CreateVendor";
import { VendorRow } from "@/components/vendors/VendorRow";
import type { VendorType } from "@/components/vendors/VendorRow";

export default async function VendorsPage() {
  await connectToDB();
  const raw = await Vendor.find().sort({ createdAt: -1 }).lean() as any[];
  const vendors: VendorType[] = JSON.parse(JSON.stringify(raw)).map((v: any) => ({
    _id: v._id.toString(),
    name: v.name,
    phone: v.phone,
    email: v.email,
    product: v.product,
    quantity: v.quantity,
    pricePaid: v.pricePaid,
    notes: v.notes,
    createdAt: v.createdAt,
  }));

  const totalPaid = vendors.reduce((sum, v) => sum + (v.pricePaid ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Vendors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} · Total paid ₹{totalPaid.toLocaleString("en-IN")}
          </p>
        </div>
        <CreateVendor />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Vendor</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Product</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Qty</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Price Paid</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Added</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length > 0 ? (
                vendors.map((v) => <VendorRow key={v._id} vendor={v} />)
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-400">
                    No vendors yet. Click <strong>Add Vendor</strong> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {vendors.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
