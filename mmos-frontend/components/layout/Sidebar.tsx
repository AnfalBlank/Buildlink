"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FolderKanban, Wrench, Factory,
  Truck, ShieldCheck, DollarSign, BarChart3, Settings,
  Bell, ChevronDown, Boxes, ClipboardList, TrendingUp,
  PanelLeftClose,
} from "lucide-react";
import { useState } from "react";
import { notifications } from "@/lib/dummy-data";

const nav = [
  { label: "Dasbor", href: "/", icon: LayoutDashboard },
  {
    label: "CRM & Penjualan", icon: Users,
    children: [
      { label: "Pelanggan", href: "/crm/customers" },
      { label: "Prospek", href: "/crm/leads" },
      { label: "Penawaran", href: "/crm/quotations" },
      { label: "Sales Order", href: "/crm/sales-orders" },
    ],
  },
  {
    label: "Proyek", icon: FolderKanban,
    children: [
      { label: "Daftar Proyek", href: "/projects" },
      { label: "Project Tracker", href: "/projects/tracker" },
      { label: "Milestone", href: "/projects/milestones" },
      { label: "Risiko & Isu", href: "/projects/risks" },
    ],
  },
  {
    label: "Engineering", icon: Wrench,
    children: [
      { label: "Dokumen", href: "/engineering/documents" },
      { label: "Produk & BOM", href: "/engineering/products" },
      { label: "Routing", href: "/engineering/routing" },
      { label: "Work Center", href: "/engineering/work-centers" },
    ],
  },
  {
    label: "Produksi", icon: Factory,
    children: [
      { label: "Production Order", href: "/production/orders" },
      { label: "Work Order", href: "/production/work-orders" },
    ],
  },
  { label: "MRP", icon: TrendingUp, href: "/mrp" },
  {
    label: "Pengadaan", icon: ClipboardList,
    children: [
      { label: "Vendor", href: "/procurement/vendors" },
      { label: "Purchase Order", href: "/procurement/purchase-orders" },
      { label: "Penerimaan Barang", href: "/procurement/goods-receipt" },
    ],
  },
  {
    label: "Gudang", icon: Boxes,
    children: [
      { label: "Inventori", href: "/warehouse/inventory" },
      { label: "Transaksi Stok", href: "/warehouse/transactions" },
    ],
  },
  {
    label: "Quality Control", icon: ShieldCheck,
    children: [
      { label: "Inspeksi", href: "/quality/inspections" },
      { label: "NCR", href: "/quality/ncr" },
      { label: "Rework", href: "/quality/rework" },
    ],
  },
  {
    label: "Keuangan", icon: DollarSign,
    children: [
      { label: "Costing Proyek", href: "/finance/costing" },
      { label: "Invoice", href: "/finance/invoices" },
      { label: "Pembayaran", href: "/finance/payments" },
    ],
  },
  { label: "Pengiriman", icon: Truck, href: "/delivery" },
  { label: "Laporan", icon: BarChart3, href: "/reports" },
  {
    label: "Pengaturan", icon: Settings,
    children: [
      { label: "Pengguna & Hak Akses", href: "/settings/users" },
      { label: "Audit Log", href: "/settings/audit-log" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["Proyek", "Produksi"]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggle = (label: string) =>
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false;

  return (
    <aside
      className="flex flex-col w-[260px] h-full bg-white border-r border-[#E2E8F0] select-none"
      style={{ height: "100vh" }}
    >
      {/* ── Logo & Toggle Header (64px matches TopBar) ── */}
      <div className="shrink-0 h-16 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-4">
        <Link href="/" className="flex items-center flex-1 min-w-0 pr-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/buildlink.png"
            alt="Buildlink"
            className="h-9 sm:h-10 w-auto max-w-[185px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] transition-all duration-200 shrink-0"
          title="Sembunyikan sidebar (Ctrl+B)"
          aria-label="Sembunyikan sidebar"
        >
          <PanelLeftClose size={17} className="transition-transform duration-200 hover:-translate-x-0.5" />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 overflow-x-hidden space-y-0.5">
        {nav.map((item) => {
          if (item.href) {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
                  active
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs"
                    : "text-[#4B5563] hover:bg-[#F8FAFC] hover:text-[#111827]"
                )}
              >
                <item.icon size={16} className={active ? "text-[#2563EB] shrink-0" : "text-[#9CA3AF] shrink-0"} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          }

          const parentActive = isParentActive(item.children);
          const open = expanded.includes(item.label) || parentActive;

          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium w-full transition-all duration-150 whitespace-nowrap",
                  parentActive
                    ? "text-[#2563EB] font-semibold bg-[#EFF6FF]/40"
                    : "text-[#4B5563] hover:bg-[#F8FAFC] hover:text-[#111827]"
                )}
              >
                <item.icon size={16} className={parentActive ? "text-[#2563EB] shrink-0" : "text-[#9CA3AF] shrink-0"} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                <ChevronDown
                  size={13}
                  className={cn(
                    "text-[#9CA3AF] transition-transform duration-200 shrink-0",
                    open && "rotate-180"
                  )}
                />
              </button>

              {open && (
                <div className="ml-5 pl-2.5 border-l border-[#E2E8F0] my-1 space-y-0.5">
                  {item.children?.map((child) => {
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-all duration-150 whitespace-nowrap",
                          childActive
                            ? "text-[#2563EB] bg-[#EFF6FF] font-semibold"
                            : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]"
                        )}
                      >
                        {childActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                        )}
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Sidebar System Footer (Single profile & notif remain in TopBar) ── */}
      <div className="p-3 border-t border-[#E2E8F0] shrink-0 bg-[#F8FAFC]/50">
        <div className="px-2.5 py-2 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-bold text-[#111827] leading-tight">BuildLink MMOS</p>
              <p className="text-[10px] text-[#64748B] leading-tight">v2.4 · Enterprise Online</p>
            </div>
          </div>
          <span className="text-[10px] text-[#64748B] font-mono bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#E2E8F0]" title="Shortcut toggle sidebar">
            ⌘B
          </span>
        </div>
      </div>
    </aside>
  );
}
