"use client";
import { invoices, payments, projects, projectCosts } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  DollarSign, Receipt, TrendingUp, AlertCircle,
  CreditCard, FileText, ChevronRight, Plus, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const INV_STATUS_COLORS = ["#16A34A", "#2563EB", "#D97706", "#DC2626"];

export function FinanceDashboard() {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstandingAR = invoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Overall average project margin
  const avgMargin = (
    projects.reduce((sum, p) => sum + ((p.contractValue - p.actualCost) / (p.contractValue || 1)) * 100, 0) /
    (projects.length || 1)
  ).toFixed(1);

  // Cashflow comparison data
  const cashflowData = [
    { period: "Jul", invoice: 450, payment: 450 },
    { period: "Ags", invoice: 920, payment: 600 },
    { period: "Sep", invoice: 1200, payment: 850 },
    { period: "Okt", invoice: 1650, payment: 1100 },
  ];

  // Invoice status counts
  const invStatusData = [
    { name: "Paid", value: invoices.filter(i => i.status === "Paid").length || 2 },
    { name: "Partial", value: invoices.filter(i => i.status === "Partial").length || 1 },
    { name: "Unpaid", value: invoices.filter(i => i.status === "Unpaid" || i.status === "Sent").length || 1 },
    { name: "Overdue", value: invoices.filter(i => i.status === "Overdue").length || 1 },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Keuangan & Kontrol Biaya</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Pantau penagihan invoice, penerimaan kas, dan profitabilitas proyek</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/finance/invoices"
            className="flex items-center gap-1.5 bg-[#B45309] hover:bg-[#92400E] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Plus size={14} /> Terbitkan Invoice
          </Link>
          <Link
            href="/finance/costing"
            className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-xs"
          >
            <TrendingUp size={14} /> Analisis Costing Proyek
          </Link>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Ditagihkan"
          value={`${(totalInvoiced / 1e6).toFixed(0)}M`}
          subtitle="IDR total tagihan diterbitkan"
          icon={Receipt}
          color="blue"
        />
        <KpiCard
          title="Kas Masuk / Diterima"
          value={`${(totalReceived / 1e6).toFixed(0)}M`}
          subtitle="IDR pembayaran telah diverifikasi"
          icon={CreditCard}
          color="green"
        />
        <KpiCard
          title="Piutang Outstanding (AR)"
          value={`${(outstandingAR / 1e6).toFixed(0)}M`}
          subtitle="IDR tagihan belum terbayar"
          icon={AlertCircle}
          color={outstandingAR > 0 ? "yellow" : "green"}
        />
        <KpiCard
          title="Rata-rata Margin Proyek"
          value={`${avgMargin}%`}
          subtitle="Gross profit margin berjalan"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* ── Charts: Cashflow & Invoice Distribution ── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Trend Arus Kas: Invoice vs Pembayaran (Juta IDR)</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Perbandingan nominal invoice keluar vs pembayaran masuk</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#6B7280]">
                <span className="w-3 h-2 rounded bg-[#3B82F6]" /> Invoice
              </span>
              <span className="flex items-center gap-1.5 text-[#6B7280]">
                <span className="w-3 h-2 rounded bg-[#10B981]" /> Penerimaan Kas
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={cashflowData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-lg text-xs">
                      <p className="font-semibold text-[#0F172A]">Periode {label}</p>
                      <p className="text-[#3B82F6] font-mono mt-1 font-bold">
                        Invoice: {formatCurrency((payload[0].value as number) * 1e6)}
                      </p>
                      <p className="text-[#10B981] font-mono font-bold">
                        Penerimaan: {formatCurrency((payload[1]?.value as number) * 1e6)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="invoice" name="Invoice" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={38} />
              <Bar dataKey="payment" name="Penerimaan" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-4 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Status Penagihan Invoice</p>
          <p className="text-xs text-[#6B7280] mb-3">Distribusi status invoice saat ini</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={invStatusData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={3}
                dataKey="value"
              >
                {invStatusData.map((_, i) => (
                  <Cell key={i} fill={INV_STATUS_COLORS[i % INV_STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {invStatusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: INV_STATUS_COLORS[i] }} />
                <span className="text-[#64748B] truncate text-[11px]">{s.name}</span>
                <span className="font-semibold text-[#0F172A] ml-auto font-mono text-[11px]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Project Costing & Margin Table ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Evaluasi Costing & Margin Proyek</p>
            <p className="text-xs text-[#6B7280]">Perbandingan nilai kontrak, anggaran, dan estimasi laba kotor</p>
          </div>
          <Link href="/finance/costing" className="text-xs text-[#B45309] hover:underline font-semibold flex items-center gap-1">
            Lihat Analisis Detail <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Proyek</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Pelanggan</th>
                <th className="text-right py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Nilai Kontrak</th>
                <th className="text-right py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Anggaran (RAB)</th>
                <th className="text-right py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Biaya Aktual</th>
                <th className="text-right py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Margin (%)</th>
                <th className="text-center py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {projects.map(p => {
                const margin = (((p.contractValue - p.actualCost) / (p.contractValue || 1)) * 100).toFixed(1);
                const isHealthy = Number(margin) >= 20;
                return (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <p className="font-semibold text-[#0F172A]">{p.name}</p>
                      <p className="text-[10px] font-mono text-[#64748B]">{p.code}</p>
                    </td>
                    <td className="py-2.5 px-3 text-[#475569] whitespace-nowrap">{p.customer}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#0F172A] whitespace-nowrap">
                      {formatCurrency(p.contractValue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#64748B] whitespace-nowrap">
                      {formatCurrency(p.budget)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#2563EB] whitespace-nowrap">
                      {formatCurrency(p.actualCost)}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${isHealthy ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FFFBEB] text-[#D97706]'}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Invoices List & Recent Payments ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Outstanding Invoices */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Invoice & Status Penagihan</p>
            <Link href="/finance/invoices" className="text-xs text-[#B45309] hover:underline font-medium">
              Lihat Semua Invoice
            </Link>
          </div>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all">
                <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#B45309] flex items-center justify-center shrink-0">
                  <Receipt size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">{inv.code}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                    <span className="truncate max-w-[160px]">{inv.customer}</span>
                    <span>·</span>
                    <span>Jatuh Tempo: {inv.dueDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-[#0F172A]">{formatCurrency(inv.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="col-span-12 lg:col-span-5 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Penerimaan Kas Terakhir</p>
            <Link href="/finance/payments" className="text-xs text-[#B45309] hover:underline font-medium">
              Riwayat
            </Link>
          </div>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">{p.id}</span>
                    <span className="text-[10px] bg-[#F1F5F9] text-[#64748B] px-1.5 py-0.5 rounded font-mono">
                      {p.method}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{p.date} · Ref: {p.reference}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-[#16A34A] block">
                    +{formatCurrency(p.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
