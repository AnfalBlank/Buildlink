"use client";
import { purchaseOrders, vendors, goodsReceipts, mrpData } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  ShoppingCart, Building2, PackageCheck, AlertTriangle,
  Clock, Plus, ChevronRight, FileText, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const PO_STATUS_COLORS = ["#16A34A", "#2563EB", "#D97706", "#94A3B8"];

export function ProcurementDashboard() {
  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
  const pendingPOs = purchaseOrders.filter(po => po.status === "Pending" || po.status === "Draft" || po.status === "Sent");
  const approvedPOs = purchaseOrders.filter(po => po.status === "Approved");
  const shortages = mrpData.filter(m => m.status === "Shortage");
  const pendingReceipts = goodsReceipts.filter(g => g.status !== "Received");

  // Vendor spend chart
  const vendorSpend = vendors.map(v => {
    const total = purchaseOrders
      .filter(po => po.vendor === v.name)
      .reduce((s, po) => s + (po.total || 0), 0);
    return {
      name: v.name.replace("PT ", "").slice(0, 14),
      fullName: v.name,
      rating: v.rating,
      spend: Math.round(total / 1e6),
    };
  }).filter(v => v.spend > 0);

  // PO status distribution
  const poStatusData = [
    { name: "Approved", value: approvedPOs.length || 2 },
    { name: "Sent", value: purchaseOrders.filter(p => p.status === "Sent").length || 1 },
    { name: "Pending", value: pendingPOs.length || 1 },
    { name: "Received", value: goodsReceipts.length || 3 },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Pengadaan & Vendor</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Kelola pesanan pembelian (PO), penerimaan barang, dan evaluasi vendor</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/procurement/purchase-orders"
            className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Plus size={14} /> Buat PO Baru
          </Link>
          <Link
            href="/procurement/vendors"
            className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-xs"
          >
            <Building2 size={14} /> Daftar Vendor ({vendors.length})
          </Link>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Nilai PO"
          value={`${(totalPOValue / 1e6).toFixed(0)}M`}
          subtitle="IDR total pesanan pembelian"
          icon={ShoppingCart}
          color="blue"
        />
        <KpiCard
          title="PO Pending & Draft"
          value={pendingPOs.length}
          subtitle="Menunggu approval / konfirmasi vendor"
          icon={Clock}
          color={pendingPOs.length > 0 ? "yellow" : "green"}
        />
        <KpiCard
          title="Penerimaan Barang"
          value={goodsReceipts.length}
          subtitle={`${pendingReceipts.length} penerimaan parsial`}
          icon={PackageCheck}
          color="green"
        />
        <KpiCard
          title="Shortage Rekomendasi PO"
          value={shortages.length}
          subtitle="Item mendesak dari hasil MRP"
          icon={AlertTriangle}
          color={shortages.length > 0 ? "red" : "green"}
        />
      </div>

      {/* ── Charts: Spend per Vendor & PO Status ── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Pengeluaran Pembelian per Vendor (Juta IDR)</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Akumulasi nilai purchase order per mitra supplier</p>
            </div>
            <span className="text-xs text-[#4F46E5] font-semibold bg-[#EEF2FF] px-2.5 py-1 rounded-full border border-[#C7D2FE]">
              Top Supplier
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={vendorSpend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = vendorSpend.find(v => v.name === label);
                  return (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-lg text-xs">
                      <p className="font-semibold text-[#0F172A]">{item?.fullName}</p>
                      <p className="text-[#4F46E5] font-mono mt-1 font-bold">
                        Total PO: {formatCurrency((payload[0].value as number) * 1e6)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="spend" name="Total Spend" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-4 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Status Purchase Order</p>
          <p className="text-xs text-[#6B7280] mb-3">Distribusi siklus hidup pesanan pembelian</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={poStatusData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={3}
                dataKey="value"
              >
                {poStatusData.map((_, i) => (
                  <Cell key={i} fill={PO_STATUS_COLORS[i % PO_STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {poStatusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PO_STATUS_COLORS[i] }} />
                <span className="text-[#64748B] truncate text-[11px]">{s.name}</span>
                <span className="font-semibold text-[#0F172A] ml-auto font-mono text-[11px]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MRP Shortages Needing Urgent PO ── */}
      {shortages.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center">
                <AlertTriangle size={15} className="text-[#DC2626]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Rekomendasi Pemesanan PO Mendesak (MRP)</p>
                <p className="text-xs text-[#6B7280]">{shortages.length} material kekurangan stok butuh diterbitkan PO segera</p>
              </div>
            </div>
            <Link
              href="/procurement/purchase-orders"
              className="flex items-center gap-1.5 text-white bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Generate PO Massal <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                  <th className="text-left py-2 px-3 text-[#64748B] font-semibold">Material</th>
                  <th className="text-left py-2 px-3 text-[#64748B] font-semibold">Proyek</th>
                  <th className="text-left py-2 px-3 text-[#64748B] font-semibold">Kebutuhan Netto</th>
                  <th className="text-left py-2 px-3 text-[#64748B] font-semibold">Tanggal Diperlukan</th>
                  <th className="text-left py-2 px-3 text-[#64748B] font-semibold">Rekomendasi PO</th>
                  <th className="text-left py-2 px-3 text-[#64748B] font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {shortages.map(s => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{s.material}</td>
                    <td className="py-2.5 px-3 font-mono text-[#64748B]">{s.projectId}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#DC2626]">{s.netRequirement}</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{s.requiredDate}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                        {s.recommendedPO}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/procurement/purchase-orders?material=${encodeURIComponent(s.material)}`}
                        className="text-[#4F46E5] hover:underline font-semibold"
                      >
                        + Buat PO
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Purchase Orders & Vendor Ratings ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent POs */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Purchase Order Terkini</p>
            <Link href="/procurement/purchase-orders" className="text-xs text-[#4F46E5] hover:underline font-medium">
              Lihat Semua PO
            </Link>
          </div>
          <div className="space-y-2">
            {purchaseOrders.slice(0, 4).map(po => (
              <div key={po.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">{po.code}</span>
                    <StatusBadge status={po.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                    <span>{po.vendor}</span>
                    <span>·</span>
                    <span>Tgl: {po.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-[#0F172A]">{formatCurrency(po.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors Directory Preview */}
        <div className="col-span-12 lg:col-span-5 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Performa & Rating Vendor</p>
            <Link href="/procurement/vendors" className="text-xs text-[#4F46E5] hover:underline font-medium">
              Katalog
            </Link>
          </div>
          <div className="space-y-2">
            {vendors.slice(0, 4).map(v => (
              <div key={v.id} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#0F172A]">{v.name}</p>
                  <p className="text-[10px] text-[#64748B]">{v.category} · {v.contact}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-700 font-bold text-xs">
                  ★ {v.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
