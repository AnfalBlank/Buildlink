"use client";

import { useState, useMemo } from "react";
import {
  projects, milestones, projectTasks, projectActivities,
  projectCosts, type ProjectTask
} from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar, RingProgress } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2,
  CheckCircle2, Clock, AlertTriangle, PauseCircle,
  User, Calendar, Filter, List, BarChart3, Activity,
} from "lucide-react";

/* ─── Status colour tokens (light-theme only, no neon) ─── */
const STATUS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  "Selesai":     { text: "text-[#16A34A]", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]", dot: "#16A34A" },
  "Berjalan":    { text: "text-[#2563EB]", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]", dot: "#2563EB" },
  "Tertahan":    { text: "text-[#D97706]", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]", dot: "#D97706" },
  "Terlambat":   { text: "text-[#DC2626]", bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", dot: "#DC2626" },
  "Belum Mulai": { text: "text-[#6B7280]", bg: "bg-[#F9FAFB]", border: "border-[#E5E7EB]", dot: "#D1D5DB" },
};

const PRIORITAS: Record<string, { dot: string; text: string }> = {
  "Tinggi": { dot: "#DC2626", text: "text-[#DC2626]" },
  "Sedang": { dot: "#D97706", text: "text-[#D97706]" },
  "Rendah": { dot: "#16A34A", text: "text-[#16A34A]" },
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  "Selesai":     <CheckCircle2 size={12} className="text-[#16A34A]" />,
  "Berjalan":    <Activity     size={12} className="text-[#2563EB]" />,
  "Tertahan":    <PauseCircle  size={12} className="text-[#D97706]" />,
  "Terlambat":   <AlertTriangle size={12} className="text-[#DC2626]" />,
  "Belum Mulai": <Clock        size={12} className="text-[#9CA3AF]" />,
};

/* ─── Progress helpers ─── */
function progressProyek(pid: string) {
  const ms = milestones.filter(m => m.projectId === pid);
  if (!ms.length) return 0;
  return Math.round(ms.reduce((s, m) => s + m.weight * (m.completion / 100), 0));
}

function progressMilestone(mid: string) {
  const ts = projectTasks.filter(t => t.milestoneId === mid);
  if (!ts.length) return 0;
  const total = ts.reduce((s, t) => s + t.bobot, 0);
  if (!total) return 0;
  return Math.round(ts.reduce((s, t) => s + t.bobot * t.persentase / 100, 0) / total * 100);
}

function progressColor(pct: number) {
  if (pct >= 80) return { bar: "green" as const, ring: "#16A34A" };
  if (pct >= 40) return { bar: "blue"  as const, ring: "#2563EB" };
  if (pct >  0)  return { bar: "yellow" as const, ring: "#D97706" };
  return { bar: "blue" as const, ring: "#D1D5DB" };
}

