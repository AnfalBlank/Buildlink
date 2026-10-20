"use client";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar, RingProgress } from "@/components/ui/ProgressBar";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import { productionOrders, workOrders, projects } from "@/lib/dummy-data";
import {
  Factory, Wrench, Clock, CheckCircle2, ChevronRight,
  AlertTriangle, Cog, ArrowUpRight, Activity,
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

const WO_COLORS = ["#16A34A", "#2563EB", "#D97706", "#EF4444", "#CBD5E1"];

export function ProductionDashboard() {
  const inProgressPO = productionOrders.filter(p => p.status === "In Progress");
  const releasedPO = productionOrders.filter(p => p.status === "Released");
  const completedWO = workOrders.filter(w => w.status === "Completed");
  const inProgressWO = workOrders.filter(w => w.status === "In Progress");
  const qcPendingWO = workOrders.filter(w => w.status === "Submitted for QC");

  const woStatusData = [
    { name: "Selesai", value: completedWO.length },
    { name: "Berjalan", value: inProgressWO.length },
    { name: "Menunggu QC", value: qcPendingWO.length },
    { name: "Tertunda", value: workOrders.filter(w => !["Completed", "In Progress", "Submitted for QC"].includes(w.status)).length },
  ];

  const dailyOutput = [
    { day: "Sen", units: 3, target: 4 },
    { day: "Sel", units: 4, target: 4 },
    { day: "Rab", units: 2, target: 4 },
    { day: "Kam", units: 5, target: 4 },
    { day: "Jum", units: 3, target: 4 },
    { day: "Sab", units: 1, target: 2 },
  ];

  const efficiency = Math.round((completedWO.length / (workOrders.length || 1)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Produksi</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Monitoring produksi, work order & efisiensi</p>
        </div>
        <Link href="/production/orders"
          className="flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm">
          <Factory size={14} /> Production Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard title="Production Order" value={productionOrders.length}
          subtitle={`${inProgressPO.length} berjalan · ${releasedPO.length} dirilis`}
          icon={Factory} color="red"
          trend={{ value: 15, label: "bulan ini" }} />
        <KpiCard title="Work Order Aktif" value={inProgressWO.length}
          subtitle={`${workOrders.length} total WO`}
          icon={Wrench} color="blue" />
        <KpiCard title="Menunggu QC" value={qcPendingWO.length}
          subtitle="Unit submit untuk inspeksi"
          icon={Clock} color={qcPendingWO.length > 0 ? "yellow" : "green"} />
        <KpiCard title="Efisiensi" value={`${efficiency}%`}
          subtitle="Completion rate WO"
          icon={CheckCircle2} color={efficiency >= 70 ? "green" : "yellow"} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Daily Output */}
        <div className="col-span-12 lg:col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Output Harian</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Unit selesai vs target per hari</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {[{ l: "Aktual", c: "#2563EB" }, { l: "Target", c: "#E2E8F0" }].map(i => (
                <span key={i.l} className="flex items-center gap-1.5 text-[#6B7280]">
                  <span className="w-3 h-1.5 rounded-full" style={{ background: i.c }} />
                  {i.l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyOutput} barSize={20} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="target" name="Target" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth={1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="units" name="Aktual" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* WO Status Pie */}
        <div className="col-span-12 lg:col-span-4 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Status Work Order</p>
          <p className="text-xs text-[#6B7280] mb-3">Distribusi status saat ini</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={woStatusData} cx="50%" cy="50%" innerRadius={44} outerRadius={64}
                dataKey="value" paddingAngle={3} strokeWidth={0}>
                {woStatusData.map((_, i) => <Cell key={i} fill={WO_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {woStatusData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: WO_COLORS[i] }} />
                <span className="text-[#6B7280] truncate">{item.name}</span>
                <span className="font-mono font-semibold text-[#111827] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Work Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#111827]">Work Order Aktif</p>
          <Link href="/production/work-orders" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {workOrders.filter(w => w.status === "In Progress").slice(0, 4).map(wo => {
            const progress = wo.status === "Completed" ? 100 : Math.min(95, Math.round(((wo.actualHours || 0) / (wo.estimatedHours || 1)) * 100));
            return (
              <div key={wo.id} className="flex items-center gap-4 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all group cursor-pointer">
                <RingProgress value={progress} size={44} stroke={4} color={progress >= 70 ? "#16A34A" : "#2563EB"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[#111827] truncate">{wo.code}</span>
                    <StatusBadge status={wo.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <Cog size={10} /> {wo.workCenter}
                    <span className="text-[#D1D5DB]">·</span>
                    {wo.assignedTo}
                  </div>
                  <ProgressBar value={progress} color={progress >= 70 ? "green" : "blue"} size="xs" className="mt-1.5" />
                </div>
                <Link href="/production/work-orders" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white">
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
