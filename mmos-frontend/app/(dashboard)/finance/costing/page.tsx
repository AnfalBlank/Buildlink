"use client";
import { useState, useMemo } from "react";
import { projectCosts, projects } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Search, Plus, Printer, FileText, CheckCircle2, AlertTriangle,
  XCircle, Trash2, Eye, Pencil, Calculator, Layers, TrendingUp,
  DollarSign, ArrowUpRight, ShieldCheck, Download
} from "lucide-react";

interface RabItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ProjectRab {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  customer: string;
  date: string;
  targetDate: string;
  contractValue: number;
  materials: RabItem[];
  labor: RabItem[];
  machining: RabItem[];
  overhead: RabItem[];
  notes?: string;
}

const INITIAL_RABS: ProjectRab[] = [
  {
    id: "RAB001",
    code: "RAB-2026-001",
    projectId: "PRJ001",
    projectName: "Tangki BBM 16KL - Pertamina",
    customer: "PT Pertamina Trans Kontinental",
    date: "2026-08-10",
    targetDate: "2026-12-31",
    contractValue: 1850000000,
    materials: [
      { id: "M1", name: "Plat Baja SS400 8mm & 6mm", qty: 4500, unit: "Kg", unitPrice: 22000, total: 99000000 },
      { id: "M2", name: "Pipa Seamless SCH40 4 inch", qty: 24, unit: "Meter", unitPrice: 850000, total: 20400000 },
      { id: "M3", name: "Flange ANSI 150# & Fitting", qty: 18, unit: "Pcs", unitPrice: 1200000, total: 21600000 },
      { id: "M4", name: "Cat Epoxy Primer & Polyurethane", qty: 12, unit: "Pail", unitPrice: 1850000, total: 22200000 },
      { id: "M5", name: "Accessories Tangki & Manhole Cover", qty: 2, unit: "Set", unitPrice: 35000000, total: 70000000 },
    ],
    labor: [
      { id: "L1", name: "Welder 6G ASME Bersertifikat", qty: 320, unit: "Jam", unitPrice: 125000, total: 40000000 },
      { id: "L2", name: "Fitter Fabrikasi & Assembly", qty: 280, unit: "Jam", unitPrice: 95000, total: 26600000 },
      { id: "L3", name: "Blaster & Painter Coating", qty: 160, unit: "Jam", unitPrice: 85000, total: 13600000 },
    ],
    machining: [
      { id: "MC1", name: "CNC Plasma Cutting & Bending Press", qty: 40, unit: "Jam", unitPrice: 350000, total: 14000000 },
      { id: "MC2", name: "Rolling Plate Mesin 16mm", qty: 2, unit: "Unit", unitPrice: 6500000, total: 13000000 },
    ],
    overhead: [
      { id: "O1", name: "Hydrostatic Test 1.5x Design Pressure", qty: 1, unit: "Job", unitPrice: 15000000, total: 15000000 },
      { id: "O2", name: "NDT Radiography Test (RT 100%)", qty: 1, unit: "Lot", unitPrice: 22000000, total: 22000000 },
      { id: "O3", name: "Sertifikasi Migas & Dokumen As-Built", qty: 1, unit: "Lot", unitPrice: 30000000, total: 30000000 },
    ],
    notes: "RAB mengacu standar ASME VIII Div.1 dan spesifikasi Pertamina.",
  },
  {
    id: "RAB002",
    code: "RAB-2026-002",
    projectId: "PRJ002",
    projectName: "Truk Tangki Kimia 10KL - AHM",
    customer: "PT Astra Honda Motor",
    date: "2026-09-18",
    targetDate: "2027-03-31",
    contractValue: 2400000000,
    materials: [
      { id: "M1", name: "Plat Stainless Steel SUS304 6mm", qty: 3800, unit: "Kg", unitPrice: 78000, total: 296400000 },
      { id: "M2", name: "Chassis Modification Kit Hino 500", qty: 3, unit: "Set", unitPrice: 120000000, total: 360000000 },
      { id: "M3", name: "Chemical Pump & Valve Stainless", qty: 3, unit: "Set", unitPrice: 45000000, total: 135000000 },
      { id: "M4", name: "Pneumatic Safety Foot Valve", qty: 3, unit: "Lot", unitPrice: 28000000, total: 84000000 },
    ],
    labor: [
      { id: "L1", name: "Welder TIG Stainless Steel", qty: 450, unit: "Jam", unitPrice: 150000, total: 67500000 },
      { id: "L2", name: "Chassis & Mechanical Assembler", qty: 380, unit: "Jam", unitPrice: 110000, total: 41800000 },
    ],
    machining: [
      { id: "MC1", name: "Laser Cutting & CNC Press Brake", qty: 60, unit: "Jam", unitPrice: 450000, total: 27000000 },
    ],
    overhead: [
      { id: "O1", name: "Uji Emisi & Tera Metrologi Legal", qty: 3, unit: "Unit", unitPrice: 12000000, total: 36000000 },
      { id: "O2", name: "Dokumen SRUT Kemenhub & Sertifikat", qty: 3, unit: "Unit", unitPrice: 25000000, total: 75000000 },
    ],
    notes: "Truk tangki bahan kimia korosif standar B3 dan Kemenhub.",
  },
  {
    id: "RAB003",
    code: "RAB-2025-045",
    projectId: "PRJ003",
    projectName: "Tangki Storage 20KL - Pupuk",
    customer: "PT Pupuk Indonesia",
    date: "2025-06-05",
    targetDate: "2025-12-31",
    contractValue: 750000000,
    materials: [
      { id: "M1", name: "Plat Baja Carbon Steel A36 6mm", qty: 2600, unit: "Kg", unitPrice: 21000, total: 54600000 },
      { id: "M2", name: "Pipa, Flange & Gasket", qty: 1, unit: "Lot", unitPrice: 38000000, total: 38000000 },
    ],
    labor: [
      { id: "L1", name: "Welder & Fitter Fabrikasi", qty: 220, unit: "Jam", unitPrice: 100000, total: 22000000 },
    ],
    machining: [
      { id: "MC1", name: "Mesin Roll & Shearing", qty: 1, unit: "Lot", unitPrice: 12000000, total: 12000000 },
    ],
    overhead: [
      { id: "O1", name: "Testing & Finishing Painting", qty: 1, unit: "Lot", unitPrice: 18000000, total: 18000000 },
    ],
    notes: "Proyek fabrikasi selesai tepat waktu dengan efisiensi tinggi.",
  },
  {
    id: "RAB004",
    code: "RAB-2026-003",
    projectId: "PRJ004",
    projectName: "Truk Tangki BBM 8KL - Elnusa",
    customer: "PT Elnusa Petrofin",
    date: "2026-10-02",
    targetDate: "2027-01-31",
    contractValue: 920000000,
    materials: [
      { id: "M1", name: "Plat Baja Tangki 6mm", qty: 2200, unit: "Kg", unitPrice: 24000, total: 52800000 },
      { id: "M2", name: "Chassis & PTO Pump", qty: 1, unit: "Unit", unitPrice: 580000000, total: 580000000 },
      { id: "M3", name: "Bottom Loading Valve & Sensor", qty: 1, unit: "Set", unitPrice: 75000000, total: 75000000 },
    ],
    labor: [
      { id: "L1", name: "Assembly & Welder Team", qty: 260, unit: "Jam", unitPrice: 110000, total: 28600000 },
    ],
    machining: [
      { id: "MC1", name: "Fabrikasi Subkon", qty: 1, unit: "Lot", unitPrice: 25000000, total: 25000000 },
    ],
    overhead: [
      { id: "O1", name: "Tera & Sertifikasi Kendaraan", qty: 1, unit: "Lot", unitPrice: 48000000, total: 48000000 },
    ],
    notes: "Margin tipis karena lonjakan harga komponen chassis import.",
  },
];

