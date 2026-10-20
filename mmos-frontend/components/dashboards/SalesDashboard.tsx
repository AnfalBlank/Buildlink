"use client";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import { quotations, salesOrders, customers, leads } from "@/lib/dummy-data";
import {
  Users, TrendingUp, FileText, DollarSign, ChevronRight,
  Target, UserPlus, ArrowUpRight, Phone,
} from "lucide-react";
import Link from "next/link";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 shadow-md text-xs">
      <p className="text-[#6B7280] mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 mb-0.5" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          {p.name}: <span className="font-mono font-semibold">{typeof p.value === 'number' && p.value > 10000 ? formatCurrency(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const LEAD_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED"];

export function SalesDashboard() {
  const activeCustomers = customers.filter(c => c.status === "Active");
  const totalQuotValue = quotations.reduce((s, q) => s + q.total, 0);
  const activeOrders = salesOrders.filter(so => so.status === "Active");
  const totalSOValue = activeOrders.reduce((s, so) => s + so.contractValue, 0);

  const leadsByStage = [
    { name: "Qualification", value: leads.filter(l => l.stage === "Qualification").length },
    { name: "Proposal", value: leads.filter(l => l.stage === "Proposal").length },
    { name: "Negotiation", value: leads.filter(l => l.stage === "Negotiation").length },
    { name: "Closed Won", value: leads.filter(l => l.stage === "Closed Won").length },
  ];

  const quoteByMonth = [
    { month: "Jul", count: 1, value: 800000000 },
    { month: "Aug", count: 2, value: 2770000000 },
    { month: "Sep", count: 1, value: 1650000000 },
    { month: "Oct", count: 1, value: 2400000000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Penjualan</h1>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Overview pipeline, prospek & penawaran</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Pelanggan Aktif" value={activeCustomers.length}
          subtitle={`${customers.length} total pelanggan`}
          icon={Users} color="blue"
          trend={{ value: 12, label: "bulan ini" }} />
        <KpiCard title="Prospek Aktif" value={leads.filter(l => l.stage !== "Closed Won").length}
          subtitle={`${leads.length} total prospek`}
          icon={Target} color="purple"
          trend={{ value: 25, label: "bulan ini" }} />
        <KpiCard title="Total Penawaran" value={`${(totalQuotValue / 1e9).toFixed(1)}M`}
          subtitle={`${quotations.length} quotation aktif`}
          icon={FileText} color="green" />
        <KpiCard title="SO Aktif" value={`${(totalSOValue / 1e9).toFixed(1)}M`}
          subtitle={`${activeOrders.length} sales order berjalan`}
          icon={DollarSign} color="yellow"
          trend={{ value: 8, label: "vs bulan lalu" }} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Pipeline Chart */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Trend Penawaran</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Jumlah & nilai quotation per bulan</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={quoteByMonth} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1e9).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Nilai (IDR)" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Pipeline */}
        <div className="col-span-12 lg:col-span-5 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Pipeline Prospek</p>
          <p className="text-xs text-[#6B7280] mb-3">Distribusi per stage</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={leadsByStage} cx="50%" cy="50%" innerRadius={44} outerRadius={64}
                dataKey="value" paddingAngle={3} strokeWidth={0}>
                {leadsByStage.map((_, i) => <Cell key={i} fill={LEAD_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {leadsByStage.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LEAD_COLORS[i] }} />
                <span className="text-[#6B7280] truncate">{item.name}</span>
                <span className="font-mono font-semibold text-[#111827] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#111827]">Prospek Terbaru</p>
          <Link href="/crm/leads" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {leads.slice(0, 4).map(l => {
            const stageColor = l.stage === "Closed Won" ? "#16A34A" : l.stage === "Negotiation" ? "#D97706" : "#2563EB";
            return (
              <div key={l.id} className="flex items-center gap-4 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${stageColor}15`, color: stageColor, border: `1px solid ${stageColor}30` }}>
                  <UserPlus size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[#111827] truncate">{l.company}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ color: stageColor, background: `${stageColor}10`, borderColor: `${stageColor}30` }}>
                      {l.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <Phone size={10} /> {l.contact}
                    <span className="text-[#D1D5DB]">·</span>
                    <span className="font-mono text-[#2563EB] font-medium">{formatCurrency(l.estimatedValue)}</span>
                  </div>
                </div>
                <Link href="/crm/leads" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white">
                  <ArrowUpRight size={14} className="text-[#2563EB]" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
