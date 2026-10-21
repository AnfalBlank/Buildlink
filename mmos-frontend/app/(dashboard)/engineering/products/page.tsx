"use client";
import { useState } from "react";
import { products as initialProducts, boms as initialBoms } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Pencil, Trash2, Search, Eye, List, ChevronDown, ChevronRight,
  Printer, ArrowUpDown, DollarSign, Calculator, Layers, FileSpreadsheet
} from "lucide-react";

const TYPES = ["Standard", "Configured", "Custom"];
const CATEGORIES = ["Fabrication", "Assembly", "Raw Material", "Component", "Consumable", "Subcontract"];

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [boms, setBoms] = useState<any[]>(initialBoms);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"products" | "bom">("products");
  const [expandedBom, setExpandedBom] = useState<string[]>(["BOM001"]);
  const [sortField, setSortField] = useState<string>("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [modal, setModal] = useState<{ type: "add" | "edit" | "view"; item?: any } | null>(null);
  const [form, setForm] = useState<any>({});
  const [bomLineForm, setBomLineForm] = useState<any>({});

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "primary" | "danger" | "warning";
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  // Sorting and filtering
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = products
    .filter(p => {
      const matchCat = catFilter === "All" || p.category === catFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  // Save product request
  const handleRequestSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Validasi Gagal", "Silakan masukkan nama produk / material.");
      return;
    }

    const isAdd = modal?.type === "add";
    setConfirmState({
      open: true,
      title: isAdd ? "Konfirmasi Tambah Produk / Material" : "Konfirmasi Simpan Perubahan",
      message: isAdd
        ? `Apakah Anda yakin ingin menambahkan produk "${form.name}" ke dalam master data?`
        : `Apakah Anda yakin ingin menyimpan perubahan data untuk "${form.name}"?`,
      variant: "primary",
      confirmText: "Ya, Simpan",
      onConfirm: executeSaveProduct,
    });
  };

  const executeSaveProduct = () => {
    const matCost = Number(form.materialCost) || 0;
    const labCost = Number(form.laborCost) || 0;
    const ovhCost = Number(form.overheadCost) || 0;
    const calculatedHpp = matCost + labCost + ovhCost || Number(form.estimatedHpp) || Number(form.unitPrice) || 0;
    const sellPrice = Number(form.sellingPrice) || 0;
    const margin = sellPrice > 0 ? Number((((sellPrice - calculatedHpp) / sellPrice) * 100).toFixed(1)) : 0;

    if (modal?.type === "add") {
      const newProd = {
        id: `PRD${String(products.length + 1).padStart(3, "0")}`,
        code: form.code || `PRD-${String(products.length + 1).padStart(3, "0")}`,
        name: form.name ?? "",
        type: form.type ?? "Standard",
        category: form.category ?? "Fabrication",
        uom: form.uom ?? "Unit",
        status: form.status ?? "Active",
        revision: form.revision ?? "Rev.A",
        bomId: null,
        routingId: null,
        description: form.description ?? "",
        materialCost: matCost,
        laborCost: labCost,
        overheadCost: ovhCost,
        estimatedHpp: calculatedHpp,
        sellingPrice: sellPrice,
        targetMargin: margin,
      };
      setProducts([newProd, ...products]);
      toast.success("Produk Ditambahkan", `Master data "${newProd.name}" (${newProd.code}) berhasil disimpan.`);
    } else if (modal?.type === "edit" && modal.item) {
      setProducts(products.map(p => p.id === modal.item.id ? {
        ...p,
        ...form,
        materialCost: matCost,
        laborCost: labCost,
        overheadCost: ovhCost,
        estimatedHpp: calculatedHpp,
        sellingPrice: sellPrice,
        targetMargin: margin,
      } : p));
      toast.info("Perubahan Disimpan", `Data produk "${form.name || modal.item.name}" berhasil diperbarui.`);
    }
    setConfirmState(null);
    setModal(null);
  };

  // Delete product request
  const handleRequestDeleteProduct = (item: any) => {
    setConfirmState({
      open: true,
      title: "Hapus Produk / Material",
      message: `Apakah Anda yakin ingin menghapus "${item.name}" (${item.code})? Tindakan ini akan menghapus referensi master data.`,
      variant: "danger",
      confirmText: "Ya, Hapus Data",
      onConfirm: () => {
        setProducts(prev => prev.filter(x => x.id !== item.id));
        setConfirmState(null);
        toast.warning("Produk Dihapus", `"${item.name}" telah dihapus.`);
      },
    });
  };

  // Add line to BOM
  const handleAddBomLine = (bomId: string) => {
    if (!bomLineForm.material?.trim()) {
      toast.error("Validasi", "Silakan masukkan nama material.");
      return;
    }
    const qty = Number(bomLineForm.qty) || 1;
    const unitPrice = Number(bomLineForm.unitPrice) || 0;
    const scrapPct = Number(bomLineForm.scrapPct) || 0;
    const subtotalCost = Math.round(qty * unitPrice * (1 + scrapPct / 100));

    const newLine = {
      id: `BI${String(Math.random()).slice(2, 8)}`,
      material: bomLineForm.material,
      materialId: bomLineForm.materialId || "MAT-CUSTOM",
      qty,
      uom: bomLineForm.uom || "Kg",
      scrapPct,
      unitPrice,
      subtotalCost,
      notes: bomLineForm.notes || "",
    };

    setBoms(boms.map(b => {
      if (b.id !== bomId) return b;
      const updatedItems = [...b.items, newLine];
      const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.subtotalCost || 0), 0);
      return { ...b, items: updatedItems, totalMaterialCost: newTotal };
    }));

    setBomLineForm({});
    toast.success("Item BOM Ditambahkan", `Material "${newLine.material}" ditambahkan ke BOM.`);
  };

  const handleDeleteBomLine = (bomId: string, lineId: string, materialName: string) => {
    setConfirmState({
      open: true,
      title: "Hapus Komponen BOM",
      message: `Apakah Anda yakin ingin menghapus material "${materialName}" dari Bill of Materials ini?`,
      variant: "danger",
      confirmText: "Ya, Hapus Item",
      onConfirm: () => {
        setBoms(boms.map(b => {
          if (b.id !== bomId) return b;
          const updatedItems = b.items.filter((i: any) => i.id !== lineId);
          const newTotal = updatedItems.reduce((acc: number, curr: any) => acc + (curr.subtotalCost || 0), 0);
          return { ...b, items: updatedItems, totalMaterialCost: newTotal };
        }));
        setConfirmState(null);
        toast.warning("Komponen Dihapus", `Item "${materialName}" dihapus dari BOM.`);
      },
    });
  };

  const toggleBom = (id: string) =>
    setExpandedBom(e => (e.includes(id) ? e.filter(x => x !== id) : [...e, id]));

  // Print PDF for Product / BOM
  const handlePrintProduct = (item: any) => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Products, Materials & BOM"
        subtitle="Master produk, Bill of Materials, serta perhitungan HPP & RAB manufaktur"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#2563EB]"
              title="Cetak Master Produk & RAB"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>
            <button
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
              onClick={() => {
                setForm({ status: "Active", type: "Standard", category: "Fabrication", uom: "Unit", revision: "Rev.A" });
                setModal({ type: "add" });
              }}
            >
              <Plus size={16} />
              <span>Tambah Produk</span>
            </button>
          </div>
        }
      />

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-5 border-b border-[#E2E8F0] pb-3 overflow-x-auto max-w-full scrollbar-none">
        {(["products", "bom"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === t
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
            }`}
          >
            {t === "products" ? <Layers size={16} /> : <FileSpreadsheet size={16} />}
            <span className="hidden sm:inline">{t === "products" ? "Daftar Produk & Material (HPP / RAB)" : "Bill of Materials (BOM Breakdown)"}</span>
            <span className="sm:hidden">{t === "products" ? "Produk (HPP/RAB)" : "BOM Breakdown"}</span>
          </button>
        ))}
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && (
        <>
          {/* Category Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
            {["All", ...CATEGORIES].map(c => (
              <div
                key={c}
                className={`card text-center cursor-pointer transition-all py-3 px-2 ${
                  catFilter === c
                    ? "border-[#2563EB] bg-[#EFF6FF]/60 shadow-xs"
                    : "hover:border-[#CBD5E1]"
                }`}
                onClick={() => setCatFilter(c)}
              >
                <p className="text-[#64748B] text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
                  {c === "All" ? "Semua Kategori" : c}
                </p>
                <p className="font-mono font-bold text-lg text-[#2563EB]">
                  {c === "All" ? products.length : products.filter(p => p.category === c).length}
                </p>
              </div>
            ))}
          </div>

          <div className="card">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  className="input !pl-10"
                  placeholder="Cari kode atau nama produk..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span>Urutkan:</span>
                <button
                  onClick={() => handleSort("code")}
                  className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 ${
                    sortField === "code" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
                  }`}
                >
                  <span>Kode</span>
                  <ArrowUpDown size={12} />
                </button>
                <button
                  onClick={() => handleSort("estimatedHpp")}
                  className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 ${
                    sortField === "estimatedHpp" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
                  }`}
                >
                  <span>HPP / RAB</span>
                  <ArrowUpDown size={12} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full border border-border rounded-lg">
              <table className="table min-w-[1050px]">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("code")} className="cursor-pointer hover:text-[#2563EB]">
                      KODE
                    </th>
                    <th onClick={() => handleSort("name")} className="cursor-pointer hover:text-[#2563EB]">
                      PRODUK / MATERIAL
                    </th>
                    <th>KATEGORI</th>
                    <th>UOM</th>
                    <th onClick={() => handleSort("estimatedHpp")} className="cursor-pointer hover:text-[#2563EB]">
                      ESTIMASI HPP / RAB
                    </th>
                    <th onClick={() => handleSort("sellingPrice")} className="cursor-pointer hover:text-[#2563EB]">
                      HARGA JUAL
                    </th>
                    <th>PROYEKSI MARGIN</th>
                    <th>BOM & ROUTING</th>
                    <th>STATUS</th>
                    <th className="text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-[#94A3B8]">
                        Tidak ada data produk yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="font-mono font-bold text-[#2563EB]">{p.code}</td>
                        <td className="font-semibold text-[#0F172A] max-w-[220px]">
                          <div className="truncate" title={p.name}>{p.name}</div>
                          <span className="text-[10px] text-[#64748B] font-mono">{p.revision ?? "Standard"}</span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                            {p.category}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{p.uom}</td>
                        <td className="font-mono font-bold text-[#0F172A]">
                          {p.estimatedHpp ? formatCurrency(p.estimatedHpp) : formatCurrency(p.unitPrice || 0)}
                        </td>
                        <td className="font-mono font-semibold text-[#2563EB]">
                          {p.sellingPrice ? formatCurrency(p.sellingPrice) : "—"}
                        </td>
                        <td>
                          {p.targetMargin ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                              +{p.targetMargin}%
                            </span>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">—</span>
                          )}
                        </td>
                        <td className="text-xs">
                          {p.bomId ? (
                            <button
                              className="text-[#2563EB] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                              onClick={() => {
                                setActiveTab("bom");
                                setExpandedBom([p.bomId]);
                              }}
                            >
                              <List size={13} />
                              <span>Lihat BOM</span>
                            </button>
                          ) : (
                            <span className="text-[#94A3B8]">—</span>
                          )}
                        </td>
                        <td><StatusBadge status={p.status} /></td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                              title="Lihat Detail & Breakdown RAB"
                              onClick={() => setModal({ type: "view", item: p })}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                              title="Edit Produk"
                              onClick={() => {
                                setForm({ ...p });
                                setModal({ type: "edit", item: p });
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                              title="Hapus Produk"
                              onClick={() => handleRequestDeleteProduct(p)}
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
        </>
      )}

      {/* ── BOM TAB ── */}
      {activeTab === "bom" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Rencana Anggaran Biaya (RAB) Material & BOM</h3>
              <p className="text-xs text-[#64748B]">Daftar estimasi biaya komponen dan kebutuhan per unit produk</p>
            </div>
            <button
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm"
              onClick={() => {
                setForm({ revision: "Rev.A", status: "Draft" });
                toast.info("Buat BOM Baru", "Silakan masukkan detail header Bill of Materials.");
              }}
            >
              <Plus size={16} />
              <span>BOM Baru</span>
            </button>
          </div>

          {boms.map((bom: any) => {
            const prod = products.find((p: any) => p.id === bom.productId);
            const open = expandedBom.includes(bom.id);
            const totalCost = bom.items.reduce((acc: number, curr: any) => acc + (curr.subtotalCost || 0), 0);

            return (
              <div key={bom.id} className="card p-0 overflow-hidden border border-[#CBD5E1]/80 shadow-sm">
                {/* BOM Header Card */}
                <div
                  className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] border-b border-[#E2E8F0] cursor-pointer hover:bg-[#F1F5F9]/80 transition-colors"
                  onClick={() => toggleBom(bom.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] shadow-xs">
                      {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#2563EB]">{bom.code}</span>
                        <StatusBadge status={bom.status} />
                        <span className="text-xs font-mono font-semibold text-[#64748B] bg-white px-2 py-0.5 rounded border">
                          {bom.revision}
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] font-semibold mt-1">
                        {prod?.name ?? bom.productId} —{" "}
                        <span className="text-[#64748B] font-normal">{bom.items.length} Komponen Material</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Total RAB Material</p>
                      <p className="font-mono font-bold text-base text-[#16A34A]">{formatCurrency(totalCost)}</p>
                    </div>
                  </div>
                </div>

                {/* BOM Items Table */}
                {open && (
                  <div className="p-4 sm:p-5">
                    <div className="overflow-x-auto">
                      <table className="table min-w-[950px]">
                        <thead>
                          <tr>
                            <th>MATERIAL / KOMPONEN</th>
                            <th>KODE MATERIAL</th>
                            <th>QTY</th>
                            <th>UOM</th>
                            <th>SCRAP %</th>
                            <th>ESTIMASI HARGA SATUAN</th>
                            <th>SUBTOTAL RAB</th>
                            <th>CATATAN TEKNIS</th>
                            <th className="text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bom.items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-[#F8FAFC]">
                              <td className="font-semibold text-[#0F172A]">{item.material}</td>
                              <td className="font-mono text-xs text-[#64748B]">{item.materialId}</td>
                              <td className="font-mono font-bold">{item.qty}</td>
                              <td className="text-xs text-[#64748B]">{item.uom}</td>
                              <td className="font-mono text-xs">{item.scrapPct}%</td>
                              <td className="font-mono text-xs">{formatCurrency(item.unitPrice || 0)}</td>
                              <td className="font-mono font-bold text-[#16A34A]">
                                {formatCurrency(item.subtotalCost || 0)}
                              </td>
                              <td className="text-xs text-[#64748B] max-w-[200px] truncate">{item.notes || "—"}</td>
                              <td className="text-right">
                                <button
                                  onClick={() => handleDeleteBomLine(bom.id, item.id, item.material)}
                                  className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Komponen"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Quick Add BOM Line */}
                    <div className="mt-4 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider shrink-0">
                        + Tambah Komponen:
                      </span>
                      <input
                        className="input !py-1.5 !text-xs flex-1 min-w-[150px]"
                        placeholder="Nama material (contoh: Plat Baja 10mm)"
                        value={bomLineForm.material ?? ""}
                        onChange={e => setBomLineForm({ ...bomLineForm, material: e.target.value })}
                      />
                      <input
                        type="number"
                        min={1}
                        className="input !py-1.5 !text-xs w-20"
                        placeholder="Qty"
                        value={bomLineForm.qty ?? ""}
                        onChange={e => setBomLineForm({ ...bomLineForm, qty: e.target.value })}
                      />
                      <input
                        className="input !py-1.5 !text-xs w-20"
                        placeholder="UOM (Kg/Pcs)"
                        value={bomLineForm.uom ?? ""}
                        onChange={e => setBomLineForm({ ...bomLineForm, uom: e.target.value })}
                      />
                      <input
                        type="number"
                        className="input !py-1.5 !text-xs w-36 font-mono"
                        placeholder="Harga Satuan (Rp)"
                        value={bomLineForm.unitPrice ?? ""}
                        onChange={e => setBomLineForm({ ...bomLineForm, unitPrice: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddBomLine(bom.id)}
                        className="btn-primary !py-1.5 !px-3 text-xs font-semibold cursor-pointer"
                      >
                        Tambah ke BOM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DETAIL MODAL (HPP & RAB BREAKDOWN) ── */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Detail Spesifikasi & RAB — ${modal.item.name}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            {/* Header Product Card */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-[#2563EB]">{modal.item.code}</span>
                  <StatusBadge status={modal.item.status} />
                  <span className="text-xs font-mono font-semibold text-[#64748B] bg-white px-2 py-0.5 rounded border">
                    {modal.item.revision ?? "Rev.A"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mt-1">{modal.item.name}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">{modal.item.description}</p>
              </div>
              <button
                onClick={() => handlePrintProduct(modal.item)}
                className="btn-secondary !rounded-xl !py-2 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer hover:border-[#2563EB]"
              >
                <Printer size={14} />
                <span>Cetak Lembar RAB</span>
              </button>
            </div>

            {/* Financial RAB / HPP Breakdown Grid */}
            <div>
              <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calculator size={15} />
                Rincian Biaya Pokok Produksi (HPP / RAB) per Unit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                  <p className="text-[#64748B] text-xs font-medium mb-1">1. Estimasi Biaya Material (BOM)</p>
                  <p className="font-mono font-bold text-base text-[#0F172A]">
                    {formatCurrency(modal.item.materialCost || modal.item.estimatedHpp || 0)}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Plat baja, fitting pipa, valve, dan coating</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                  <p className="text-[#64748B] text-xs font-medium mb-1">2. Biaya Tenaga Kerja & Fabrikasi</p>
                  <p className="font-mono font-bold text-base text-[#0F172A]">
                    {formatCurrency(modal.item.laborCost || 0)}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Welder certified, fitter, operator cutting/rolling</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                  <p className="text-[#64748B] text-xs font-medium mb-1">3. Overhead Pabrik & QC Testing</p>
                  <p className="font-mono font-bold text-base text-[#0F172A]">
                    {formatCurrency(modal.item.overheadCost || 0)}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Hydrotest, radiografi NDT, blasting & utility</p>
                </div>
              </div>
            </div>

            {/* Grand Total Comparison */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#EFF6FF] to-[#F8FAFC] border border-[#BFDBFE] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Total HPP / RAB per Unit</p>
                <p className="font-mono font-bold text-xl text-[#0F172A] mt-1">
                  {formatCurrency(modal.item.estimatedHpp || 0)}
                </p>
              </div>

              <div>
                <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Harga Jual Rekomendasi</p>
                <p className="font-mono font-bold text-xl text-[#2563EB] mt-1">
                  {modal.item.sellingPrice ? formatCurrency(modal.item.sellingPrice) : "—"}
                </p>
              </div>

              <div>
                <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Estimasi Gross Margin</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-xl text-[#16A34A]">
                    {modal.item.sellingPrice && modal.item.estimatedHpp
                      ? formatCurrency(modal.item.sellingPrice - modal.item.estimatedHpp)
                      : "—"}
                  </span>
                  {modal.item.targetMargin && (
                    <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded border border-[#BBF7D0]">
                      +{modal.item.targetMargin}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-[#F1F5F9]">
              <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setModal(null)}>
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          open
          title={modal.type === "add" ? "Tambah Produk & Spesifikasi Baru" : `Edit Master Produk — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="md"
        >
          <form onSubmit={handleRequestSaveProduct} className="space-y-4">
            <div>
              <label className="form-label">
                Nama Produk / Material <span className="text-[#DC2626]">*</span>
              </label>
              <input
                className="input"
                placeholder="Contoh: Tangki Storage Solar 30.000 Liter"
                value={form.name ?? ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">Tipe Produk</label>
                <select className="select" value={form.type ?? "Standard"} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Kategori</label>
                <select className="select" value={form.category ?? "Fabrication"} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Satuan (UOM)</label>
                <input
                  className="input"
                  placeholder="Unit, Kg, Meter"
                  value={form.uom ?? "Unit"}
                  onChange={e => setForm({ ...form, uom: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] pt-3">
              <h5 className="form-section-title">
                <Calculator size={14} />
                Penetapan Rencana Anggaran Biaya (RAB) & Harga Jual
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="form-label">Estimasi Biaya Material (IDR)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    placeholder="0"
                    value={form.materialCost ?? ""}
                    onChange={e => setForm({ ...form, materialCost: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Estimasi Tenaga Kerja (IDR)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    placeholder="0"
                    value={form.laborCost ?? ""}
                    onChange={e => setForm({ ...form, laborCost: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Overhead & Pengujian (IDR)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    placeholder="0"
                    value={form.overheadCost ?? ""}
                    onChange={e => setForm({ ...form, overheadCost: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Harga Jual Standar (IDR)</label>
                  <input
                    type="number"
                    className="input font-mono text-[#2563EB] font-bold"
                    placeholder="0"
                    value={form.sellingPrice ?? ""}
                    onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Deskripsi Spesifikasi Teknis</label>
              <textarea
                className="textarea"
                placeholder="Spesifikasi bahan, sertifikasi ASME/Pertamina, dan standar teknis..."
                value={form.description ?? ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
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
                {modal.type === "add" ? "Simpan Produk" : "Simpan Perubahan"}
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
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
