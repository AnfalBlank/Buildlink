"use client";
import { useState } from "react";
import { projectCosts, projects } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Search } from "lucide-react";

export default function CostingPage() {
  const [search, setSearch] = useState("");

  const costData = projectCosts.map(c => {
    const proj = projects.find(p => p.id === c.projectId);
    return { ...c, projectName: proj?.name ?? c.projectId, projectCode: proj?.code ?? c.projectId };
  }).filter(c => {
    const q = search.toLowerCase();
    return !q || c.projectCode.toLowerCase().includes(q) || c.projectName.toLowerCase().includes(q);
  });

  const chartData = costData.map(c => ({
    name: c.projectCode,
    Budget: c.budgetTotal / 1e6,
    Committed: (c.committedMaterial + c.committedLabor + c.committedSubcon) / 1e6,
    Actual: c.actualTotal / 1e6,
    EAC: c.eac / 1e6,
  }));

  const formatM = (v: number) => `${v.toFixed(0)}M`;

  return (
    <div>
      <PageHeader
        title="Project Costing"
        subtitle="Biaya anggaran vs komitmen vs aktual per proyek"
      />

      {/* Chart */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Budget vs Committed vs Actual vs EAC (IDR Juta)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
            <XAxis dataKey="name" tick={{ fill: "#98989D", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#98989D", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatM} />
            <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", border: "1px solid #2C2C2E", borderRadius: 8 }} formatter={(v: unknown) => [`${(v as number).toFixed(0)}M IDR`]} />
            <Legend wrapperStyle={{ color: "#98989D", fontSize: 12 }} />
            <Bar dataKey="Budget" fill="#2C2C2E" radius={[4,4,0,0]} />
            <Bar dataKey="Committed" fill="#FFD60A" radius={[4,4,0,0]} />
            <Bar dataKey="Actual" fill="#00E5FF" radius={[4,4,0,0]} />
            <Bar dataKey="EAC" fill="#32D74B" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input className="input pl-9" placeholder="Cari proyek..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Per Project Cards */}
      <div className="space-y-4">
        {costData.map(c => {
          const budgetUtilPct = c.budgetTotal > 0 ? (c.actualTotal / c.budgetTotal) * 100 : 0;
          const marginPct = c.forecastRevenue > 0 ? (c.forecastMargin / c.forecastRevenue) * 100 : 0;
          const variance = c.budgetTotal - c.eac;
          return (
            <div key={c.projectId} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-text-primary font-semibold">{c.projectName}</h3>
                  <p className="text-text-secondary text-xs">{c.projectCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-secondary text-xs mb-0.5">Forecast Margin</p>
                  <p className={`font-mono font-bold text-xl ${marginPct >= 20 ? "text-accent-success" : marginPct >= 10 ? "text-accent-warning" : "text-accent-alert"}`}>{marginPct.toFixed(1)}%</p>
                  <p className="text-text-secondary text-xs">{formatCurrency(c.forecastMargin)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Contract Revenue", val: c.forecastRevenue, cls: "text-accent-success" },
                  { label: "Budget Cost", val: c.budgetTotal, cls: "text-text-primary" },
                  { label: "Committed Cost", val: c.committedMaterial + c.committedLabor + c.committedSubcon, cls: "text-accent-warning" },
                  { label: "Actual Cost", val: c.actualTotal, cls: "text-accent" },
                  { label: "ETC (Est. to Complete)", val: c.etc, cls: "text-purple-400" },
                  { label: "EAC (Forecast Final)", val: c.eac, cls: "text-blue-400" },
                  { label: "Cost Variance", val: variance, cls: variance >= 0 ? "text-accent-success" : "text-accent-alert" },
                  { label: "Forecast Margin", val: c.forecastMargin, cls: marginPct >= 20 ? "text-accent-success" : "text-accent-warning" },
                ].map(f => (
                  <div key={f.label} className="bg-surface-2 rounded-lg p-3">
                    <p className="text-text-secondary text-xs mb-1">{f.label}</p>
                    <p className={`font-mono font-bold text-sm ${f.cls}`}>{formatCurrency(f.val)}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Budget Utilization</span>
                  <span className="font-mono">{budgetUtilPct.toFixed(1)}%</span>
                </div>
                <ProgressBar value={budgetUtilPct} color={budgetUtilPct > 90 ? "red" : budgetUtilPct > 70 ? "yellow" : "cyan"} />
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Cost Breakdown</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    ["Material", c.actualMaterial],
                    ["Labor", c.actualLabor],
                    ["Overhead", c.actualOverhead],
                    ["Subcontract", c.actualSubcon],
                  ].map(([l,v]) => (
                    <div key={l} className="bg-surface-2 rounded p-2">
                      <p className="text-text-secondary mb-0.5">{l}</p>
                      <p className="font-mono text-accent">{formatCurrency(Number(v))}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
