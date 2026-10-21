"use client";
import { useState, useMemo } from "react";
import { inventory as initialData } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { 
  Search, ArrowUpDown, Plus, AlertTriangle, Printer, 
  Warehouse, CheckCircle2, SlidersHorizontal, FileSpreadsheet 
} from "lucide-react";

type Inv = typeof initialData[0];

export default function InventoryPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"materialId" | "material" | "available" | "total">("material");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [modal, setModal] = useState<{ type: "adjust" | "reserve" | "print"; item?: Inv } | null>(null);
  const [adjForm, setAdjForm] = useState<{ qty: string; reason: string; type: "Add" | "Remove" }>({
    qty: "",
    reason: "",
    type: "Add"
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

  const warehouses = useMemo(() => {
    return Array.from(new Set(data.map(i => i.warehouse)));
  }, [data]);

  const filteredAndSorted = useMemo(() => {
    let result = data.filter(i => {
      const matchSearch = i.material.toLowerCase().includes(search.toLowerCase()) ||
        i.materialId.toLowerCase().includes(search.toLowerCase());
      
      const matchWarehouse = warehouseFilter === "all" || i.warehouse === warehouseFilter;

      let matchStatus = true;
      if (stockStatusFilter === "zero") matchStatus = i.available === 0;
      else if (stockStatusFilter === "low") matchStatus = i.available > 0 && i.available <= 10;
      else if (stockStatusFilter === "hold") matchStatus = i.qualityHold > 0;

      return matchSearch && matchWarehouse && matchStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "materialId") cmp = a.materialId.localeCompare(b.materialId);
      else if (sortBy === "material") cmp = a.material.localeCompare(b.material);
      else if (sortBy === "available") cmp = a.available - b.available;
      else if (sortBy === "total") cmp = a.total - b.total;
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, warehouseFilter, stockStatusFilter, sortBy, sortOrder]);

  const toggleSort = (col: "materialId" | "material" | "available" | "total") => {
    if (sortBy === col) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  const requestAdjust = () => {
    const qty = Number(adjForm.qty);
    if (!qty || !adjForm.reason || !modal?.item) return;

    const item = modal.item;
    const delta = adjForm.type === "Add" ? qty : -qty;
    const nextAvailable = Math.max(0, item.available + delta);
    const nextTotal = Math.max(0, item.total + delta);

    setConfirmConfig({
      open: true,
      title: "Konfirmasi Penyesuaian Stok Fisik",
      description: `Apakah Anda yakin ingin melakukan ${adjForm.type === "Add" ? "penambahan" : "pengurangan"} stok untuk ${item.material} (${item.materialId}) sebesar ${qty} ${item.uom}? Alasan: "${adjForm.reason}". Stok baru akan menjadi ${nextAvailable} ${item.uom}.`,
      confirmText: "Ya, Terapkan Penyesuaian",
      variant: adjForm.type === "Add" ? "info" : "warning",
      onConfirm: () => {
        setData(data.map(i => {
          if (i.id !== item.id) return i;
          return {
            ...i,
            available: nextAvailable,
            total: nextTotal,
            lastUpdated: new Date().toISOString().split("T")[0]
          };
        }));
        toast.success(
          "Stok Berhasil Disesuaikan",
          `${item.material}: ${adjForm.type === "Add" ? "+" : "-"}${qty} ${item.uom} tercatat.`
        );
        setModal(null);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const lowStock = data.filter(i => i.available === 0 && i.total > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saldo & Inventaris Gudang"
        subtitle="Manajemen stok material, lokasi gudang, alokasi reservasi produksi, dan penyesuaian stok opname"
        actions={
          <div className="flex items-center gap-2.5">
            <button 
              className="btn-secondary flex items-center gap-2 text-xs"
              onClick={() => setModal({ type: "print" })}
            >
              <Printer size={15} /> Cetak Laporan Saldo Stok
            </button>
            <button 
              className="btn-primary flex items-center gap-2 text-xs"
              onClick={() => {
                if (data.length > 0) {
                  setAdjForm({ qty: "", reason: "", type: "Add" });
                  setModal({ type: "adjust", item: data[0] });
                }
              }}
            >
              <Plus size={16} /> Stock Adjustment
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-text-secondary text-xs mb-1 font-medium">Total SKU Material</p>
          <p className="font-mono font-bold text-2xl text-accent">{data.length}</p>
          <p className="text-text-secondary text-xs mt-1">Terdaftar aktif di sistem</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-xs mb-1 font-medium">Material Siap Pakai (Available)</p>
          <p className="font-mono font-bold text-2xl text-accent-success">{data.filter(i => i.available > 0).length}</p>
          <p className="text-emerald-500 text-xs mt-1">Stok mencukupi untuk SPK</p>
        </div>
        <div className="card border-accent-alert/30">
          <p className="text-accent-alert text-xs mb-1 flex items-center gap-1 font-medium">
            <AlertTriangle size={13} /> Stok Habis (Zero Available)
          </p>
          <p className="font-mono font-bold text-2xl text-accent-alert">{data.filter(i => i.available === 0).length}</p>
          <p className="text-rose-500 text-xs mt-1">Perlu pemesanan PO segera</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-xs mb-1 font-medium">Karantina QC (Hold)</p>
          <p className="font-mono font-bold text-2xl text-accent-warning">{data.filter(i => i.qualityHold > 0).length}</p>
          <p className="text-amber-500 text-xs mt-1">Menunggu approval inspeksi</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-accent-alert/10 border border-accent-alert/30 border-l-4 border-l-accent-alert rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-accent-alert shrink-0" />
            <p className="text-accent-alert text-xs font-semibold">
              Perhatian: {lowStock.length} material memiliki stok tersedia = 0 unit. Seluruh stok terikat pada reservasi SPK berjalan.
            </p>
          </div>
          <button 
            className="text-xs font-semibold underline text-accent-alert hover:opacity-80"
            onClick={() => setStockStatusFilter("zero")}
          >
            Lihat Item Kritis
          </button>
        </div>
      )}

      {/* Filter and Table Card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                className="input pl-9 text-xs" 
                placeholder="Cari kode material atau deskripsi..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>

            {/* Gudang Filter */}
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border px-2.5 py-1.5 rounded-lg text-xs">
              <Warehouse size={14} className="text-text-secondary" />
              <span className="text-text-secondary">Lokasi:</span>
              <select 
                value={warehouseFilter} 
                onChange={e => setWarehouseFilter(e.target.value)}
                className="bg-transparent border-0 text-text-primary text-xs focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Lokasi Gudang</option>
                {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Status Filter */}
            <select 
              className="select text-xs w-36"
              value={stockStatusFilter}
              onChange={e => setStockStatusFilter(e.target.value)}
            >
              <option value="all">Semua Kondisi</option>
              <option value="zero">Habis (0)</option>
              <option value="low">Menipis (≤ 10)</option>
              <option value="hold">Quality Hold</option>
            </select>
          </div>

          <div className="text-xs text-text-secondary font-mono">
            Menampilkan <span className="font-bold text-text-primary">{filteredAndSorted.length}</span> dari {data.length} material
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-secondary text-xs">
                <th className="text-left py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("materialId")}>
                  <div className="flex items-center gap-1.5">Kode Material <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("material")}>
                  <div className="flex items-center gap-1.5">Nama & Spesifikasi Material <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-3 px-3.5 font-semibold whitespace-nowrap">Gudang / Rak</th>
                <th className="text-right py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("available")}>
                  <div className="flex items-center justify-end gap-1.5">Available <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-right py-3 px-3.5 font-semibold whitespace-nowrap">Reserved (SPK)</th>
                <th className="text-right py-3 px-3.5 font-semibold whitespace-nowrap">QC Hold</th>
                <th className="text-right py-3 px-3.5 font-semibold cursor-pointer hover:text-accent transition-colors whitespace-nowrap" onClick={() => toggleSort("total")}>
                  <div className="flex items-center justify-end gap-1.5">Total Stok <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-center py-3 px-3.5 font-semibold whitespace-nowrap">Satuan</th>
                <th className="text-left py-3 px-3.5 font-semibold whitespace-nowrap">Update Terakhir</th>
                <th className="text-right py-3 px-3.5 font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-text-secondary text-sm">
                    Tidak ada material yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(inv => (
                  <tr key={inv.id} className="table-row-hover group">
                    <td className="py-3 px-3.5 font-mono text-accent font-semibold text-xs">
                      {inv.materialId}
                    </td>
                    <td className="py-3 px-3.5 text-text-primary font-medium">
                      {inv.material}
                    </td>
                    <td className="py-3 px-3.5 text-text-secondary text-xs">
                      {inv.warehouse}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <span className={`font-mono font-bold text-sm ${inv.available > 0 ? "text-accent-success" : "text-accent-alert bg-rose-500/10 px-2 py-0.5 rounded"}`}>
                        {inv.available}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-accent-warning text-right text-xs">
                      {inv.reserved}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {inv.qualityHold > 0 ? (
                        <span className="font-mono text-amber-500 font-semibold text-xs bg-amber-500/10 px-2 py-0.5 rounded">
                          {inv.qualityHold}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs font-mono">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-text-primary text-right text-sm">
                      {inv.total}
                    </td>
                    <td className="py-3 px-3.5 text-center text-text-secondary text-xs">
                      {inv.uom}
                    </td>
                    <td className="py-3 px-3.5 text-text-secondary text-xs font-mono">
                      {inv.lastUpdated}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button 
                        className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
                        onClick={() => { 
                          setAdjForm({ qty: "", reason: "", type: "Add" }); 
                          setModal({ type: "adjust", item: inv }); 
                        }}
                      >
                        <ArrowUpDown size={12} className="text-accent" /> Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {modal?.type === "adjust" && modal.item && (
        <Modal 
          open 
          title={`Penyesuaian Stok Fisik — ${modal.item.material}`} 
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div className="bg-surface-2 rounded-lg p-3.5 border border-border">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary text-xs mb-1">Stok Available</p>
                  <p className="font-mono font-bold text-accent-success text-xl">{modal.item.available} {modal.item.uom}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs mb-1">Reserved SPK</p>
                  <p className="font-mono font-bold text-accent-warning text-xl">{modal.item.reserved} {modal.item.uom}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs mb-1">Total Fisik</p>
                  <p className="font-mono font-bold text-text-primary text-xl">{modal.item.total} {modal.item.uom}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Jenis Penyesuaian</label>
                <select 
                  className="select text-sm" 
                  value={adjForm.type} 
                  onChange={e => setAdjForm({ ...adjForm, type: e.target.value as "Add" | "Remove" })}
                >
                  <option value="Add">Penambahan (Fisik Lebih / Retur)</option>
                  <option value="Remove">Pengurangan (Rusak / Selisih Hilang)</option>
                </select>
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1.5 block font-medium">Jumlah Qty ({modal.item.uom}) *</label>
                <input 
                  type="number" 
                  min={1} 
                  className="input text-sm font-mono" 
                  placeholder="Contoh: 5"
                  value={adjForm.qty} 
                  onChange={e => setAdjForm({ ...adjForm, qty: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-xs mb-1.5 block font-medium">Alasan Penyesuaian (Wajib Diisi) *</label>
              <textarea 
                className="input min-h-[75px] resize-none text-sm" 
                value={adjForm.reason} 
                onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} 
                placeholder="Contoh: Hasil stock opname akhir periode Q3, koreksi selisih timbangan gudang..." 
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Batal</button>
              <button 
                className="btn-primary text-xs" 
                onClick={requestAdjust} 
                disabled={!adjForm.qty || !adjForm.reason}
              >
                Konfirmasi Penyesuaian
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Printable Stock Balance Sheet Modal */}
      {modal?.type === "print" && (
        <Modal open title="Cetak Rekap Saldo Inventaris Gudang" onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-xs text-text-secondary">Pratinjau lembar rekap saldo stok seluruh gudang PT. Manggala Utama Indonesia.</p>
              <button 
                className="btn-primary flex items-center gap-2 text-xs"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Cetak / Unduh PDF
              </button>
            </div>

            {/* Official Paper Document */}
            <div className="bg-white text-slate-900 p-8 rounded-lg border border-slate-200 shadow-sm font-sans text-xs space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div className="space-y-1">
                  <span className="font-black text-xl tracking-tight text-blue-900 font-mono">PT. MANGGALA UTAMA INDONESIA</span>
                  <p className="text-[11px] text-slate-600">Departemen Warehouse & Material Control (WMC)</p>
                  <p className="text-[10px] text-slate-500">Kawasan Industri Cikarang Blok B-12, Bekasi | Tanggal Cetak: 20 Oktober 2026</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    LAPORAN SALDO INVENTARIS
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Dokumen Resmi: WMC-INV-2026/10</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                      <th className="py-2 px-2.5 border border-slate-900 text-center w-8 whitespace-nowrap">No</th>
                      <th className="py-2 px-2.5 border border-slate-900 whitespace-nowrap">Kode Material</th>
                      <th className="py-2 px-2.5 border border-slate-900 whitespace-nowrap">Nama Material</th>
                      <th className="py-2 px-2.5 border border-slate-900 whitespace-nowrap">Lokasi Gudang</th>
                      <th className="py-2 px-2.5 border border-slate-900 text-right whitespace-nowrap">Available</th>
                      <th className="py-2 px-2.5 border border-slate-900 text-right whitespace-nowrap">Reserved</th>
                      <th className="py-2 px-2.5 border border-slate-900 text-right whitespace-nowrap">QC Hold</th>
                      <th className="py-2 px-2.5 border border-slate-900 text-right whitespace-nowrap">Total Fisik</th>
                      <th className="py-2 px-2.5 border border-slate-900 text-center whitespace-nowrap">Sat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAndSorted.map((inv, idx) => (
                      <tr key={inv.id}>
                        <td className="py-2 px-2.5 border border-slate-200 text-center font-mono whitespace-nowrap">{idx + 1}</td>
                        <td className="py-2 px-2.5 border border-slate-200 font-mono font-semibold whitespace-nowrap">{inv.materialId}</td>
                        <td className="py-2 px-2.5 border border-slate-200 whitespace-nowrap">{inv.material}</td>
                        <td className="py-2 px-2.5 border border-slate-200 text-slate-600 whitespace-nowrap">{inv.warehouse}</td>
                        <td className="py-2 px-2.5 border border-slate-200 text-right font-mono font-bold whitespace-nowrap">{inv.available}</td>
                        <td className="py-2 px-2.5 border border-slate-200 text-right font-mono text-slate-600 whitespace-nowrap">{inv.reserved}</td>
                        <td className="py-2 px-2.5 border border-slate-200 text-right font-mono text-slate-600 whitespace-nowrap">{inv.qualityHold}</td>
                        <td className="py-2 px-2.5 border border-slate-200 text-right font-mono font-black whitespace-nowrap">{inv.total}</td>
                        <td className="py-2 px-2.5 border border-slate-200 text-center whitespace-nowrap">{inv.uom}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={4} className="py-2 px-2.5 border border-slate-300 text-right uppercase whitespace-nowrap">Total Akumulasi Fisik</td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono whitespace-nowrap">
                        {filteredAndSorted.reduce((s, i) => s + i.available, 0)}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono whitespace-nowrap">
                        {filteredAndSorted.reduce((s, i) => s + i.reserved, 0)}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono whitespace-nowrap">
                        {filteredAndSorted.reduce((s, i) => s + i.qualityHold, 0)}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono text-blue-900 font-black whitespace-nowrap">
                        {filteredAndSorted.reduce((s, i) => s + i.total, 0)}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-center whitespace-nowrap">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">Petugas Gudang (Stock Keeper),</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Agus Supriyanto</p>
                  <p className="text-[10px] text-slate-500">Warehouse Staff</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Kepala Gudang & Logistik,</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Bambang Wahyudi</p>
                  <p className="text-[10px] text-slate-500">Warehouse Head</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Internal Audit & Akuntansi,</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Dewi Kusuma, S.E.</p>
                  <p className="text-[10px] text-slate-500">Cost Accounting</p>
                </div>
              </div>
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