// Helper to compute total of an item array
function sumItems(items?: RabItem[]): number {
  return items?.reduce((acc, it) => acc + (it.total || 0), 0) || 0;
}

// Calculate RAB metrics
function getRabMetrics(rab: ProjectRab) {
  const matTotal = sumItems(rab.materials);
  const laborTotal = sumItems(rab.labor);
  const machTotal = sumItems(rab.machining);
  const ovhTotal = sumItems(rab.overhead);
  const totalCost = matTotal + laborTotal + machTotal + ovhTotal;
  const contract = rab.contractValue || 1;
  const grossProfit = contract - totalCost;
  const marginPct = (grossProfit / contract) * 100;

  // Status determination
  let status: "Aman" | "Waspada" | "Overbudget" = "Aman";
  let statusLabel = "RAB SEHAT (AMAN)";
  let statusColor = "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]";

  if (marginPct >= 25) {
    status = "Aman";
    statusLabel = "RAB AMAN / SEHAT";
    statusColor = "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]";
  } else if (marginPct >= 15) {
    status = "Waspada";
    statusLabel = "RAB WASPADA (MARGIN KETAT)";
    statusColor = "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]";
  } else {
    status = "Overbudget";
    statusLabel = "RAB RAWAN DEFISIT / OVERBUDGET";
    statusColor = "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]";
  }

  return {
    matTotal,
    laborTotal,
    machTotal,
    ovhTotal,
    totalCost,
    grossProfit,
    marginPct,
    status,
    statusLabel,
    statusColor,
  };
}

