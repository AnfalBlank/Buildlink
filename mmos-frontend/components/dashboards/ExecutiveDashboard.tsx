"use client";
import { dashboardSummary, projects, workOrders, mrpData, notifications } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar, RingProgress } from "@/components/ui/ProgressBar";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FolderKanban, TrendingUp, AlertTriangle,
  DollarSign, Factory, CheckCircle2, Clock,
  ChevronRight, Activity, ArrowUpRight,
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
          {p.name}: <span className="font-mono font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const WO_COLORS = ["#16A34A", "#2563EB", "#D97706", "#CBD5E1"];

export function ExecutiveDashboard() {
  const d = dashboardSummary;
  const activeProjects = projects.filter(p => p.status === "Active");
  const shortages = mrpData.filter(m => m.status === "Shortage");
  const unreadNotifs = notifications.filter(n => !n.read);

  const woStatusData = [
    { name: "Selesai", value: workOrders.filter(w => w.status === "Completed").length },
    { name: "Berjalan", value: workOrders.filter(w => w.status === "In Progress").length },
    { name: "Submit QC", value: workOrders.filter(w => w.status === "Submitted for QC").length },
    { name: "Lainnya", value: workOrders.filter(w => !["Completed", "In Progress", "Submitted for QC"].includes(w.status)).length },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Eksekutif</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">PT Manggala Utama Indonesia · Ringkasan Operasional & Finansial</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#16A34A] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Data Real-time
          </div>
          <Link
            href="/projects/tracker"
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Activity size={14} /> Project Tracker
          </Link>
        </div>
      </div>

      {/* ── KPI Row 1 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Proyek Aktif"
          value={d.activeProjects}
          subtitle={`${d.delayedProjects} terlambat · ${d.onHoldProjects} ditunda`}
          icon={FolderKanban}
          color="blue"
          trend={{ value: 12, label: "bulan ini" }}
        />
        <KpiCard
          title="Nilai Kontrak Aktif"
          value={`${(d.totalContractValue / 1e9).toFixed(1)}M`}
          subtitle="Miliar IDR total kontrak"
          icon={DollarSign}
          color="green"
          trend={{ value: 8, label: "vs bulan lalu" }}
        />
        <KpiCard
          title="Forecast Margin"
          value={`${(d.forecastMargin / 1e9).toFixed(2)}M`}
          subtitle={`${((d.forecastMargin / d.totalContractValue) * 100).toFixed(1)}% margin keseluruhan`}
          icon={TrendingUp}
          color="purple"
        />
        <KpiCard
          title="Shortage Material"
          value={shortages.length}
          subtitle="Item butuh tindakan segera"
          icon={AlertTriangle}
          color={shortages.length > 0 ? "red" : "green"}
        />
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Production Order"
          value={d.productionOrders.total}
          subtitle={`${d.productionOrders.inProgress} berjalan · ${d.productionOrders.released} dirilis`}
          icon={Factory}
          color="yellow"
        />
        <KpiCard
          title="Unit Ditahan QC"
          value={d.unitsOnQCHold}
          subtitle="Menunggu hasil inspeksi"
          icon={Clock}
          color={d.unitsOnQCHold > 0 ? "yellow" : "green"}
        />
        <KpiCard
          title="Invoice Outstanding"
          value={`${(d.invoiceOutstanding / 1e6).toFixed(0)}M`}
          subtitle="IDR belum dibayar"
          icon={DollarSign}
          color="yellow"
        />
        <KpiCard
          title="Siap Kirim"
          value={d.unitsReadyToShip}
          subtitle="Unit memenuhi release criteria"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Progress Chart */}
        <div className="col-span-12 lg:col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Progres Proyek — Rencana vs Aktual</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Persentase penyelesaian berbobot per milestone</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {[
                { l: "Rencana", c: "#2563EB" },
                { l: "Aktual", c: "#16A34A" },
              ].map(i => (
                <span key={i.l} className="flex items-center gap-1.5 text-[#6B7280]">
                  <span className="w-3 h-1.5 rounded-full" style={{ background: i.c }} />
                  {i.l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={d.chartData.projectProgress}>
              <defs>
                <linearGradient id="execGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="execGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="planned"
                name="Rencana %"
                stroke="#2563EB"
                fill="url(#execGradBlue)"
                strokeWidth={2}
                dot={{ fill: "#2563EB", r: 3, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Aktual %"
                stroke="#16A34A"
                fill="url(#execGradGreen)"
                strokeWidth={2}
                dot={{ fill: "#16A34A", r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* WO Pie */}
        <div className="col-span-12 lg:col-span-4 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Status Work Order</p>
          <p className="text-xs text-[#6B7280] mb-3">Distribusi status saat ini</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={woStatusData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={3}
                dataKey="value"
              >
                {woStatusData.map((_, i) => (
                  <Cell key={i} fill={WO_COLORS[i % WO_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {woStatusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: WO_COLORS[i] }} />
                <span className="text-[#6B7280] truncate">{s.name}</span>
                <span className="font-semibold text-[#111827] ml-auto font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Active Projects */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Proyek Aktif</p>
            <Link href="/projects" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {activeProjects.map(p => {
              const pctColor = p.progress >= 70 ? "#16A34A" : p.progress >= 40 ? "#2563EB" : "#D97706";
              const barColor = p.progress >= 70 ? "green" : p.progress >= 40 ? "blue" : "yellow";
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all group cursor-pointer"
                >
                  <RingProgress value={p.progress} size={44} stroke={4} color={pctColor} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#111827] truncate">{p.name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#6B7280] flex-wrap">
                      <span className="font-medium text-[#4B5563]">{p.pm}</span>
                      <span className="text-[#D1D5DB]">·</span>
                      <span className="truncate max-w-[160px]">{p.customer}</span>
                      <span className="text-[#D1D5DB]">·</span>
                      <span className="text-[#2563EB] font-mono font-medium">{formatCurrency(p.contractValue)}</span>
                    </div>
                    <ProgressBar value={p.progress} color={barColor as any} size="xs" className="mt-1.5" />
                  </div>
                  <Link
                    href="/projects/tracker"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white"
                  >
                    <ArrowUpRight size={14} className="text-[#2563EB]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="col-span-12 lg:col-span-5 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Notifikasi & Peringatan</p>
            <span className="text-xs text-[#DC2626] font-medium bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA]">
              {unreadNotifs.length} belum dibaca
            </span>
          </div>
          <div className="space-y-2">
            {notifications.map(n => {
              const cfg = {
                alert: { bar: "bg-[#DC2626]", bg: "bg-[#FEF2F2] border-l-[#DC2626]", title: "text-[#DC2626]" },
                warning: { bar: "bg-[#D97706]", bg: "bg-[#FFFBEB] border-l-[#D97706]", title: "text-[#D97706]" },
                success: { bar: "bg-[#16A34A]", bg: "bg-[#F0FDF4] border-l-[#16A34A]", title: "text-[#16A34A]" },
                info: { bar: "bg-[#2563EB]", bg: "bg-[#EFF6FF] border-l-[#2563EB]", title: "text-[#2563EB]" },
              };
              const s = cfg[n.type as keyof typeof cfg] ?? cfg.info;
              return (
                <div key={n.id} className={`p-3 rounded-lg border-l-4 ${s.bg} ${!n.read ? "opacity-100" : "opacity-60"}`}>
                  <p className={`text-xs font-semibold ${s.title}`}>{n.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{n.message}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{n.createdAt}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Material Shortages ── */}
      {shortages.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center">
                <AlertTriangle size={15} className="text-[#DC2626]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Kekurangan Material Kritis</p>
                <p className="text-xs text-[#6B7280]">{shortages.length} item perlu ditindaklanjuti segera</p>
              </div>
            </div>
            <Link
              href="/mrp"
              className="flex items-center gap-1.5 text-[#2563EB] text-xs font-medium border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 rounded-lg hover:bg-[#DBEAFE] transition-colors"
            >
              Jalankan MRP <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {["Material", "Proyek", "Kebutuhan Kotor", "Stok", "Net Req", "Tgl Butuh", "Rec. PO Qty"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-[#6B7280] font-medium text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shortages.map(m => (
                  <tr key={m.id} className="table-row-hover">
                    <td className="py-2.5 px-3 text-[#111827] font-medium whitespace-nowrap">{m.material}</td>
                    <td className="py-2.5 px-3 text-[#6B7280] text-xs whitespace-nowrap">{m.projectId}</td>
                    <td className="py-2.5 px-3 font-mono text-[#4B5563] whitespace-nowrap">{m.grossRequirement}</td>
                    <td className="py-2.5 px-3 font-mono text-[#4B5563] whitespace-nowrap">{m.onHand}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded">{m.netRequirement}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#6B7280] text-xs whitespace-nowrap">{m.requiredDate}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-[#D97706]">{m.recommendedPO}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
