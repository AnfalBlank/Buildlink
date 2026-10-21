"use client";
import { useState, useMemo } from "react";
import { salesOrders as initialData, quotations, customers } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { 
  Plus, Pencil, Trash2, Search, Eye, Printer, ArrowUpDown, 
  Calendar, CheckCircle2, FileCheck, Building2 
} from "lucide-react";

type SalesOrder = typeof initialData[0];

export default function SalesOrdersPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"code" | "customer" | "date" | "contractValue">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<{ type: "add" | "edit" | "view" | "print"; item?: SalesOrder } | null>(null);
  const [form, setForm] = useState<Partial<SalesOrder>>({});

  // Confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "danger" | "warning" | "info" | "success";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const filteredAndSorted = useMemo(() => {
    let result = data.filter(so => {
      const matchSearch = so.code.toLowerCase().includes(search.toLowerCase()) ||
        so.customer.toLowerCase().includes(search.toLowerCase()) ||
        (so.poNumber ?? "").toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === "all" || so.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "2026-10") {
        matchPeriod = so.date.startsWith("2026-10");
      } else if (periodFilter === "2026-11") {
        matchPeriod = so.date.startsWith("2026-11");
      } else if (periodFilter === "q4") {
        matchPeriod = so.date >= "2026-10-01" && so.date <= "2026-12-31";
      }

      return matchSearch && matchStatus && matchPeriod;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "code") cmp = a.code.localeCompare(b.code);
      else if (sortBy === "customer") cmp = a.customer.localeCompare(b.customer);
      else if (sortBy === "date") cmp = a.date.localeCompare(b.date);
      else if (sortBy === "contractValue") cmp = a.contractValue - b.contractValue;
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, statusFilter, periodFilter, sortBy, sortOrder]);

  const toggleSort = (col: "code" | "customer" | "date" | "contractValue") => {
    if (sortBy === col) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  const requestSave = () => {
    if (!form.customer) {
      toast.error("Validasi Gagal", "Nama pelanggan wajib dipilih.");
      return;
    }
    const isEdit = modal?.type === "edit";
    setConfirmConfig({
      open: true,
      title: isEdit ? "Simpan Perubahan Sales Order" : "Konfirmasi Terbitkan Sales Order Baru",
      description: isEdit 
        ? `Apakah Anda yakin ingin memperbarui data Sales Order ${modal?.item?.code}?`
        : `Apakah Anda yakin ingin menerbitkan Sales Order untuk ${form.customer} dengan nilai ${formatCurrency(Number(form.contractValue) || 0)}?`,
      confirmText: isEdit ? "Ya, Simpan Perubahan" : "Ya, Terbitkan SO",
      variant: "info",
      onConfirm: () => {
        if (modal?.type === "add") {
          const newSO: SalesOrder = {
            id: `SO${String(data.length + 1).padStart(3, "0")}`,
            code: `SO-2026-${String(data.length + 1).padStart(3, "0")}`,
            quotationId: form.quotationId ?? null as unknown as string,
            customer: form.customer ?? "",
            customerId: form.customerId ?? "CUST-001",
            poNumber: form.poNumber ?? `PO-${Date.now().toString().slice(-6)}`,
            contractValue: Number(form.contractValue) || 0,
            date: form.date ?? new Date().toISOString().split("T")[0],
            deliveryDate: form.deliveryDate ?? "",
            status: form.status ?? "Active",
            projectId: null,
            paymentTerms: form.paymentTerms ?? "30% DP, 70% Pelunasan Sebelum Pengiriman",
          };
          setData([newSO, ...data]);
          toast.success("Sales Order Terbit", `${newSO.code} untuk ${newSO.customer} berhasil dibuat.`);
        } else if (modal?.type === "edit" && modal.item) {
          setData(data.map(so => so.id === modal.item!.id ? { ...so, ...form } as SalesOrder : so));
          toast.success("Sales Order Diperbarui", `Perubahan data pada ${modal.item.code} telah disimpan.`);
        }
        setModal(null);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const requestDelete = (so: SalesOrder) => {
    setConfirmConfig({
      open: true,
      title: "Hapus Sales Order?",
      description: `Apakah Anda yakin ingin membatalkan & menghapus order ${so.code} (${so.customer}) senilai ${formatCurrency(so.contractValue)}? Data tidak dapat dipulihkan.`,
      confirmText: "Ya, Hapus Order",
      variant: "danger",
      onConfirm: () => {
        setData(data.filter(x => x.id !== so.id));
        toast.error("Sales Order Dihapus", `Order ${so.code} berhasil dihapus dari sistem.`);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const requestActivate = (so: SalesOrder) => {
    setConfirmConfig({
      open: true,
      title: "Aktivasi Sales Order?",
      description: `Ubah status order ${so.code} menjadi 'Active' untuk meneruskan ke perencanaan produksi (PPIC / MRP)?`,
      confirmText: "Aktivasi Order",
      variant: "success",
      onConfirm: () => {
        setData(data.map(x => x.id === so.id ? { ...x, status: "Active" } : x));
        toast.success("Sales Order Aktif", `${so.code} kini aktif dan siap diteruskan ke jadwal produksi.`);
        setConfirmConfig(prev => ({ ...prev, open: false }));
        if (modal?.item?.id === so.id) {
          setModal({ type: "view", item: { ...so, status: "Active" } });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders (Pesanan Penjualan)"
        subtitle="Manajemen kontrak pesanan resmi dari PO pelanggan, termin pembayaran, dan jadwal pengiriman"
        actions={
          <div className="flex items-center gap-2.5">
            <button 
              className="btn-secondary flex items-center gap-2 text-xs"
              onClick={() => {
                if (filteredAndSorted.length > 0) {
                  setModal({ type: "print", item: filteredAndSorted[0] });
                }
              }}
            >
              <Printer size={15} /> Cetak Rekap Pesanan
            </button>
            <button 
              className="btn-primary flex items-center gap-2 text-xs" 
              onClick={() => { 
                setForm({ 
                  status: "Active",
                  date: new Date().toISOString().split("T")[0],
                  deliveryDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
                  paymentTerms: "30% DP, 40% Progress, 30% FAT / Delivery"
                }); 
                setModal({ type: "add" }); 
              }}
            >
              <Plus size={16} /> Buat Sales Order Baru
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-text-secondary text-xs mb-1 font-medium">Total Pesanan Terdaftar</p>
          <p className="font-mono font-bold text-2xl text-accent">{data.length} Kontrak</p>
          <p className="text-text-secondary text-xs mt-1">Seluruh divisi manufaktur</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-xs mb-1 font-medium">Total Nilai Kontrak Komersial</p>
          <p className="font-mono font-bold text-xl text-accent">
            {formatCurrency(data.reduce((a, s) => a + s.contractValue, 0))}
          </p>
          <p className="text-emerald-500 text-xs mt-1 font-medium">Target pendapatan tercapai 92%</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-xs mb-1 font-medium">Pesanan Aktif Berjalan</p>
          <p className="font-mono font-bold text-2xl text-accent-success">
            {data.filter(s => s.status === "Active").length} Order
          </p>
          <p className="text-text-secondary text-xs mt-1">Dalam proses fabrikasi / perakitan</p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                className="input pl-9 text-xs" 
                placeholder="Cari kode SO, klien, atau No. PO..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>

            {/* Filter Periode */}
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border px-2.5 py-1.5 rounded-lg text-xs">
              <Calendar size={14} className="text-text-secondary" />
              <span className="text-text-secondary">Periode:</span>
              <select 
                value={periodFilter} 
                onChange={e => setPeriodFilter(e.target.value)}
                className="bg-transparent border-0 text-text-primary text-xs focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Periode</option>
                <option value="2026-10">Oktober 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="q4">Kuartal IV 2026</option>
              </select>
            </div>

            {/* Status Filter */}
            <select 
              className="select text-xs w-36"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              {["Active", "Completed", "Draft", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="text-xs text-text-secondary font-mono">
            Menampilkan <span className="font-bold text-text-primary">{filteredAndSorted.length}</span> dari {data.length} pesanan
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-secondary text-xs">
                <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("code")}>
                  <div className="flex items-center gap-1.5">No. SO <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("customer")}>
                  <div className="flex items-center gap-1.5">Pelanggan <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">PO Pelanggan</th>
                <th className="text-right py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("contractValue")}>
                  <div className="flex items-center justify-end gap-1.5">Nilai Kontrak (IDR) <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("date")}>
                  <div className="flex items-center gap-1.5">Tgl Order <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Target Kirim</th>
                <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Termin Bayar</th>
                <th className="text-center py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                <th className="text-right py-3 px-4 font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-secondary text-sm">
                    Tidak ada sales order yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(so => (
                  <tr key={so.id} className="table-row-hover group">
                    <td className="py-3 px-4 font-mono text-accent font-semibold text-xs whitespace-nowrap">
                      {so.code}
                    </td>
                    <td className="py-3 px-4 text-text-primary font-medium whitespace-nowrap">
                      {so.customer}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-xs whitespace-nowrap">
                      {so.poNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-accent font-bold text-xs text-right whitespace-nowrap">
                      {formatCurrency(so.contractValue)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs font-mono whitespace-nowrap">
                      {so.date}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs font-mono whitespace-nowrap">
                      {so.deliveryDate}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs max-w-[150px] truncate whitespace-nowrap" title={so.paymentTerms}>
                      {so.paymentTerms}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={so.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent transition-colors" 
                          title="Lihat Detail Order" 
                          onClick={() => setModal({ type: "view", item: so })}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent transition-colors" 
                          title="Cetak Sales Order PDF" 
                          onClick={() => setModal({ type: "print", item: so })}
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent transition-colors" 
                          title="Edit Sales Order" 
                          onClick={() => { setForm({ ...so }); setModal({ type: "edit", item: so }); }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent-alert transition-colors" 
                          title="Hapus Sales Order" 
                          onClick={() => requestDelete(so)}
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

      {/* View Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Detail Sales Order — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["No. Dokumen Sales Order", modal.item.code],
                ["Nama Pelanggan", modal.item.customer],
                ["Nomor Purchase Order Klien", modal.item.poNumber || "-"],
                ["Total Nilai Kontrak", formatCurrency(modal.item.contractValue)],
                ["Tanggal Order Diterima", modal.item.date],
                ["Target Waktu Pengiriman", modal.item.deliveryDate],
                ["Termin Pembayaran", modal.item.paymentTerms],
                ["Status Saat Ini", modal.item.status],
                ["Quotation Terkait", modal.item.quotationId ?? "Ref Langsung Klien"],
                ["ID Proyek Terhubung", modal.item.projectId ?? "Siap Dijadwalkan PPIC"],
              ].map(([label, val]) => (
                <div key={label} className="bg-surface-2 rounded-lg p-3 border border-border">
                  <p className="text-text-secondary text-xs mb-1 font-medium">{label}</p>
                  <p className="text-text-primary font-medium text-sm">{val}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <button 
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                  onClick={() => setModal({ type: "print", item: modal.item })}
                >
                  <Printer size={14} /> Cetak Form SO Resmi
                </button>
                {modal.item.status === "Draft" && (
                  <button 
                    className="btn-secondary flex items-center gap-1.5 text-xs text-emerald-600 border-emerald-600/30 hover:bg-emerald-50"
                    onClick={() => requestActivate(modal.item!)}
                  >
                    <CheckCircle2 size={14} /> Konfirmasi & Aktifkan
                  </button>
                )}
              </div>
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Printable Sales Order Document */}
      {modal?.type === "print" && modal.item && (
        <Modal open title={`Cetak Sales Order Resmi — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-xs text-text-secondary">Pratinjau lembar konfirmasi Sales Order untuk produksi & pengiriman.</p>
              <button 
                className="btn-primary flex items-center gap-2 text-xs"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Cetak / Unduh PDF
              </button>
            </div>

            {/* Official Paper Document */}
            <div className="bg-white text-slate-900 p-8 rounded-lg border border-slate-200 shadow-sm font-sans text-xs space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <span className="font-black text-xl tracking-tight text-blue-900 font-mono">PT. MANGGALA UTAMA INDONESIA</span>
                  <p className="text-[11px] text-slate-600">Manufacturing, Engineering & Heavy Machinery Operations</p>
                  <p className="text-[10px] text-slate-500">Kawasan Industri Cikarang Blok B-12, Bekasi | Telp: (021) 8983-0021</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    SALES ORDER CONFIRMATION
                  </span>
                  <p className="font-mono font-bold text-xs text-slate-800 mt-1">{modal.item.code}</p>
                  <p className="text-[10px] text-slate-500">Tanggal: {modal.item.date}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pemesan (Customer):</p>
                  <p className="font-bold text-sm text-slate-900">{modal.item.customer}</p>
                  <p className="text-slate-600">No. PO Klien: <span className="font-mono font-bold text-slate-800">{modal.item.poNumber || "-"}</span></p>
                  <p className="text-slate-600">Ref Quotation: <span className="font-mono">{modal.item.quotationId || "Direct Order"}</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ketentuan Pengiriman & Pembayaran:</p>
                  <p className="text-slate-600">Target Serah Terima: <span className="font-bold text-slate-800 font-mono">{modal.item.deliveryDate}</span></p>
                  <p className="text-slate-600">Termin: <span className="font-medium text-slate-800">{modal.item.paymentTerms}</span></p>
                  <p className="text-slate-600">Status Order: <span className="font-bold text-emerald-700">{modal.item.status.toUpperCase()}</span></p>
                </div>
              </div>

              {/* Scope of Work Table */}
              <div className="overflow-x-auto w-full border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3 border border-slate-900 text-center w-8 whitespace-nowrap">No</th>
                      <th className="py-2 px-3 border border-slate-900 whitespace-nowrap">Uraian Pekerjaan / Fabrikasi Sesuai PO</th>
                      <th className="py-2 px-3 border border-slate-900 text-center w-24 whitespace-nowrap">Satuan</th>
                      <th className="py-2 px-3 border border-slate-900 text-right w-44 whitespace-nowrap">Nilai Kontrak (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    <tr>
                      <td className="py-3 px-3 border border-slate-200 text-center font-mono whitespace-nowrap">1</td>
                      <td className="py-3 px-3 border border-slate-200 font-medium whitespace-nowrap">
                        Pengadaan & Fabrikasi Unit Presisi Sesuai Purchase Order {modal.item.poNumber}
                        <p className="text-[11px] text-slate-500 mt-0.5">Spesifikasi teknik terlampir pada dokumen kontrak dan gambar kerja engineering.</p>
                      </td>
                      <td className="py-3 px-3 border border-slate-200 text-center whitespace-nowrap">1 Lot</td>
                      <td className="py-3 px-3 border border-slate-200 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(modal.item.contractValue)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 border border-slate-200 text-right uppercase text-[11px] whitespace-nowrap">Subtotal Nilai Kontrak</td>
                      <td className="py-2.5 px-3 border border-slate-200 text-right font-mono whitespace-nowrap">{formatCurrency(modal.item.contractValue)}</td>
                    </tr>
                    <tr className="bg-blue-50 font-black text-slate-900 text-sm">
                      <td colSpan={3} className="py-3 px-3 border border-slate-300 text-right uppercase whitespace-nowrap">Total Nilai Pesanan Disepakati</td>
                      <td className="py-3 px-3 border border-slate-300 text-right font-mono text-blue-900 whitespace-nowrap">{formatCurrency(modal.item.contractValue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[10px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">CATATAN PPIC & LOGISTIK:</p>
                <p>1. Order ini telah diverifikasi oleh Sales Admin dan diteruskan ke PPIC untuk penjadwalan MPS & MRP.</p>
                <p>2. Surat Perintah Kerja (SPK) akan diterbitkan otomatis sesuai target serah terima {modal.item.deliveryDate}.</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 text-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">Sales & Marketing,</p>
                  <div className="h-14"></div>
                  <p className="font-bold text-slate-900 underline">Budi Santoso</p>
                  <p className="text-[10px] text-slate-500">Sales Engineer</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">PPIC & Operasional,</p>
                  <div className="h-14"></div>
                  <p className="font-bold text-slate-900 underline">Ahmad Dahlan</p>
                  <p className="text-[10px] text-slate-500">PPIC Manager</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Dikonfirmasi Oleh Klien,</p>
                  <div className="h-14"></div>
                  <p className="font-bold text-slate-900 underline">{modal.item.customer}</p>
                  <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal 
          open 
          title={modal.type === "add" ? "Buat Sales Order Baru" : `Edit Sales Order — ${modal.item?.code}`} 
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Pelanggan *</label>
                <select 
                  className="select text-sm" 
                  value={form.customer ?? ""} 
                  onChange={e => setForm({ ...form, customer: e.target.value })}
                >
                  <option value="">Pilih pelanggan...</option>
                  {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Quotation Terkait</label>
                <select 
                  className="select text-sm" 
                  value={form.quotationId ?? ""} 
                  onChange={e => setForm({ ...form, quotationId: e.target.value })}
                >
                  <option value="">Tidak ada (Ref Langsung)</option>
                  {quotations.filter(q => q.status === "Approved").map(q => (
                    <option key={q.id} value={q.id}>{q.code} — {q.customer}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Nomor PO Pelanggan *</label>
                <input 
                  type="text" 
                  className="input text-sm font-mono" 
                  placeholder="Contoh: PO-KLIEN/2026/088"
                  value={form.poNumber ?? ""} 
                  onChange={e => setForm({ ...form, poNumber: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Nilai Kontrak (IDR) *</label>
                <input 
                  type="number" 
                  className="input text-sm font-mono" 
                  placeholder="Contoh: 250000000"
                  value={form.contractValue ?? ""} 
                  onChange={e => setForm({ ...form, contractValue: Number(e.target.value) })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Tanggal Order</label>
                <input 
                  type="date" 
                  className="input text-sm" 
                  value={form.date ?? ""} 
                  onChange={e => setForm({ ...form, date: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Target Pengiriman</label>
                <input 
                  type="date" 
                  className="input text-sm" 
                  value={form.deliveryDate ?? ""} 
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-xs mb-1.5 block font-medium">Ketentuan Pembayaran</label>
              <input 
                className="input text-sm" 
                value={form.paymentTerms ?? ""} 
                onChange={e => setForm({ ...form, paymentTerms: e.target.value })} 
                placeholder="Contoh: 30% DP, 40% Progress, 30% FAT / Delivery" 
              />
            </div>

            <div>
              <label className="text-text-secondary text-xs mb-1.5 block font-medium">Status Pesanan</label>
              <select 
                className="select text-sm" 
                value={form.status ?? "Active"} 
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {["Draft", "Active", "Completed", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-primary text-xs" onClick={requestSave}>
                Simpan Order
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Global Confirm Dialog */}
      <ConfirmDialog
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