export default function CostingPage() {
  const [activeTab, setActiveTab] = useState<"rab" | "costing">("rab");
  const [rabs, setRabs] = useState<ProjectRab[]>(INITIAL_RABS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [modal, setModal] = useState<{ type: "add" | "edit" | "view" | "print"; item?: ProjectRab } | null>(null);
  const [form, setForm] = useState<Partial<ProjectRab>>({});

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

  // Filtered RABs
  const filteredRabs = useMemo(() => {
    return rabs.filter(r => {
      const matchSearch =
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.projectName.toLowerCase().includes(search.toLowerCase()) ||
        r.customer.toLowerCase().includes(search.toLowerCase());

      const metrics = getRabMetrics(r);
      const matchStatus = statusFilter === "all" || metrics.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [rabs, search, statusFilter]);

  // Project Costing original calculation
  const costData = projectCosts.map(c => {
    const proj = projects.find(p => p.id === c.projectId);
    return { ...c, projectName: proj?.name ?? c.projectId, projectCode: proj?.code ?? c.projectId };
  }).filter(c => {
    const q = search.toLowerCase();
    return !q || c.projectCode.toLowerCase().includes(q) || c.projectName.toLowerCase().includes(q);
  });

  const chartData = costData.map(c => ({
    name: c.projectCode,
    Budget: c.budgetTotal / 1e6,
    Committed: (c.committedMaterial + c.committedLabor + c.committedSubcon) / 1e6,
    Actual: c.actualTotal / 1e6,
    EAC: c.eac / 1e6,
  }));

  // Dynamic Item row manipulation for Form
  const addCategoryItem = (category: "materials" | "labor" | "machining" | "overhead") => {
    const current = form[category] ? [...(form[category] as RabItem[])] : [];
    const newItem: RabItem = {
      id: Math.random().toString(36).substring(2, 7),
      name: "",
      qty: 1,
      unit: category === "labor" ? "Jam" : category === "materials" ? "Kg" : "Job",
      unitPrice: 0,
      total: 0,
    };
    setForm({ ...form, [category]: [...current, newItem] });
  };

  const updateCategoryItem = (
    category: "materials" | "labor" | "machining" | "overhead",
    index: number,
    field: keyof RabItem,
    val: any
  ) => {
    const current = form[category] ? [...(form[category] as RabItem[])] : [];
    const item = { ...current[index], [field]: val };
    if (field === "qty" || field === "unitPrice") {
      const q = field === "qty" ? Math.max(0, Number(val) || 0) : item.qty;
      const p = field === "unitPrice" ? Math.max(0, Number(val) || 0) : item.unitPrice;
      item.total = q * p;
    }
    current[index] = item;
    setForm({ ...form, [category]: current });
  };

  const removeCategoryItem = (category: "materials" | "labor" | "machining" | "overhead", index: number) => {
    const current = form[category] ? [...(form[category] as RabItem[])] : [];
    current.splice(index, 1);
    setForm({ ...form, [category]: current });
  };

  // Open Add modal
  const openAddRab = () => {
    setForm({
      code: `RAB-2026-${String(rabs.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      contractValue: 0,
      projectName: "",
      customer: "",
      materials: [{ id: "m1", name: "", qty: 1, unit: "Kg", unitPrice: 0, total: 0 }],
      labor: [{ id: "l1", name: "", qty: 1, unit: "Jam", unitPrice: 0, total: 0 }],
      machining: [{ id: "mc1", name: "", qty: 1, unit: "Job", unitPrice: 0, total: 0 }],
      overhead: [{ id: "o1", name: "", qty: 1, unit: "Lot", unitPrice: 0, total: 0 }],
      notes: "",
    });
    setModal({ type: "add" });
  };

  const openEditRab = (rab: ProjectRab) => {
    setForm({
      ...rab,
      materials: rab.materials.map(it => ({ ...it })),
      labor: rab.labor.map(it => ({ ...it })),
      machining: rab.machining.map(it => ({ ...it })),
      overhead: rab.overhead.map(it => ({ ...it })),
    });
    setModal({ type: "edit", item: rab });
  };

  // Save RAB with confirmation
  const requestSaveRab = () => {
    if (!form.projectName || !form.customer) {
      toast.error("Validasi Gagal", "Nama proyek dan nama pelanggan wajib diisi.");
      return;
    }

    if (!form.contractValue || form.contractValue <= 0) {
      toast.error("Validasi Gagal", "Nilai kontrak / estimasi penjualan proyek harus lebih besar dari Rp 0.");
      return;
    }

    const isEdit = modal?.type === "edit";
    const currentRab: ProjectRab = {
      id: form.id || `RAB${String(rabs.length + 1).padStart(3, "0")}`,
      code: form.code || `RAB-2026-00${rabs.length + 1}`,
      projectId: form.projectId || "PRJ001",
      projectName: form.projectName || "",
      customer: form.customer || "",
      date: form.date || new Date().toISOString().split("T")[0],
      targetDate: form.targetDate || "",
      contractValue: Number(form.contractValue) || 0,
      materials: form.materials?.filter(m => m.name.trim()) || [],
      labor: form.labor?.filter(l => l.name.trim()) || [],
      machining: form.machining?.filter(mc => mc.name.trim()) || [],
      overhead: form.overhead?.filter(o => o.name.trim()) || [],
      notes: form.notes || "",
    };

    const metrics = getRabMetrics(currentRab);

    setConfirmConfig({
      open: true,
      title: isEdit ? "Simpan Perubahan Dokumen RAB" : "Terbitkan Rencana Anggaran Biaya (RAB)",
      description: `Apakah Anda yakin ingin menyimpan RAB ${currentRab.code}? Total Anggaran: ${formatCurrency(metrics.totalCost)} (Margin: ${metrics.marginPct.toFixed(1)}%).`,
      confirmText: isEdit ? "Ya, Simpan Perubahan" : "Ya, Terbitkan RAB",
      variant: metrics.status === "Overbudget" ? "warning" : "info",
      onConfirm: () => {
        if (modal?.type === "add") {
          setRabs([currentRab, ...rabs]);
          toast.success("RAB Berhasil Dibuat", `${currentRab.code} untuk ${currentRab.projectName} telah tersimpan.`);
        } else if (modal?.type === "edit" && modal.item) {
          setRabs(rabs.map(r => r.id === modal.item!.id ? currentRab : r));
          toast.success("RAB Berhasil Diperbarui", `${currentRab.code} telah diperbarui dengan status: ${metrics.statusLabel}.`);
        }
        setModal(null);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      },
    });
  };

  const requestDeleteRab = (rab: ProjectRab) => {
    setConfirmConfig({
      open: true,
      title: "Hapus Rencana Anggaran Biaya (RAB)",
      description: `Apakah Anda yakin ingin menghapus dokumen ${rab.code} (${rab.projectName})? Data anggaran yang dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus RAB",
      variant: "danger",
      onConfirm: () => {
        setRabs(rabs.filter(r => r.id !== rab.id));
        toast.success("RAB Dihapus", `Dokumen ${rab.code} telah dihapus.`);
        setConfirmConfig(prev => ({ ...prev, open: false }));
      },
    });
  };

  // Live metrics of active form
  const formMetrics = useMemo(() => {
    return getRabMetrics(form as ProjectRab);
  }, [form]);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
            Costing & Rencana Anggaran Biaya (RAB)
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Penyusunan anggaran HPP proyek, evaluasi kelayakan margin profit, dan cetak dokumen resmi
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddRab}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Buat Dokumen RAB Baru
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-medium px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={14} /> Cetak Rekapitulasi
          </button>
        </div>
      </div>

      {/* ── View Mode Tabs ── */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab("rab")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "rab"
              ? "bg-[#0F172A] text-white shadow-xs"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          }`}
        >
          <Calculator size={14} />
          <span>Daftar Rencana Anggaran Biaya (RAB)</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-white/20 text-white ml-1">
            {rabs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("costing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "costing"
              ? "bg-[#0F172A] text-white shadow-xs"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          }`}
        >
          <TrendingUp size={14} />
          <span>Realisasi Biaya Aktual vs Anggaran (Project Costing)</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: RENCANA ANGGARAN BIAYA (RAB)
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "rab" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-[#64748B] font-medium">Total Nilai Kontrak Proyek</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] mt-1">
                {formatCurrency(rabs.reduce((s, r) => s + r.contractValue, 0))}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Dari {rabs.length} proyek terdaftar</p>
            </div>
            <div className="card">
              <p className="text-xs text-[#64748B] font-medium">Total Anggaran Biaya (RAB)</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#2563EB] mt-1">
                {formatCurrency(rabs.reduce((s, r) => s + getRabMetrics(r).totalCost, 0))}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">HPP gabungan manufaktur</p>
            </div>
            <div className="card">
              <p className="text-xs text-[#64748B] font-medium">Estimasi Laba Kotor (Gross Profit)</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#16A34A] mt-1">
                {formatCurrency(rabs.reduce((s, r) => s + getRabMetrics(r).grossProfit, 0))}
              </p>
              <p className="text-[11px] text-[#16A34A] font-semibold mt-1">
                Rata-rata Margin: {(
                  rabs.reduce((s, r) => s + getRabMetrics(r).marginPct, 0) / (rabs.length || 1)
                ).toFixed(1)}%
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-[#64748B] font-medium">Status Kesehatan RAB</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0]">
                  {rabs.filter(r => getRabMetrics(r).status === "Aman").length} Aman
                </span>
                <span className="text-xs font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                  {rabs.filter(r => getRabMetrics(r).status === "Waspada").length} Waspada
                </span>
                <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                  {rabs.filter(r => getRabMetrics(r).status === "Overbudget").length} Kritis
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">Evaluasi berkala margin proyek</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0]">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="input text-xs pl-9 w-full"
                placeholder="Cari kode RAB, proyek, pelanggan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B] font-medium">Status RAB:</span>
              <select
                className="select text-xs py-1.5"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="Aman">RAB Aman (Margin &gt;= 25%)</option>
                <option value="Waspada">RAB Waspada (15% - 24.9%)</option>
                <option value="Overbudget">RAB Kritis / Defisit (&lt; 15%)</option>
              </select>
            </div>
          </div>

          {/* RAB Cards / Table */}
          <div className="space-y-3">
            {filteredRabs.map(rab => {
              const m = getRabMetrics(rab);
              return (
                <div
                  key={rab.id}
                  className="card hover:border-[#CBD5E1] transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                          {rab.code}
                        </span>
                        <h3 className="text-sm font-bold text-[#0F172A]">{rab.projectName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${m.statusColor}`}>
                          {m.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">
                        Klien: <strong className="text-[#334155]">{rab.customer}</strong> · Tanggal RAB: {rab.date} · Target: {rab.targetDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-auto">
                      <button
                        onClick={() => setModal({ type: "print", item: rab })}
                        className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                        title="Cetak Lembar Resmi RAB"
                      >
                        <Printer size={13} /> Cetak Lembar RAB
                      </button>
                      <button
                        onClick={() => openEditRab(rab)}
                        className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                        title="Edit Dokumen RAB"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => requestDeleteRab(rab)}
                        className="btn-secondary text-xs text-[#DC2626] hover:bg-[#FEF2F2] border-[#FECACA] flex items-center gap-1.5 py-1.5 px-2.5"
                        title="Hapus RAB"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-3 border-b border-[#F1F5F9] text-xs">
                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block font-medium">A. Material & Komponen</span>
                      <span className="font-mono font-bold text-[#0F172A] text-xs mt-0.5 block">
                        {formatCurrency(m.matTotal)}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block font-medium">B. Tenaga Kerja (Labor)</span>
                      <span className="font-mono font-bold text-[#0F172A] text-xs mt-0.5 block">
                        {formatCurrency(m.laborTotal)}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block font-medium">C. Mesin & Subkontrak</span>
                      <span className="font-mono font-bold text-[#0F172A] text-xs mt-0.5 block">
                        {formatCurrency(m.machTotal)}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block font-medium">D. Overhead & QC</span>
                      <span className="font-mono font-bold text-[#0F172A] text-xs mt-0.5 block">
                        {formatCurrency(m.ovhTotal)}
                      </span>
                    </div>
                    <div className="bg-[#EFF6FF] p-2.5 rounded-xl border border-[#BFDBFE]">
                      <span className="text-[10px] text-[#1E40AF] block font-medium">Total Anggaran (HPP)</span>
                      <span className="font-mono font-black text-[#2563EB] text-xs mt-0.5 block">
                        {formatCurrency(m.totalCost)}
                      </span>
                    </div>
                    <div className="bg-[#F0FDF4] p-2.5 rounded-xl border border-[#BBF7D0]">
                      <span className="text-[10px] text-[#166534] block font-medium">Gross Profit & Margin</span>
                      <span className="font-mono font-black text-[#16A34A] text-xs mt-0.5 block">
                        {m.marginPct.toFixed(1)}% ({formatCurrency(m.grossProfit)})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#64748B]">
                    <span className="truncate max-w-xl">
                      Catatan: {rab.notes || "Tidak ada catatan khusus teknis."}
                    </span>
                    <span className="font-semibold text-[#0F172A]">
                      Nilai Kontrak: <strong className="font-mono">{formatCurrency(rab.contractValue)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 2: REALISASI PROJECT COSTING (AKTUAL VS BUDGET)
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "costing" && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-[#111827] mb-1">
              Perbandingan Anggaran vs Komitmen vs Realisasi Aktual vs EAC (Juta IDR)
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">Monitoring biaya aktual per proyek</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
                <Tooltip formatter={(v: unknown) => [`${(v as number).toFixed(0)}M IDR`]} />
                <Legend wrapperStyle={{ color: "#64748B", fontSize: 12 }} />
                <Bar dataKey="Budget" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Committed" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="EAC" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Cost Cards */}
          <div className="space-y-4">
            {costData.map(c => {
              const budgetUtilPct = c.budgetTotal > 0 ? (c.actualTotal / c.budgetTotal) * 100 : 0;
              const marginPct = c.forecastRevenue > 0 ? (c.forecastMargin / c.forecastRevenue) * 100 : 0;
              const variance = c.budgetTotal - c.eac;
              return (
                <div key={c.projectId} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[#0F172A] font-semibold">{c.projectName}</h3>
                      <p className="text-[#64748B] text-xs font-mono">{c.projectCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#64748B] text-xs mb-0.5">Forecast Margin</p>
                      <p className={`font-mono font-bold text-xl ${marginPct >= 20 ? "text-[#16A34A]" : marginPct >= 10 ? "text-[#D97706]" : "text-[#DC2626]"}`}>
                        {marginPct.toFixed(1)}%
                      </p>
                      <p className="text-[#64748B] text-xs">{formatCurrency(c.forecastMargin)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Contract Revenue", val: c.forecastRevenue, cls: "text-[#16A34A]" },
                      { label: "Budget Cost", val: c.budgetTotal, cls: "text-[#0F172A]" },
                      { label: "Committed Cost", val: c.committedMaterial + c.committedLabor + c.committedSubcon, cls: "text-[#D97706]" },
                      { label: "Actual Cost", val: c.actualTotal, cls: "text-[#2563EB]" },
                      { label: "ETC (Est. to Complete)", val: c.etc, cls: "text-purple-600" },
                      { label: "EAC (Forecast Final)", val: c.eac, cls: "text-blue-600" },
                      { label: "Cost Variance", val: variance, cls: variance >= 0 ? "text-[#16A34A]" : "text-[#DC2626]" },
                      { label: "Forecast Margin", val: c.forecastMargin, cls: marginPct >= 20 ? "text-[#16A34A]" : "text-[#D97706]" },
                    ].map(f => (
                      <div key={f.label} className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                        <p className="text-[#64748B] text-xs mb-1">{f.label}</p>
                        <p className={`font-mono font-bold text-sm ${f.cls}`}>{formatCurrency(f.val)}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#64748B] mb-1">
                      <span>Budget Utilization</span>
                      <span className="font-mono">{budgetUtilPct.toFixed(1)}%</span>
                    </div>
                    <ProgressBar value={budgetUtilPct} color={budgetUtilPct > 90 ? "red" : budgetUtilPct > 70 ? "yellow" : "blue"} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 1: ADD / EDIT RAB WITH 4 COST CATEGORIES
      ═══════════════════════════════════════════════════════════ */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          open
          title={modal.type === "add" ? "Penyusunan Rencana Anggaran Biaya (RAB) Baru" : `Edit Dokumen RAB — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Kode Dokumen RAB *</label>
                <input
                  type="text"
                  className="input text-xs font-mono w-full"
                  value={form.code ?? ""}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Nama Proyek / Unit *</label>
                <input
                  type="text"
                  className="input text-xs w-full"
                  placeholder="Misal: Fabrikasi Tangki 16KL..."
                  value={form.projectName ?? ""}
                  onChange={e => setForm({ ...form, projectName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Pelanggan / Klien *</label>
                <input
                  type="text"
                  className="input text-xs w-full"
                  placeholder="Misal: PT Pertamina..."
                  value={form.customer ?? ""}
                  onChange={e => setForm({ ...form, customer: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Estimasi Nilai Kontrak (IDR) *</label>
                <input
                  type="number"
                  className="input text-xs font-mono w-full font-bold text-[#2563EB]"
                  placeholder="0"
                  value={form.contractValue ?? ""}
                  onChange={e => setForm({ ...form, contractValue: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* LIVE FINANCIAL HEALTH SUMMARY BANNER */}
            <div className={`p-4 rounded-xl border ${formMetrics.statusColor} flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs`}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Status Evaluasi RAB:</span>
                    <span className="text-xs font-black">{formMetrics.statusLabel}</span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {formMetrics.status === "Aman" && "Margin diatas 25% — RAB sangat sehat dan layak diproduksi."}
                    {formMetrics.status === "Waspada" && "Margin berada di antara 15% - 24.9% — Anggaran ketat, perhatikan efisiensi jam kerja & subkon."}
                    {formMetrics.status === "Overbudget" && "Margin dibawah 15% atau defisit — Biaya melebihi batas toleransi! Butuh re-engineering."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-75">Total Anggaran RAB</p>
                  <p className="font-mono font-black text-sm">{formatCurrency(formMetrics.totalCost)}</p>
                </div>
                <div className="border-l border-current pl-4">
                  <p className="text-[10px] uppercase font-bold opacity-75">Estimasi Gross Margin</p>
                  <p className="font-mono font-black text-base">{formMetrics.marginPct.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* ── KATEGORI A: MATERIAL ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-[10px] font-black">A</span>
                  Material Utama & Komponen (Raw Materials)
                </span>
                <button
                  type="button"
                  onClick={() => addCategoryItem("materials")}
                  className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Tambah Material
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                      <th className="py-2 px-3 text-left">Nama Material / Spesifikasi</th>
                      <th className="py-2 px-3 text-center w-24">Qty</th>
                      <th className="py-2 px-3 text-center w-24">Satuan</th>
                      <th className="py-2 px-3 text-right w-36">Harga Satuan (IDR)</th>
                      <th className="py-2 px-3 text-right w-36">Subtotal</th>
                      <th className="py-2 px-3 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {form.materials?.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input text-xs w-full py-1"
                            placeholder="Plat Baja 8mm..."
                            value={it.name}
                            onChange={e => updateCategoryItem("materials", idx, "name", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="input text-xs text-center font-mono py-1 w-full"
                            value={it.qty || ""}
                            onChange={e => updateCategoryItem("materials", idx, "qty", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input text-xs text-center py-1 w-full"
                            value={it.unit}
                            onChange={e => updateCategoryItem("materials", idx, "unit", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="input text-xs text-right font-mono py-1 w-full"
                            value={it.unitPrice || ""}
                            onChange={e => updateCategoryItem("materials", idx, "unitPrice", e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-[#0F172A]">
                          {formatCurrency(it.total || 0)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCategoryItem("materials", idx)}
                            className="text-[#94A3B8] hover:text-[#DC2626]"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── KATEGORI B: TENAGA KERJA (LABOR) ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center text-[10px] font-black">B</span>
                  Tenaga Kerja Langsung (Direct Labor & Manpower)
                </span>
                <button
                  type="button"
                  onClick={() => addCategoryItem("labor")}
                  className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Tambah Tenaga Kerja
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                      <th className="py-2 px-3 text-left">Posisi / Kategori Keahlian</th>
                      <th className="py-2 px-3 text-center w-24">Alokasi Jam</th>
                      <th className="py-2 px-3 text-center w-24">Satuan</th>
                      <th className="py-2 px-3 text-right w-36">Rate per Jam (IDR)</th>
                      <th className="py-2 px-3 text-right w-36">Subtotal</th>
                      <th className="py-2 px-3 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {form.labor?.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input text-xs w-full py-1"
                            placeholder="Welder 6G..."
                            value={it.name}
                            onChange={e => updateCategoryItem("labor", idx, "name", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="input text-xs text-center font-mono py-1 w-full"
                            value={it.qty || ""}
                            onChange={e => updateCategoryItem("labor", idx, "qty", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input text-xs text-center py-1 w-full"
                            value={it.unit}
                            onChange={e => updateCategoryItem("labor", idx, "unit", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="input text-xs text-right font-mono py-1 w-full"
                            value={it.unitPrice || ""}
                            onChange={e => updateCategoryItem("labor", idx, "unitPrice", e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-[#0F172A]">
                          {formatCurrency(it.total || 0)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCategoryItem("labor", idx)}
                            className="text-[#94A3B8] hover:text-[#DC2626]"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── KATEGORI C & D: MESIN & OVERHEAD ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Mesin & Subkon */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center text-[10px] font-black">C</span>
                    Mesin, Peralatan & Subkontrak
                  </span>
                  <button
                    type="button"
                    onClick={() => addCategoryItem("machining")}
                    className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                        <th className="py-2 px-2 text-left">Item / Alat</th>
                        <th className="py-2 px-2 text-center w-16">Qty</th>
                        <th className="py-2 px-2 text-right w-24">Tarif</th>
                        <th className="py-2 px-2 text-right w-28">Subtotal</th>
                        <th className="py-2 px-1 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {form.machining?.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-1.5">
                            <input
                              type="text"
                              className="input text-xs w-full py-1"
                              placeholder="CNC Bending..."
                              value={it.name}
                              onChange={e => updateCategoryItem("machining", idx, "name", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              className="input text-xs text-center font-mono py-1 w-full"
                              value={it.qty || ""}
                              onChange={e => updateCategoryItem("machining", idx, "qty", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              className="input text-xs text-right font-mono py-1 w-full"
                              value={it.unitPrice || ""}
                              onChange={e => updateCategoryItem("machining", idx, "unitPrice", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-[#0F172A]">
                            {formatCurrency(it.total || 0)}
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeCategoryItem("machining", idx)}
                              className="text-[#94A3B8] hover:text-[#DC2626]"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overhead & QC */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center text-[10px] font-black">D</span>
                    Overhead Pabrik, QC & Sertifikasi
                  </span>
                  <button
                    type="button"
                    onClick={() => addCategoryItem("overhead")}
                    className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                        <th className="py-2 px-2 text-left">Item Testing / Sertifikasi</th>
                        <th className="py-2 px-2 text-center w-16">Qty</th>
                        <th className="py-2 px-2 text-right w-24">Tarif</th>
                        <th className="py-2 px-2 text-right w-28">Subtotal</th>
                        <th className="py-2 px-1 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {form.overhead?.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-1.5">
                            <input
                              type="text"
                              className="input text-xs w-full py-1"
                              placeholder="NDT Radiography..."
                              value={it.name}
                              onChange={e => updateCategoryItem("overhead", idx, "name", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              className="input text-xs text-center font-mono py-1 w-full"
                              value={it.qty || ""}
                              onChange={e => updateCategoryItem("overhead", idx, "qty", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              className="input text-xs text-right font-mono py-1 w-full"
                              value={it.unitPrice || ""}
                              onChange={e => updateCategoryItem("overhead", idx, "unitPrice", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-[#0F172A]">
                            {formatCurrency(it.total || 0)}
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeCategoryItem("overhead", idx)}
                              className="text-[#94A3B8] hover:text-[#DC2626]"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-[#475569] mb-1 block">Catatan Teknis / Syarat Spesifikasi RAB</label>
              <textarea
                className="input text-xs w-full py-2"
                rows={2}
                placeholder="Catatan tambahan spesifikasi material, toleransi desain, atau persyaratan klien..."
                value={form.notes ?? ""}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
              <button className="btn-secondary text-xs" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-primary text-xs" onClick={requestSaveRab}>
                Simpan & Terbitkan RAB
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 2: PRINTABLE OFFICIAL RAB DOCUMENT WITH KOP SURAT
      ═══════════════════════════════════════════════════════════ */}
      {modal?.type === "print" && modal.item && (() => {
        const rab = modal.item;
        const m = getRabMetrics(rab);
        return (
          <Modal
            open
            title={`Cetak Lembar Resmi RAB — ${rab.code}`}
            onClose={() => setModal(null)}
            size="xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <p className="text-xs text-[#64748B]">
                  Pratinjau lembar kerja formal Rencana Anggaran Biaya (RAB) manufaktur.
                </p>
                <button
                  onClick={() => window.print()}
                  className="btn-primary flex items-center gap-2 text-xs"
                >
                  <Printer size={15} /> Cetak Lembar RAB (PDF)
                </button>
              </div>

              {/* Printable Document Paper */}
              <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-sm font-sans text-xs space-y-6">
                {/* Header Letterhead */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div className="space-y-1">
                    <span className="font-black text-xl tracking-tight text-blue-900 font-mono">
                      PT. MANGGALA UTAMA INDONESIA
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Industrial Heavy Equipment, Storage Tanks & Precision Fabrication
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Kawasan Industri Cikarang Blok B-12, Bekasi · Telp: (021) 8983-0021 · finance@manggala.co.id
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                      RENCANA ANGGARAN BIAYA (RAB)
                    </span>
                    <p className="font-mono font-bold text-xs text-slate-800 mt-1">{rab.code}</p>
                    <p className="text-[10px] text-slate-500">Tanggal: {rab.date} · Target: {rab.targetDate}</p>
                  </div>
                </div>

                {/* Project Details Box */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Informasi Proyek / Pesanan:</p>
                    <p className="font-bold text-sm text-slate-900 mt-0.5">{rab.projectName}</p>
                    <p className="text-slate-600 text-[11px]">Klien: {rab.customer}</p>
                    <p className="text-slate-500 text-[10px] mt-1">{rab.notes || "Spesifikasi standar manufaktur."}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-slate-500 text-[11px]">Nilai Kontrak / Penjualan: </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(rab.contractValue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Total Anggaran Biaya (HPP): </span>
                      <span className="font-mono font-bold text-blue-800">
                        {formatCurrency(m.totalCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Estimasi Gross Margin: </span>
                      <span className="font-mono font-black text-emerald-700">
                        {m.marginPct.toFixed(1)}% ({formatCurrency(m.grossProfit)})
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${m.statusColor}`}>
                        {m.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RAB Breakdown Tables */}
                <div className="space-y-4">
                  {/* Category A */}
                  <div>
                    <p className="font-bold text-slate-900 text-xs mb-1.5 flex items-center justify-between">
                      <span>A. BIAYA MATERIAL &amp; KOMPONEN UTAMA</span>
                      <span className="font-mono text-blue-900">Subtotal: {formatCurrency(m.matTotal)}</span>
                    </p>
                    <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold">
                          <th className="py-1.5 px-2.5 border border-slate-200 w-8 text-center">No</th>
                          <th className="py-1.5 px-2.5 border border-slate-200">Nama Material / Komponen</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-center w-16">Qty</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-center w-16">Satuan</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-right w-32">Harga Satuan</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-right w-32">Subtotal (IDR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rab.materials.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200">{it.name}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-center font-mono">{it.qty}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-center">{it.unit}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-right font-mono font-semibold">{formatCurrency(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Category B */}
                  <div>
                    <p className="font-bold text-slate-900 text-xs mb-1.5 flex items-center justify-between">
                      <span>B. BIAYA UPAH TENAGA KERJA LANGSUNG (MANPOWER)</span>
                      <span className="font-mono text-blue-900">Subtotal: {formatCurrency(m.laborTotal)}</span>
                    </p>
                    <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold">
                          <th className="py-1.5 px-2.5 border border-slate-200 w-8 text-center">No</th>
                          <th className="py-1.5 px-2.5 border border-slate-200">Kategori Keahlian Tenaga Kerja</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-center w-16">Alokasi</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-center w-16">Satuan</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-right w-32">Rate per Jam</th>
                          <th className="py-1.5 px-2.5 border border-slate-200 text-right w-32">Subtotal (IDR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rab.labor.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200">{it.name}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-center font-mono">{it.qty}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-center">{it.unit}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                            <td className="py-1.5 px-2.5 border border-slate-200 text-right font-mono font-semibold">{formatCurrency(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Category C & D Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-slate-900 text-[11px] mb-1 flex items-center justify-between">
                        <span>C. MESIN &amp; SUBKON</span>
                        <span className="font-mono">{formatCurrency(m.machTotal)}</span>
                      </p>
                      <table className="w-full text-left border-collapse border border-slate-200 text-[10px]">
                        <tbody>
                          {rab.machining.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td className="py-1 px-2 border border-slate-200">{it.name}</td>
                              <td className="py-1 px-2 border border-slate-200 text-right font-mono font-semibold">{formatCurrency(it.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 text-[11px] mb-1 flex items-center justify-between">
                        <span>D. OVERHEAD &amp; TESTING QC</span>
                        <span className="font-mono">{formatCurrency(m.ovhTotal)}</span>
                      </p>
                      <table className="w-full text-left border-collapse border border-slate-200 text-[10px]">
                        <tbody>
                          {rab.overhead.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td className="py-1 px-2 border border-slate-200">{it.name}</td>
                              <td className="py-1 px-2 border border-slate-200 text-right font-mono font-semibold">{formatCurrency(it.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Grand Total Summary Box */}
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>TOTAL RENCANA ANGGARAN BIAYA (HPP = A + B + C + D):</span>
                    <span className="font-mono text-sm text-blue-900">{formatCurrency(m.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>NILAI KONTRAK / HARGA JUAL PROYEK:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(rab.contractValue)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-emerald-800 pt-1.5 border-t border-slate-300">
                    <span>ESTIMASI LABA KOTOR (GROSS MARGIN):</span>
                    <span className="font-mono text-base">{m.marginPct.toFixed(1)}% ({formatCurrency(m.grossProfit)})</span>
                  </div>
                </div>

                {/* Official Signatures (3 Columns) */}
                <div className="grid grid-cols-3 gap-6 pt-6 text-center text-[11px]">
                  <div>
                    <p className="text-slate-500">Disusun Oleh,</p>
                    <div className="h-16"></div>
                    <p className="font-bold text-slate-900 underline">Eko Prasetyo, S.T.</p>
                    <p className="text-[10px] text-slate-500">Cost Estimator / Sales Engineering</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Diperiksa Oleh,</p>
                    <div className="h-16"></div>
                    <p className="font-bold text-slate-900 underline">Reza Pratama, PMP</p>
                    <p className="text-[10px] text-slate-500">Project Manager</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Disetujui Oleh Direksi,</p>
                    <div className="h-16"></div>
                    <p className="font-bold text-slate-900 underline">Ahmad Faisal</p>
                    <p className="text-[10px] text-slate-500">Direktur Operasional &amp; Keuangan</p>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

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
