"use client";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { inventory, inventoryTransactions } from "@/lib/dummy-data";
import {
  Boxes, AlertTriangle, TrendingDown, TrendingUp,
  ChevronRight, Package,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 shadow-md text-xs">
      <p className="text-[#6B7280] mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 mb-0.5" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          {p.name}: <span className="font-mono font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function WarehouseDashboard() {
  const lowStock = inventory.filter(i => i.available <= 10);
  const totalItems = inventory.length;
  const recentTx = inventoryTransactions?.slice(0, 6) ?? [];
  const inTx = inventoryTransactions.filter(t => t.type === "Receipt").length;
  const outTx = inventoryTransactions.filter(t => t.type === "Issue").length;

  const stockByCategory = inventory.map(item => ({
    name: item.material.length > 12 ? item.material.slice(0, 12) + "..." : item.material,
    qty: item.available,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Gudang & Inventori</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Inventori material, stok aman & mutasi transaksi gudang</p>
        </div>
        <Link
          href="/warehouse/inventory"
          className="flex items-center gap-1.5 bg-[#92400E] hover:bg-[#78350F] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
        >
          <Boxes size={14} /> Inventori Material
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Item Material"
          value={totalItems}
          subtitle="Material aktif tercatat"
          icon={Package}
          color="blue"
        />
        <KpiCard
          title="Low Stock / Kritis"
          value={lowStock.length}
          subtitle="Item mendekati / habis"
          icon={AlertTriangle}
          color={lowStock.length > 0 ? "red" : "green"}
        />
        <KpiCard
          title="Transaksi Masuk"
          value={inTx}
          subtitle="Penerimaan barang (Receipt)"
          icon={TrendingUp}
          color="green"
        />
        <KpiCard
          title="Transaksi Keluar"
          value={outTx}
          subtitle="Pengeluaran ke produksi (Issue)"
          icon={TrendingDown}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Stock Chart */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Tingkat Stok Tersedia per Material</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Kuantitas tersedia di gudang penyimpanan</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stockByCategory} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="qty" name="Stok Tersedia" fill="#D97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alert */}
        <div className="col-span-12 lg:col-span-5 card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-[#DC2626]" />
            <p className="text-sm font-semibold text-[#111827]">Low Stock Alert</p>
          </div>
          <div className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-xs text-[#6B7280] text-center py-6">Tidak ada item low stock 🎉</p>
            ) : (
              lowStock.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
                  <Package size={14} className="text-[#DC2626] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">{item.material}</p>
                    <p className="text-[10px] text-[#6B7280]">
                      Tersedia: <span className="font-mono font-bold text-[#DC2626]">{item.available} {item.uom}</span> (Gudang: {item.warehouse})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#111827]">Daftar Stok Material Gudang</p>
          <Link href="/warehouse/inventory" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {["Kode", "Material", "Tersedia", "Dipesan", "Total", "Satuan", "Gudang", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[#6B7280] font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 6).map(item => (
                <tr key={item.id} className="table-row-hover">
                  <td className="py-2.5 px-3 font-mono text-xs text-[#2563EB] whitespace-nowrap">{item.materialId}</td>
                  <td className="py-2.5 px-3 text-[#111827] font-medium text-xs whitespace-nowrap">{item.material}</td>
                  <td className="py-2.5 px-3 font-mono text-[#111827] whitespace-nowrap">{item.available}</td>
                  <td className="py-2.5 px-3 font-mono text-[#6B7280] whitespace-nowrap">{item.reserved}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#111827] whitespace-nowrap">{item.total}</td>
                  <td className="py-2.5 px-3 text-[#6B7280] text-xs whitespace-nowrap">{item.uom}</td>
                  <td className="py-2.5 px-3 text-[#6B7280] text-xs whitespace-nowrap">{item.warehouse}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge status={item.available <= 10 ? "Low Stock" : "In Stock"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
