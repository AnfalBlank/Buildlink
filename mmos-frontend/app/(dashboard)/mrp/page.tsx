"use client";
import { useState } from "react";
import { mrpData as initialData, inventory } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  RefreshCw, AlertTriangle, CheckCircle2, ShoppingCart, Eye, Search,
  Printer, Calendar, ArrowUpDown, Filter, Clock, PackageCheck, Layers
} from "lucide-react";

type MRP = typeof initialData[0];

export default function MRPPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("requiredDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<MRP | null>(null);
  const [lastRun, setLastRun] = useState("2026-10-20 08:30");
  const [isRunning, setIsRunning] = useState(false);

  // ConfirmDialog State
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
    .filter(m => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.material.toLowerCase().includes(q) ||
        m.projectId.toLowerCase().includes(q) ||
        m.productionOrderId.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || m.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "October") {
        matchPeriod = m.requiredDate.startsWith("2026-10");
      } else if (periodFilter === "November") {
        matchPeriod = m.requiredDate.startsWith("2026-11");
      }

      return matchSearch && matchStatus && matchPeriod;
    })
    .sort((a, b) => {
      let valA = a[sortField as keyof MRP] ?? "";
      let valB = b[sortField as keyof MRP] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const shortages = data.filter(m => m.status === "Shortage");
  const okItems = data.filter(m => m.status === "OK");

  // Run MRP calculation action
  const handleRequestRunMRP = () => {
    setConfirmState({
      open: true,
      title: "Jalankan Kalkulasi MRP",
      message: "Apakah Anda yakin ingin menjalankan ulang algoritma MRP untuk seluruh pesanan produksi dan stok gudang terkini?",
      variant: "primary",
      confirmText: "Ya, Jalankan Sekarang",
      action: () => executeRunMRP(),
    });
  };

  const executeRunMRP = () => {
    setIsRunning(true);
    setConfirmState(null);
    setTimeout(() => {
      setIsRunning(false);
      setLastRun(
        new Date().toLocaleString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      toast.success("Kalkulasi MRP Selesai", "Kebutuhan bersih material telah disinkronisasi dengan jadwal produksi.");
    }, 1000);
  };

  // Create PR for shortages
  const handleRequestCreatePR = () => {
    setConfirmState({
      open: true,
      title: "Buat Purchase Request Otomatis",
      message: `Terbitkan Purchase Request (PR) otomatis untuk ${shortages.length} material yang mengalami shortage?`,
      variant: "warning",
      confirmText: "Terbitkan PR",
      action: () => {
        setConfirmState(null);
        toast.success(
          "Purchase Request Diterbitkan",
          `PR otomatis untuk ${shortages.length} material telah diteruskan ke Departemen Pengadaan.`
        );
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Material Requirements Planning (MRP)"
        subtitle="Analisis kebutuhan bersih material berdasarkan jadwal produksi, stok gudang, dan lead time pengadaan"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#64748B]">
              <Clock size={13} className="text-[#2563EB]" />
              <span>Update Terakhir: <strong className="text-[#0F172A] font-mono">{lastRun}</strong></span>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#2563EB]"
              title="Cetak Laporan MRP"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>

            <button
              onClick={handleRequestRunMRP}
              disabled={isRunning}
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <RefreshCw size={15} className={isRunning ? "animate-spin" : ""} />
              <span>{isRunning ? "Mengkalkulasi..." : "Run MRP"}</span>
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 hover:border-[#CBD5E1] transition-all">
          <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">Total Item Analisis</p>
          <div className="flex items-baseline justify-between">
            <p className="font-mono font-bold text-2xl text-[#2563EB]">{data.length}</p>
            <span className="text-xs text-[#64748B]">Material Terdaftar</span>
          </div>
        </div>

        <div className="card p-4 border-[#FECACA] bg-[#FEF2F2]/30 hover:border-[#F87171] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={15} className="text-[#DC2626]" />
            <p className="text-[#DC2626] text-xs font-bold uppercase tracking-wider">Defisit / Shortage</p>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-mono font-bold text-2xl text-[#DC2626]">{shortages.length}</p>
            <span className="text-xs text-[#DC2626] font-medium">Perlu Dipesan Segera</span>
          </div>
        </div>

        <div className="card p-4 border-[#BBF7D0] bg-[#F0FDF4]/30 hover:border-[#4ADE80] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={15} className="text-[#16A34A]" />
            <p className="text-[#16A34A] text-xs font-bold uppercase tracking-wider">Kebutuhan Terpenuhi (OK)</p>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-mono font-bold text-2xl text-[#16A34A]">{okItems.length}</p>
            <span className="text-xs text-[#16A34A] font-medium">Stok Mencukupi</span>
          </div>
        </div>

        <div className="card p-4 hover:border-[#CBD5E1] transition-all">
          <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">Rekomendasi PO Baru</p>
          <div className="flex items-baseline justify-between">
            <p className="font-mono font-bold text-2xl text-[#D97706]">
              {data.filter(m => m.recommendedPO > 0).length}
            </p>
            <span className="text-xs text-[#D97706] font-medium">Item PO Otomatis</span>
          </div>
        </div>
      </div>

      {/* Shortage Alert Banner */}
      {shortages.length > 0 && (
        <div className="bg-gradient-to-r from-[#FEF2F2] to-white border border-[#FECACA] border-l-4 border-l-[#DC2626] rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#991B1B]">
                Peringatan: Terdeteksi {shortages.length} Kebutuhan Material Mengalami Shortage!
              </h3>
              <p className="text-xs text-[#7F1D1D] mt-0.5 leading-relaxed">
                Segera terbitkan Purchase Request (PR) ke bagian pengadaan untuk menghindari penundaan jadwal fabrikasi shop-floor.
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestCreatePR}
            className="btn-primary !bg-[#DC2626] hover:!bg-[#B91C1C] flex items-center gap-2 text-xs font-semibold shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all !rounded-xl !py-2.5 !px-4"
          >
            <ShoppingCart size={15} />
            <span>Terbitkan PR untuk Shortage</span>
          </button>
        </div>
      )}

      {/* MRP Table View */}
      <div className="card">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="input !pl-10"
                placeholder="Cari material atau kode proyek..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={15} className="text-[#64748B] shrink-0" />
              <select
                className="select w-40"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">Semua Status</option>
                <option value="Shortage">Hanya Shortage</option>
                <option value="OK">Hanya OK</option>
              </select>
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
                <option value="November">Bulan Depan (Nov 2026)</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-[#64748B]">
            Menampilkan <strong className="text-[#0F172A]">{filtered.length}</strong> kebutuhan material
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="table min-w-[1100px]">
            <thead>
              <tr>
                <th onClick={() => handleSort("material")} className="cursor-pointer hover:text-[#2563EB]">
                  MATERIAL & SPESIFIKASI
                </th>
                <th>PROYEK / PO</th>
                <th onClick={() => handleSort("grossRequirement")} className="cursor-pointer hover:text-[#2563EB]">
                  GROSS REQ
                </th>
                <th>STOK GUDANG</th>
                <th>TERALOKASI</th>
                <th>PO BERJALAN</th>
                <th onClick={() => handleSort("netRequirement")} className="cursor-pointer hover:text-[#2563EB]">
                  NET REQUIREMENT
                </th>
                <th onClick={() => handleSort("requiredDate")} className="cursor-pointer hover:text-[#2563EB]">
                  TARGET TANGGAL
                </th>
                <th>LEAD TIME</th>
                <th>REKOMENDASI PO</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-[#94A3B8]">
                    Tidak ada material yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map(m => (
                  <tr
                    key={m.id}
                    className={`hover:bg-[#F8FAFC]/80 transition-colors ${
                      m.status === "Shortage" ? "bg-[#FEF2F2]/30" : ""
                    }`}
                  >
                    <td className="font-semibold text-[#0F172A]">
                      <div>{m.material}</div>
                      <span className="text-[10px] text-[#64748B] font-mono">{m.materialId}</span>
                    </td>
                    <td className="text-xs font-mono">
                      <div className="font-semibold text-[#2563EB]">{m.projectId}</div>
                      <div className="text-[#64748B]">{m.productionOrderId}</div>
                    </td>
                    <td className="font-mono font-medium text-[#0F172A]">{m.grossRequirement}</td>
                    <td className="font-mono text-[#059669] font-medium">{m.onHand}</td>
                    <td className="font-mono text-[#D97706]">{m.reserved}</td>
                    <td className="font-mono text-[#2563EB]">{m.scheduledReceipt}</td>
                    <td>
                      <span
                        className={`font-mono font-bold text-sm ${
                          m.netRequirement > 0 ? "text-[#DC2626]" : "text-[#16A34A]"
                        }`}
                      >
                        {m.netRequirement}
                      </span>
                    </td>
                    <td className="text-xs text-[#475569] font-mono">{m.requiredDate}</td>
                    <td className="font-mono text-xs text-[#64748B]">{m.leadTime} hari</td>
                    <td>
                      {m.recommendedPO > 0 ? (
                        <span className="font-mono font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                          +{m.recommendedPO}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          m.status === "Shortage"
                            ? "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]"
                            : "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]"
                        }`}
                      >
                        {m.status === "Shortage" ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                        <span>{m.status}</span>
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelected(m)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                        title="Lihat Kalkulasi & Simulasi"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MRP Calculation Detail Modal */}
      {selected && (
        <Modal open title={`Kalkulasi Logika MRP — ${selected.material}`} onClose={() => setSelected(null)} size="md">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers size={14} />
                Formula Gross-to-Net Breakdown
              </h4>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Kebutuhan Kasar (Gross Requirement)</span>
                  <span className="font-mono font-bold text-[#0F172A]">{selected.grossRequirement}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9] text-[#16A34A]">
                  <span>Stok Fisik Tersedia di Gudang (On-hand)</span>
                  <span className="font-mono font-semibold">-{selected.onHand}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9] text-[#D97706]">
                  <span>Alokasi Pesanan Lain (Reserved)</span>
                  <span className="font-mono font-semibold">+{selected.reserved}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9] text-[#2563EB]">
                  <span>Penerimaan Terjadwal PO Berjalan (Scheduled Receipts)</span>
                  <span className="font-mono font-semibold">-{selected.scheduledReceipt}</span>
                </div>
                <div className="pt-2 flex justify-between items-center font-bold">
                  <span className={selected.netRequirement > 0 ? "text-[#DC2626]" : "text-[#16A34A]"}>
                    Kebutuhan Bersih (Net Requirement)
                  </span>
                  <span
                    className={`font-mono text-xl ${
                      selected.netRequirement > 0 ? "text-[#DC2626]" : "text-[#16A34A]"
                    }`}
                  >
                    {selected.netRequirement}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                <p className="text-[#64748B] text-xs font-medium">Batas Waktu Dibutuhkan</p>
                <p className="font-mono font-bold text-sm text-[#0F172A] mt-1">{selected.requiredDate}</p>
              </div>

              <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                <p className="text-[#64748B] text-xs font-medium">Lead Time Supplier</p>
                <p className="font-mono font-bold text-sm text-[#0F172A] mt-1">{selected.leadTime} Hari Kerja</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1E40AF]">Rekomendasi Pemesanan PO</p>
                <p className="text-[11px] text-[#3B82F6] mt-0.5">Jumlah kuantiti yang disarankan untuk dipesan</p>
              </div>
              <p className="font-mono font-bold text-lg text-[#2563EB]">
                {selected.recommendedPO > 0 ? `${selected.recommendedPO} Unit` : "0 (Stok Cukup)"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
              <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setSelected(null)}>
                Tutup
              </button>
              {selected.recommendedPO > 0 && (
                <button
                  className="btn-primary !rounded-xl !py-2 !px-4 text-sm flex items-center gap-1.5"
                  onClick={() => {
                    toast.success("Draft PO Dibuat", `Draft pesanan untuk ${selected.material} dibuat.`);
                    setSelected(null);
                  }}
                >
                  <ShoppingCart size={15} />
                  <span>Buat PO Kebutuhan</span>
                </button>
              )}
            </div>
          </div>
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
