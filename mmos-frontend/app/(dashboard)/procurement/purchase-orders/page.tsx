"use client";
import { useState } from "react";
import { purchaseOrders as initialData, vendors, projects } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Pencil, Trash2, Eye, Search, CheckCircle2, Send,
  Printer, ArrowUpDown, Calendar, Filter, FileText
} from "lucide-react";

type PO = typeof initialData[0];
const STATUSES = ["Draft", "Sent", "Partially Received", "Received", "Cancelled"];

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<{ type: "add" | "edit" | "view"; item?: PO } | null>(null);
  const [form, setForm] = useState<Partial<PO>>({});

  // ConfirmDialog State
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
    .filter(po => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        po.code.toLowerCase().includes(q) ||
        po.vendor.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || po.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "Recent") {
        matchPeriod = po.date.startsWith("2026-10") || po.date.startsWith("2026-09");
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

  const handleRequestSave = () => {
    if (!form.vendorId) {
      toast.warning("Validasi", "Silakan pilih vendor terlebih dahulu.");
      return;
    }

    const isAdd = modal?.type === "add";
    setConfirmState({
      open: true,
      title: isAdd ? "Konfirmasi Buat Purchase Order" : "Konfirmasi Simpan PO",
      message: isAdd
        ? "Apakah Anda yakin ingin membuat Purchase Order baru ini?"
        : "Apakah Anda yakin ingin menyimpan perubahan pada Purchase Order ini?",
      variant: "primary",
      confirmText: "Ya, Simpan PO",
      action: () => executeSave(),
    });
  };

  const executeSave = () => {
    if (modal?.type === "add") {
      const v = vendors.find(x => x.id === form.vendorId);
      const newPO: PO = {
        id: `PRC${String(data.length + 1).padStart(3, "0")}`,
        code: `PO-2026-${String(data.length + 1).padStart(3, "0")}`,
        vendorId: form.vendorId ?? "",
        vendor: v?.name ?? "",
        projectId: form.projectId ?? "",
        date: form.date ?? new Date().toISOString().split("T")[0],
        deliveryDate: form.deliveryDate ?? "",
        status: "Draft",
        total: Number(form.total) || 0,
        approvedBy: null,
        items: [
          { id: "poi-new", material: "Plat Baja 6mm SS400", materialId: "MAT-001", qty: 1000, uom: "Kg", unitPrice: 18500, total: 18500000, qtyReceived: 0, qtyRejected: 0 }
        ],
      };
      setData([newPO, ...data]);
      toast.success("PO Dibuat", `Purchase Order ${newPO.code} berhasil disimpan.`);
    } else if (modal?.type === "edit" && modal.item) {
      const v = vendors.find(x => x.id === form.vendorId);
      setData(data.map(p => p.id === modal.item!.id ? {
        ...p,
        ...form,
        vendor: v ? v.name : p.vendor,
        total: Number(form.total)
      } as PO : p));
      toast.success("PO Diperbarui", `Perubahan pada ${modal.item.code} berhasil disimpan.`);
    }
    setModal(null);
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  const handleRequestDelete = (po: PO) => {
    setConfirmState({
      open: true,
      title: "Hapus Purchase Order",
      message: `Apakah Anda yakin ingin menghapus PO ${po.code} (${po.vendor})? Data yang dihapus tidak dapat dipulihkan.`,
      variant: "danger",
      confirmText: "Ya, Hapus",
      action: () => {
        setData(data.filter(x => x.id !== po.id));
        toast.error("PO Dihapus", `Purchase Order ${po.code} telah dihapus.`);
        setConfirmState(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleRequestApprove = (po: PO) => {
    setConfirmState({
      open: true,
      title: "Approve & Kirim Purchase Order",
      message: `Setujui PO ${po.code} senilai ${formatCurrency(po.total)} dan kirimkan ke ${po.vendor}?`,
      variant: "primary",
      confirmText: "Setujui & Kirim",
      action: () => {
        setData(data.map(p => p.id === po.id ? { ...p, approvedBy: "Manager Procurement", status: "Sent" } : p));
        toast.success("PO Disetujui", `${po.code} berhasil diapprove dan dikirim ke vendor.`);
        setConfirmState(prev => ({ ...prev, open: false }));
        setModal(null);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Pesanan Pembelian (Purchase Orders)"
        subtitle="Pengadaan material baku, komponen fabrikasi, dan order resmi ke vendor rekanan"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#2563EB]"
              title="Cetak Daftar PO"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>
            <button
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
              onClick={() => { setForm({ status: "Draft", date: new Date().toISOString().split("T")[0] }); setModal({ type: "add" }); }}
            >
              <Plus size={16} />
              <span>New PO</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {["Draft", "Sent", "Partially Received", "Received"].map(s => {
          const count = data.filter(p => p.status === s).length;
          const sum = data.filter(p => p.status === s).reduce((a, p) => a + p.total, 0);
          return (
            <div key={s} className="card p-4 transition-all hover:border-[#CBD5E1]">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">{s}</p>
              <p className="font-mono font-bold text-2xl text-[#2563EB]">{count}</p>
              <p className="text-[#64748B] text-xs font-mono mt-1">{formatCurrency(sum)}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        {/* Toolbar: Search, Period Filter, Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="input !pl-10"
                placeholder="Cari nomor PO atau nama vendor..."
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
                <option value="Recent">2 Bulan Terakhir</option>
              </select>
            </div>

            <select
              className="select w-40"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              {STATUSES.map(s => (
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
              onClick={() => handleSort("total")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "total" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>Total Nilai</span>
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
                  NO. PO
                </th>
                <th onClick={() => handleSort("vendor")} className="cursor-pointer hover:text-[#2563EB]">
                  VENDOR / SUPLIER
                </th>
                <th>PROYEK</th>
                <th onClick={() => handleSort("date")} className="cursor-pointer hover:text-[#2563EB]">
                  TANGGAL PO
                </th>
                <th>TARGET DELIVERY</th>
                <th onClick={() => handleSort("total")} className="cursor-pointer hover:text-[#2563EB]">
                  TOTAL NILAI
                </th>
                <th>APPROVAL</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#94A3B8]">
                    Tidak ada purchase order ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map(po => (
                  <tr key={po.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="font-mono font-bold text-[#2563EB]">{po.code}</td>
                    <td className="font-semibold text-[#0F172A]">{po.vendor}</td>
                    <td className="font-mono text-xs text-[#64748B]">{po.projectId || "—"}</td>
                    <td className="text-[#475569] font-mono text-xs">{po.date}</td>
                    <td className="text-[#475569] font-mono text-xs">{po.deliveryDate}</td>
                    <td className="font-mono font-bold text-[#0F172A]">{formatCurrency(po.total)}</td>
                    <td className="text-xs">
                      {po.approvedBy ? (
                        <span className="text-[#16A34A] font-medium flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          {po.approvedBy}
                        </span>
                      ) : (
                        <span className="text-[#D97706] font-medium">Pending Approval</span>
                      )}
                    </td>
                    <td><StatusBadge status={po.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Lihat Detail & Cetak PO"
                          onClick={() => setModal({ type: "view", item: po })}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Edit PO"
                          onClick={() => { setForm({ ...po }); setModal({ type: "edit", item: po }); }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          title="Hapus PO"
                          onClick={() => handleRequestDelete(po)}
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

      {/* View Detail & Official PO Printable Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Purchase Order Resmi — ${modal.item.code}`} onClose={() => setModal(null)} size="xl">
          <div className="space-y-5">
            {/* Kop Surat Header */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">PT. MANGGALA UTAMA INDONESIA</h3>
                  <p className="text-xs text-[#64748B]">Procurement & Supply Chain Operations</p>
                  <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">MMOS Central Warehouse, Cikarang Industrial Estate</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                    OFFICIAL PURCHASE ORDER
                  </span>
                  <p className="font-mono font-bold text-sm text-[#0F172A] mt-1.5">{modal.item.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                <div>
                  <p className="text-[#64748B] font-medium">Vendor Dituju:</p>
                  <p className="font-bold text-[#0F172A] mt-0.5">{modal.item.vendor}</p>
                  <p className="text-[11px] text-[#64748B] font-mono">ID: {modal.item.vendorId}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Proyek Alokasi:</p>
                  <p className="font-semibold text-[#0F172A] mt-0.5 font-mono">{modal.item.projectId || "Stok Umum"}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Tanggal Pemesanan:</p>
                  <p className="font-semibold text-[#0F172A] mt-0.5 font-mono">{modal.item.date}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Target Pengiriman:</p>
                  <p className="font-semibold text-[#2563EB] mt-0.5 font-mono">{modal.item.deliveryDate}</p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Rincian Barang & Spesifikasi Pengadaan
              </h4>
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] w-full">
                <table className="table min-w-[650px]">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap">MATERIAL</th>
                      <th className="whitespace-nowrap">QTY</th>
                      <th className="whitespace-nowrap">UOM</th>
                      <th className="whitespace-nowrap">HARGA SATUAN</th>
                      <th className="whitespace-nowrap">SUBTOTAL</th>
                      <th className="whitespace-nowrap">DITERIMA</th>
                      <th className="whitespace-nowrap">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.item.items.map((item, i) => (
                      <tr key={i} className="hover:bg-[#F8FAFC]">
                        <td className="font-semibold text-[#0F172A] whitespace-nowrap">{item.material}</td>
                        <td className="font-mono font-bold whitespace-nowrap">{item.qty}</td>
                        <td className="text-xs text-[#64748B] whitespace-nowrap">{item.uom}</td>
                        <td className="font-mono text-xs whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                        <td className="font-mono font-bold text-[#2563EB] whitespace-nowrap">{formatCurrency(item.total)}</td>
                        <td className="font-mono text-[#16A34A] whitespace-nowrap">{item.qtyReceived}</td>
                        <td className="whitespace-nowrap">
                          <span className={`text-xs font-semibold ${item.qtyReceived >= item.qty ? "text-[#16A34A]" : "text-[#D97706]"}`}>
                            {item.qtyReceived >= item.qty ? "Lengkap" : "Sebagian"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-xs text-[#64748B]">Total Nilai Pesanan Pembelian:</span>
                  <span className="font-mono font-bold text-lg text-[#0F172A]">{formatCurrency(modal.item.total)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center text-xs pt-3 border-t border-[#F1F5F9]">
              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Dibuat & Disetujui (MMOS)</p>
                <div className="h-12 flex items-end justify-center font-bold text-[#0F172A]">
                  {modal.item.approvedBy ?? "Pending Approval"}
                </div>
                <p className="text-[10px] text-[#94A3B8]">Procurement Manager</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Konfirmasi Vendor Rekanan</p>
                <div className="h-12 flex items-end justify-center font-bold text-[#0F172A]">( Tanda Tangan & Stempel )</div>
                <p className="text-[10px] text-[#94A3B8]">{modal.item.vendor}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary !rounded-xl !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer hover:border-[#2563EB]"
              >
                <Printer size={15} />
                <span>Cetak Lembar PO Resmi</span>
              </button>

              <div className="flex items-center gap-2">
                <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setModal(null)}>
                  Tutup
                </button>
                {!modal.item.approvedBy && (
                  <button
                    className="btn-primary !rounded-xl !py-2 !px-4 text-sm flex items-center gap-1.5 cursor-pointer"
                    onClick={() => handleRequestApprove(modal.item!)}
                  >
                    <Send size={15} />
                    <span>Approve & Kirim ke Vendor</span>
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
          title={modal.type === "add" ? "Buat Purchase Order Baru" : `Edit Purchase Order — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Vendor <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  className="select"
                  value={form.vendorId ?? ""}
                  onChange={e => setForm({ ...form, vendorId: e.target.value })}
                >
                  <option value="">Pilih vendor...</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Proyek Terkait</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tanggal PO</label>
                <input
                  type="date"
                  className="input font-mono"
                  value={form.date ?? ""}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Estimasi Pengiriman (Delivery Date)</label>
                <input
                  type="date"
                  className="input font-mono"
                  value={form.deliveryDate ?? ""}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Estimasi Nilai Total (IDR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">Rp</span>
                <input
                  type="number"
                  className="input !pl-10 font-mono text-base font-bold"
                  placeholder="0"
                  value={form.total ?? ""}
                  onChange={e => setForm({ ...form, total: Number(e.target.value) })}
                />
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
                Simpan Purchase Order
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
