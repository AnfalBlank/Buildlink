"use client";
import { useState } from "react";
import { productionOrders as initialData, projects, products } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Plus, Pencil, Trash2, Eye, Factory, Search, CheckCircle2,
  Printer, ArrowUpDown, Calendar, Filter, FileText
} from "lucide-react";

type PO = typeof initialData[0];
const STATUSES = ["Draft", "Planned", "Material Check", "Released", "In Progress", "QC / Rework", "Completed", "Closed"];

export default function ProductionOrdersPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("targetDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [modal, setModal] = useState<{ type: "add" | "edit" | "view"; item?: PO } | null>(null);
  const [form, setForm] = useState<Partial<PO>>({});

  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "primary" | "danger" | "warning";
    confirmText: string;
    action: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "Ya, Lanjutkan",
    action: () => {},
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = data
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.projectId.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || p.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "Upcoming") {
        matchPeriod = p.targetDate.startsWith("2026") || p.targetDate.startsWith("2027");
      }

      return matchSearch && matchStatus && matchPeriod;
    })
    .sort((a, b) => {
      let valA = a[sortField as keyof PO] ?? "";
      let valB = b[sortField as keyof PO] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  // Prompt confirmation before saving
  const handleRequestSave = () => {
    if (!form.productId) {
      toast.warning("Validasi", "Silakan pilih produk terlebih dahulu");
      return;
    }

    const isAdd = modal?.type === "add";
    setConfirmState({
      open: true,
      title: isAdd ? "Konfirmasi Tambah Production Order" : "Konfirmasi Simpan Perubahan",
      message: isAdd
        ? "Apakah Anda yakin ingin menerbitkan Perintah Produksi (SPK) baru ini ke lantai pabrik?"
        : "Apakah Anda yakin ingin menyimpan perubahan pada Production Order ini?",
      variant: "primary",
      confirmText: "Ya, Simpan",
      action: () => executeSave(),
    });
  };

  const executeSave = () => {
    if (modal?.type === "add") {
      const proj = projects.find(p => p.id === form.projectId);
      const prod = products.find(p => p.id === form.productId);
      const newPO: PO = {
        id: `PO${String(data.length + 1).padStart(3, "0")}`,
        code: `PROD-2026-${String(data.length + 1).padStart(3, "0")}`,
        projectId: form.projectId ?? "",
        salesOrderId: proj?.salesOrderId ?? "",
        product: prod?.name ?? "",
        productId: form.productId ?? "",
        qty: Number(form.qty) || 1,
        bomRevision: prod?.revision ?? "Rev.A",
        routingRevision: prod?.revision ?? "Rev.A",
        targetDate: form.targetDate ?? "",
        status: form.status ?? "Draft",
        priority: form.priority ?? "Medium",
        progress: 0,
        units: [
          { serial: `SN-UNIT-${String(data.length + 1).padStart(3, "0")}`, status: "Draft", progress: 0 }
        ],
      };
      setData([newPO, ...data]);
      toast.success("Berhasil Disimpan", `Perintah produksi ${newPO.code} berhasil ditambahkan.`);
    } else if (modal?.type === "edit" && modal.item) {
      const prod = products.find(p => p.id === form.productId);
      setData(data.map(p => p.id === modal.item!.id ? {
        ...p,
        ...form,
        product: prod ? prod.name : p.product,
        qty: Number(form.qty),
        progress: Number(form.progress ?? p.progress)
      } as PO : p));
      toast.success("Berhasil Diperbarui", `Production Order ${modal.item.code} telah diperbarui.`);
    }
    setModal(null);
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  // Prompt confirmation before deleting
  const handleRequestDelete = (item: PO) => {
    setConfirmState({
      open: true,
      title: "Hapus Production Order",
      message: `Apakah Anda yakin ingin menghapus ${item.code} (${item.product})? Tindakan ini tidak dapat dibatalkan.`,
      variant: "danger",
      confirmText: "Ya, Hapus",
      action: () => {
        setData(data.filter(x => x.id !== item.id));
        toast.error("Dihapus", `Production order ${item.code} telah dihapus.`);
        setConfirmState(prev => ({ ...prev, open: false }));
      },
    });
  };

  // Prompt confirmation before releasing order
  const handleReleaseOrder = (item: PO) => {
    setConfirmState({
      open: true,
      title: "Rilis Production Order",
      message: `Rilis perintah kerja ${item.code} ke lantai pabrik? Status akan berubah menjadi 'Released'.`,
      variant: "primary",
      confirmText: "Rilis Sekarang",
      action: () => {
        setData(data.map(p => p.id === item.id ? { ...p, status: "Released" } : p));
        toast.success("Order Dirilis", `${item.code} kini berstatus Released untuk fabrikasi.`);
        setConfirmState(prev => ({ ...prev, open: false }));
        setModal(null);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Perintah Produksi (Production Orders)"
        subtitle="Manajemen Surat Perintah Kerja (SPK), alokasi shop-floor, dan serial number tracking"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#2563EB]"
              title="Cetak Jadwal Produksi"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>
            <button
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
              onClick={() => {
                setForm({ status: "Draft", priority: "Medium", qty: 1 });
                setModal({ type: "add" });
              }}
            >
              <Plus size={16} />
              <span>New Production Order</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Orders", val: data.length, cls: "text-[#2563EB]" },
          { label: "In Progress", val: data.filter(p => p.status === "In Progress").length, cls: "text-[#D97706]" },
          { label: "Released", val: data.filter(p => p.status === "Released").length, cls: "text-[#4F46E5]" },
          { label: "Completed", val: data.filter(p => p.status === "Completed").length, cls: "text-[#16A34A]" },
        ].map(s => (
          <div key={s.label} className="card p-4 transition-all hover:border-[#CBD5E1]">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Search, Period Filter & Sorting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="input !pl-10"
                placeholder="Cari kode atau nama produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#64748B] shrink-0" />
              <select
                className="select w-44"
                value={periodFilter}
                onChange={e => setPeriodFilter(e.target.value)}
              >
                <option value="All">Semua Target</option>
                <option value="Upcoming">Tahun Berjalan (2026/2027)</option>
              </select>
            </div>

            <select
              className="select w-44"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span>Urutkan:</span>
            <button
              onClick={() => handleSort("targetDate")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "targetDate" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>Target Selesai</span>
              <ArrowUpDown size={12} />
            </button>
            <button
              onClick={() => handleSort("progress")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "progress" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>Progress</span>
              <ArrowUpDown size={12} />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto w-full">
          <table className="table min-w-[1050px]">
            <thead>
              <tr>
                <th onClick={() => handleSort("code")} className="cursor-pointer hover:text-[#2563EB] whitespace-nowrap">
                  KODE SPK
                </th>
                <th className="whitespace-nowrap">PRODUK</th>
                <th className="whitespace-nowrap">PROYEK</th>
                <th onClick={() => handleSort("qty")} className="cursor-pointer hover:text-[#2563EB] whitespace-nowrap">
                  JUMLAH
                </th>
                <th onClick={() => handleSort("targetDate")} className="cursor-pointer hover:text-[#2563EB] whitespace-nowrap">
                  TARGET DATE
                </th>
                <th onClick={() => handleSort("progress")} className="cursor-pointer hover:text-[#2563EB] w-40 whitespace-nowrap">
                  PROGRESS
                </th>
                <th className="whitespace-nowrap">STATUS</th>
                <th className="text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#94A3B8]">
                    Tidak ada data production order yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="font-mono font-bold text-[#2563EB] whitespace-nowrap">{p.code}</td>
                    <td className="font-semibold text-[#0F172A] whitespace-nowrap">{p.product}</td>
                    <td className="font-mono text-xs text-[#64748B] whitespace-nowrap">{p.projectId}</td>
                    <td className="font-mono font-bold whitespace-nowrap">{p.qty} unit</td>
                    <td className="text-[#475569] font-mono text-xs whitespace-nowrap">{p.targetDate}</td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} size="sm" className="flex-1" />
                        <span className="text-xs font-mono font-bold text-[#475569]">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap"><StatusBadge status={p.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Lihat Detail & Cetak SPK"
                          onClick={() => setModal({ type: "view", item: p })}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Edit"
                          onClick={() => { setForm(p); setModal({ type: "edit", item: p }); }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          title="Hapus"
                          onClick={() => handleRequestDelete(p)}
                        >
                          <Trash2 size={15} />
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

      {/* View Detail & Official SPK Printable Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Surat Perintah Kerja (SPK) — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            {/* Kop Surat Header */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">PT. MANGGALA UTAMA INDONESIA</h3>
                  <p className="text-xs text-[#64748B]">Divisi Fabrikasi & Manufaktur Shop Floor</p>
                  <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">MMOS Plant 1 - Bay Fabrikasi Berat</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                    SURAT PERINTAH KERJA (SPK)
                  </span>
                  <p className="font-mono font-bold text-sm text-[#0F172A] mt-1.5">{modal.item.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                <div>
                  <p className="text-[#64748B] font-medium">Nama Produk Manufaktur:</p>
                  <p className="font-bold text-[#0F172A] mt-0.5 text-sm">{modal.item.product}</p>
                  <p className="text-[11px] text-[#64748B] font-mono">ID Proyek: {modal.item.projectId}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Kuantiti Target:</p>
                  <p className="font-bold text-[#0F172A] mt-0.5 text-sm">{modal.item.qty} Unit</p>
                  <p className="text-[11px] text-[#64748B]">Prioritas: {modal.item.priority}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Revisi BOM / Routing:</p>
                  <p className="font-bold text-[#2563EB] mt-0.5 font-mono">{modal.item.bomRevision} / {modal.item.routingRevision}</p>
                  <p className="text-[11px] text-[#64748B]">Target Selesai: {modal.item.targetDate}</p>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-1.5">
                <span>Penyelesaian Keseluruhan Shop Floor</span>
                <span className="font-mono font-bold text-[#0F172A] text-sm">{modal.item.progress}%</span>
              </div>
              <ProgressBar value={modal.item.progress} size="md" />
            </div>

            {/* Serial Numbers & Unit Tracking */}
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Factory size={15} className="text-[#2563EB]" />
                Serial Number & Tracking Perakitan
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {modal.item.units.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-lg">Belum ada serial number yang dibuat.</p>
                ) : (
                  modal.item.units.map((u, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5">
                      <span className="font-mono text-[#2563EB] text-xs font-bold">{u.serial}</span>
                      <div className="flex items-center gap-3">
                        <ProgressBar value={u.progress} size="sm" className="w-24" />
                        <span className="text-xs font-mono font-bold text-[#64748B]">{u.progress}%</span>
                        <StatusBadge status={u.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tanda Tangan Mandor / Supervisor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center text-xs pt-3 border-t border-[#F1F5F9]">
              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Disetujui Oleh (Pabrik)</p>
                <div className="h-10 flex items-end justify-center font-bold text-[#0F172A]">Supri Santoso</div>
                <p className="text-[10px] text-[#94A3B8]">Production Manager</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Diterima Mandor / Foreman</p>
                <div className="h-10 flex items-end justify-center font-bold text-[#0F172A]">( Budi Welder / Lead Fitter )</div>
                <p className="text-[10px] text-[#94A3B8]">Shop Floor Lead</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary !rounded-xl !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer hover:border-[#2563EB]"
              >
                <Printer size={15} />
                <span>Cetak Lembar SPK</span>
              </button>

              <div className="flex items-center gap-2">
                <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setModal(null)}>
                  Tutup
                </button>
                {modal.item.status === "Planned" && (
                  <button
                    className="btn-primary !rounded-xl !py-2 !px-4 text-sm flex items-center gap-1.5 cursor-pointer"
                    onClick={() => handleReleaseOrder(modal.item!)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Rilis Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          open
          title={modal.type === "add" ? "Tambah Perintah Produksi (SPK) Baru" : `Edit Production Order — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="form-label">
                Pilih Produk <span className="text-[#DC2626]">*</span>
              </label>
              <select
                className="select"
                value={form.productId ?? ""}
                onChange={e => setForm({ ...form, productId: e.target.value })}
              >
                <option value="">Pilih produk yang diproduksi...</option>
                {products
                  .filter(p => p.category === "Fabrication" || p.category === "Assembly")
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Terhubung ke Proyek</label>
                <select
                  className="select"
                  value={form.projectId ?? ""}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                >
                  <option value="">Pilih proyek...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Jumlah Unit (Qty)</label>
                <input
                  type="number"
                  min={1}
                  className="input font-mono font-bold"
                  value={form.qty ?? 1}
                  onChange={e => setForm({ ...form, qty: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Target Tanggal</label>
                <input
                  type="date"
                  className="input font-mono"
                  value={form.targetDate ?? ""}
                  onChange={e => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Prioritas</label>
                <select
                  className="select"
                  value={form.priority ?? "Medium"}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label className="form-label">Status Awal</label>
                <select
                  className="select"
                  value={form.status ?? "Draft"}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-5 border-t border-[#F1F5F9]">
              <button
                type="button"
                className="btn-secondary !rounded-xl !py-2 !px-4 text-sm cursor-pointer"
                onClick={() => setModal(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-primary !rounded-xl !py-2 !px-5 text-sm cursor-pointer font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                onClick={handleRequestSave}
              >
                Simpan Order
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmText={confirmState.confirmText}
        cancelText="Batal"
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
