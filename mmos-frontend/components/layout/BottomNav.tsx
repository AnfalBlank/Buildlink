"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, Factory, DollarSign,
  Menu, X, Search, ChevronRight, Users, Wrench,
  Boxes, ShieldCheck, Truck, BarChart3, Settings,
  TrendingUp, ClipboardList, Sparkles, Scale
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { RoleIcon } from "@/components/ui/RoleIcon";

interface NavGroup {
  title: string;
  items: { label: string; href: string; icon?: any; badge?: string }[];
}

const ALL_MODULE_GROUPS: NavGroup[] = [
  {
    title: "CRM & Penjualan",
    items: [
      { label: "Pelanggan", href: "/crm/customers" },
      { label: "Prospek (Leads)", href: "/crm/leads" },
      { label: "Penawaran Harga", href: "/crm/quotations" },
      { label: "Sales Order", href: "/crm/sales-orders" },
    ],
  },
  {
    title: "Manajemen Proyek",
    items: [
      { label: "Daftar Proyek", href: "/projects" },
      { label: "Project Tracker (Gantt)", href: "/projects/tracker" },
      { label: "Milestone & Kurva S", href: "/projects/milestones" },
      { label: "Risiko & Isu Proyek", href: "/projects/risks" },
    ],
  },
  {
    title: "Engineering & Estimasi",
    items: [
      { label: "Dokumen Shop Drawing", href: "/engineering/documents" },
      { label: "Produk & BOM", href: "/engineering/products" },
      { label: "Estimasi & RAB Fabrikasi", href: "/engineering/rab", badge: "New" },
      { label: "Routing Operasi", href: "/engineering/routing" },
      { label: "Work Center / Mesin", href: "/engineering/work-centers" },
    ],
  },
  {
    title: "Produksi Fabrikasi",
    items: [
      { label: "Production Orders", href: "/production/orders" },
      { label: "Surat Perintah Kerja (SPK)", href: "/production/work-orders" },
      { label: "Material Requirement (MRP)", href: "/mrp" },
    ],
  },
  {
    title: "Quality Control & Mutu",
    items: [
      { label: "Inspeksi & Sertifikasi QC", href: "/quality/inspections" },
      { label: "Laporan Cacat (NCR)", href: "/quality/ncr" },
      { label: "Perintah Rework", href: "/quality/rework" },
      { label: "Material Traceability & MTC", href: "/quality/traceability", badge: "New" },
    ],
  },
  {
    title: "Gudang & Material",
    items: [
      { label: "Inventori Stok Gudang", href: "/warehouse/inventory" },
      { label: "Transaksi Keluar Masuk", href: "/warehouse/transactions" },
      { label: "Pelat Sisa (Offcut)", href: "/quality/traceability?tab=offcut" },
    ],
  },
  {
    title: "Pengadaan (Procurement)",
    items: [
      { label: "Daftar Vendor", href: "/procurement/vendors" },
      { label: "Purchase Orders (PO)", href: "/procurement/purchase-orders" },
      { label: "Penerimaan Barang (GR)", href: "/procurement/goods-receipt" },
    ],
  },
  {
    title: "Keuangan & Penagihan",
    items: [
      { label: "Job Order Costing", href: "/finance/costing" },
      { label: "Faktur & Tagihan (Invoices)", href: "/finance/invoices" },
      { label: "Pencatatan Pembayaran", href: "/finance/payments" },
    ],
  },
  {
    title: "Logistik & Lainnya",
    items: [
      { label: "Surat Jalan & Pelepasan", href: "/delivery" },
      { label: "Laporan & Analitik", href: "/reports" },
      { label: "Pengguna & Hak Akses", href: "/settings/users" },
      { label: "Audit Log Aktivitas", href: "/settings/audit-log" },
    ],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when menu sheet is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = [
    {
      label: "Dasbor",
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
    },
    {
      label: "Proyek",
      href: "/projects",
      icon: FolderKanban,
      isActive: pathname.startsWith("/projects"),
    },
    {
      label: "Produksi",
      href: "/production/work-orders",
      icon: Factory,
      isActive: pathname.startsWith("/production") || pathname === "/mrp",
    },
    {
      label: "Keuangan",
      href: "/finance/invoices",
      icon: DollarSign,
      isActive: pathname.startsWith("/finance"),
    },
    {
      label: "Semua Menu",
      href: "#menu",
      icon: Menu,
      isActive: menuOpen,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuOpen(v => !v);
      },
    },
  ];

  // Filter module groups based on search query
  const filteredGroups = ALL_MODULE_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(it => 
      !searchQuery || 
      it.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  return (
    <>
      {/* ── Fixed Bottom Navbar Container (Mobile Exclusive: md:hidden) ── */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(15,23,42,0.08)] select-none"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around h-16 px-1 safe-area-pb">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = item.isActive;

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 transition-all active:scale-90 cursor-pointer ${
                    active ? "text-[#2563EB]" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon size={20} className={active ? "stroke-[2.5]" : "stroke-[1.8]"} />
                    {active && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2563EB]" />
                    )}
                  </div>
                  <span className={`text-[10px] tracking-tight mt-1 truncate ${active ? "font-bold text-[#2563EB]" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 transition-all active:scale-90 ${
                  active ? "text-[#2563EB]" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon size={20} className={active ? "stroke-[2.5]" : "stroke-[1.8]"} />
                  {active && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2563EB]" />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-1 truncate ${active ? "font-bold text-[#2563EB]" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Full Mobile Menu Sheet / Drawer (Opens when "Semua Menu" is tapped) ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Bottom Panel */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-slide-up pb-16">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full mx-auto mt-3 mb-1" />

            {/* Sheet Header */}
            <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{
                    background: user.roleDefinition.bgColor,
                    color: user.roleDefinition.color,
                    border: `1.5px solid ${user.roleDefinition.borderColor}`,
                  }}
                >
                  <RoleIcon roleKey={user.role} size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0F172A]">{user.name}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        color: user.roleDefinition.color,
                        background: user.roleDefinition.bgColor,
                        borderColor: user.roleDefinition.borderColor,
                      }}
                    >
                      {user.roleDefinition.shortLabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Navigasi Lengkap Sistem MMOS</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RoleSwitcher />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] active:scale-95 transition-all"
                  aria-label="Tutup Menu"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Search inside Mobile Menu */}
            <div className="p-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Cari modul (misal: RAB, MTC, Invoice)..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Module Groups List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredGroups.map(group => (
                <div key={group.title} className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider px-1">
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {group.items.map(item => {
                      const isCurrent = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            isCurrent
                              ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                              : "bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#2563EB] text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <ChevronRight size={14} className="text-[#94A3B8] shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredGroups.length === 0 && (
                <div className="text-center py-8 text-xs text-[#94A3B8]">
                  Tidak ada modul yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
