"use client";
import { useState } from "react";
import { invoices as initialData, projects } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Eye, Pencil, FileText, Search, Printer, ArrowUpDown,
  Calendar, CheckCircle2, Clock, DollarSign, Building2, Send
} from "lucide-react";

type Invoice = typeof initialData[0];
const TYPES = ["Down Payment", "Progress Billing", "Final Billing", "Credit Note"];

export default function InvoicesPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<{ type: "add" | "edit" | "view"; item?: Invoice } | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({});

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "primary" | "danger" | "warning";
    confirmText: string;
    action: () => void;
  } | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = data
    .filter(inv => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        inv.code.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.type.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "October") {
        matchPeriod = inv.date.startsWith("2026-10");
      } else if (periodFilter === "August") {
        matchPeriod = inv.date.startsWith("2026-08");
      } else if (periodFilter === "UnpaidOnly") {
        matchPeriod = inv.status !== "Paid";
      }

      return matchSearch && matchStatus && matchPeriod;
    })
    .sort((a, b) => {
      let valA = a[sortField as keyof Invoice] ?? "";
      let valB = b[sortField as keyof Invoice] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      toast.error("Validasi", "Silakan pilih proyek terkait.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Validasi", "Silakan masukkan nominal tagihan.");
      return;
    }

    const isAdd = modal?.type === "add";
    const proj = projects.find(p => p.id === form.projectId);

    setConfirmState({
      open: true,
      title: isAdd ? "Konfirmasi Terbitkan Faktur" : "Konfirmasi Simpan Perubahan",
      message: isAdd
        ? `Apakah Anda yakin ingin menerbitkan tagihan ${form.type} senilai ${formatCurrency(Number(form.amount))} untuk ${proj?.customer}?`
        : `Simpan perubahan pada faktur ${modal?.item?.code}?`,
      variant: "primary",
      confirmText: "Ya, Simpan Faktur",
      action: () => executeSave(),
    });
  };

  const executeSave = () => {
    const proj = projects.find(p => p.id === form.projectId);
    if (modal?.type === "add") {
      const newInv: Invoice = {
        id: `INV${String(data.length + 1).padStart(3, "0")}`,
        code: `INV-2026-${String(data.length + 1).padStart(3, "0")}`,
        projectId: form.projectId ?? "",
        salesOrderId: form.salesOrderId ?? (proj?.salesOrderId ?? ""),
        customer: proj?.customer ?? "",
        date: form.date ?? new Date().toISOString().split("T")[0],
        dueDate: form.dueDate ?? "",
        type: form.type ?? "Progress Billing",
        amount: Number(form.amount) || 0,
        taxAmount: 0,
        totalAmount: Number(form.amount) || 0,
        status: "Unpaid",
        paidDate: null,
        paidAmount: 0,
        notes: form.notes ?? "",
      };
      setData([newInv, ...data]);
      toast.success("Faktur Diterbitkan", `Faktur ${newInv.code} berhasil disimpan.`);
    } else if (modal?.type === "edit" && modal.item) {
      setData(
        data.map(i =>
          i.id === modal.item!.id
            ? ({
                ...i,
                ...form,
                amount: Number(form.amount),
                totalAmount: Number(form.amount),
              } as Invoice)
            : i
        )
      );
      toast.info("Faktur Diperbarui", `Perubahan data faktur ${modal.item.code} telah disimpan.`);
    }
    setModal(null);
    setConfirmState(null);
  };

  const handleMarkPaid = (inv: Invoice) => {
    setConfirmState({
      open: true,
      title: "Konfirmasi Pelunasan Tagihan",
      message: `Konfirmasi pembayaran lunas untuk invoice ${inv.code} senilai ${formatCurrency(inv.totalAmount)} dari ${inv.customer}?`,
      variant: "primary",
      confirmText: "Tandai Lunas",
      action: () => {
        const today = new Date().toISOString().split("T")[0];
        setData(
          data.map(i =>
            i.id === inv.id
              ? { ...i, status: "Paid", paidAmount: i.totalAmount, paidDate: today }
              : i
          )
        );
        toast.success("Pembayaran Dikonfirmasi", `Invoice ${inv.code} telah ditandai Lunas.`);
        setConfirmState(null);
        setModal(null);
      },
    });
  };

  const totalOutstanding = data
    .filter(i => i.status !== "Paid")
    .reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);
  const totalPaid = data
    .filter(i => i.status === "Paid")
    .reduce((s, i) => s + i.paidAmount, 0);

  return (
    <div>
      <PageHeader
        title="Faktur & Tagihan (Invoices)"
        subtitle="Manajemen penagihan piutang, termin pembayaran proyek, dan rekonsiliasi kas"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#2563EB]"
              title="Cetak Rekap Invoice"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>
            <button
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
              onClick={() => {
                setForm({
                  type: "Progress Billing",
                  date: new Date().toISOString().split("T")[0],
                });
                setModal({ type: "add" });
              }}
            >
              <Plus size={16} />
              <span>Faktur Baru</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Difakturkan", val: formatCurrency(data.reduce((s, i) => s + i.totalAmount, 0)), cls: "text-[#2563EB]" },
          { label: "Telah Dibayar (Lunas)", val: formatCurrency(totalPaid), cls: "text-[#16A34A]" },
          { label: "Sisa Tagihan (Outstanding)", val: formatCurrency(totalOutstanding), cls: "text-[#D97706]" },
          { label: "Faktur Overdue", val: `${data.filter(i => i.status === "Overdue").length} Faktur`, cls: "text-[#DC2626]" },
        ].map(s => (
          <div key={s.label} className="card p-4 transition-all hover:border-[#CBD5E1]">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-xl sm:text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Toolbar: Search, Period Filter, Status Filter, Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="input !pl-10"
                placeholder="Cari kode invoice atau pelanggan..."
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
                <option value="All">Semua Periode</option>
                <option value="October">Bulan Ini (Okt 2026)</option>
                <option value="August">Agustus 2026</option>
                <option value="UnpaidOnly">Hanya Belum Lunas</option>
              </select>
            </div>

            <select
              className="select w-40"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              {["Unpaid", "Partially Paid", "Paid", "Overdue"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span>Urutkan:</span>
            <button
              onClick={() => handleSort("date")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "date" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>Tanggal</span>
              <ArrowUpDown size={12} />
            </button>
            <button
              onClick={() => handleSort("totalAmount")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "totalAmount" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>Nominal</span>
              <ArrowUpDown size={12} />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="table min-w-[1050px]">
            <thead>
              <tr>
                <th onClick={() => handleSort("code")} className="cursor-pointer hover:text-[#2563EB]">
                  NO. FAKTUR
                </th>
                <th>PELANGGAN / KLIEN</th>
                <th>PROYEK</th>
                <th>TIPE TERMIN</th>
                <th onClick={() => handleSort("date")} className="cursor-pointer hover:text-[#2563EB]">
                  TANGGAL
                </th>
                <th onClick={() => handleSort("dueDate")} className="cursor-pointer hover:text-[#2563EB]">
                  JATUH TEMPO
                </th>
                <th onClick={() => handleSort("totalAmount")} className="cursor-pointer hover:text-[#2563EB]">
                  TOTAL TAGIHAN
                </th>
                <th>DIBAYAR</th>
                <th>SISA (SALDO)</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-[#94A3B8]">
                    Tidak ada faktur tagihan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="font-mono font-bold text-[#2563EB]">{inv.code}</td>
                    <td className="font-semibold text-[#0F172A] max-w-[180px]">
                      <div className="truncate" title={inv.customer}>{inv.customer}</div>
                    </td>
                    <td className="font-mono text-xs text-[#64748B]">{inv.projectId}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                        {inv.type}
                      </span>
                    </td>
                    <td className="text-xs text-[#475569] font-mono">{inv.date}</td>
                    <td className="text-xs text-[#475569] font-mono">{inv.dueDate}</td>
                    <td className="font-mono font-bold text-[#0F172A]">{formatCurrency(inv.totalAmount)}</td>
                    <td className="font-mono text-[#16A34A]">{formatCurrency(inv.paidAmount)}</td>
                    <td className="font-mono font-bold text-[#D97706]">
                      {formatCurrency(inv.totalAmount - inv.paidAmount)}
                    </td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Lihat Detail & Cetak Invoice"
                          onClick={() => setModal({ type: "view", item: inv })}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Edit Invoice"
                          onClick={() => {
                            setForm({ ...inv });
                            setModal({ type: "edit", item: inv });
                          }}
                        >
                          <Pencil size={15} />
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

      {/* Invoice Detail & Official Printable Layout Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Detail Faktur Tagihan — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            {/* Kop Surat Header for Print */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">PT. MANGGALA UTAMA INDONESIA</h3>
                  <p className="text-xs text-[#64748B]">Integrated Manufacturing & Heavy Equipment Operations</p>
                  <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">Kawasan Industri MMOS, Bekasi · Telp: (021) 8990-1234</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                    FAKTUR PENJUALAN
                  </span>
                  <p className="font-mono font-bold text-sm text-[#0F172A] mt-1.5">{modal.item.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div>
                  <p className="text-[11px] text-[#64748B] font-medium">Ditagihkan Kepada:</p>
                  <p className="text-xs font-bold text-[#0F172A] mt-0.5">{modal.item.customer}</p>
                  <p className="text-[11px] text-[#64748B] font-mono">Proyek: {modal.item.projectId}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#64748B] font-medium">Tanggal Faktur:</p>
                  <p className="text-xs font-semibold text-[#0F172A] mt-0.5 font-mono">{modal.item.date}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#64748B] font-medium">Jatuh Tempo:</p>
                  <p className="text-xs font-semibold text-[#DC2626] mt-0.5 font-mono">{modal.item.dueDate}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#64748B] font-medium">Status Pembayaran:</p>
                  <div className="mt-0.5"><StatusBadge status={modal.item.status} /></div>
                </div>
              </div>
            </div>

            {/* Billing Items Card */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
              <table className="table">
                <thead>
                  <tr>
                    <th>DESKRIPSI TERMIN PENAGIHAN</th>
                    <th>TIPE</th>
                    <th className="text-right">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <p className="font-semibold text-[#0F172A]">{modal.item.notes || `Penagihan ${modal.item.type}`}</p>
                      <p className="text-xs text-[#64748B]">Berdasarkan kesepakatan kontrak kerja sama {modal.item.salesOrderId}</p>
                    </td>
                    <td><span className="px-2 py-0.5 rounded text-xs bg-[#F1F5F9] font-medium">{modal.item.type}</span></td>
                    <td className="text-right font-mono font-bold text-sm">{formatCurrency(modal.item.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col items-end gap-1.5">
                <div className="flex justify-between w-64 text-xs text-[#64748B]">
                  <span>Total Tagihan:</span>
                  <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(modal.item.totalAmount)}</span>
                </div>
                <div className="flex justify-between w-64 text-xs text-[#16A34A]">
                  <span>Telah Dibayarkan:</span>
                  <span className="font-mono font-bold">-{formatCurrency(modal.item.paidAmount)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm font-bold border-t border-[#E2E8F0] pt-1.5 text-[#0F172A]">
                  <span>Sisa Saldo:</span>
                  <span className="font-mono text-[#2563EB]">{formatCurrency(modal.item.totalAmount - modal.item.paidAmount)}</span>
                </div>
              </div>
            </div>

            {/* Bank Transfer info */}
            <div className="p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#1E40AF]">Instruksi Pembayaran Bank Transfer:</p>
                <p className="text-[#3B82F6] font-mono mt-0.5">Bank Mandiri: 123-00-9876543-2 a.n PT Manggala Utama Indonesia</p>
              </div>
              <span className="text-[11px] text-[#64748B] italic">Harap cantumkan no invoice pada berita transfer.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary !rounded-xl !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer hover:border-[#2563EB]"
              >
                <Printer size={15} />
                <span>Cetak Invoice Resmi</span>
              </button>

              <div className="flex items-center gap-2">
                <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setModal(null)}>
                  Tutup
                </button>
                {modal.item.status !== "Paid" && (
                  <button
                    className="btn-primary !rounded-xl !py-2 !px-4 text-sm flex items-center gap-1.5 cursor-pointer"
                    onClick={() => handleMarkPaid(modal.item!)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Tandai Lunas</span>
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
          title={modal.type === "add" ? "Terbitkan Faktur Tagihan Baru" : `Edit Faktur — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="md"
        >
          <form onSubmit={handleRequestSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">
                  Pilih Proyek <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  className="select"
                  value={form.projectId ?? ""}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  required
                >
                  <option value="">Pilih proyek pelanggan...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Tipe Termin Penagihan</label>
                <select
                  className="select"
                  value={form.type ?? "Progress Billing"}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Tanggal Faktur</label>
                <input
                  type="date"
                  className="input font-mono"
                  value={form.date ?? ""}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Jatuh Tempo (Due Date)</label>
                <input
                  type="date"
                  className="input font-mono"
                  value={form.dueDate ?? ""}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Nominal Tagihan (IDR) <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#64748B]">Rp</span>
                <input
                  type="number"
                  className="input !pl-10 font-mono text-base font-bold text-[#0F172A]"
                  placeholder="0"
                  value={form.amount ?? ""}
                  onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Catatan & Keterangan Termin</label>
              <textarea
                className="textarea"
                placeholder="Contoh: Pembayaran DP 30% sesuai SPK no..."
                value={form.notes ?? ""}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                className="btn-secondary !rounded-xl !py-2 !px-4 text-sm"
                onClick={() => setModal(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary !rounded-xl !py-2 !px-5 text-sm font-semibold shadow-sm hover:shadow active:scale-95 transition-all"
              >
                {modal.type === "add" ? "Terbitkan Faktur" : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          confirmText={confirmState.confirmText}
          cancelText="Batal"
          onConfirm={confirmState.action}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
