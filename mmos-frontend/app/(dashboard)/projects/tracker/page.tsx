"use client";

import { useState, useMemo } from "react";
import {
  projects, milestones, projectTasks, projectActivities,
  projectCosts, type ProjectTask
} from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar, RingProgress } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2,
  CheckCircle2, Clock, AlertTriangle, PauseCircle,
  User, Calendar, Filter, List, BarChart3, Activity,
  Printer, Search, CalendarRange, X, Check, FileText
} from "lucide-react";

/* ─── Status colour tokens (light-theme only, no neon) ─── */
const STATUS: Record<string, { text: string; bg: string; border: string; dot: string; barBg: string }> = {
  "Selesai":     { text: "text-[#16A34A]", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]", dot: "#16A34A", barBg: "#22C55E" },
  "Berjalan":    { text: "text-[#2563EB]", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]", dot: "#2563EB", barBg: "#3B82F6" },
  "Tertahan":    { text: "text-[#D97706]", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]", dot: "#D97706", barBg: "#F59E0B" },
  "Terlambat":   { text: "text-[#DC2626]", bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", dot: "#DC2626", barBg: "#EF4444" },
  "Belum Mulai": { text: "text-[#6B7280]", bg: "bg-[#F9FAFB]", border: "border-[#E5E7EB]", dot: "#9CA3AF", barBg: "#94A3B8" },
};

const PRIORITAS: Record<string, { dot: string; text: string; bg: string }> = {
  "Tinggi": { dot: "#DC2626", text: "text-[#DC2626]", bg: "bg-[#FEF2F2]" },
  "Sedang": { dot: "#D97706", text: "text-[#D97706]", bg: "bg-[#FFFBEB]" },
  "Rendah": { dot: "#16A34A", text: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
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

function progressMilestone(mid: string, taskList: ProjectTask[]) {
  const ts = taskList.filter(t => t.milestoneId === mid);
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

/* ─── TaskRow Component ─── */
function TaskRow({ task, onEdit, onDelete, onStatusChange }: {
  task: ProjectTask;
  onEdit: (t: ProjectTask) => void;
  onDelete: (id: string, name: string) => void;
  onStatusChange: (id: string, next: string) => void;
}) {
  const sc = STATUS[task.status] ?? STATUS["Belum Mulai"];
  const pc = PRIORITAS[task.prioritas] ?? PRIORITAS["Sedang"];

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-0">
      {/* Toggle done */}
      <button
        onClick={() => onStatusChange(task.id, task.status === "Selesai" ? "Berjalan" : "Selesai")}
        title={task.status === "Selesai" ? "Tandai belum selesai" : "Tandai selesai"}
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

      {/* Status select dropdown */}
      <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium flex-shrink-0 ${sc.bg} ${sc.border} ${sc.text}`}>
        {STATUS_ICON[task.status]}
        <span>{task.status}</span>
      </div>

      {/* Priority badge */}
      <span className={`hidden lg:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${pc.bg} ${pc.text}`}>
        {task.prioritas}
      </span>

      {/* PIC */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#6B7280] w-28 flex-shrink-0 truncate">
        <User size={10} className="flex-shrink-0" />{task.pic}
      </div>

      {/* Timeline dates */}
      <div className="hidden md:flex items-center gap-1 text-[11px] text-[#6B7280] flex-shrink-0 w-28">
        <Calendar size={10} />{task.targetSelesai || "-"}
      </div>

      {/* Hours */}
      <div className="hidden xl:block text-[11px] font-mono text-[#9CA3AF] w-16 text-right flex-shrink-0">
        {task.aktualJam > 0 ? `${task.aktualJam}/${task.estimasiJam}h` : `${task.estimasiJam}h`}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#9CA3AF] hover:text-[#2563EB] transition-colors" title="Edit Task">
          <Pencil size={12} />
        </button>
        <button onClick={() => onDelete(task.id, task.nama)} className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#9CA3AF] hover:text-[#DC2626] transition-colors" title="Hapus Task">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── MilestoneSection Component ─── */
function MilestoneSection({ milestone, tasks, allTasks, onEditTask, onDeleteTask, onStatusChange, onAddTask }: {
  milestone: typeof milestones[0];
  tasks: ProjectTask[];
  allTasks: ProjectTask[];
  onEditTask: (t: ProjectTask) => void;
  onDeleteTask: (id: string, name: string) => void;
  onStatusChange: (id: string, s: string) => void;
  onAddTask: (mid: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const pct = progressMilestone(milestone.id, allTasks);
  const done = tasks.filter(t => t.status === "Selesai").length;
  const late = tasks.filter(t => t.status === "Terlambat").length;
  const { ring } = progressColor(pct);

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-xs">
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
            {late > 0 && <span className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium"><AlertTriangle size={11}/>{late} terlambat</span>}
          </div>
          <div className="flex items-center gap-4 mt-0.5 text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1"><Calendar size={9}/>Target: {milestone.targetDate}</span>
            {milestone.actualDate && <span className="text-[#16A34A]">Aktual: {milestone.actualDate}</span>}
            <span className="flex items-center gap-1"><User size={9}/>{milestone.pic}</span>
            <span className="text-[#6B7280] font-medium">{done}/{tasks.length} task selesai</span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {[
            { v: done,                                                         c: "#16A34A", l: "Selesai" },
            { v: tasks.filter(t=>t.status==="Berjalan").length,               c: "#2563EB", l: "Berjalan" },
            { v: tasks.filter(t=>t.status==="Tertahan"||t.status==="Terlambat").length, c: "#D97706", l: "Perhatian" },
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
            <span className="hidden lg:block w-14 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide flex-shrink-0">Prioritas</span>
            <span className="hidden lg:block w-28 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide flex-shrink-0">PIC</span>
            <span className="hidden md:block w-28 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide flex-shrink-0">Deadline</span>
            <span className="hidden xl:block w-16 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide text-right flex-shrink-0">Jam</span>
            <span className="w-12 flex-shrink-0"/>
          </div>

          {tasks.length === 0 ? (
            <div className="px-4 py-6 text-center text-[#9CA3AF] text-sm">Belum ada task dalam milestone ini</div>
          ) : (
            tasks.map(t => (
              <TaskRow key={t.id} task={t}
                onEdit={onEditTask} onDelete={onDeleteTask} onStatusChange={onStatusChange}/>
            ))
          )}

          {/* Add task button */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#F1F5F9]">
            <button
              onClick={() => onAddTask(milestone.id)}
              className="flex items-center gap-2 text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors py-1 px-2 rounded hover:bg-white"
            >
              <Plus size={12} className="text-[#2563EB]" />Tambah task ke milestone ini
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Interactive Gantt Timeline Component ─── */
function GanttTimelineView({
  tasks,
  milestonesList,
  onEditTask
}: {
  tasks: ProjectTask[];
  milestonesList: typeof milestones;
  onEditTask: (t: ProjectTask) => void;
}) {
  // Timeline calendar bounds: Sep 1, 2026 to Nov 30, 2026 (91 days)
  const baseStart = useMemo(() => new Date(2026, 8, 1), []); // Sep 1, 2026
  const baseEnd = useMemo(() => new Date(2026, 10, 30), []); // Nov 30, 2026
  const totalDays = useMemo(() => {
    return Math.round((baseEnd.getTime() - baseStart.getTime()) / (1000 * 60 * 60 * 24));
  }, [baseStart, baseEnd]);

  // Today marker (Oct 20, 2026)
  const today = useMemo(() => new Date(2026, 9, 20), []);
  const todayPct = useMemo(() => {
    const diff = (today.getTime() - baseStart.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (diff / totalDays) * 100));
  }, [today, baseStart, totalDays]);

  // Weeks for headers
  const weeks = useMemo(() => {
    const list: { label: string; left: number; width: number }[] = [];
    const cur = new Date(baseStart);
    let weekIndex = 1;
    while (cur < baseEnd) {
      const startDay = Math.round((cur.getTime() - baseStart.getTime()) / (1000 * 60 * 60 * 24));
      const monthShort = cur.toLocaleDateString("id-ID", { month: "short" });
      list.push({
        label: `M${weekIndex} (${monthShort})`,
        left: (startDay / totalDays) * 100,
        width: (7 / totalDays) * 100,
      });
      cur.setDate(cur.getDate() + 7);
      weekIndex++;
    }
    return list;
  }, [baseStart, baseEnd, totalDays]);

  // Parse task position
  const getTaskCoords = (t: ProjectTask) => {
    const sDate = t.targetMulai ? new Date(t.targetMulai) : baseStart;
    const eDate = t.targetSelesai ? new Date(t.targetSelesai) : new Date(sDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const startDiff = (sDate.getTime() - baseStart.getTime()) / (1000 * 60 * 60 * 24);
    const endDiff = (eDate.getTime() - baseStart.getTime()) / (1000 * 60 * 60 * 24);
    
    const left = Math.max(0, Math.min(95, (startDiff / totalDays) * 100));
    const width = Math.max(3, Math.min(100 - left, ((endDiff - startDiff) / totalDays) * 100));
    return { left, width, sDate, eDate };
  };

  return (
    <div className="card overflow-hidden p-0 border border-[#E2E8F0] shadow-xs">
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3 bg-[#F8FAFC]">
        <div>
          <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
            <CalendarRange size={16} className="text-[#2563EB]"/>
            Gantt Timeline Proyek & Schedule Jadwal
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Visualisasi rentang waktu task dan milestone (September - November 2026) dengan progres bar real-time
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#22C55E]"/>
            <span className="text-[#4B5563]">Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#3B82F6]"/>
            <span className="text-[#4B5563]">Berjalan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#F59E0B]"/>
            <span className="text-[#4B5563]">Tertahan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#EF4444]"/>
            <span className="text-[#4B5563]">Terlambat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#DC2626] border-t border-dashed border-[#DC2626] inline-block"/>
            <span className="text-[#DC2626] font-semibold">Hari Ini (20 Okt)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[960px]">
          {/* Header row with weeks */}
          <div className="flex border-b border-[#E2E8F0] bg-[#F1F5F9] text-[11px] font-semibold text-[#6B7280]">
            <div className="w-72 p-3 border-r border-[#E2E8F0] flex-shrink-0">Task / Milestone</div>
            <div className="flex-1 relative h-10">
              {weeks.map((w, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-r border-[#CBD5E1] px-2 flex items-center text-[10px] text-[#4B5563]"
                  style={{ left: `${w.left}%`, width: `${w.width}%` }}
                >
                  {w.label}
                </div>
              ))}
              {/* Today line in header */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#DC2626] z-10"
                style={{ left: `${todayPct}%` }}
                title="Hari ini: 20 Oktober 2026"
              >
                <span className="absolute -top-1 -left-5 bg-[#DC2626] text-white text-[9px] px-1 rounded font-bold">Today</span>
              </div>
            </div>
          </div>

          {/* Grouped by milestone */}
          {milestonesList.map(ms => {
            const msTasks = tasks.filter(t => t.milestoneId === ms.id);
            const msPct = progressMilestone(ms.id, tasks);

            return (
              <div key={ms.id} className="border-b border-[#E2E8F0] last:border-0">
                {/* Milestone row */}
                <div className="flex items-center bg-[#F8FAFC] border-b border-[#F1F5F9] hover:bg-[#F1F5F9] transition-colors">
                  <div className="w-72 p-3 border-r border-[#E2E8F0] flex-shrink-0 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] truncate">{ms.name}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#2563EB]">
                      {msPct}% (Bbt: {ms.weight}%)
                    </span>
                  </div>
                  <div className="flex-1 relative h-9">
                    {/* Background grid lines */}
                    {weeks.map((w, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 border-r border-[#F1F5F9]"
                        style={{ left: `${w.left}%`, width: `${w.width}%` }}
                      />
                    ))}
                    {/* Today indicator */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-[#DC2626]/40 z-10" style={{ left: `${todayPct}%` }} />
                  </div>
                </div>

                {/* Task rows */}
                {msTasks.map(t => {
                  const { left, width } = getTaskCoords(t);
                  const sc = STATUS[t.status] ?? STATUS["Belum Mulai"];

                  return (
                    <div key={t.id} className="flex items-center hover:bg-[#F8FAFC] transition-colors border-b border-[#F8FAFC] last:border-0 group">
                      <div className="w-72 px-4 py-2.5 border-r border-[#E2E8F0] flex-shrink-0 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-medium text-[#111827] truncate group-hover:text-[#2563EB] cursor-pointer" onClick={() => onEditTask(t)}>
                            {t.nama}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1.5 mt-0.5">
                            <span>{t.pic}</span> • <span>{t.targetMulai || "01 Sep"} s/d {t.targetSelesai || "30 Nov"}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onEditTask(t)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#9CA3AF] hover:text-[#2563EB] transition-opacity"
                        >
                          <Pencil size={11} />
                        </button>
                      </div>

                      {/* Timeline bar area */}
                      <div className="flex-1 relative h-11 flex items-center">
                        {/* Background grid lines */}
                        {weeks.map((w, idx) => (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 border-r border-[#F1F5F9]"
                            style={{ left: `${w.left}%`, width: `${w.width}%` }}
                          />
                        ))}

                        {/* Today line */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-[#DC2626]/40 z-10" style={{ left: `${todayPct}%` }} />

                        {/* Task Gantt Bar */}
                        <div
                          onClick={() => onEditTask(t)}
                          className="absolute h-6 rounded-md shadow-xs cursor-pointer overflow-hidden border transition-all hover:scale-[1.02] flex items-center px-2"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: `${sc.barBg}22`,
                            borderColor: sc.barBg,
                          }}
                          title={`${t.nama} (${t.status}): ${t.persentase}% selesai. PIC: ${t.pic}`}
                        >
                          {/* Inner progress fill */}
                          <div
                            className="absolute top-0 bottom-0 left-0 transition-all rounded-l-md"
                            style={{
                              width: `${t.persentase}%`,
                              backgroundColor: sc.barBg,
                              opacity: 0.85,
                            }}
                          />
                          <span className="relative z-10 text-[10px] font-bold text-[#0F172A] drop-shadow-xs truncate">
                            {t.persentase}% • {t.nama}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function ProjectTrackerPage() {
  const [selectedPid, setSelectedPid] = useState("PRJ001");
  const [tasks, setTasks] = useState<ProjectTask[]>(projectTasks);
  const [activeTab, setActiveTab] = useState<"breakdown"|"gantt"|"ringkasan"|"aktivitas">("breakdown");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<{type:"tambah"|"edit";task?:ProjectTask;milestoneId?:string}|null>(null);
  const [form, setForm] = useState<Partial<ProjectTask>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string; taskName: string }>({
    open: false,
    taskId: "",
    taskName: "",
  });
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      ts = ts.filter(t => t.nama.toLowerCase().includes(q) || t.pic.toLowerCase().includes(q) || t.deskripsi.toLowerCase().includes(q));
    }
    return ts;
  };

  const handleSave = () => {
    if (!form.nama || !form.milestoneId) return;
    if (modal?.type === "tambah") {
      const newTask: ProjectTask = {
        id: `T${String(tasks.length+1).padStart(3,"0")}`,
        milestoneId: form.milestoneId!,
        projectId: selectedPid,
        nama: form.nama!,
        deskripsi: form.deskripsi ?? "",
        pic: form.pic ?? "",
        prioritas: (form.prioritas as any) ?? "Sedang",
        status: (form.status as any) ?? "Belum Mulai",
        targetMulai: form.targetMulai ?? "2026-09-01",
        targetSelesai: form.targetSelesai ?? "2026-10-30",
        aktualSelesai: null,
        persentase: Number(form.persentase) || 0,
        bobot: Number(form.bobot) || 10,
        estimasiJam: Number(form.estimasiJam) || 0,
        aktualJam: Number(form.aktualJam) || 0,
        workOrderId: null,
        catatan: form.catatan ?? "",
        tags: [],
      };
      setTasks([...tasks, newTask]);
      toast.success("Task Berhasil Ditambahkan", `Task "${form.nama}" telah dimasukkan ke dalam tracking.`);
    } else if (modal?.type === "edit" && modal.task) {
      setTasks(tasks.map(t => t.id === modal.task!.id
        ? { ...t, ...form, persentase: Number(form.persentase), bobot: Number(form.bobot), estimasiJam: Number(form.estimasiJam), aktualJam: Number(form.aktualJam) } as ProjectTask
        : t));
      toast.success("Task Diperbarui", `Perubahan data task "${form.nama}" telah disimpan.`);
    }
    setModal(null);
  };

  const executeDelete = () => {
    const { taskId, taskName } = deleteConfirm;
    setTasks(tasks.filter(t => t.id !== taskId));
    setDeleteConfirm({ open: false, taskId: "", taskName: "" });
    toast.info("Task Dihapus", `Task "${taskName}" telah dihapus.`);
  };

  const handleStatusChange = (id: string, next: string) => {
    setTasks(tasks.map(t => t.id !== id ? t : {
      ...t, status: next as any,
      persentase: next === "Selesai" ? 100 : t.persentase,
      aktualSelesai: next === "Selesai" ? new Date().toISOString().split("T")[0] : t.aktualSelesai,
    }));
    toast.info("Status Diperbarui", `Status task dialihkan ke "${next}".`);
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
          <h1 className="text-xl font-bold text-[#111827]">Project Tracker & Gantt Schedule</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Pemantauan milestone berbobot, jadwal pelaksanaan Gantt, dan alokasi jam kerja teknisi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-[#F8FAFC] text-[#4B5563] border border-[#CBD5E1] font-semibold px-3.5 py-2 rounded-lg text-sm transition-colors shadow-xs"
          >
            <Printer size={14}/> Cetak Laporan
          </button>
          <button
            onClick={() => { setForm({ prioritas:"Sedang", status:"Belum Mulai", bobot:20, persentase:0, milestoneId: projMs[0]?.id }); setModal({ type:"tambah" }); }}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus size={14}/> Tambah Task
          </button>
        </div>
      </div>

      {/* ── Project selector ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {projects.filter(p => p.status === "Active" || p.status === "Draft").map(p => {
          const pp = progressProyek(p.id);
          const sel = p.id === selectedPid;
          const { ring } = progressColor(pp);
          return (
            <button key={p.id} onClick={() => setSelectedPid(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${sel ? "border-[#2563EB] bg-[#EFF6FF] shadow-xs ring-1 ring-[#2563EB]/20" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"}`}>
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
                { l:"Total Task",      v:stats.total,    c:"#4B5563" },
                { l:"Selesai",         v:stats.selesai,  c:"#16A34A" },
                { l:"Berjalan",        v:stats.berjalan, c:"#2563EB" },
                { l:"Perlu Tindakan",  v:stats.masalah,  c:"#DC2626" },
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
              <span className="text-[#6B7280]">Total Progres Tertimbang = Σ(bobot milestone × % penyelesaian task)</span>
              <span className="font-mono font-semibold" style={{color:pColor}}>{pPct}%</span>
            </div>
            <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:`${pPct}%`, background:pColor}}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs + Search & Filter ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 border border-[#E2E8F0] rounded-lg p-1 bg-white shadow-xs">
          {([
            { id:"breakdown",  label:"Task Breakdown", icon:<List size={13}/> },
            { id:"gantt",      label:"Gantt Timeline", icon:<CalendarRange size={13}/> },
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

        {/* Search and status filter (visible on breakdown & gantt) */}
        {(activeTab === "breakdown" || activeTab === "gantt") && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Cari task atau PIC..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input py-1.5 pl-8 pr-2 text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] p-1 rounded-lg">
              <Filter size={11} className="text-[#9CA3AF] ml-1.5 mr-1"/>
              {["Semua","Berjalan","Tertahan","Terlambat","Selesai"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterStatus === s
                      ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                      : "text-[#6B7280] hover:text-[#111827]"
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
              allTasks={tasks}
              onEditTask={t => { setForm({...t}); setModal({type:"edit",task:t}); }}
              onDeleteTask={(id, name) => setDeleteConfirm({ open: true, taskId: id, taskName: name })}
              onStatusChange={handleStatusChange}
              onAddTask={mid => { setForm({milestoneId:mid,prioritas:"Sedang",status:"Belum Mulai",bobot:20,persentase:0}); setModal({type:"tambah",milestoneId:mid}); }}
            />
          ))}
        </div>
      )}

      {/* ── Tab: Gantt Timeline ── */}
      {activeTab === "gantt" && (
        <GanttTimelineView
          tasks={tasks.filter(t => t.projectId === selectedPid)}
          milestonesList={projMs}
          onEditTask={t => { setForm({...t}); setModal({type:"edit",task:t}); }}
        />
      )}

      {/* ── Tab: Ringkasan ── */}
      {activeTab === "ringkasan" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projMs.map(ms => {
              const pp = progressMilestone(ms.id, tasks);
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
                const pp = progressMilestone(ms.id, tasks);
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

      {/* ── Modal: Tambah / Edit Task ── */}
      {(modal?.type === "tambah" || modal?.type === "edit") && (
        <Modal
          open title={modal.type === "tambah" ? "Tambah Task Baru" : `Edit Task`}
          onClose={() => setModal(null)} size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Nama Task *</label>
              <input className="input" placeholder="Nama pekerjaan teknis..."
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
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">PIC (Penanggung Jawab)</label>
              <input className="input" placeholder="Nama teknisi / lead" value={form.pic ?? ""} onChange={e => setForm({...form, pic:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Prioritas</label>
              <select className="select" value={form.prioritas ?? "Sedang"} onChange={e => setForm({...form, prioritas:e.target.value as any})}>
                {["Tinggi","Sedang","Rendah"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Status Pelaksanaan</label>
              <select className="select" value={form.status ?? "Belum Mulai"} onChange={e => setForm({...form, status:e.target.value as any})}>
                {["Belum Mulai","Berjalan","Selesai","Tertahan","Terlambat"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Target Mulai</label>
              <input type="date" className="input" value={form.targetMulai ?? ""} onChange={e => setForm({...form, targetMulai:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Target Selesai (Deadline)</label>
              <input type="date" className="input" value={form.targetSelesai ?? ""} onChange={e => setForm({...form, targetSelesai:e.target.value})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">
                Persentase Penyelesaian: <span className="font-mono font-bold text-[#2563EB]">{form.persentase ?? 0}%</span>
              </label>
              <input type="range" min={0} max={100} step={5} className="w-full accent-[#2563EB]"
                value={form.persentase ?? 0} onChange={e => setForm({...form, persentase:Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Bobot Task (%)</label>
              <input type="number" min={1} max={100} className="input"
                value={form.bobot ?? 10} onChange={e => setForm({...form, bobot:Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Estimasi Jam Kerja</label>
              <input type="number" min={0} className="input" placeholder="0"
                value={form.estimasiJam ?? ""} onChange={e => setForm({...form, estimasiJam:Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[#4B5563] text-xs font-medium mb-1.5 block">Jam Kerja Aktual</label>
              <input type="number" min={0} className="input" placeholder="0"
                value={form.aktualJam ?? ""} onChange={e => setForm({...form, aktualJam:Number(e.target.value)})}/>
            </div>
          </div>

          {/* Preview contribution */}
          {(form.bobot ?? 0) > 0 && (
            <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <p className="text-[#6B7280] text-xs mb-1.5 font-medium">Kalkulasi Kontribusi Bobot ke Milestone:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{width:`${form.persentase??0}%`}}/>
                </div>
                <span className="text-[#2563EB] font-mono text-xs font-bold">{form.persentase??0}%</span>
                <span className="text-[#9CA3AF] text-xs">× bobot {form.bobot}% =</span>
                <span className="text-[#16A34A] font-mono text-xs font-bold">+{(((form.persentase??0)*(form.bobot??0))/100).toFixed(1)} poin</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[#F1F5F9]">
            <button className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
            <button className="btn-primary" onClick={handleSave} disabled={!form.nama || !form.milestoneId}>
              {modal.type === "tambah" ? "Simpan Task Baru" : "Update Task"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Print Official Project Progress Sheet ── */}
      {showPrintModal && selProj && (
        <Modal
          open
          title="Pratinjau Cetak Laporan Progres Proyek"
          onClose={() => setShowPrintModal(false)}
          size="xl"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              <span className="text-xs text-[#6B7280]">Format dokumen resmi siap cetak (A4 Portrait)</span>
              <button
                onClick={() => window.print()}
                className="btn-primary flex items-center gap-2 text-xs py-1.5 px-3"
              >
                <Printer size={13} /> Cetak / Unduh PDF
              </button>
            </div>

            {/* Printable A4 Content */}
            <div id="project-print-sheet" className="bg-white border border-[#CBD5E1] p-8 rounded-lg text-[#0F172A] space-y-6 shadow-sm print:border-0 print:p-0">
              {/* KOP Surat Perusahaan */}
              <div className="flex items-center justify-between border-b-2 border-[#1E3A8A] pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#1E3A8A]">PT. MANGGALA UTAMA INDONESIA</h2>
                  <p className="text-xs text-[#475569] mt-0.5">Industrial Engineering & Automation Manufacturing System</p>
                  <p className="text-[11px] text-[#64748B]">Kawasan Industri Manunggal No. 88, Cikarang Barat • Telp: (021) 8990-2026</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-bold rounded">
                    LAPORAN STATUS PROYEK
                  </span>
                  <p className="text-[11px] text-[#64748B] mt-1">Tanggal Cetak: 20 Oktober 2026</p>
                </div>
              </div>

              {/* Project Meta Info */}
              <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0] text-xs">
                <div>
                  <p className="text-[#64748B]">Kode / Nama Proyek:</p>
                  <p className="font-bold text-sm text-[#0F172A]">{selProj.code} — {selProj.name}</p>
                  <p className="text-[#64748B] mt-2">Klien / Customer:</p>
                  <p className="font-semibold text-[#0F172A]">{selProj.customer}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Nilai Kontrak Proyek:</p>
                  <p className="font-bold text-[#1E3A8A]">{formatCurrency(selProj.contractValue)}</p>
                  <p className="text-[#64748B] mt-2">Total Progres Fisik Saat Ini:</p>
                  <p className="font-bold text-base text-[#16A34A]">{pPct}% Selesai</p>
                </div>
              </div>

              {/* Milestones Summary Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155] mb-2">1. Ringkasan Milestone Proyek</h4>
                <table className="w-full text-xs border border-[#CBD5E1]">
                  <thead className="bg-[#F1F5F9] text-[#334155]">
                    <tr>
                      <th className="p-2 border border-[#CBD5E1] text-left">Nama Tahapan Milestone</th>
                      <th className="p-2 border border-[#CBD5E1] text-center w-20">Bobot</th>
                      <th className="p-2 border border-[#CBD5E1] text-center w-24">Target Selesai</th>
                      <th className="p-2 border border-[#CBD5E1] text-center w-28">Status</th>
                      <th className="p-2 border border-[#CBD5E1] text-right w-24">Penyelesaian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projMs.map(ms => {
                      const mPct = progressMilestone(ms.id, tasks);
                      return (
                        <tr key={ms.id}>
                          <td className="p-2 border border-[#CBD5E1] font-medium">{ms.name}</td>
                          <td className="p-2 border border-[#CBD5E1] text-center">{ms.weight}%</td>
                          <td className="p-2 border border-[#CBD5E1] text-center">{ms.targetDate}</td>
                          <td className="p-2 border border-[#CBD5E1] text-center font-semibold">{ms.status}</td>
                          <td className="p-2 border border-[#CBD5E1] text-right font-bold text-[#2563EB]">{mPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tasks Detail Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155] mb-2">2. Rincian Task & Pekerjaan Lapangan</h4>
                <table className="w-full text-xs border border-[#CBD5E1]">
                  <thead className="bg-[#F1F5F9] text-[#334155]">
                    <tr>
                      <th className="p-2 border border-[#CBD5E1] text-left">Item Pekerjaan (Task)</th>
                      <th className="p-2 border border-[#CBD5E1] text-left w-28">PIC</th>
                      <th className="p-2 border border-[#CBD5E1] text-center w-24">Deadline</th>
                      <th className="p-2 border border-[#CBD5E1] text-center w-20">Jam Kerja</th>
                      <th className="p-2 border border-[#CBD5E1] text-center w-24">Status</th>
                      <th className="p-2 border border-[#CBD5E1] text-right w-20">Progres</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projTasks.map(t => (
                      <tr key={t.id}>
                        <td className="p-2 border border-[#CBD5E1]">
                          <span className="font-medium text-[#0F172A]">{t.nama}</span>
                          {t.deskripsi && <p className="text-[10px] text-[#64748B]">{t.deskripsi}</p>}
                        </td>
                        <td className="p-2 border border-[#CBD5E1]">{t.pic}</td>
                        <td className="p-2 border border-[#CBD5E1] text-center">{t.targetSelesai}</td>
                        <td className="p-2 border border-[#CBD5E1] text-center font-mono">{t.aktualJam}/{t.estimasiJam}h</td>
                        <td className="p-2 border border-[#CBD5E1] text-center font-medium">{t.status}</td>
                        <td className="p-2 border border-[#CBD5E1] text-right font-bold">{t.persentase}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Approvals Signatures Block */}
              <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
                <div>
                  <p className="text-[#64748B] mb-12">Disiapkan Oleh (Lead Engineer):</p>
                  <p className="font-bold border-t border-[#94A3B8] pt-1">Budi Setiawan, S.T.</p>
                  <p className="text-[10px] text-[#64748B]">Project Coordinator</p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-12">Ditinjau Oleh (Technical Manager):</p>
                  <p className="font-bold border-t border-[#94A3B8] pt-1">Ir. Hendra Kusuma</p>
                  <p className="text-[10px] text-[#64748B]">Manager Operasional & Proyek</p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-12">Disetujui Oleh (Direktur):</p>
                  <p className="font-bold border-t border-[#94A3B8] pt-1">Dr. Ir. M. Anfal, M.T.</p>
                  <p className="text-[10px] text-[#64748B]">Direktur Operasional & Pabrik</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        open={deleteConfirm.open}
        variant="danger"
        title="Hapus Task Pekerjaan?"
        message={`Apakah Anda yakin ingin menghapus task "${deleteConfirm.taskName}"? Data progres dan jam kerja task ini akan dihapus dari kalkulasi milestone.`}
        confirmText="Ya, Hapus Task"
        cancelText="Batal"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ open: false, taskId: "", taskName: "" })}
      />
    </div>
  );
}
