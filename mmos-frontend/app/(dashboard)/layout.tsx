"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  // Route transition & auto-close drawer on mobile navigation
  useEffect(() => {
    setIsTransitioning(true);
    setMobileOpen(false);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setDesktopCollapsed((c) => !c);
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

      {/* ── Desktop In-flow Sidebar (Screen >= 1024px) ── */}
      <div
        className={cn(
          "hidden lg:block relative shrink-0 overflow-hidden select-none",
          "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        )}
        style={{ width: desktopCollapsed ? 0 : 260 }}
      >
        <div
          className={cn(
            "w-[260px] h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            desktopCollapsed
              ? "-translate-x-6 opacity-0 pointer-events-none"
              : "translate-x-0 opacity-100"
          )}
        >
          <Sidebar
            collapsed={desktopCollapsed}
            onToggle={() => setDesktopCollapsed((c) => !c)}
          />
        </div>
      </div>

      {/* ── Mobile / Tablet Overlay Drawer (Screen < 1024px) ── */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-[270px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        <TopBar
          onToggleSidebar={() => setDesktopCollapsed((c) => !c)}
          onOpenMobile={() => setMobileOpen(true)}
          sidebarCollapsed={desktopCollapsed}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-6 min-w-0 flex flex-col justify-between">
          {/* Animated page transition container */}
          <div
            key={pathname}
            className="min-w-0 w-full max-w-[1600px] mx-auto flex-1 page-enter-animation"
          >
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-6 pb-2 text-center border-t border-[#E2E8F0] select-none">
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
