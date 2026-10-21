"use client";
import { useState, useMemo } from "react";
import { qcInspections as initialData, workOrders } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { 
  Plus, Eye, Pencil, CheckCircle2, XCircle, Clock, Search, 
  Printer, ArrowUpDown, Calendar, ShieldCheck, AlertTriangle 
} from "lucide-react";
import { PhotoEvidenceUpload, PhotoEvidenceItem, EVIDENCE_PRESETS } from "@/components/ui/PhotoEvidenceUpload";

type QCI = typeof initialData[0] & { photos?: PhotoEvidenceItem[] };

export default function InspectionsPage() {
  const [data, setData] = useState<QCI[]>(() => 
    initialData.map(q => {
      if (q.id === "QCI001") {
        return { ...q, photos: [...EVIDENCE_PRESETS.qc] };
      }
      return { ...q, photos: [] };
    })
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"code" | "serial" | "operation" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<{ type: "view" | "add" | "result" | "print"; item?: QCI } | null>(null);
  const [form, setForm] = useState<Partial<QCI>>({});
  const [resultPhotos, setResultPhotos] = useState<PhotoEvidenceItem[]>([]);
  const [addPhotos, setAddPhotos] = useState<PhotoEvidenceItem[]>([]);
  const [resultForm, setResultForm] = useState<{ status: string; result: string; notes: string }>({
    status: "Pass",
    result: "",
    notes: ""
  });

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
      const qu = search.toLowerCase();
      const matchSearch = !qu || 
        q.code.toLowerCase().includes(qu) || 
        q.serial.toLowerCase().includes(qu) || 
        q.operation.toLowerCase().includes(qu) ||
        q.inspector.toLowerCase().includes(qu);

      const matchStatus = statusFilter === "All" || q.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "2026-10") {
        matchPeriod = q.date.startsWith("2026-10");
      } else if (periodFilter === "2026-11") {
        matchPeriod = q.date.startsWith("2026-11");
      }

      return matchSearch && matchStatus && matchPeriod;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "code") cmp = a.code.localeCompare(b.code);
      else if (sortBy === "serial") cmp = a.serial.localeCompare(b.serial);
      else if (sortBy === "operation") cmp = a.operation.localeCompare(b.operation);
      else if (sortBy === "date") cmp = a.date.localeCompare(b.date);
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, statusFilter, periodFilter, sortBy, sortOrder]);

  const toggleSort = (col: "code" | "serial" | "operation" | "date") => {
    if (sortBy === col) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  const requestSaveAdd = () => {
    if (!form.serial || !form.operation) {
      toast.error("Validasi Gagal", "Serial number dan operasi wajib diisi.");
      return;
    }

    setConfirmConfig({
      open: true,
      title: "Buat Lembar Inspeksi QC Baru",
      description: `Daftarkan pengujian QC baru untuk unit serial ${form.serial} pada tahapan ${form.operation}?`,
      confirmText: "Ya, Daftarkan",
      variant: "info",
      onConfirm: () => {
        const newCode = `QCI-2026-${String(data.length + 1).padStart(3, "0")}`;
        const newItem: QCI = {
          id: `QCI${String(data.length + 1).padStart(3, "0")}`,
          code: newCode,
          workOrderId: form.workOrderId ?? "WO-001",
          serial: form.serial ?? "",
          operation: form.operation ?? "",
          inspector: form.inspector ?? "QC Inspector",
          date: form.date ?? new Date().toISOString().split("T")[0],
          status: "Pending",
          criteria: form.criteria ?? "Dimensi toleransi ±0.02mm, uji visual NDT bebas cacat",
          result: null,
          notes: form.notes ?? "",
          photos: addPhotos,
        };
        setData([newItem, ...data]);
        toast.success("Inspeksi Didaftarkan", `${newCode} siap dilakukan pemeriksaan fisik.`);
        setModal(null);
        setAddPhotos([]);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const requestSaveResult = () => {
    if (!resultForm.result) {
      toast.error("Validasi Gagal", "Ringkasan hasil inspeksi wajib diisi.");
      return;
    }
    const item = modal?.item;
    if (!item) return;

    const isFail = resultForm.status === "Fail";

    setConfirmConfig({
      open: true,
      title: `Konfirmasi Keputusan QC — ${resultForm.status.toUpperCase()}`,
      description: isFail
        ? `PERINGATAN: Menetapkan status 'Fail' pada serial ${item.serial} akan membekukan aliran produksi unit ini dan otomatis membuka tiket NCR (Non-Conformance Report). Lanjutkan?`
        : `Apakah Anda yakin ingin mengesahkan status ${resultForm.status} untuk unit serial ${item.serial}?`,
      confirmText: isFail ? "Ya, Tetapkan Fail & Buka NCR" : "Ya, Sahkan Hasil QC",
      variant: isFail ? "danger" : "success",
      onConfirm: () => {
        setData(data.map(q => {
          if (q.id !== item.id) return q;
          return {
            ...q,
            status: resultForm.status,
            result: resultForm.result,
            notes: resultForm.notes,
            photos: resultPhotos,
          };
        }));

        if (isFail) {
          toast.warning(
            "QC Fail Tercatat",
            `Serial ${item.serial} ditandai cacat. NCR otomatis diterbitkan ke departemen QA.`
          );
        } else {
          toast.success(
            "Hasil QC Disahkan",
            `Inspeksi ${item.code} disahkan dengan status ${resultForm.status}.`
          );
        }

        setModal(null);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control & Inspeksi Mutu"
        subtitle="Pencatatan pengujian dimensi presisi, toleransi teknis, uji NDT, dan sertifikasi kelayakan unit"
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
              <Printer size={15} /> Cetak Rekap QC
            </button>
            <button 
              className="btn-primary flex items-center gap-2 text-xs" 
              onClick={() => { 
                setForm({ 
                  status: "Pending",
                  date: new Date().toISOString().split("T")[0],
                  inspector: "Andi Saputra, A.Md."
                }); 
                setModal({ type: "add" }); 
              }}
            >
              <Plus size={16} /> Buat Lembar Inspeksi
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Menunggu Pengujian (Pending)", val: data.filter(q => q.status === "Pending").length, icon: <Clock size={16} className="text-accent-warning" />, cls: "text-accent-warning", border: "border-amber-500/20" },
          { label: "Lolos Uji (Pass)", val: data.filter(q => q.status === "Pass").length, icon: <CheckCircle2 size={16} className="text-accent-success" />, cls: "text-accent-success", border: "border-emerald-500/20" },
          { label: "Cacat / Gagal (Fail)", val: data.filter(q => q.status === "Fail").length, icon: <XCircle size={16} className="text-accent-alert" />, cls: "text-accent-alert", border: "border-rose-500/20" },
          { label: "Dispensasi Bersyarat", val: data.filter(q => q.status === "Conditional Approval").length, icon: <AlertTriangle size={16} className="text-orange-400" />, cls: "text-orange-400", border: "border-orange-500/20" },
        ].map(s => (
          <div key={s.label} className={`card ${s.border}`}>
            <div className="flex items-center gap-2 mb-1">
              {s.icon}
              <p className="text-text-secondary text-xs font-medium">{s.label}</p>
            </div>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter and Table Card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                className="input pl-9 text-xs" 
                placeholder="Cari kode, serial, operasi, atau inspektor..." 
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
              </select>
            </div>

            {/* Status Filter */}
            <select 
              className="select text-xs w-44" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status Hasil</option>
              {["Pending", "Pass", "Fail", "Conditional Approval"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="text-xs text-text-secondary font-mono">
            Menampilkan <span className="font-bold text-text-primary">{filteredAndSorted.length}</span> dari {data.length} pengujian
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg w-full">
          <table className="w-full text-sm min-w-[950px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-secondary text-xs">
                <th className="text-left py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("code")}>
                  <div className="flex items-center gap-1.5">No. QC <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("serial")}>
                  <div className="flex items-center gap-1.5">Serial Number <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("operation")}>
                  <div className="flex items-center gap-1.5">Tahapan Operasi <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-3.5 font-semibold whitespace-nowrap">Inspektor</th>
                <th className="text-left py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("date")}>
                  <div className="flex items-center gap-1.5">Tgl Uji <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-3.5 font-semibold whitespace-nowrap">Kriteria Penerimaan</th>
                <th className="text-left py-3 px-3.5 font-semibold whitespace-nowrap">Hasil Temuan</th>
                <th className="text-center py-3 px-3.5 font-semibold whitespace-nowrap">Status</th>
                <th className="text-right py-3 px-3.5 font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-secondary text-sm">
                    Tidak ada catatan inspeksi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(q => (
                  <tr key={q.id} className="table-row-hover group">
                    <td className="py-3 px-3.5 font-mono text-accent font-semibold text-xs whitespace-nowrap">
                      {q.code}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-text-primary text-xs font-bold whitespace-nowrap">
                      {q.serial}
                    </td>
                    <td className="py-3 px-3.5 text-text-primary font-medium max-w-[160px] truncate whitespace-nowrap" title={q.operation}>
                      {q.operation}
                    </td>
                    <td className="py-3 px-3.5 text-text-secondary text-xs whitespace-nowrap">
                      {q.inspector}
                    </td>
                    <td className="py-3 px-3.5 text-text-secondary text-xs font-mono whitespace-nowrap">
                      {q.date}
                    </td>
                    <td className="py-3 px-3.5 text-text-secondary text-xs max-w-[180px] truncate whitespace-nowrap" title={q.criteria}>
                      {q.criteria}
                    </td>
                    <td className="py-3 px-3.5 text-xs max-w-[140px] truncate font-mono whitespace-nowrap">
                      <span className={q.status === "Pass" ? "text-emerald-500" : q.status === "Fail" ? "text-rose-500 font-bold" : "text-text-secondary"}>
                        {q.result ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
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
                          title="Cetak Sertifikat QC" 
                          onClick={() => setModal({ type: "print", item: q })}
                        >
                          <Printer size={14} />
                        </button>
                        {q.status === "Pending" && (
                          <button 
                            className="btn-secondary py-1 px-2.5 text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10 font-medium cursor-pointer"
                            onClick={() => { 
                              setResultForm({ status: "Pass", result: "", notes: "" }); 
                              setResultPhotos(q.photos && q.photos.length > 0 ? [...q.photos] : [...EVIDENCE_PRESETS.qc]);
                              setModal({ type: "result", item: q }); 
                            }}
                          >
                            Input Hasil
                          </button>
                        )}
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
        <Modal open title={`Detail Hasil QC — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["No. Dokumen QC", modal.item.code],
                ["Nomor Seri Unit", modal.item.serial],
                ["Tahapan Fabrikasi", modal.item.operation],
                ["Petugas Inspektor", modal.item.inspector],
                ["Tanggal Pengujian", modal.item.date],
                ["Status Keputusan", modal.item.status],
                ["Standar Kriteria", modal.item.criteria],
                ["Hasil Temuan Fisik", modal.item.result ?? "Belum diuji"],
              ].map(([l, v]) => (
                <div key={l} className="bg-surface-2 rounded-lg p-3 border border-border">
                  <p className="text-text-secondary text-xs mb-1 font-medium">{l}</p>
                  <p className="text-text-primary font-medium text-sm">{v}</p>
                </div>
              ))}
            </div>

            {modal.item.notes && (
              <div className="bg-surface-2 rounded-lg p-3 border border-border">
                <p className="text-text-secondary text-xs mb-1 font-medium">Catatan / Deviasi Teknis</p>
                <p className="text-text-primary text-xs">{modal.item.notes}</p>
              </div>
            )}

            {/* Photo Evidence Section */}
            <div className="pt-2 border-t border-border/80">
              <PhotoEvidenceUpload
                readOnly
                photos={modal.item.photos || []}
                title="Dokumentasi Bukti Foto Pengujian QC"
                description="Arsip visual hasil pengujian dimensi dan inspeksi visual permukaan unit."
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button 
                className="btn-secondary flex items-center gap-1.5 text-xs"
                onClick={() => setModal({ type: "print", item: modal.item })}
              >
                <Printer size={14} /> Cetak Lembar Sertifikat QC
              </button>
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Result Modal */}
      {modal?.type === "result" && modal.item && (
        <Modal open title={`Pencatatan Hasil Pengujian — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="bg-surface-2 rounded-lg p-3 border border-border">
              <p className="text-text-secondary text-xs mb-0.5">Unit Teruji & Tahapan:</p>
              <p className="text-text-primary font-bold text-sm">{modal.item.operation} — Serial: {modal.item.serial}</p>
              <p className="text-text-secondary text-xs mt-1">Kriteria: {modal.item.criteria}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Keputusan QC *</label>
                <select 
                  className="select text-sm font-semibold" 
                  value={resultForm.status} 
                  onChange={e => setResultForm({ ...resultForm, status: e.target.value })}
                >
                  <option value="Pass">Pass (Lolos Sesuai Toleransi)</option>
                  <option value="Fail">Fail (Gagal / Deviasi di Luar Toleransi)</option>
                  <option value="Conditional Approval">Conditional (Dispensasi Rekayasa)</option>
                </select>
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Ringkasan Nilai Ukur *</label>
                <input 
                  className="input text-sm" 
                  placeholder="Contoh: Dimensi +0.01mm, lolos NDT 100%" 
                  value={resultForm.result} 
                  onChange={e => setResultForm({ ...resultForm, result: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-xs mb-1.5 block font-medium">Keterangan / Temuan Spesifik</label>
              <textarea 
                className="input min-h-[75px] resize-none text-sm" 
                placeholder="Rincian catatan inspeksi teknis untuk arsip penjaminan mutu..."
                value={resultForm.notes} 
                onChange={e => setResultForm({ ...resultForm, notes: e.target.value })} 
              />
            </div>

            {/* Photo Evidence Component */}
            <div className="pt-2 border-t border-border">
              <PhotoEvidenceUpload
                photos={resultPhotos}
                onChange={setResultPhotos}
                presetType="qc"
                title="Unggah Bukti Foto Hasil Pemeriksaan"
                description="Lampirkan foto pengukuran caliper, mikrometer, atau visual hasil las."
                defaultInspector={modal.item.inspector}
              />
            </div>

            {resultForm.status === "Fail" && (
              <div className="bg-accent-alert/10 border border-accent-alert/30 rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-accent-alert shrink-0 mt-0.5" />
                <p className="text-accent-alert text-xs font-semibold">
                  Peringatan: Menetapkan status 'Fail' akan membekukan aliran rute perakitan unit ini dan secara otomatis memicu pembukaan form NCR (Non-Conformance Report).
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-primary text-xs" onClick={requestSaveResult}>
                Sahkan Keputusan QC
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Printable QC Certificate Modal */}
      {modal?.type === "print" && modal.item && (
        <Modal open title={`Sertifikat Hasil Uji Mutu (QC) — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-xs text-text-secondary">Pratinjau lembar pengesahan Certificate of Quality Inspection resmi.</p>
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
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div className="space-y-1">
                  <span className="font-black text-xl tracking-tight text-blue-900 font-mono">PT. MANGGALA UTAMA INDONESIA</span>
                  <p className="text-[11px] text-slate-600">Departemen Quality Assurance & Metrology Inspection</p>
                  <p className="text-[10px] text-slate-500">Kawasan Industri Cikarang Blok B-12, Bekasi | Standar: ISO 9001:2015</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="inline-block px-3 py-1 bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    CERTIFICATE OF INSPECTION (COI)
                  </span>
                  <p className="font-mono font-bold text-xs text-slate-800 mt-1">{modal.item.code}</p>
                  <p className="text-[10px] text-slate-500">Tgl Sertifikasi: {modal.item.date}</p>
                </div>
              </div>

              {/* Inspection Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500">Nomor Seri Unit (Serial No):</p>
                  <p className="font-mono font-bold text-base text-slate-900">{modal.item.serial}</p>
                  <p className="text-slate-500 mt-1">Tahapan Fabrikasi / Operasi:</p>
                  <p className="font-semibold text-slate-800">{modal.item.operation}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-slate-500">Inspektor Penanggung Jawab:</p>
                  <p className="font-bold text-slate-800">{modal.item.inspector}</p>
                  <p className="text-slate-500 mt-1">Hasil Keputusan Pengujian:</p>
                  <span className={`inline-block px-3 py-0.5 rounded font-black font-mono text-sm ${modal.item.status === "Pass" ? "bg-emerald-100 text-emerald-800" : modal.item.status === "Fail" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                    {modal.item.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Parameters Table */}
              <div className="overflow-x-auto w-full border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3 border border-slate-900 w-10 text-center whitespace-nowrap">No</th>
                      <th className="py-2 px-3 border border-slate-900 whitespace-nowrap">Parameter Uji & Standar Toleransi</th>
                      <th className="py-2 px-3 border border-slate-900 whitespace-nowrap">Hasil Pengukuran Aktual</th>
                      <th className="py-2 px-3 border border-slate-900 text-center w-24 whitespace-nowrap">Kesesuaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-3 border border-slate-200 text-center font-mono whitespace-nowrap">1</td>
                      <td className="py-3 px-3 border border-slate-200 font-medium whitespace-nowrap">
                        Pemeriksaan Geometrik & Dimensi Kritis
                        <p className="text-[10px] text-slate-500 mt-0.5">{modal.item.criteria}</p>
                      </td>
                      <td className="py-3 px-3 border border-slate-200 font-mono font-semibold whitespace-nowrap">
                        {modal.item.result || "Semua toleransi tercapai"}
                      </td>
                      <td className="py-3 px-3 border border-slate-200 text-center font-bold text-emerald-700 whitespace-nowrap">
                        CONFORM
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 border border-slate-200 text-center font-mono whitespace-nowrap">2</td>
                      <td className="py-3 px-3 border border-slate-200 font-medium whitespace-nowrap">
                        Pemeriksaan Visual Cacat Permukaan (NDT)
                        <p className="text-[10px] text-slate-500 mt-0.5">Bebas dari retak las (crack), porosity, dan undercutting.</p>
                      </td>
                      <td className="py-3 px-3 border border-slate-200 font-mono text-slate-700 whitespace-nowrap">
                        100% Visual Test Clear
                      </td>
                      <td className="py-3 px-3 border border-slate-200 text-center font-bold text-emerald-700 whitespace-nowrap">
                        CONFORM
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Photographic Evidence Annex (if photos attached) */}
              {modal.item.photos && modal.item.photos.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Lampiran Dokumentasi Visual Mutu & Bukti Pemeriksaan
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {modal.item.photos.length} Berkas Bukti Foto Terverifikasi
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {modal.item.photos.map((photo, pIdx) => (
                      <div key={photo.id || pIdx} className="p-2 rounded border border-slate-200 bg-slate-50 flex gap-2.5 items-start">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={photo.url} 
                          alt={photo.title || "Bukti Uji"} 
                          className="w-24 h-18 object-cover rounded border border-slate-300 shrink-0" 
                        />
                        <div className="overflow-hidden space-y-0.5">
                          <p className="font-bold text-slate-900 text-[11px] truncate">{photo.title || "Bukti Inspeksi"}</p>
                          <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">{photo.caption || "Pemeriksaan visual fisik"}</p>
                          <p className="text-[9px] text-slate-400 font-mono pt-1">{photo.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 pt-8 text-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">Inspektor Penguji,</p>
                  <div className="h-14"></div>
                  <p className="font-bold text-slate-900 underline">{modal.item.inspector}</p>
                  <p className="text-[10px] text-slate-500">QC Inspector Specialist</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Mengetahui & Menyetujui,</p>
                  <div className="h-14"></div>
                  <p className="font-bold text-slate-900 underline">Ir. Dwi Cahyono, M.T.</p>
                  <p className="text-[10px] text-slate-500">Quality Assurance Manager</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Inspection Modal */}
      {modal?.type === "add" && (
        <Modal open title="Daftarkan Lembar Pengujian QC Baru" onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Serial Number Unit *</label>
                <input 
                  type="text" 
                  className="input text-sm font-mono" 
                  placeholder="Contoh: SN-TRF-001" 
                  value={form.serial ?? ""} 
                  onChange={e => setForm({ ...form, serial: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Tahapan Operasi *</label>
                <input 
                  type="text" 
                  className="input text-sm" 
                  placeholder="Contoh: Core Winding, Welding, Final Assembly" 
                  value={form.operation ?? ""} 
                  onChange={e => setForm({ ...form, operation: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Inspektor Penanggung Jawab</label>
                <input 
                  type="text" 
                  className="input text-sm" 
                  value={form.inspector ?? ""} 
                  onChange={e => setForm({ ...form, inspector: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Tanggal Inspeksi</label>
                <input 
                  type="date" 
                  className="input text-sm" 
                  value={form.date ?? ""} 
                  onChange={e => setForm({ ...form, date: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-xs mb-1.5 block font-medium">Kriteria Penerimaan Standar Mutu</label>
              <textarea 
                className="input min-h-[70px] resize-none text-sm" 
                placeholder="Contoh: Dimensi toleransi ±0.02mm, uji visual NDT bebas cacat las..."
                value={form.criteria ?? ""} 
                onChange={e => setForm({ ...form, criteria: e.target.value })} 
              />
            </div>

            {/* Photo Evidence in Add Modal */}
            <div className="pt-2 border-t border-border">
              <PhotoEvidenceUpload
                photos={addPhotos}
                onChange={setAddPhotos}
                presetType="qc"
                title="Lampiran Foto Awal / Gambar Kerja"
                description="Opsional: lampirkan foto benda uji sebelum inspeksi dimulai."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-primary text-xs" onClick={requestSaveAdd}>
                Simpan & Daftarkan
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
