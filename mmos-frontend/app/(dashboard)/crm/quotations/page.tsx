"use client";
import { useState, useMemo } from "react";
import { quotations as initialData, customers } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { 
  Plus, Pencil, Trash2, Search, FileText, Eye, Printer, 
  ArrowUpDown, Calendar, CheckCircle2, Send, Download 
} from "lucide-react";

type Quotation = typeof initialData[0];
const STATUSES = ["Draft", "Sent", "Approved", "Rejected", "Expired"];

export default function QuotationsPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"code" | "customer" | "date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<{ type: "add" | "edit" | "view" | "print"; item?: Quotation } | null>(null);
  const [form, setForm] = useState<Partial<Quotation>>({});
  
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
    let result = data.filter(q => {
      const matchSearch = q.code.toLowerCase().includes(search.toLowerCase()) ||
        q.customer.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === "all" || q.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "2026-10") {
        matchPeriod = q.date.startsWith("2026-10");
      } else if (periodFilter === "2026-11") {
        matchPeriod = q.date.startsWith("2026-11");
      } else if (periodFilter === "q4") {
        matchPeriod = q.date >= "2026-10-01" && q.date <= "2026-12-31";
      }

      return matchSearch && matchStatus && matchPeriod;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "code") cmp = a.code.localeCompare(b.code);
      else if (sortBy === "customer") cmp = a.customer.localeCompare(b.customer);
      else if (sortBy === "date") cmp = a.date.localeCompare(b.date);
      else if (sortBy === "total") cmp = a.total - b.total;
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, statusFilter, periodFilter, sortBy, sortOrder]);

  const toggleSort = (col: "code" | "customer" | "date" | "total") => {
    if (sortBy === col) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  const openAdd = () => { 
    setForm({ 
      status: "Draft", 
      revision: 1, 
      date: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      items: [] 
    }); 
    setModal({ type: "add" }); 
  };
  
  const openEdit = (item: Quotation) => { 
    setForm({ ...item }); 
    setModal({ type: "edit", item }); 
  };

  const requestSave = () => {
    if (!form.customer) {
      toast.error("Peringatan Validasi", "Nama pelanggan wajib dipilih.");
      return;
    }
    const isEdit = modal?.type === "edit";
    setConfirmConfig({
      open: true,
      title: isEdit ? "Konfirmasi Perubahan Quotation" : "Konfirmasi Buat Quotation Baru",
      description: isEdit 
        ? `Apakah Anda yakin ingin menyimpan perubahan pada quotation ${modal?.item?.code}? Revisi akan dicatat.`
        : `Apakah Anda yakin ingin menerbitkan draft quotation baru untuk ${form.customer}?`,
      confirmText: isEdit ? "Ya, Simpan Perubahan" : "Ya, Terbitkan Quotation",
      variant: "info",
      onConfirm: () => {
        if (modal?.type === "add") {
          const newQuo: Quotation = {
            id: `Q${String(data.length + 1).padStart(3, "0")}`,
            code: `QUO-2026-${String(data.length + 1).padStart(3, "0")}`,
            customer: form.customer ?? "",
            customerId: form.customerId ?? "CUST-001",
            date: form.date ?? new Date().toISOString().split("T")[0],
            validUntil: form.validUntil ?? "",
            status: form.status ?? "Draft",
            total: Number(form.total) || 0,
            revision: 1,
            items: form.items?.length ? form.items : [
              { product: "Custom Fabrication / Standard Work", qty: 1, unit: "Set", unitPrice: Number(form.total) || 0, total: Number(form.total) || 0 }
            ],
          };
          setData([newQuo, ...data]);
          toast.success("Quotation Berhasil Dibuat", `${newQuo.code} untuk ${newQuo.customer} telah tersimpan.`);
        } else if (modal?.type === "edit" && modal.item) {
          setData(data.map(q => q.id === modal.item!.id ? { ...q, ...form, revision: q.revision + 1 } as Quotation : q));
          toast.success("Quotation Diperbarui", `${modal.item.code} revisi ${modal.item.revision + 1} berhasil disimpan.`);
        }
        setModal(null);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const requestDelete = (quo: Quotation) => {
    setConfirmConfig({
      open: true,
      title: "Hapus Quotation?",
      description: `Apakah Anda yakin ingin menghapus ${quo.code} (${quo.customer}) senilai ${formatCurrency(quo.total)}? Dokumen yang dihapus tidak dapat dipulihkan.`,
      confirmText: "Ya, Hapus Quotation",
      variant: "danger",
      onConfirm: () => {
        setData(data.filter(q => q.id !== quo.id));
        toast.error("Quotation Dihapus", `Quotation ${quo.code} berhasil dihapus dari sistem.`);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const requestSend = (quo: Quotation) => {
    setConfirmConfig({
      open: true,
      title: "Kirim Quotation ke Klien?",
      description: `Kirim penawaran harga resmi ${quo.code} ke email perwakilan ${quo.customer}? Status akan diubah menjadi 'Sent'.`,
      confirmText: "Kirim Sekarang",
      variant: "info",
      onConfirm: () => {
        setData(data.map(q => q.id === quo.id ? { ...q, status: "Sent" } : q));
        toast.success("Quotation Terkirim", `Surat penawaran ${quo.code} telah dikirim ke ${quo.customer}.`);
        setConfirmConfig(prev => ({ ...prev, open: false }));
        if (modal?.item?.id === quo.id) {
          setModal({ type: "view", item: { ...quo, status: "Sent" } });
        }
      }
    });
  };

  const requestApprove = (quo: Quotation) => {
    setConfirmConfig({
      open: true,
      title: "Approve Penawaran (PO Diterima)?",
      description: `Klien telah menyetujui quotation ${quo.code}? Ini menandai penawaran sebagai 'Approved' dan siap diterbitkan Sales Order.`,
      confirmText: "Konfirmasi Disetujui",
      variant: "success",
      onConfirm: () => {
        setData(data.map(q => q.id === quo.id ? { ...q, status: "Approved" } : q));
        toast.success("Quotation Disetujui", `${quo.code} berhasil disetujui. Siap dikonversi ke Sales Order.`);
        setConfirmConfig(prev => ({ ...prev, open: false }));
        if (modal?.item?.id === quo.id) {
          setModal({ type: "view", item: { ...quo, status: "Approved" } });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surat Penawaran Harga (Quotations)"
        subtitle="Manajemen penawaran komersial, RAB jual klien, revisi, dan status persetujuan"
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
              <Printer size={15} /> Print Lembar Rekap
            </button>
            <button className="btn-primary flex items-center gap-2 text-xs" onClick={openAdd}>
              <Plus size={16} /> Buat Quotation Baru
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Draft Penawaran", status: "Draft", cls: "text-amber-500", border: "border-amber-500/20" },
          { label: "Terkirim (Review)", status: "Sent", cls: "text-blue-500", border: "border-blue-500/20" },
          { label: "Disetujui Klien", status: "Approved", cls: "text-emerald-500", border: "border-emerald-500/20" },
          { label: "Ditolak / Expired", status: "Rejected", cls: "text-rose-500", border: "border-rose-500/20" },
        ].map(s => {
          const list = data.filter(q => q.status === s.status);
          const totalVal = list.reduce((a, q) => a + q.total, 0);
          return (
            <div key={s.status} className={`card ${s.border} relative overflow-hidden`}>
              <p className="text-text-secondary text-xs mb-1 font-medium">{s.label}</p>
              <p className={`font-mono font-bold text-2xl ${s.cls}`}>{list.length}</p>
              <p className="text-text-secondary text-[11px] mt-1 font-mono truncate">{formatCurrency(totalVal)}</p>
            </div>
          );
        })}
      </div>

      {/* Filter and Table Card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                className="input pl-9 text-xs" 
                placeholder="Cari kode atau nama klien..." 
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
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="text-xs text-text-secondary font-mono">
            Menampilkan <span className="font-bold text-text-primary">{filteredAndSorted.length}</span> dari {data.length} dokumen
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-secondary text-xs">
                <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort("code")}>
                  <div className="flex items-center gap-1.5">No. Penawaran <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort("customer")}>
                  <div className="flex items-center gap-1.5">Pelanggan / Klien <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort("date")}>
                  <div className="flex items-center gap-1.5">Tgl Terbit <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-4 font-semibold">Masa Berlaku</th>
                <th className="text-center py-3 px-4 font-semibold">Revisi</th>
                <th className="text-right py-3 px-4 font-semibold cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort("total")}>
                  <div className="flex items-center justify-end gap-1.5">Nilai Total (IDR) <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-center py-3 px-4 font-semibold">Status</th>
                <th className="text-right py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary text-sm">
                    Tidak ada quotation yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(q => (
                  <tr key={q.id} className="table-row-hover group">
                    <td className="py-3 px-4 font-mono text-accent font-semibold text-xs">
                      {q.code}
                    </td>
                    <td className="py-3 px-4 text-text-primary font-medium">
                      {q.customer}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs font-mono">
                      {q.date}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs font-mono">
                      {q.validUntil}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-surface-2 text-text-secondary font-mono border border-border">
                        Rev.{q.revision}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-accent font-bold text-xs text-right">
                      {formatCurrency(q.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent transition-colors" 
                          title="Lihat Detail" 
                          onClick={() => setModal({ type: "view", item: q })}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent transition-colors" 
                          title="Cetak PDF Resmi" 
                          onClick={() => setModal({ type: "print", item: q })}
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent transition-colors" 
                          title="Edit Penawaran" 
                          onClick={() => openEdit(q)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-accent-alert transition-colors" 
                          title="Hapus Penawaran" 
                          onClick={() => requestDelete(q)}
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
        <Modal open title={`Detail Quotation — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Pelanggan / Klien", val: modal.item.customer },
                { label: "Tanggal Diterbitkan", val: modal.item.date },
                { label: "Batas Waktu Berlaku", val: modal.item.validUntil },
                { label: "Status Dokumen", val: <StatusBadge status={modal.item.status} /> },
                { label: "Revisi Ke", val: `Rev.${modal.item.revision}` },
                { label: "Total Nilai Penawaran", val: <span className="font-mono text-accent font-bold text-base">{formatCurrency(modal.item.total)}</span> },
              ].map((f, i) => (
                <div key={i} className="bg-surface-2 rounded-lg p-3 border border-border">
                  <p className="text-text-secondary text-xs mb-1">{f.label}</p>
                  <div className="text-text-primary font-medium text-sm">{f.val}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <FileText size={15} className="text-accent" /> Rincian Item Pekerjaan / Produk
                </h4>
                <span className="text-xs text-text-secondary font-mono">{modal.item.items?.length || 0} item terdaftar</span>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-secondary text-xs">
                      <th className="text-left py-2 px-3">Deskripsi Produk / Jasa</th>
                      <th className="text-center py-2 px-3">Qty</th>
                      <th className="text-center py-2 px-3">Satuan</th>
                      <th className="text-right py-2 px-3">Harga Satuan (IDR)</th>
                      <th className="text-right py-2 px-3">Subtotal (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {modal.item.items && modal.item.items.length > 0 ? (
                      modal.item.items.map((item, i) => (
                        <tr key={i} className="hover:bg-surface-2/40">
                          <td className="py-2.5 px-3 text-text-primary font-medium">{item.product}</td>
                          <td className="py-2.5 px-3 font-mono text-center">{item.qty}</td>
                          <td className="py-2.5 px-3 text-text-secondary text-center">{item.unit}</td>
                          <td className="py-2.5 px-3 font-mono text-text-secondary text-xs text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2.5 px-3 font-mono text-accent font-bold text-xs text-right">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-text-secondary text-xs">
                          Pekerjaan fabrikasi sesuai spesifikasi teknik terlampir
                        </td>
                      </tr>
                    )}
                    <tr className="bg-surface-2 font-semibold">
                      <td colSpan={4} className="py-2.5 px-3 text-right text-text-primary text-sm">Total Penawaran Sebelum PPN</td>
                      <td className="py-2.5 px-3 font-mono text-accent font-bold text-right text-sm">{formatCurrency(modal.item.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <button 
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                  onClick={() => setModal({ type: "print", item: modal.item })}
                >
                  <Printer size={14} /> Cetak Lembar Penawaran PDF
                </button>
                {modal.item.status === "Draft" && (
                  <button 
                    className="btn-secondary flex items-center gap-1.5 text-xs text-blue-600 border-blue-600/30 hover:bg-blue-50"
                    onClick={() => requestSend(modal.item!)}
                  >
                    <Send size={14} /> Kirim ke Klien
                  </button>
                )}
                {modal.item.status === "Sent" && (
                  <button 
                    className="btn-secondary flex items-center gap-1.5 text-xs text-emerald-600 border-emerald-600/30 hover:bg-emerald-50"
                    onClick={() => requestApprove(modal.item!)}
                  >
                    <CheckCircle2 size={14} /> Tandai Disetujui Klien
                  </button>
                )}
              </div>
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Printable Quotation Document Modal */}
      {modal?.type === "print" && modal.item && (
        <Modal open title={`Cetak Surat Penawaran Resmi — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-xs text-text-secondary">Pratinjau dokumen cetak resmi penawaran harga untuk klien.</p>
              <button 
                className="btn-primary flex items-center gap-2 text-xs"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Cetak / Unduh PDF
              </button>
            </div>

            {/* Official Paper Layout */}
            <div className="bg-white text-slate-900 p-8 rounded-lg border border-slate-200 shadow-sm font-sans text-xs space-y-6">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tight text-blue-900 font-mono">PT. MANGGALA UTAMA INDONESIA</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Precision Engineering, Heavy Machining & Industrial Fabrication</p>
                  <p className="text-[10px] text-slate-500">Kawasan Industri Cikarang Blok B-12, Bekasi, Jawa Barat | Telp: (021) 8983-0021 | info@manggala.co.id</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="inline-block px-2.5 py-1 bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    SURAT PENAWARAN HARGA
                  </span>
                  <p className="font-mono font-bold text-xs text-slate-800 mt-1">{modal.item.code}</p>
                  <p className="text-[10px] text-slate-500">Revisi: {modal.item.revision} | Tanggal: {modal.item.date}</p>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kepada Yth:</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{modal.item.customer}</p>
                  <p className="text-slate-600 text-[11px]">Departemen Procurement & Engineering</p>
                  <p className="text-slate-500 text-[11px]">Indonesia</p>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500 text-[11px]">Batas Waktu Penawaran: </span>
                    <span className="font-semibold text-slate-800">{modal.item.validUntil}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Mata Uang: </span>
                    <span className="font-semibold text-slate-800">IDR (Rupiah)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Status Dokumen: </span>
                    <span className="font-bold text-blue-700">{modal.item.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3 border border-slate-900 text-center w-8">No</th>
                      <th className="py-2 px-3 border border-slate-900">Deskripsi Pekerjaan / Produk</th>
                      <th className="py-2 px-3 border border-slate-900 text-center w-16">Qty</th>
                      <th className="py-2 px-3 border border-slate-900 text-center w-16">Satuan</th>
                      <th className="py-2 px-3 border border-slate-900 text-right w-36">Harga Satuan (IDR)</th>
                      <th className="py-2 px-3 border border-slate-900 text-right w-36">Jumlah (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {(modal.item.items && modal.item.items.length > 0 ? modal.item.items : [
                      { product: "Pekerjaan fabrikasi presisi sesuai spesifikasi teknis", qty: 1, unit: "Set", unitPrice: modal.item.total, total: modal.item.total }
                    ]).map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 border border-slate-200 text-center font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 border border-slate-200 font-medium">{row.product}</td>
                        <td className="py-2.5 px-3 border border-slate-200 text-center font-mono">{row.qty}</td>
                        <td className="py-2.5 px-3 border border-slate-200 text-center">{row.unit}</td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-mono">{formatCurrency(row.unitPrice)}</td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-mono font-semibold">{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={5} className="py-2.5 px-3 border border-slate-200 text-right uppercase text-[11px]">Subtotal DPP</td>
                      <td className="py-2.5 px-3 border border-slate-200 text-right font-mono">{formatCurrency(modal.item.total)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={5} className="py-2 px-3 border border-slate-200 text-right text-[11px] text-slate-600">PPN 11%</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono text-slate-600">{formatCurrency(Math.round(modal.item.total * 0.11))}</td>
                    </tr>
                    <tr className="bg-blue-50 font-black text-slate-900 text-sm">
                      <td colSpan={5} className="py-3 px-3 border border-slate-300 text-right uppercase">Total Penawaran Termasuk PPN</td>
                      <td className="py-3 px-3 border border-slate-300 text-right font-mono text-blue-900">{formatCurrency(Math.round(modal.item.total * 1.11))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms & Conditions */}
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600 pt-2 border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-800 mb-1">SYARAT & KETENTUAN PENAWARAN:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Harga belum termasuk biaya uji pihak ketiga khusus jika disyaratkan.</li>
                    <li>Termin Pembayaran: DP 30% saat PO terbit, 70% setelah FAT & Surat Jalan.</li>
                    <li>Waktu Pengerjaan: Sesuai jadwal manufaktur (est. 45 - 60 hari kerja).</li>
                    <li>Masa garansi produk: 12 bulan setelah tanggal serah terima.</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 mb-1">REKENING PEMBAYARAN RESMI:</p>
                  <p className="font-mono">Bank Mandiri Cabang Cikarang Industri</p>
                  <p className="font-mono font-bold text-slate-800">No. Rek: 156-00-1928374-1</p>
                  <p>a/n PT. Manggala Utama Indonesia</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">Dibuat & Diajukan Oleh,</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-900 underline">Budi Santoso, S.T.</p>
                  <p className="text-[10px] text-slate-500">Commercial & Sales Engineering Head</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Disetujui Oleh Direksi,</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-900 underline">Ir. Hendra Gunawan, M.T.</p>
                  <p className="text-[10px] text-slate-500">Direktur Operasional & Manufaktur</p>
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
          title={modal.type === "add" ? "Buat Quotation Baru" : `Edit Quotation — ${modal.item?.code}`} 
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block font-medium">Pelanggan / Klien *</label>
              <select 
                className="select text-sm" 
                value={form.customer ?? ""} 
                onChange={e => setForm({ ...form, customer: e.target.value })}
              >
                <option value="">Pilih pelanggan...</option>
                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Tanggal Diterbitkan</label>
                <input 
                  type="date" 
                  className="input text-sm" 
                  value={form.date ?? ""} 
                  onChange={e => setForm({ ...form, date: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Batas Waktu Berlaku</label>
                <input 
                  type="date" 
                  className="input text-sm" 
                  value={form.validUntil ?? ""} 
                  onChange={e => setForm({ ...form, validUntil: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Total Nilai Penawaran (IDR) *</label>
                <input 
                  type="number" 
                  className="input text-sm font-mono" 
                  placeholder="Contoh: 150000000"
                  value={form.total ?? ""} 
                  onChange={e => setForm({ ...form, total: Number(e.target.value) })} 
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Status Penawaran</label>
                <select 
                  className="select text-sm" 
                  value={form.status ?? "Draft"} 
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-primary text-xs" onClick={requestSave}>
                Simpan Penawaran
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
