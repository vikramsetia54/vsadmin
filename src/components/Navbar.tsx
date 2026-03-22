import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";

export default function Navbar() {
  return (
    <header className="h-16 flex items-center border-b border-slate-100 bg-white px-4 md:px-6 gap-4 sticky top-0 z-40">
      <MobileSidebar />
      <div className="flex-1">
        <span className="md:hidden text-base font-black text-slate-900 tracking-tight">
          VSEnterprises<span className="text-blue-600">Admin</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-100">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
