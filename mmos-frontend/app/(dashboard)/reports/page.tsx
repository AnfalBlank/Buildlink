"use client";
import { useState, useMemo } from "react";
import { projects, productionOrders, mrpData, invoices, qcInspections, ncrs, projectCosts, workOrders } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/Badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Calendar, Filter } from "lucide-react";

const TABS = ["Project","Production","Procurement & Inventory","Quality","Finance & Cost"];

type DateRange = { from: string; to: string };

function isInRange(dateStr: string, range: DateRange): boolean {
  if (!range.from && !range.to) return true;
  const d = new Date(dateStr);
  if (range.from && d < new Date(range.from)) return false;
  if (range.to && d > new Date(range.to)) return false;
  return true;
}

const QUICK_RANGES = [
  { label: "Semua", from: "", to: "" },
  { label: "Bulan Ini", from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
  { label: "3 Bulan", from: new Date(new Date().setMonth(new Date().getMonth()-3)).toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
  { label: "6 Bulan", from: new Date(new Date().setMonth(new Date().getMonth()-6)).toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
  { label: "Tahun Ini", from: `${new Date().getFullYear()}-01-01`, to: new Date().toISOString().split("T")[0] },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("Project");
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const [quickLabel, setQuickLabel] = useState("Semua");

  function applyQuick(qr: typeof QUICK_RANGES[0]) {
    setQuickLabel(qr.label);
    setRange({ from: qr.from, to: qr.to });
  }

  // Filtered data based on date range
  const filteredProjects = useMemo(() =>
    projects.filter(p => !p.targetDate || isInRange(p.targetDate, range)),
    [range]
  );
  const filteredWO = useMemo(() =>
    workOrders.filter(w => !w.targetDate || isInRange(w.targetDate, range)),
    [range]
  );
  const filteredInvoices = useMemo(() =>
    invoices.filter(i => !i.dueDate || isInRange(i.dueDate, range)),
    [range]
  );
  const filteredNCRs = useMemo(() =>
    ncrs.filter(n => !n.dueDate || isInRange(n.dueDate, range)),
    [range]
  );
  const filteredInspections = useMemo(() =>
    qcInspections.filter(q => !q.date || isInRange(q.date, range)),
    [range]
  );
  const filteredCosts = useMemo(() =>
    projectCosts.filter(c => {
      const proj = projects.find(p => p.id === c.projectId);
      return !proj?.targetDate || isInRange(proj.targetDate, range);
    }),
    [range]
  );

  const totalBudget = filteredCosts.reduce((s,c) => s+c.budgetTotal, 0);
  const totalActual = filteredCosts.reduce((s,c) => s+c.actualTotal, 0);
  const totalCommitted = filteredCosts.reduce((s,c) => s+c.committedMaterial+c.committedLabor+c.committedSubcon, 0);
  const totalEAC = filteredCosts.reduce((s,c) => s+c.eac, 0);
  const totalRevenue = filteredCosts.reduce((s,c) => s+c.forecastRevenue, 0);
  const totalMargin = filteredCosts.reduce((s,c) => s+c.forecastMargin, 0);

  const qcPassRate = filteredInspections.length > 0
    ? (filteredInspections.filter(q=>q.status==="Pass").length / Math.max(1, filteredInspections.filter(q=>q.status!=="Pending").length) * 100)
    : 0;

  const woStatusData = [
    { name: "Completed", value: filteredWO.filter(w=>w.status==="Completed").length, color: "#32D74B" },
    { name: "In Progress", value: filteredWO.filter(w=>w.status==="In Progress").length, color: "#00E5FF" },
    { name: "Submitted QC", value: filteredWO.filter(w=>w.status==="Submitted for QC").length, color: "#FFD60A" },
    { name: "Draft/Ready", value: filteredWO.filter(w=>w.status==="Draft"||w.status==="Ready").length, color: "#98989D" },
  ];

  const costBreakdown = [
    { name: "Material", value: filteredCosts.reduce((s,c)=>s+c.actualMaterial,0)/1e6, color: "#00E5FF" },
    { name: "Labor", value: filteredCosts.reduce((s,c)=>s+c.actualLabor,0)/1e6, color: "#32D74B" },
    { name: "Overhead", value: filteredCosts.reduce((s,c)=>s+c.actualOverhead,0)/1e6, color: "#FFD60A" },
    { name: "Subcontract", value: filteredCosts.reduce((s,c)=>s+c.actualSubcon,0)/1e6, color: "#FF453A" },
  ];

  // ── Period Filter Bar ──────────────────────────────────────────
  const PeriodFilter = () => (
    <div className="card mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Filter size={14} />
          <span className="text-xs font-medium">Filter Periode:</span>
        </div>
        {QUICK_RANGES.map(qr => (
          <button
            key={qr.label}
            onClick={() => applyQuick(qr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              quickLabel === qr.label
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-secondary hover:text-text-primary"
            }`}
          >
            {qr.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <Calendar size={13} className="text-text-secondary" />
          <input
            type="date"
            className="input !py-1 !text-xs w-36"
            value={range.from}
            onChange={e => { setRange(r => ({...r, from: e.target.value})); setQuickLabel("Custom"); }}
          />
          <span className="text-text-secondary text-xs">—</span>
          <input
            type="date"
            className="input !py-1 !text-xs w-36"
            value={range.to}
            onChange={e => { setRange(r => ({...r, to: e.target.value})); setQuickLabel("Custom"); }}
          />
          {(range.from || range.to) && (
            <button
              onClick={() => applyQuick(QUICK_RANGES[0])}
              className="text-xs text-accent-alert hover:underline"
            >Reset</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Laporan manajemen terintegrasi"
        actions={<button className="btn-secondary text-xs">Export PDF</button>}
      />

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4 border-b border-border pb-3 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t?"bg-accent/10 text-accent border border-accent/30":"text-text-secondary hover:text-text-primary"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Period Filter */}
      <PeriodFilter />

      {/* ── Project Report ── */}
      {tab === "Project" && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Active Projects", val: filteredProjects.filter(p=>p.status==="Active").length, cls:"text-accent" },
              { label: "On Time", val: filteredProjects.filter(p=>p.status==="Active").length, cls:"text-accent-success" },
              { label: "Delayed", val: 0, cls:"text-accent-alert" },
              { label: "Completed YTD", val: filteredProjects.filter(p=>p.status==="Completed").length, cls:"text-accent" },
            ].map(s=>(
              <div key={s.label} className="card text-center">
                <p className="text-text-secondary text-xs mb-1">{s.label}</p>
                <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Project Status — Milestone vs Actual Progress</h3>
            {filteredProjects.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">Tidak ada data untuk periode yang dipilih.</p>
            ) : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["Code","Project Name","Customer","PM","Target","Contract Value","Progress","Status"].map(h=>(
                    <th key={h} className="text-left py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredProjects.map(p=>(
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2 px-3 font-mono text-accent text-xs">{p.code}</td>
                      <td className="py-2 px-3 text-text-primary font-medium">{p.name}</td>
                      <td className="py-2 px-3 text-text-secondary text-xs">{p.customer}</td>
                      <td className="py-2 px-3 text-text-secondary text-xs">{p.pm}</td>
                      <td className="py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{p.targetDate}</td>
                      <td className="py-2 px-3 font-mono text-accent text-xs whitespace-nowrap">{formatCurrency(p.contractValue)}</td>
                      <td className="py-2 px-3 w-28"><ProgressBar value={p.progress} size="sm" showLabel/></td>
                      <td className="py-2 px-3"><StatusBadge status={p.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ── Production Report ── */}
      {tab === "Production" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Work Order Status Distribution</h3>
              {filteredWO.length === 0 ? <p className="text-text-secondary text-sm text-center py-8">Tidak ada data.</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={woStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {woStatusData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor:"#fff",border:"1px solid #E2E8F0",borderRadius:8}}/>
                    <Legend wrapperStyle={{color:"#6B7280",fontSize:12}}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Production Orders by Status</h3>
              <div className="space-y-3">
                {productionOrders.map(po=>(
                  <div key={po.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{po.code}</p>
                      <p className="text-text-secondary text-xs">{po.product} — {po.qty} units</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={po.progress} size="sm" className="w-24"/>
                      <StatusBadge status={po.status}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Work Order Efficiency</h3>
            {filteredWO.length === 0 ? <p className="text-text-secondary text-sm text-center py-8">Tidak ada data.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["WO Code","Operation","Serial","Est.Hrs","Act.Hrs","Efficiency","Status"].map(h=>(
                    <th key={h} className="text-left py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredWO.map(w=>{
                    const eff = w.actualHours>0?Math.round((w.estimatedHours/w.actualHours)*100):null;
                    return (
                      <tr key={w.id} className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-accent text-xs">{w.code}</td>
                        <td className="py-2 px-3 text-text-primary">{w.operation}</td>
                        <td className="py-2 px-3 font-mono text-text-secondary text-xs">{w.serial}</td>
                        <td className="py-2 px-3 font-mono text-text-secondary">{w.estimatedHours}h</td>
                        <td className="py-2 px-3 font-mono text-text-secondary">{w.actualHours}h</td>
                        <td className="py-2 px-3">{eff!=null?<span className={`font-mono font-bold ${eff>=90?"text-accent-success":eff>=75?"text-accent-warning":"text-accent-alert"}`}>{eff}%</span>:<span className="text-text-secondary">-</span>}</td>
                        <td className="py-2 px-3"><StatusBadge status={w.status}/></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ── Procurement & Inventory ── */}
      {tab === "Procurement & Inventory" && (
        <div className="space-y-5">
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Material Shortage Report</h3>
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Material","Project","Gross Req","On Hand","Net Req","Required Date","Lead Time","Rec. PO","Status"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {mrpData
                  .filter(m => !m.requiredDate || isInRange(m.requiredDate, range))
                  .map(m=>(
                  <tr key={m.id} className="border-b border-border/50">
                    <td className="py-2 px-3 text-text-primary font-medium">{m.material}</td>
                    <td className="py-2 px-3 text-text-secondary text-xs">{m.projectId}</td>
                    <td className="py-2 px-3 font-mono text-text-secondary">{m.grossRequirement}</td>
                    <td className="py-2 px-3 font-mono text-text-secondary">{m.onHand}</td>
                    <td className="py-2 px-3 font-mono font-bold text-accent-alert">{m.netRequirement}</td>
                    <td className="py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{m.requiredDate}</td>
                    <td className="py-2 px-3 font-mono text-text-secondary text-xs">{m.leadTime}d</td>
                    <td className="py-2 px-3 font-mono text-accent-warning">{m.recommendedPO}</td>
                    <td className="py-2 px-3"><span className={`badge-status border ${m.status==="Shortage"?"text-accent-alert bg-accent-alert/10 border-accent-alert/30":"text-accent-success bg-accent-success/10 border-accent-success/30"}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* ── Quality Report ── */}
      {tab === "Quality" && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Inspections", val: filteredInspections.length, cls:"text-accent" },
              { label: "Pass", val: filteredInspections.filter(q=>q.status==="Pass").length, cls:"text-accent-success" },
              { label: "Fail", val: filteredInspections.filter(q=>q.status==="Fail").length, cls:"text-accent-alert" },
              { label: "Pass Rate", val: `${qcPassRate.toFixed(0)}%`, cls: qcPassRate>=90?"text-accent-success":"text-accent-warning" },
            ].map(s=>(
              <div key={s.label} className="card text-center">
                <p className="text-text-secondary text-xs mb-1">{s.label}</p>
                <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Open NCRs</h3>
            {filteredNCRs.length === 0 ? <p className="text-text-secondary text-sm text-center py-8">Tidak ada data.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["Code","Serial","Title","Severity","Disposition","PIC","Due Date","Status"].map(h=>(
                    <th key={h} className="text-left py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredNCRs.map(n=>(
                    <tr key={n.id} className="border-b border-border/50">
                      <td className="py-2 px-3 font-mono text-accent-alert text-xs">{n.code}</td>
                      <td className="py-2 px-3 font-mono text-text-secondary text-xs">{n.serial}</td>
                      <td className="py-2 px-3 text-text-primary">{n.title}</td>
                      <td className="py-2 px-3"><span className={`badge-status border ${n.severity==="Major"?"text-accent-alert bg-accent-alert/10 border-accent-alert/30":"text-accent-warning bg-accent-warning/10 border-accent-warning/30"}`}>{n.severity}</span></td>
                      <td className="py-2 px-3 text-text-secondary text-xs">{n.disposition}</td>
                      <td className="py-2 px-3 text-text-secondary text-xs">{n.pic}</td>
                      <td className="py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{n.dueDate}</td>
                      <td className="py-2 px-3"><StatusBadge status={n.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ── Finance & Cost ── */}
      {tab === "Finance & Cost" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Contract Revenue", val: formatCurrency(totalRevenue), cls:"text-accent-success" },
              { label: "Budget Cost", val: formatCurrency(totalBudget), cls:"text-text-primary" },
              { label: "Actual Cost (To Date)", val: formatCurrency(totalActual), cls:"text-accent" },
              { label: "Committed Cost", val: formatCurrency(totalCommitted), cls:"text-accent-warning" },
              { label: "Forecast Final Cost (EAC)", val: formatCurrency(totalEAC), cls:"text-blue-500" },
              { label: "Forecast Margin", val: formatCurrency(totalMargin), cls: totalMargin>0?"text-accent-success":"text-accent-alert" },
            ].map(s=>(
              <div key={s.label} className="card">
                <p className="text-text-secondary text-xs mb-1">{s.label}</p>
                <p className={`font-mono font-bold text-xl ${s.cls}`}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Actual Cost Breakdown</h3>
              {filteredCosts.length===0 ? <p className="text-text-secondary text-sm text-center py-8">Tidak ada data.</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={costBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {costBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor:"#fff",border:"1px solid #E2E8F0",borderRadius:8}} formatter={(v:unknown)=>[`${(v as number).toFixed(1)}M IDR`]}/>
                    <Legend wrapperStyle={{color:"#6B7280",fontSize:12}}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Invoice Status Summary</h3>
              <div className="space-y-3">
                {["Paid","Partially Paid","Unpaid","Overdue"].map(s => {
                  const inv = filteredInvoices.filter(i=>i.status===s);
                  const total = inv.reduce((a,i)=>a+i.totalAmount,0);
                  return (
                    <div key={s} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s}/>
                        <span className="text-text-secondary text-xs">{inv.length} invoice(s)</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-accent">{formatCurrency(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
