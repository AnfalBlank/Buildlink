"use client";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { qcInspections } from "@/lib/dummy-data";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight,
  ArrowUpRight, XCircle, Clock, FileCheck2,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 shadow-md text-xs">
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.payload.fill }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.payload.fill }} />
          {p.name}: <span className="font-mono font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const RESULT_COLORS = ["#16A34A", "#EF4444", "#D97706", "#94A3B8"];

export function QualityDashboard() {
  const passed = qcInspections.filter(q => q.result === "Pass");
  const failed = qcInspections.filter(q => q.result === "Fail");
  const pending = qcInspections.filter(q => q.result === "Pending");
  const passRate = Math.round((passed.length / (qcInspections.length || 1)) * 100);

  const resultData = [
    { name: "Pass", value: passed.length },
    { name: "Fail", value: failed.length },
    { name: "Pending", value: pending.length },
    { name: "Partial", value: qcInspections.length - passed.length - failed.length - pending.length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Quality Control</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Inspeksi, NCR tracking & sertifikasi kualitas</p>
        </div>
        <Link href="/quality/inspections"
          className="flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm">
          <ShieldCheck size={14} /> Inspeksi
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard title="Pass Rate" value={`${passRate}%`}
          subtitle={`${passed.length}/${qcInspections.length} inspeksi lulus`}
          icon={CheckCircle2} color={passRate >= 80 ? "green" : "yellow"} />
        <KpiCard title="Inspeksi Gagal" value={failed.length}
          subtitle="Membutuhkan NCR / rework"
          icon={XCircle} color={failed.length > 0 ? "red" : "green"} />
        <KpiCard title="Menunggu Inspeksi" value={pending.length}
          subtitle="Unit belum diinspeksi"
          icon={Clock} color={pending.length > 0 ? "yellow" : "green"} />
        <KpiCard title="Total Inspeksi" value={qcInspections.length}
          subtitle="Inspeksi periode ini"
          icon={FileCheck2} color="blue" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Pass/Fail Pie */}
        <div className="col-span-12 lg:col-span-5 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Distribusi Hasil</p>
          <p className="text-xs text-[#6B7280] mb-3">Breakdown hasil inspeksi</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={resultData} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                dataKey="value" paddingAngle={3} strokeWidth={0}>
                {resultData.map((_, i) => <Cell key={i} fill={RESULT_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {resultData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: RESULT_COLORS[i] }} />
                <span className="text-[#6B7280]">{item.name}</span>
                <span className="font-mono font-semibold text-[#111827] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inspections */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111827]">Inspeksi Terbaru</p>
            <Link href="/quality/inspections" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {qcInspections.slice(0, 5).map(insp => {
              const resultColor = insp.status === "Pass" ? "#16A34A" : insp.status === "Fail" ? "#EF4444" : "#D97706";
              const ResultIcon = insp.status === "Pass" ? CheckCircle2 : insp.status === "Fail" ? XCircle : Clock;
              return (
                <div key={insp.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${resultColor}15`, color: resultColor }}>
                    <ResultIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#111827] truncate">{insp.code}</span>
                      <StatusBadge status={insp.status} />
                    </div>
                    <p className="text-[10px] text-[#6B7280] truncate">{insp.operation} · {insp.inspector}</p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">{insp.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
