"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setOpen(true)} 
        className="p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex">
           {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setOpen(false)} 
          />
          {/* Sidebar Panel */}
          <div className="relative w-64 bg-white h-full flex flex-col pt-0 shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-50"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full overflow-y-auto w-full">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
