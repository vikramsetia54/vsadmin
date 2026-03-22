import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative bg-slate-50 min-h-screen">
      <div className="hidden h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-60 flex flex-col min-h-screen">
        <Navbar />
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[100vw] overflow-x-hidden md:max-w-none w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
