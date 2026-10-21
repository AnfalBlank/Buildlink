"use client";
import { useState } from "react";
import { projects as initialData } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Pencil, Trash2, Search, Eye, FolderKanban,
  Calendar, DollarSign, User, Building, FileText, Check, AlertCircle
} from "lucide-react";

type Project = typeof initialData[0];
const STATUSES = ["Draft","Quotation","Awaiting Order","Active","On Hold","Ready for Delivery","Delivered","Completed","Closed"];
const PRIORITIES = ["High","Medium","Low"];

export default function ProjectsPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{ type: "add" | "edit" | "view"; item?: Project } | null>(null);
  const [form, setForm] = useState<Partial<Project>>({});

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "primary" | "danger" | "warning";
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const filtered = data.filter(p =>
    (statusFilter === "All" || p.status === statusFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.code.toLowerCase().includes(search.toLowerCase()) ||
     p.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const executeSave = () => {
    if (modal?.type === "add") {
      const newProject: Project = {
        id: `PRJ${String(data.length + 1).padStart(3, "0")}`,
        code: `PRJ-2026-${String(data.length + 1).padStart(3, "0")}`,
        name: form.name ?? "",
        customer: form.customer ?? "",
        pm: form.pm ?? "",
        salesOrderId: form.salesOrderId ?? null,
        startDate: form.startDate ?? new Date().toISOString().split("T")[0],
        targetDate: form.targetDate ?? "",
        status: form.status ?? "Draft",
        priority: form.priority ?? "Medium",
        contractValue: Number(form.contractValue) || 0,
        budget: Number(form.budget) || 0,
        actualCost: 0,
        progress: 0,
        description: form.description ?? "",
      };
      setData([newProject, ...data]);
      toast.success("Proyek Berhasil Dibuat", `Proyek "${newProject.name}" (${newProject.code}) telah ditambahkan.`);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(p => p.id === modal.item!.id ? ({ ...p, ...form } as Project) : p));
      toast.info("Perubahan Disimpan", `Data proyek "${form.name || modal.item.name}" berhasil diperbarui.`);
    }
    setConfirmState(null);
    setModal(null);
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Nama Proyek Wajib Diisi", "Silakan masukkan nama proyek yang valid.");
      return;
    }
    if (!form.customer?.trim()) {
      toast.error("Pelanggan Wajib Diisi", "Silakan tentukan nama pelanggan / perusahaan.");
      return;
    }

    setConfirmState({
      open: true,
      title: modal?.type === "add" ? "Konfirmasi Tambah Proyek" : "Konfirmasi Simpan Perubahan",
      message: modal?.type === "add"
        ? `Apakah Anda yakin ingin menambahkan proyek "${form.name}" ke dalam sistem?`
        : `Apakah Anda yakin ingin menyimpan perubahan pada proyek "${form.name}"?`,
      variant: "primary",
      confirmText: "Ya, Simpan",
      onConfirm: executeSave,
    });
  };

  const handleRequestDelete = (p: Project) => {
    setConfirmState({
      open: true,
      title: "Konfirmasi Hapus Proyek",
      message: `Apakah Anda yakin ingin menghapus proyek "${p.name}" (${p.code})? Tindakan ini akan menghapus data dari daftar.`,
      variant: "danger",
      confirmText: "Ya, Hapus Data",
      onConfirm: () => {
        setData(prev => prev.filter(x => x.id !== p.id));
        setConfirmState(null);
        toast.warning("Proyek Dihapus", `Proyek "${p.name}" telah dihapus.`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Proyek"
        subtitle="Manajemen proyek aktif, milestone, dan alokasi sumber daya manufaktur"
        actions={
          <button
            className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
            onClick={() => {
              setForm({
                status: "Draft",
                priority: "Medium",
                startDate: new Date().toISOString().split("T")[0],
                contractValue: 0,
                budget: 0,
              });
              setModal({ type: "add" });
            }}
          >
            <Plus size={16} />
            <span>Proyek Baru</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Proyek Aktif", val: data.filter(p => p.status === "Active").length, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]" },
          { label: "Ditunda / On Hold", val: data.filter(p => p.status === "On Hold").length, color: "text-[#D97706]", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]" },
          { label: "Selesai", val: data.filter(p => p.status === "Completed").length, color: "text-[#2563EB]", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]" },
          { label: "Total Nilai Kontrak", val: formatCurrency(data.reduce((s, p) => s + p.contractValue, 0)), color: "text-[#2563EB]", bg: "bg-[#F8FAFC]", border: "border-[#E2E8F0]" },
        ].map(s => (
          <div key={s.label} className="card flex flex-col justify-between p-4 sm:p-5 hover:border-[#CBD5E1] transition-all">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{s.label}</p>
            <p className={`font-mono font-bold text-2xl sm:text-3xl mt-2 tracking-tight ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card !p-0 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="input pl-10 text-xs sm:text-sm"
                placeholder="Cari kode, nama proyek, atau pelanggan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select w-44 text-xs sm:text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-xs text-[#64748B] font-medium ml-auto">
            Menampilkan <strong className="text-[#0F172A]">{filtered.length}</strong> dari {data.length} proyek
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="table min-w-[980px]">
            <thead>
              <tr>
                <th className="w-28">Kode</th>
                <th>Nama Proyek</th>
                <th>Pelanggan</th>
                <th>PM</th>
                <th>Periode</th>
                <th className="w-36">Progres</th>
                <th>Nilai Kontrak</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#94A3B8]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderKanban size={32} className="text-[#CBD5E1]" />
                      <p className="font-semibold text-sm text-[#475569]">Tidak ada proyek yang sesuai</p>
                      <p className="text-xs text-[#94A3B8]">Coba ubah kata kunci pencarian atau filter status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="table-row-hover group">
                    <td className="py-3.5 px-4 font-mono text-[#2563EB] font-bold text-xs">{p.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A] max-w-[220px]">
                      <div className="truncate" title={p.name}>{p.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] text-xs max-w-[150px] truncate" title={p.customer}>{p.customer}</td>
                    <td className="py-3.5 px-4 text-[#475569] text-xs">{p.pm}</td>
                    <td className="py-3.5 px-4 text-[#64748B] text-xs font-mono">
                      {p.startDate} <span className="text-[#CBD5E1]">→</span> {p.targetDate}
                    </td>
                    <td className="py-3.5 px-4 w-32">
                      <ProgressBar value={p.progress} size="sm" showLabel />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#0F172A] font-semibold text-xs whitespace-nowrap">
                      {formatCurrency(p.contractValue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`badge-status border ${
                        p.priority === "High" ? "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]" :
                        p.priority === "Medium" ? "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]" :
                        "text-[#475569] bg-[#F1F5F9] border-[#E2E8F0]"
                      }`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="Lihat Detail"
                          onClick={() => setModal({ type: "view", item: p })}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="Edit Proyek"
                          onClick={() => {
                            setForm({ ...p });
                            setModal({ type: "edit", item: p });
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FECACA] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="Hapus Proyek"
                          onClick={() => handleRequestDelete(p)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Detail Proyek — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">{modal.item.code}</span>
                <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">{modal.item.name}</h3>
                <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
                  <Building size={13} className="text-[#94A3B8]" />
                  <span>{modal.item.customer}</span>
                  <span className="text-[#CBD5E1]">·</span>
                  <User size={13} className="text-[#94A3B8]" />
                  <span>PM: {modal.item.pm}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatusBadge status={modal.item.status} />
                <span className="text-xs font-medium text-[#64748B]">Prioritas: <strong className="text-[#0F172A]">{modal.item.priority}</strong></span>
              </div>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ["Mulai", modal.item.startDate, Calendar],
                ["Target Selesai", modal.item.targetDate, Calendar],
                ["Progress", `${modal.item.progress}%`, FileText],
                ["Nilai Kontrak", formatCurrency(modal.item.contractValue), DollarSign],
                ["Budget Anggaran", formatCurrency(modal.item.budget), DollarSign],
                ["Biaya Aktual", formatCurrency(modal.item.actualCost), DollarSign],
              ].map(([l, v, Icon]: any) => (
                <div key={l} className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-2xs">
                  <p className="text-[#64748B] text-[11px] font-medium flex items-center gap-1 mb-1">
                    <Icon size={12} className="text-[#94A3B8]" />
                    <span>{l}</span>
                  </p>
                  <p className="text-[#0F172A] font-semibold font-mono text-sm">{v}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-[#334155]">Kemajuan Penyelesaian</span>
                <span className="font-mono font-bold text-[#2563EB]">{modal.item.progress}%</span>
              </div>
              <ProgressBar value={modal.item.progress} size="md" color="blue" />
            </div>

            {/* Description */}
            {modal.item.description && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Deskripsi Proyek</p>
                <p className="text-xs text-[#334155] leading-relaxed">{modal.item.description}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button className="btn-secondary !rounded-xl cursor-pointer" onClick={() => setModal(null)}>
                Tutup
              </button>
              <button
                className="btn-primary !rounded-xl cursor-pointer flex items-center gap-1.5"
                onClick={() => {
                  setForm({ ...modal.item });
                  setModal({ type: "edit", item: modal.item });
                }}
              >
                <Pencil size={14} />
                <span>Edit Proyek</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Form Modal with Enhanced UX */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          open
          title={modal.type === "add" ? "Tambah Proyek Baru" : `Edit Proyek — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="lg"
        >
          <form onSubmit={handleRequestSave} className="space-y-5">
            {/* Section 1: Informasi Utama */}
            <div>
              <div className="form-section-title">
                <FolderKanban size={14} />
                <span>Informasi Utama Proyek</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">
                    Nama Proyek <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    required
                    className="input font-medium"
                    placeholder="Contoh: Tangki Storage 20KL - Pertamina Balikpapan"
                    value={form.name ?? ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Pelanggan / Klien <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    required
                    className="input"
                    placeholder="Contoh: PT Pertamina Trans Kontinental"
                    value={form.customer ?? ""}
                    onChange={e => setForm({ ...form, customer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Project Manager (PM) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    required
                    className="input"
                    placeholder="Contoh: Reza Fahlevi, ST"
                    value={form.pm ?? ""}
                    onChange={e => setForm({ ...form, pm: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Prioritas Proyek</label>
                  <select
                    className="select font-medium"
                    value={form.priority ?? "Medium"}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">Status Proyek</label>
                  <select
                    className="select font-medium"
                    value={form.status ?? "Draft"}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Jadwal & Finansial */}
            <div>
              <div className="form-section-title">
                <DollarSign size={14} />
                <span>Estimasi Jadwal & Finansial</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="input font-mono"
                    value={form.startDate ?? ""}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Target Tanggal Selesai</label>
                  <input
                    type="date"
                    className="input font-mono"
                    value={form.targetDate ?? ""}
                    onChange={e => setForm({ ...form, targetDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Nilai Kontrak (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#64748B]">Rp</span>
                    <input
                      type="number"
                      className="input pl-10 font-mono font-semibold"
                      placeholder="0"
                      value={form.contractValue ?? ""}
                      onChange={e => setForm({ ...form, contractValue: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Anggaran Budget (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#64748B]">Rp</span>
                    <input
                      type="number"
                      className="input pl-10 font-mono font-semibold"
                      placeholder="0"
                      value={form.budget ?? ""}
                      onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Deskripsi */}
            <div>
              <div className="form-section-title">
                <FileText size={14} />
                <span>Catatan & Deskripsi Teknis</span>
              </div>
              <textarea
                className="textarea text-xs sm:text-sm"
                placeholder="Tuliskan spesifikasi, lingkup pekerjaan, atau catatan penting terkait proyek ini..."
                rows={3}
                value={form.description ?? ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                className="btn-secondary !rounded-xl cursor-pointer"
                onClick={() => setModal(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary !rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Check size={16} />
                <span>{modal.type === "add" ? "Simpan Proyek" : "Perbarui Proyek"}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Global Confirmation Dialog for CRUD */}
      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          confirmText={confirmState.confirmText}
          cancelText="Batal"
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
