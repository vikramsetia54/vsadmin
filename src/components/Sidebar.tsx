"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  FileText,
  MessageSquare,
} from "lucide-react";

const routes = [
  { label: "Overview",    icon: LayoutDashboard, href: "/" },
  { label: "Orders",      icon: ShoppingCart,    href: "/orders" },
  { label: "Products",    icon: Package,         href: "/products" },
  { label: "Categories",  icon: Tags,            href: "/categories" },
  { label: "Blogs",       icon: FileText,        href: "/blogs" },
  { label: "Testimonials", icon: MessageSquare,   href: "/testimonials" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-100">
        <span className="text-base font-black text-slate-900 tracking-tight">
          VSEnterprises<span className="text-blue-600">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {routes.map((route) => {
          const active = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <route.icon
                size={17}
                className={active ? "text-blue-600" : "text-slate-400"}
              />
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-300 font-medium">© 2026 VSEnterprisesAdmin</p>
      </div>
    </div>
  );
}