/* ─── TaskRow ─── */
function TaskRow({ task, onEdit, onDelete, onStatusChange }: {
  task: ProjectTask;
  onEdit: (t: ProjectTask) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, next: string) => void;
}) {
  const sc = STATUS[task.status] ?? STATUS["Belum Mulai"];
  const pc = PRIORITAS[task.prioritas];

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-0">
      {/* Toggle done */}
      <button
        onClick={() => onStatusChange(task.id, task.status === "Selesai" ? "Berjalan" : "Selesai")}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.status === "Selesai"
            ? "bg-[#16A34A] border-[#16A34A]"
            : "border-[#D1D5DB] hover:border-[#2563EB]"
        }`}
      >
        {task.status === "Selesai" && <CheckCircle2 size={10} className="text-white" />}
      </button>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] font-medium ${task.status === "Selesai" ? "line-through text-[#9CA3AF]" : "text-[#111827]"}`}>
          {task.nama}
        </span>
        {task.deskripsi && (
          <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{task.deskripsi}</p>
        )}
      </div>

      {/* Progress */}
      <div className="hidden md:flex items-center gap-2 w-28 flex-shrink-0">
        <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${task.persentase}%`, background: sc.dot }} />
        </div>
        <span className="text-[11px] font-mono font-semibold w-8 text-right" style={{ color: sc.dot }}>{task.persentase}%</span>
      </div>

      {/* Status */}
      <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium flex-shrink-0 ${sc.bg} ${sc.border} ${sc.text}`}>
        {STATUS_ICON[task.status]}
        <span className="hidden lg:inline">{task.status}</span>
      </div>

      {/* Priority dot */}
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pc.dot }} title={task.prioritas} />

      {/* PIC */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#6B7280] w-28 flex-shrink-0 truncate">
        <User size={10} className="flex-shrink-0" />{task.pic}
      </div>

      {/* Deadline */}
      <div className="hidden md:flex items-center gap-1 text-[11px] text-[#6B7280] flex-shrink-0 w-24">
        <Calendar size={10} />{task.targetSelesai}
      </div>

      {/* Hours */}
      <div className="hidden xl:block text-[11px] font-mono text-[#9CA3AF] w-16 text-right flex-shrink-0">
        {task.aktualJam > 0 ? `${task.aktualJam}/${task.estimasiJam}h` : `${task.estimasiJam}h`}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#9CA3AF] hover:text-[#2563EB] transition-colors">
          <Pencil size={12} />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── MilestoneSection ─── */
function MilestoneSection({ milestone, tasks, onEditTask, onDeleteTask, onStatusChange, onAddTask }: {
  milestone: typeof milestones[0];
  tasks: ProjectTask[];
  onEditTask: (t: ProjectTask) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, s: string) => void;
  onAddTask: (mid: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const pct = progressMilestone(milestone.id);
  const done = tasks.filter(t => t.status === "Selesai").length;
  const late = tasks.filter(t => t.status === "Terlambat").length;
  const { ring } = progressColor(pct);

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9]"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[#9CA3AF]">{open ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}</span>
        <RingProgress value={pct} size={40} stroke={3} color={ring} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#111827] font-semibold text-sm">{milestone.name}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${
              milestone.status === "Completed" ? "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]" :
              milestone.status === "In Progress" ? "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]" :
              "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]"
            }`}>{milestone.status}</span>
            <span className="text-[#9CA3AF] text-[11px]">Bobot <span className="font-mono text-[#4B5563]">{milestone.weight}%</span></span>
            {late > 0 && <span className="text-[11px] text-[#DC2626] flex items-center gap-1"><AlertTriangle size={11}/>{late} terlambat</span>}
          </div>
          <div className="flex items-center gap-4 mt-0.5 text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1"><Calendar size={9}/>Target: {milestone.targetDate}</span>
            {milestone.actualDate && <span className="text-[#16A34A]">Aktual: {milestone.actualDate}</span>}
            <span className="flex items-center gap-1"><User size={9}/>{milestone.pic}</span>
            <span className="text-[#6B7280]">{done}/{tasks.length} selesai</span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {[
            { v: done,                                                         c: "#16A34A", l: "Selesai" },
            { v: tasks.filter(t=>t.status==="Berjalan").length,               c: "#2563EB", l: "Berjalan" },
            { v: tasks.filter(t=>t.status==="Tertahan"||t.status==="Terlambat").length, c: "#D97706", l: "Perlu Perhatian" },
          ].map(s=>(
            <div key={s.l} className="text-center w-14 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="font-mono font-bold text-sm" style={{color:s.c}}>{s.v}</p>
              <p className="text-[9px] text-[#9CA3AF] leading-tight">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="hidden lg:block w-28 flex-shrink-0">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#9CA3AF]">Progres</span>
            <span className="font-mono font-semibold" style={{color:ring}}>{pct}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background: ring}}/>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {open && (
        <>
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <div className="w-4 flex-shrink-0"/>
            <span className="flex-1 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Task</span>
            <span className="hidden md:block w-28 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide text-right flex-shrink-0">Progres</span>
            <span className="hidden sm:block w-24 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide flex-shrink-0">Status</span>
            <span className="w-1.5 flex-shrink-0"/>
            <span className="hidden lg:block w-28 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide flex-shrink-0">PIC</span>
            <span className="hidden md:block w-24 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide flex-shrink-0">Deadline</span>
            <span className="hidden xl:block w-16 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide text-right flex-shrink-0">Jam</span>
            <span className="w-12 flex-shrink-0"/>
          </div>

          {tasks.length === 0 ? (
            <div className="px-4 py-6 text-center text-[#9CA3AF] text-sm">Belum ada task</div>
          ) : (
            tasks.map(t => (
              <TaskRow key={t.id} task={t}
                onEdit={onEditTask} onDelete={onDeleteTask} onStatusChange={onStatusChange}/>
            ))
          )}

          {/* Add task */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#F1F5F9]">
            <button
              onClick={() => onAddTask(milestone.id)}
              className="flex items-center gap-2 text-[12px] text-[#6B7280] hover:text-[#2563EB] transition-colors py-1 px-2 rounded hover:bg-white"
            >
              <Plus size={12} className="text-[#2563EB]" />Tambah task
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function ProjectTrackerPage() {
  const [selectedPid, setSelectedPid] = useState("PRJ001");
  const [tasks, setTasks] = useState<ProjectTask[]>(projectTasks);
  const [activeTab, setActiveTab] = useState<"breakdown"|"ringkasan"|"aktivitas">("breakdown");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [modal, setModal] = useState<{type:"tambah"|"edit";task?:ProjectTask;milestoneId?:string}|null>(null);
  const [form, setForm] = useState<Partial<ProjectTask>>({});

  const selProj = projects.find(p => p.id === selectedPid);
  const projMs  = milestones.filter(m => m.projectId === selectedPid);
  const projTasks = tasks.filter(t => t.projectId === selectedPid);
  const acts    = projectActivities.filter(a => a.projectId === selectedPid);
  const cost    = projectCosts.find(c => c.projectId === selectedPid);
  const pPct    = progressProyek(selectedPid);
  const { ring: pColor } = progressColor(pPct);

  const stats = useMemo(() => ({
    total:    projTasks.length,
    selesai:  projTasks.filter(t=>t.status==="Selesai").length,
    berjalan: projTasks.filter(t=>t.status==="Berjalan").length,
    masalah:  projTasks.filter(t=>t.status==="Tertahan"||t.status==="Terlambat").length,
    estJam:   projTasks.reduce((s,t)=>s+t.estimasiJam,0),
    aktJam:   projTasks.reduce((s,t)=>s+t.aktualJam,0),
  }), [projTasks]);

  const filteredTasks = (mid: string) => {
    let ts = tasks.filter(t => t.milestoneId === mid);
    if (filterStatus !== "Semua") ts = ts.filter(t => t.status === filterStatus);
    return ts;
  };

  const handleSave = () => {
    if (!form.nama || !form.milestoneId) return;
    if (modal?.type === "tambah") {
      setTasks([...tasks, {
        id: `T${String(tasks.length+1).padStart(3,"0")}`,
        milestoneId: form.milestoneId!,
        projectId: selectedPid,
        nama: form.nama!,
        deskripsi: form.deskripsi ?? "",
        pic: form.pic ?? "",
        prioritas: (form.prioritas as any) ?? "Sedang",
        status: (form.status as any) ?? "Belum Mulai",
        targetMulai: form.targetMulai ?? "",
        targetSelesai: form.targetSelesai ?? "",
        aktualSelesai: null,
        persentase: Number(form.persentase) || 0,
        bobot: Number(form.bobot) || 10,
        estimasiJam: Number(form.estimasiJam) || 0,
        aktualJam: Number(form.aktualJam) || 0,
        workOrderId: null,
        catatan: form.catatan ?? "",
        tags: [],
      }]);
    } else if (modal?.type === "edit" && modal.task) {
      setTasks(tasks.map(t => t.id === modal.task!.id
        ? { ...t, ...form, persentase: Number(form.persentase), bobot: Number(form.bobot), estimasiJam: Number(form.estimasiJam), aktualJam: Number(form.aktualJam) } as ProjectTask
        : t));
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus task ini?")) setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: string, next: string) => {
    setTasks(tasks.map(t => t.id !== id ? t : {
      ...t, status: next as any,
      persentase: next === "Selesai" ? 100 : t.persentase,
      aktualSelesai: next === "Selesai" ? new Date().toISOString().split("T")[0] : t.aktualSelesai,
    }));
  };

  return (
    <div className="space-y-5 max-w-[1440px]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[#9CA3AF] text-sm mb-1.5">
            <a href="/projects" className="hover:text-[#2563EB] transition-colors">Proyek</a>
            <ChevronRight size={13}/>
            <span className="text-[#4B5563]">Project Tracker</span>
          </div>
          <h1 className="text-xl font-bold text-[#111827]">Project Tracker</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Breakdown task per milestone dengan progres berbobot</p>
        </div>
        <button
          onClick={() => { setForm({ prioritas:"Sedang", status:"Belum Mulai", bobot:20, persentase:0, milestoneId: projMs[0]?.id }); setModal({ type:"tambah" }); }}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus size={14}/> Tambah Task
        </button>
      </div>

      {/* ── Project selector ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {projects.filter(p => p.status === "Active" || p.status === "Draft").map(p => {
          const pp = progressProyek(p.id);
          const sel = p.id === selectedPid;
          const { ring } = progressColor(pp);
          return (
            <button key={p.id} onClick={() => setSelectedPid(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${sel ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[#6B7280] text-[11px] font-mono">{p.code}</span>
                <RingProgress value={pp} size={34} stroke={3} color={ring}/>
              </div>
              <p className={`text-[13px] font-semibold leading-snug ${sel ? "text-[#2563EB]" : "text-[#111827]"}`}>{p.name}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className={`px-1.5 py-0.5 rounded font-medium ${p.priority==="High" ? "text-[#DC2626] bg-[#FEF2F2]" : p.priority==="Medium" ? "text-[#D97706] bg-[#FFFBEB]" : "text-[#16A34A] bg-[#F0FDF4]"}`}>{p.priority}</span>
                <span className="text-[#9CA3AF]">{p.targetDate}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected project summary ── */}
      {selProj && (
        <div className="card">
          <div className="flex items-start gap-5 flex-wrap">
            {/* Big ring */}
            <div className="flex items-center gap-3">
              <RingProgress value={pPct} size={72} stroke={5} color={pColor}/>
              <div>
                <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-0.5">Progres Proyek</p>
                <p className="font-mono font-black text-2xl text-[#111827]">{pPct}%</p>
                <p className="text-[11px] text-[#6B7280]">{selProj.name}</p>
              </div>
            </div>

            <div className="w-px h-14 bg-[#E2E8F0] hidden md:block self-center"/>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l:"Total Task",    v:stats.total,    c:"#4B5563" },
                { l:"Selesai",       v:stats.selesai,  c:"#16A34A" },
                { l:"Berjalan",      v:stats.berjalan, c:"#2563EB" },
                { l:"Perlu Perhatian", v:stats.masalah, c:"#DC2626" },
              ].map(s => (
                <div key={s.l} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">{s.l}</p>
                  <p className="font-mono font-black text-2xl" style={{color:s.c}}>{s.v}</p>
                </div>
              ))}
            </div>

            <div className="w-px h-14 bg-[#E2E8F0] hidden lg:block self-center"/>

            {/* Hours + cost */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 min-w-[90px]">
                <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Jam Kerja</p>
                <p className="font-mono font-bold text-lg text-[#D97706]">{stats.aktJam}h</p>
                <p className="text-[10px] text-[#9CA3AF]">/ {stats.estJam}h est.</p>
              </div>
              {cost && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 min-w-[120px]">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Biaya Aktual</p>
                  <p className="font-mono font-bold text-sm text-[#2563EB]">{formatCurrency(cost.actualTotal)}</p>
                  <div className="mt-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2563EB]"
                      style={{width:`${Math.min(100,(cost.actualTotal/cost.budgetTotal)*100)}%`}}/>
                  </div>
                  <p className="text-[9px] text-[#9CA3AF] mt-0.5">{((cost.actualTotal/cost.budgetTotal)*100).toFixed(0)}% budget</p>
                </div>
              )}
            </div>
          </div>

          {/* Overall bar */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-[#6B7280]">Total Progres = Σ(bobot milestone × % penyelesaian)</span>
              <span className="font-mono font-semibold" style={{color:pColor}}>{pPct}%</span>
            </div>
            <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:`${pPct}%`, background:pColor}}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs + filter ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 border border-[#E2E8F0] rounded-lg p-1 bg-white">
          {([
            { id:"breakdown",  label:"Task Breakdown", icon:<List size={13}/> },
            { id:"ringkasan",  label:"Ringkasan",      icon:<BarChart3 size={13}/> },
            { id:"aktivitas",  label:"Aktivitas",      icon:<Activity size={13}/> },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "breakdown" && (
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-[#9CA3AF]"/>
            <div className="flex gap-1">
              {["Semua","Berjalan","Tertahan","Terlambat","Belum Mulai","Selesai"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors border ${
                    filterStatus === s
                      ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                      : "text-[#6B7280] border-transparent hover:bg-[#F8FAFC] hover:border-[#E2E8F0]"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tab: Breakdown ── */}
      {activeTab === "breakdown" && (
        <div className="space-y-3">
          {projMs.map(ms => (
            <MilestoneSection key={ms.id} milestone={ms}
              tasks={filteredTasks(ms.id)}
              onEditTask={t => { setForm({...t}); setModal({type:"edit",task:t}); }}
              onDeleteTask={handleDelete}
              onStatusChange={handleStatusChange}
              onAddTask={mid => { setForm({milestoneId:mid,prioritas:"Sedang",status:"Belum Mulai",bobot:20,persentase:0}); setModal({type:"tambah",milestoneId:mid}); }}
            />
          ))}
        </div>
      )}

      {/* ── Tab: Ringkasan ── */}
      {activeTab === "ringkasan" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projMs.map(ms => {
              const pp = progressMilestone(ms.id);
              const msTasks = tasks.filter(t => t.milestoneId === ms.id);
              const { ring } = progressColor(pp);
              return (
                <div key={ms.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[#111827] font-semibold text-sm leading-snug">{ms.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">Bobot proyek: <span className="font-mono text-[#4B5563]">{ms.weight}%</span></p>
                    </div>
                    <RingProgress value={pp} size={44} stroke={3} color={ring}/>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {msTasks.map(t => {
                      const sc = STATUS[t.status] ?? STATUS["Belum Mulai"];
                      return (
                        <div key={t.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:sc.dot}}/>
                          <span className={`text-[11px] flex-1 truncate ${t.status==="Selesai"?"line-through text-[#9CA3AF]":"text-[#4B5563]"}`}>{t.nama}</span>
                          <span className="text-[11px] font-mono font-semibold flex-shrink-0" style={{color:sc.dot}}>{t.persentase}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] border-t border-[#F1F5F9] pt-2.5">
                    <div><p className="text-[#16A34A] font-semibold">{msTasks.filter(t=>t.status==="Selesai").length}</p><p className="text-[#9CA3AF]">Selesai</p></div>
                    <div><p className="font-semibold text-[#D97706]">{msTasks.reduce((s,t)=>s+t.aktualJam,0)}h</p><p className="text-[#9CA3AF]">Aktual</p></div>
                    <div><p className="font-semibold text-[#4B5563]">{msTasks.reduce((s,t)=>s+t.estimasiJam,0)}h</p><p className="text-[#9CA3AF]">Estimasi</p></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contribution chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-[#111827] mb-5">Kontribusi Bobot Milestone ke Progres Proyek</h3>
            <div className="space-y-3">
              {projMs.map(ms => {
                const pp = progressMilestone(ms.id);
                const contrib = (ms.weight * pp / 100).toFixed(1);
                const { ring } = progressColor(pp);
                return (
                  <div key={ms.id} className="flex items-center gap-4">
                    <span className="text-[#4B5563] text-[12px] w-44 flex-shrink-0 truncate">{ms.name}</span>
                    <div className="flex-1 h-6 bg-[#F1F5F9] rounded-lg overflow-hidden relative border border-[#E2E8F0]">
                      <div className="h-full rounded-lg transition-all" style={{width:`${pp}%`, background:`${ring}22`, borderRight: pp>0?`2px solid ${ring}`:undefined}}/>
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9CA3AF]">Bobot {ms.weight}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] w-20 flex-shrink-0 justify-end">
                      <span className="font-mono font-semibold" style={{color:ring}}>+{contrib}%</span>
                      <span className="text-[#9CA3AF]">/{ms.weight}%</span>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-end gap-2">
                <span className="text-[#6B7280] text-sm">Total Progres Proyek:</span>
                <span className="font-mono font-black text-xl" style={{color:pColor}}>{pPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Aktivitas ── */}
      {activeTab === "aktivitas" && (
        <div className="card">
          <h3 className="text-sm font-semibold text-[#111827] mb-5">Log Aktivitas Proyek</h3>
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#E2E8F0]"/>
            <div className="space-y-0">
              {acts.map(act => {
                const dot = act.tipe === "success" ? "#16A34A" : act.tipe === "danger" ? "#DC2626" : act.tipe === "warning" ? "#D97706" : "#2563EB";
                return (
                  <div key={act.id} className="flex gap-4 py-3 hover:bg-[#F8FAFC] rounded-lg px-3 transition-colors">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="w-[9px] h-[9px] rounded-full border-2 border-white mt-[3px]" style={{background:dot}}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[#111827] text-[13px] font-semibold">{act.aksi}</span>
                          <span className="text-[#9CA3AF] text-[11px] ml-2">oleh {act.pengguna}</span>
                        </div>
                        <span className="text-[#9CA3AF] text-[11px] flex-shrink-0">{act.waktu}</span>
                      </div>
                      <p className="text-[#6B7280] text-[12px] mt-0.5">{act.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Tambah / Edit ── */}
      {(modal?.type === "tambah" || modal?.type === "edit") && (
        <Modal
          open title={modal.type === "tambah" ? "Tambah Task" : `Edit Task`}
          onClose={() => setModal(null)} size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Nama Task *</label>
              <input className="input" placeholder="Nama pekerjaan..."
                value={form.nama ?? ""} onChange={e => setForm({...form, nama:e.target.value})}/>
            </div>
            <div className="col-span-2">
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Deskripsi</label>
              <textarea className="input min-h-[64px] resize-none"
                value={form.deskripsi ?? ""} onChange={e => setForm({...form, deskripsi:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Milestone *</label>
              <select className="select" value={form.milestoneId ?? ""} onChange={e => setForm({...form, milestoneId:e.target.value})}>
                <option value="">Pilih milestone...</option>
                {projMs.map(ms => <option key={ms.id} value={ms.id}>{ms.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">PIC</label>
              <input className="input" value={form.pic ?? ""} onChange={e => setForm({...form, pic:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Prioritas</label>
              <select className="select" value={form.prioritas ?? "Sedang"} onChange={e => setForm({...form, prioritas:e.target.value as any})}>
                {["Tinggi","Sedang","Rendah"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Status</label>
              <select className="select" value={form.status ?? "Belum Mulai"} onChange={e => setForm({...form, status:e.target.value as any})}>
                {["Belum Mulai","Berjalan","Selesai","Tertahan","Terlambat"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Target Mulai</label>
              <input type="date" className="input" value={form.targetMulai ?? ""} onChange={e => setForm({...form, targetMulai:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Target Selesai</label>
              <input type="date" className="input" value={form.targetSelesai ?? ""} onChange={e => setForm({...form, targetSelesai:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">
                Persentase Selesai: <span className="font-mono font-bold text-[#2563EB]">{form.persentase ?? 0}%</span>
              </label>
              <input type="range" min={0} max={100} step={5} className="w-full accent-[#2563EB]"
                value={form.persentase ?? 0} onChange={e => setForm({...form, persentase:Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Bobot dalam Milestone (%)</label>
              <input type="number" min={1} max={100} className="input"
                value={form.bobot ?? 10} onChange={e => setForm({...form, bobot:Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Estimasi Jam</label>
              <input type="number" min={0} className="input"
                value={form.estimasiJam ?? ""} onChange={e => setForm({...form, estimasiJam:Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Jam Aktual</label>
              <input type="number" min={0} className="input"
                value={form.aktualJam ?? ""} onChange={e => setForm({...form, aktualJam:Number(e.target.value)})}/>
            </div>
          </div>

          {/* Preview */}
          {(form.bobot ?? 0) > 0 && (
            <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <p className="text-[#6B7280] text-xs mb-1.5">Kontribusi ke Milestone:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{width:`${form.persentase??0}%`}}/>
                </div>
                <span className="text-[#2563EB] font-mono text-xs font-bold">{form.persentase??0}%</span>
                <span className="text-[#9CA3AF] text-xs">× {form.bobot}% =</span>
                <span className="text-[#16A34A] font-mono text-xs font-bold">+{(((form.persentase??0)*(form.bobot??0))/100).toFixed(1)} pts</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[#F1F5F9]">
            <button className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
            <button className="btn-primary" onClick={handleSave} disabled={!form.nama || !form.milestoneId}>
              {modal.type === "tambah" ? "Simpan Task" : "Update Task"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
