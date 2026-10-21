"use client";
import { projects, milestones, risks } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar, RingProgress } from "@/components/ui/ProgressBar";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  FolderKanban, Activity, AlertTriangle, CheckCircle2,
  Clock, ShieldAlert, ArrowUpRight, ChevronRight, Plus,
} from "lucide-react";
import Link from "next/link";

const RISK_COLORS = ["#DC2626", "#D97706", "#2563EB", "#16A34A"];

export function ProjectDashboard() {
  const activeProjects = projects.filter(p => p.status === "Active");
  const totalContract = activeProjects.reduce((s, p) => s + p.contractValue, 0);
  const totalBudget = activeProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = activeProjects.reduce((s, p) => s + p.actualCost, 0);

  const completedMilestones = milestones.filter(m => m.status === "Completed").length;
  const inProgressMilestones = milestones.filter(m => m.status === "In Progress").length;
  const openRisks = risks.filter(r => r.status === "Open");

  // Budget vs Actual per project chart data
  const budgetVsActualData = projects.map(p => ({
    name: p.code,
    fullName: p.name,
    budget: Math.round(p.budget / 1e6),
    aktual: Math.round(p.actualCost / 1e6),
  }));

  // Risk status distribution
  const riskStatusData = [
    { name: "High Impact", value: risks.filter(r => r.impact === "High").length },
    { name: "Medium Impact", value: risks.filter(r => r.impact === "Medium").length },
    { name: "Mitigated", value: risks.filter(r => r.status === "Mitigated").length },
    { name: "Open", value: risks.filter(r => r.status === "Open").length },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Manajemen Proyek</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Pantau jadwal milestone, anggaran biaya, dan mitigasi risiko proyek</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/projects/tracker"
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Activity size={14} /> Interactive Gantt Tracker
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-medium px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-xs"
          >
            <Plus size={14} /> Kelola Proyek
          </Link>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Proyek Aktif"
          value={activeProjects.length}
          subtitle={`Total Nilai: ${(totalContract / 1e9).toFixed(2)} Miliar IDR`}
          icon={FolderKanban}
          color="blue"
        />
        <KpiCard
          title="Milestone Selesai"
          value={`${completedMilestones} / ${milestones.length}`}
          subtitle={`${inProgressMilestones} milestone sedang berjalan`}
          icon={CheckCircle2}
          color="green"
        />
        <KpiCard
          title="Biaya Aktual vs Budget"
          value={`${((totalSpent / (totalBudget || 1)) * 100).toFixed(0)}%`}
          subtitle={`${(totalSpent / 1e6).toFixed(0)}M dari ${(totalBudget / 1e6).toFixed(0)}M IDR`}
          icon={Clock}
          color={totalSpent > totalBudget ? "red" : "purple"}
        />
        <KpiCard
          title="Risiko Terbuka"
          value={openRisks.length}
          subtitle={`${risks.filter(r => r.impact === "High" && r.status === "Open").length} tingkat dampak tinggi`}
          icon={ShieldAlert}
          color={openRisks.length > 0 ? "yellow" : "green"}
        />
      </div>

      {/* ── Charts: Budget vs Actual & Risk Breakdown ── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Perbandingan Anggaran vs Biaya Aktual (Juta IDR)</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Penyerapan anggaran per proyek aktif</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#6B7280]">
                <span className="w-3 h-2 rounded bg-[#3B82F6]" /> Anggaran
              </span>
              <span className="flex items-center gap-1.5 text-[#6B7280]">
                <span className="w-3 h-2 rounded bg-[#10B981]" /> Realisasi Aktual
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={budgetVsActualData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = budgetVsActualData.find(b => b.name === label);
                  return (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-lg text-xs">
                      <p className="font-semibold text-[#0F172A]">{item?.fullName}</p>
                      <p className="text-[#3B82F6] mt-1 font-mono">Anggaran: {formatCurrency((payload[0].value as number) * 1e6)}</p>
                      <p className="text-[#10B981] font-mono">Realisasi: {formatCurrency((payload[1]?.value as number) * 1e6)}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="budget" name="Anggaran" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="aktual" name="Realisasi" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-4 card">
          <p className="text-sm font-semibold text-[#111827] mb-0.5">Matriks & Profil Risiko</p>
          <p className="text-xs text-[#6B7280] mb-3">Distribusi status & tingkat keparahan</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={riskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={3}
                dataKey="value"
              >
                {riskStatusData.map((_, i) => (
                  <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {riskStatusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: RISK_COLORS[i] }} />
                <span className="text-[#64748B] truncate text-[11px]">{s.name}</span>
                <span className="font-semibold text-[#0F172A] ml-auto font-mono text-[11px]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Projects List & Milestones ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Active Projects Status */}
        <div className="col-span-12 lg:col-span-6 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Progres Proyek Aktif</p>
              <p className="text-xs text-[#6B7280]">Target penyelesaian dan Project Manager</p>
            </div>
            <Link href="/projects" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
              Semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeProjects.map(p => {
              const pctColor = p.progress >= 70 ? "#16A34A" : p.progress >= 40 ? "#2563EB" : "#D97706";
              return (
                <div key={p.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#0F172A] truncate max-w-[240px]">{p.name}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: pctColor }}>{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} color={p.progress >= 70 ? "green" : p.progress >= 40 ? "blue" : "yellow"} size="sm" />
                  <div className="flex items-center justify-between text-xs text-[#64748B] mt-2">
                    <span>PM: <strong className="text-[#334155]">{p.pm}</strong></span>
                    <span>Target: {p.targetDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Milestones */}
        <div className="col-span-12 lg:col-span-6 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Milestone Kritis & Jadwal</p>
              <p className="text-xs text-[#6B7280]">Milestone terdekat yang sedang berjalan</p>
            </div>
            <Link href="/projects/milestones" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
              Detail <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {milestones.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.status === 'Completed' ? 'bg-[#F0FDF4] text-[#16A34A]' : m.status === 'In Progress' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F8FAFC] text-[#94A3B8]'}`}>
                  {m.status === 'Completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{m.name}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                    <span>PIC: {m.pic}</span>
                    <span>·</span>
                    <span>Target: {m.targetDate}</span>
                    <span>·</span>
                    <span>Bobot: {m.weight}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#2563EB]">{m.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Risk Matrix Table ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#D97706]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Daftar Risiko Proyek & Tindakan Mitigasi</p>
              <p className="text-xs text-[#6B7280]">Identifikasi risiko aktif dan penanggung jawab</p>
            </div>
          </div>
          <Link href="/projects/risks" className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1">
            Lihat Semua Risiko <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Judul Risiko</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Proyek</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Probabilitas</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Dampak</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Status</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Rencana Mitigasi</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {risks.map(r => (
                <tr key={r.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 px-3 font-medium text-[#0F172A] whitespace-nowrap">{r.title}</td>
                  <td className="py-2.5 px-3 font-mono text-[#64748B] whitespace-nowrap">{r.projectId}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.probability === 'High' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#FFFBEB] text-[#D97706]'}`}>
                      {r.probability}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.impact === 'High' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                      {r.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2.5 px-3 text-[#475569] max-w-xs truncate whitespace-nowrap">{r.mitigation}</td>
                  <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
