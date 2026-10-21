"use client";
import { auditLogs, qcInspections, workOrders, invoices, projects } from "@/lib/dummy-data";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import {
  ShieldCheck, FileSearch, History, CheckCircle2,
  Lock, Download, Printer, Filter, ChevronRight, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ReadonlyDashboard() {
  const [filterEntity, setFilterEntity] = useState("all");

  const totalAuditLogs = auditLogs.length;
  const qcPassed = qcInspections.filter(q => q.status === "Pass").length;
  const completedWO = workOrders.filter(w => w.status === "Completed").length;

  const filteredLogs = filterEntity === "all"
    ? auditLogs
    : auditLogs.filter(l => l.entity.toLowerCase().includes(filterEntity.toLowerCase()));

  const handleExportAudit = () => {
    toast.success(
      "Laporan Audit Berhasil Diekspor",
      "Data audit trail kepatuhan per Oktober 2026 telah diunduh (PDF / Excel)."
    );
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Auditor Security Banner ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] border border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0F172A]">Mode Auditor & Kepatuhan (Read-Only)</span>
              <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Audit Trail Aktif
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Anda memiliki visibilitas penuh ke seluruh log sistem, dokumen teknis, dan transaksi tanpa hak modifikasi data.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Download size={13} /> Ekspor Audit Trail (PDF)
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Log Transaksi"
          value={totalAuditLogs}
          subtitle="Audit trail terenkripsi"
          icon={History}
          color="blue"
        />
        <KpiCard
          title="Inspeksi QC Lolos"
          value={`${qcPassed} / ${qcInspections.length}`}
          subtitle={`${((qcPassed / (qcInspections.length || 1)) * 100).toFixed(0)}% tingkat kepatuhan QC`}
          icon={CheckCircle2}
          color="green"
        />
        <KpiCard
          title="Work Order Selesai"
          value={`${completedWO} / ${workOrders.length}`}
          subtitle="Selesai sesuai standar mutu"
          icon={ShieldCheck}
          color="purple"
        />
        <KpiCard
          title="Kepatuhan SOP & Regulasi"
          value="98.5%"
          subtitle="Indeks kepatuhan ISO 9001:2015"
          icon={FileSearch}
          color="green"
        />
      </div>

      {/* ── Compliance Standards Status ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-[#16A34A] bg-[#F0FDF4]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#166534]">ISO 9001:2015 — Mutu</span>
            <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full">Valid</span>
          </div>
          <p className="text-xs text-[#374151] mt-2 font-medium">Sistem Manajemen Mutu Manufaktur</p>
          <p className="text-[11px] text-[#6B7280] mt-1">Audit berkala: 14 Des 2026 · Status: Lulus 100%</p>
        </div>

        <div className="card border-l-4 border-l-[#2563EB] bg-[#EFF6FF]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E40AF]">ASME Section VIII — Bejana Tekan</span>
            <span className="text-[10px] font-bold bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded-full">Sertifikasi U-Stamp</span>
          </div>
          <p className="text-xs text-[#374151] mt-2 font-medium">Standar Pengelasan & Uji Hidrostatik</p>
          <p className="text-[11px] text-[#6B7280] mt-1">Inspeksi eksternal diverifikasi tiap batch tangki</p>
        </div>

        <div className="card border-l-4 border-l-[#D97706] bg-[#FFFBEB]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#92400E]">SMK3 / HSE — K3 Manufaktur</span>
            <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-full">Grade A</span>
          </div>
          <p className="text-xs text-[#374151] mt-2 font-medium">Keselamatan Kerja Bengkel & Fabrikasi</p>
          <p className="text-[11px] text-[#6B7280] mt-1">Zero Fatal Incident tercatat selama 340 hari</p>
        </div>
      </div>

      {/* ── Audit Trail Table ── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Audit Trail Sistem & Log Perubahan Data</p>
            <p className="text-xs text-[#6B7280]">Rekaman forensik aktivitas pengguna di seluruh modul</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-[#64748B]" />
            <select
              value={filterEntity}
              onChange={e => setFilterEntity(e.target.value)}
              className="text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-[#334155] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">Semua Modul / Entitas</option>
              <option value="Engineering">Engineering Documents</option>
              <option value="QC">Quality Control</option>
              <option value="Purchase">Purchase Orders</option>
              <option value="Invoice">Invoice & Finance</option>
              <option value="Inventory">Gudang & Stok</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Waktu (WIB)</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Pengguna</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Aksi</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Entitas</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Kode Dokumen</th>
                <th className="text-left py-2 px-3 text-[#64748B] font-semibold whitespace-nowrap">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredLogs.map(l => {
                const actionBadge = l.action === "Pass" || l.action === "Released"
                  ? "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                  : l.action === "Fail"
                  ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                  : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]";

                return (
                  <tr key={l.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 font-mono text-[#64748B] whitespace-nowrap">{l.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A] whitespace-nowrap">{l.user}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${actionBadge}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#475569] whitespace-nowrap">{l.entity}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">{l.entityCode}</td>
                    <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">{l.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
