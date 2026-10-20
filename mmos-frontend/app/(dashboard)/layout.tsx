"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  // Route transition progress indicator
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Route transition top loading bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none transition-opacity duration-200",
          isTransitioning ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn(
            "h-full route-progress-bar transition-all duration-300 ease-out",
            isTransitioning ? "w-full" : "w-0"
          )}
        />
      </div>

      {/* Sidebar with premium spring slide motion */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden select-none",
          "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        )}
        style={{ width: collapsed ? 0 : 260 }}
      >
        <div
          className={cn(
            "w-[260px] h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            collapsed
              ? "-translate-x-6 opacity-0 pointer-events-none"
              : "translate-x-0 opacity-100"
          )}
        >
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} sidebarCollapsed={collapsed} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 min-w-0 flex flex-col justify-between">
          {/* Animated page transition container */}
          <div
            key={pathname}
            className="min-w-0 w-full max-w-[1600px] mx-auto flex-1 page-enter-animation"
          >
            {children}
          </div>

          {/* Footer as requested */}
          <footer className="mt-10 pt-6 pb-2 text-center border-t border-[#E2E8F0] select-none">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                Powered by <strong className="text-[#111827] font-semibold">PT. Manggala Utama Indonesia</strong>
              </span>
              <span className="hidden sm:inline text-[#CBD5E1]">—</span>
              <span className="text-[#64748B]">Solusi Sistem Terintegrasi 2026</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
