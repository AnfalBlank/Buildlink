"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { 
  Calculator, Plus, Eye, Printer, Download, Sparkles, 
  Trash2, Layers, Flame, Paintbrush, Users, ShieldAlert, 
  ArrowRight, CheckCircle2, TrendingUp, DollarSign, Scale, 
  FileText, Building2, Calendar, RefreshCw, Sliders 
} from "lucide-react";

// --- Types ---
interface MaterialItem {
  id: string;
  name: string;
  spec: string;
  type: "Plate" | "Beam" | "Pipe" | "Component";
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  qty: number;
  unitWeightKg: number;
  totalWeightKg: number;
  pricePerKg: number;
  totalCost: number;
}

interface ConsumableItem {
  id: string;
  name: string;
  qty: number;
  uom: string;
  unitPrice: number;
  totalCost: number;
}

interface PaintingItem {
  id: string;
  name: string;
  areaM2: number;
  ratePerM2: number;
  totalCost: number;
}

interface LaborItem {
  id: string;
  role: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
}

interface SubconItem {
  id: string;
  service: string;
  description: string;
  cost: number;
}

interface RABProject {
  id: string;
  code: string;
  title: string;
  customer: string;
  date: string;
  leadTimeWeeks: number;
  status: "Draft" | "Reviewed" | "Approved" | "Converted to SO";
  overheadPct: number;
  contingencyPct: number;
  targetMarginPct: number;
  materials: MaterialItem[];
  consumables: ConsumableItem[];
  paintings: PaintingItem[];
  labors: LaborItem[];
  subcons: SubconItem[];
}

// Preset demo projects for testing
const PRESET_RABS: RABProject[] = [
  {
    id: "RAB001",
    code: "RAB-2026-001",
    title: "Fabrikasi Tangki Storage Minyak CPO 5.000 KL (SN-TK-001)",
    customer: "PT Pertamina Trans Kontinental",
    date: "2026-10-18",
    leadTimeWeeks: 10,
    status: "Approved",
    overheadPct: 8,
    contingencyPct: 5,
    targetMarginPct: 22,
    materials: [
      { id: "m1", name: "Shell Plate Ring 1 (Bottom Course)", spec: "ASTM A36 Plate", type: "Plate", thicknessMm: 14, widthMm: 2400, lengthMm: 9400, qty: 8, unitWeightKg: 2482, totalWeightKg: 19856, pricePerKg: 19500, totalCost: 387192000 },
      { id: "m2", name: "Shell Plate Ring 2 (Middle Course)", spec: "ASTM A36 Plate", type: "Plate", thicknessMm: 10, widthMm: 2400, lengthMm: 9400, qty: 8, unitWeightKg: 1773, totalWeightKg: 14184, pricePerKg: 19500, totalCost: 276588000 },
      { id: "m3", name: "Annular & Bottom Bottom Plate", spec: "SS400 Plate", type: "Plate", thicknessMm: 10, widthMm: 2000, lengthMm: 6000, qty: 12, unitWeightKg: 942, totalWeightKg: 11304, pricePerKg: 18800, totalCost: 212515200 },
      { id: "m4", name: "Conical Roof Plate & Rafter", spec: "SS400 / UNP 150", type: "Beam", thicknessMm: 6, widthMm: 1500, lengthMm: 6000, qty: 6, unitWeightKg: 424, totalWeightKg: 2544, pricePerKg: 21000, totalCost: 53424000 },
      { id: "m5", name: "Nozzle N1-N4 & Manhole 24 Inch", spec: "A106 Gr.B & A105 Flange", type: "Component", thicknessMm: 12, widthMm: 600, lengthMm: 1200, qty: 4, unitWeightKg: 148, totalWeightKg: 592, pricePerKg: 42000, totalCost: 24864000 },
    ],
    consumables: [
      { id: "c1", name: "Kawat Las E7018 (LB-52 3.2mm & 4.0mm)", qty: 750, uom: "Kg", unitPrice: 38500, totalCost: 28875000 },
      { id: "c2", name: "Kawat Las MIG ER70S-6 (Spool 15kg)", qty: 400, uom: "Kg", unitPrice: 42000, totalCost: 16800000 },
      { id: "c3", name: "Gas Pelindung Argon & CO2", qty: 35, uom: "Tabung", unitPrice: 280000, totalCost: 9800000 },
      { id: "c4", name: "Gas Potong Oksigen & LPG CNC Cutting", qty: 45, uom: "Tabung", unitPrice: 155000, totalCost: 6975000 },
      { id: "c5", name: "Batu Gerinda Cutting & Grinding 4 & 7 Inch", qty: 250, uom: "Pcs", unitPrice: 18000, totalCost: 4500000 },
    ],
    paintings: [
      { id: "p1", name: "Surface Prep: Sandblasting Sa 2.5", areaM2: 1250, ratePerM2: 65000, totalCost: 81250000 },
      { id: "p2", name: "Primer Coat: Inorganic Zinc / Epoxy (75 um)", areaM2: 1250, ratePerM2: 45000, totalCost: 56250000 },
      { id: "p3", name: "Intermediate Coat: High Build Epoxy (125 um)", areaM2: 1250, ratePerM2: 52000, totalCost: 65000000 },
      { id: "p4", name: "Topcoat: Polyurethane UV Gloss White (50 um)", areaM2: 1250, ratePerM2: 58000, totalCost: 72500000 },
    ],
    labors: [
      { id: "l1", role: "Fitter 1 (Tank & Shell Layout)", hours: 420, hourlyRate: 45000, totalCost: 18900000 },
      { id: "l2", role: "Welder 3G/6G SMAW & FCAW Certified", hours: 680, hourlyRate: 60000, totalCost: 40800000 },
      { id: "l3", role: "Grinder & Helper Fabrikasi", hours: 480, hourlyRate: 35000, totalCost: 16800000 },
      { id: "l4", role: "Blaster & Painter Specialist", hours: 260, hourlyRate: 40000, totalCost: 10400000 },
      { id: "l5", role: "QC Metrology & Welding Inspector", hours: 110, hourlyRate: 75000, totalCost: 8250000 },
    ],
    subcons: [
      { id: "s1", service: "Uji NDT: Radiography Test (RT 100% T-Joint)", description: "Pengujian film sinar X sambungan las kritis shell tangki", cost: 18500000 },
      { id: "s2", service: "Hydrostatic Test Water & Vacuum Box Test", description: "Pengisian air uji tekanan, pengetesan kebocoran bottom plate", cost: 14000000 },
      { id: "s3", service: "Rental Mobile Crane 25 Ton (Assembly & Roll)", description: "Bongkar muat dan ereksi plat shell di area workshop/yard", cost: 16000000 },
    ],
  },
  {
    id: "RAB002",
    code: "RAB-2026-002",
    title: "Fabrikasi Struktur Baja Heavy Workshop & Crane Runway (62.8 Ton)",
    customer: "PT Astra Honda Motor",
    date: "2026-10-14",
    leadTimeWeeks: 8,
    status: "Draft",
    overheadPct: 7,
    contingencyPct: 5,
    targetMarginPct: 20,
    materials: [
      { id: "m201", name: "Kolom Utama WF 400x200x8x13", spec: "SS400 Beam", type: "Beam", thicknessMm: 13, widthMm: 200, lengthMm: 12000, qty: 16, unitWeightKg: 792, totalWeightKg: 12672, pricePerKg: 21500, totalCost: 272448000 },
      { id: "m202", name: "Rafter Kuda-Kuda WF 350x175x7x11", spec: "SS400 Beam", type: "Beam", thicknessMm: 11, widthMm: 175, lengthMm: 12000, qty: 24, unitWeightKg: 595, totalWeightKg: 14280, pricePerKg: 21500, totalCost: 307020000 },
      { id: "m203", name: "Crane Girder Runway WF 500x200x10x16", spec: "SM490 High Tensile", type: "Beam", thicknessMm: 16, widthMm: 200, lengthMm: 12000, qty: 12, unitWeightKg: 1075, totalWeightKg: 12900, pricePerKg: 23500, totalCost: 303150000 },
      { id: "m204", name: "Base Plate, Stiffener & Gusset 20mm", spec: "A36 Steel Plate", type: "Plate", thicknessMm: 20, widthMm: 1500, lengthMm: 6000, qty: 8, unitWeightKg: 1413, totalWeightKg: 11304, pricePerKg: 20000, totalCost: 226080000 },
      { id: "m205", name: "Baut Mur High Tensile A325 M20 & M24", spec: "Grade 8.8 Galvanized", type: "Component", thicknessMm: 24, widthMm: 24, lengthMm: 120, qty: 850, unitWeightKg: 0.85, totalWeightKg: 722, pricePerKg: 48000, totalCost: 34656000 },
    ],
    consumables: [
      { id: "c201", name: "Kawat Las FCAW-G E71T-1C (1.2mm)", qty: 650, uom: "Kg", unitPrice: 41000, totalCost: 26650000 },
      { id: "c202", name: "Gas CO2 100% Shielding", qty: 32, uom: "Tabung", unitPrice: 180000, totalCost: 5760000 },
      { id: "c203", name: "Cutting Gas Propane / Oxygen", qty: 38, uom: "Tabung", unitPrice: 160000, totalCost: 6080000 },
    ],
    paintings: [
      { id: "p201", name: "Surface Prep: Power Tool Cleaning St 3", areaM2: 1850, ratePerM2: 35000, totalCost: 64750000 },
      { id: "p202", name: "Zinc Chromate Alkyd Primer (80 um)", areaM2: 1850, ratePerM2: 38000, totalCost: 70300000 },
      { id: "p203", name: "Topcoat Synthetic Gloss Grey (50 um)", areaM2: 1850, ratePerM2: 42000, totalCost: 77700000 },
    ],
    labors: [
      { id: "l201", role: "Fitter Struktur Baja", hours: 550, hourlyRate: 45000, totalCost: 24750000 },
      { id: "l202", role: "Welder Struktur 3G FCAW", hours: 620, hourlyRate: 55000, totalCost: 34100000 },
      { id: "l203", role: "Helper & Finishing Grinding", hours: 440, hourlyRate: 35000, totalCost: 15400000 },
    ],
    subcons: [
      { id: "s201", service: "Hot Dip Galvanizing Bracing & Purlin", description: "Pencelupan galvanis panas anti karat 4.5 Ton", cost: 38250000 },
      { id: "s202", service: "Uji NDT Magnetic Particle (MT) Girder", description: "Uji keretakan lasan crane girder", cost: 9500000 },
    ],
  },
];

export default function FabricationRABPage() {
  const [rabs, setRabs] = useState<RABProject[]>(PRESET_RABS);
  const [selectedId, setSelectedId] = useState<string>("RAB001");
  const [activeTab, setActiveTab] = useState<"materials" | "consumables" | "paintings" | "labors" | "subcons" | "recap">("materials");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New item forms
  const [newMaterial, setNewMaterial] = useState<Partial<MaterialItem>>({
    name: "", spec: "ASTM A36", type: "Plate", thicknessMm: 12, widthMm: 1500, lengthMm: 6000, qty: 1, pricePerKg: 19500
  });

  const curRAB = useMemo(() => {
    return rabs.find(r => r.id === selectedId) || rabs[0];
  }, [rabs, selectedId]);

  // Totals calculation
  const totals = useMemo(() => {
    const totalMaterialCost = curRAB.materials.reduce((sum, m) => sum + m.totalCost, 0);
    const totalWeightKg = curRAB.materials.reduce((sum, m) => sum + m.totalWeightKg, 0);
    const totalConsumableCost = curRAB.consumables.reduce((sum, c) => sum + c.totalCost, 0);
    const totalPaintingCost = curRAB.paintings.reduce((sum, p) => sum + p.totalCost, 0);
    const totalLaborCost = curRAB.labors.reduce((sum, l) => sum + l.totalCost, 0);
    const totalManHours = curRAB.labors.reduce((sum, l) => sum + l.hours, 0);
    const totalSubconCost = curRAB.subcons.reduce((sum, s) => sum + s.cost, 0);

    const directCost = totalMaterialCost + totalConsumableCost + totalPaintingCost + totalLaborCost + totalSubconCost;
    const overheadCost = directCost * (curRAB.overheadPct / 100);
    const contingencyCost = directCost * (curRAB.contingencyPct / 100);
    const totalHPP = directCost + overheadCost + contingencyCost;
    
    // Selling price using margin formula: HPP / (1 - Margin%)
    const marginDivisor = 1 - (curRAB.targetMarginPct / 100);
    const sellingPrice = marginDivisor > 0 ? totalHPP / marginDivisor : totalHPP * 1.25;
    const grossProfit = sellingPrice - totalHPP;
    const costPerKg = totalWeightKg > 0 ? totalHPP / totalWeightKg : 0;
    const sellingPricePerKg = totalWeightKg > 0 ? sellingPrice / totalWeightKg : 0;

    return {
      totalMaterialCost,
      totalWeightKg,
      totalWeightTon: totalWeightKg / 1000,
      totalConsumableCost,
      totalPaintingCost,
      totalLaborCost,
      totalManHours,
      totalSubconCost,
      directCost,
      overheadCost,
      contingencyCost,
      totalHPP,
      sellingPrice,
      grossProfit,
      costPerKg,
      sellingPricePerKg,
    };
  }, [curRAB]);

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.name) {
      toast.error("Validasi", "Nama material wajib diisi.");
      return;
    }

    const t = Number(newMaterial.thicknessMm) || 0;
    const w = Number(newMaterial.widthMm) || 0;
    const l = Number(newMaterial.lengthMm) || 0;
    const qty = Number(newMaterial.qty) || 1;
    const pricePerKg = Number(newMaterial.pricePerKg) || 19500;

    // Density: 7.85 g/cm3 = 7.85 * 10^-6 kg/mm3
    const unitWeight = (t * w * l * 7.85) / 1000000;
    const totalWeight = unitWeight * qty;
    const totalCost = totalWeight * pricePerKg;

    const newItem: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: newMaterial.name,
      spec: newMaterial.spec || "ASTM A36",
      type: newMaterial.type as MaterialItem["type"] || "Plate",
      thicknessMm: t,
      widthMm: w,
      lengthMm: l,
      qty,
      unitWeightKg: Math.round(unitWeight),
      totalWeightKg: Math.round(totalWeight),
      pricePerKg,
      totalCost: Math.round(totalCost),
    };

    setRabs(rabs.map(r => r.id === curRAB.id ? { ...r, materials: [...r.materials, newItem] } : r));
    toast.success("Material Ditambahkan", `${newItem.name} (${Math.round(totalWeight)} kg) berhasil ditambahkan ke estimasi.`);
    setNewMaterial({ name: "", spec: "ASTM A36", type: "Plate", thicknessMm: 12, widthMm: 1500, lengthMm: 6000, qty: 1, pricePerKg: 19500 });
  };

  const handleRemoveMaterial = (id: string) => {
    setRabs(rabs.map(r => r.id === curRAB.id ? { ...r, materials: r.materials.filter(m => m.id !== id) } : r));
    toast.info("Item Dihapus", "Baris material berhasil dihapus.");
  };

  const handleSyncToCRM = () => {
    toast.success(
      "Sinkronisasi Penawaran Berhasil",
      `Nilai RAB Rp ${Math.round(totals.sellingPrice).toLocaleString("id-ID")} disinkronkan ke Penawaran CRM (${curRAB.customer}).`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalkulator Estimasi & RAB Fabrikasi"
        subtitle="Rancangan Anggaran Biaya terinci: Takeoff pelat baja, tonase, kawat las, pengecatan, jam kerja, dan kalkulasi margin laba"
        actions={
          <div className="flex items-center gap-2">
            <button 
              className="btn-secondary flex items-center gap-1.5 text-xs cursor-pointer"
              onClick={() => setShowPrintModal(true)}
            >
              <Printer size={15} /> Cetak Lembar RAB Resmi
            </button>
            <button 
              className="btn-primary flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
              onClick={handleSyncToCRM}
            >
              <CheckCircle2 size={15} /> Sinkron ke Penawaran CRM
            </button>
          </div>
        }
      />

      {/* Project Selector & Quick Stats */}
      <div className="card p-4 sm:p-5 bg-gradient-to-r from-surface to-surface-2 border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Proyek Estimasi Aktif:</span>
              <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                {curRAB.code}
              </span>
              <StatusBadge status={curRAB.status} />
            </div>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="select text-sm sm:text-base font-bold text-text-primary py-1.5 bg-surface border-border max-w-xl"
            >
              {rabs.map(r => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.title} ({r.customer})
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary">
              Klien: <strong className="text-text-primary">{curRAB.customer}</strong> • Target Pengerjaan: <strong className="text-text-primary">{curRAB.leadTimeWeeks} Minggu</strong> • Tanggal Dokumen: <strong className="font-mono text-text-primary">{curRAB.date}</strong>
            </p>
          </div>

          {/* Quick Summary Pill on Header */}
          <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-text-secondary font-medium uppercase">Total Nilai Penawaran (IDR)</p>
              <p className="font-mono font-bold text-lg sm:text-xl text-emerald-500">
                Rp {Math.round(totals.sellingPrice).toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-text-secondary font-mono">
                Rp {Math.round(totals.sellingPricePerKg).toLocaleString("id-ID")} / kg • Margin {curRAB.targetMarginPct}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="card p-3.5 border-blue-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <Scale size={15} className="text-blue-500" />
            <span>Total Tonase Baja</span>
          </div>
          <p className="font-mono font-bold text-xl text-blue-500">
            {totals.totalWeightTon.toFixed(2)} <span className="text-xs font-normal">Ton</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">
            {Math.round(totals.totalWeightKg).toLocaleString("id-ID")} Kg Pelat/Profil
          </p>
        </div>

        <div className="card p-3.5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <DollarSign size={15} className="text-emerald-500" />
            <span>Biaya Material Utama</span>
          </div>
          <p className="font-mono font-bold text-xl text-emerald-500">
            Rp {(totals.totalMaterialCost / 1000000).toFixed(1)} <span className="text-xs font-normal">Jt</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">
            {((totals.totalMaterialCost / totals.directCost) * 100).toFixed(0)}% dari Total Direct Cost
          </p>
        </div>

        <div className="card p-3.5 border-amber-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <Users size={15} className="text-amber-500" />
            <span>Total Jam Kerja (MH)</span>
          </div>
          <p className="font-mono font-bold text-xl text-amber-500">
            {totals.totalManHours} <span className="text-xs font-normal">Jam</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">
            Rp {(totals.totalLaborCost / 1000000).toFixed(1)} Jt Upah Fitter/Welder
          </p>
        </div>

        <div className="card p-3.5 border-purple-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <Calculator size={15} className="text-purple-500" />
            <span>Harga Pokok (HPP)</span>
          </div>
          <p className="font-mono font-bold text-xl text-purple-500">
            Rp {(totals.totalHPP / 1000000).toFixed(1)} <span className="text-xs font-normal">Jt</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">
            Rp {Math.round(totals.costPerKg).toLocaleString("id-ID")} / Kg Dasar
          </p>
        </div>

        <div className="card p-3.5 border-rose-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <TrendingUp size={15} className="text-rose-500" />
            <span>Estimasi Laba Kotor</span>
          </div>
          <p className="font-mono font-bold text-xl text-rose-500">
            Rp {(totals.grossProfit / 1000000).toFixed(1)} <span className="text-xs font-normal">Jt</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">
            Margin: {curRAB.targetMarginPct}% Target Laba
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-border bg-surface-2 overflow-x-auto">
          {[
            { key: "materials", label: "1. Material & Pelat Baja", icon: Layers, count: curRAB.materials.length },
            { key: "consumables", label: "2. Kawat Las & Gas", icon: Flame, count: curRAB.consumables.length },
            { key: "paintings", label: "3. Blasting & Cat", icon: Paintbrush, count: curRAB.paintings.length },
            { key: "labors", label: "4. Jam Kerja (Man-hours)", icon: Users, count: curRAB.labors.length },
            { key: "subcons", label: "5. Subcon & NDT Test", icon: ShieldAlert, count: curRAB.subcons.length },
            { key: "recap", label: "6. Rekapitulasi & Margin", icon: Sliders, count: null },
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isSel
                    ? "border-accent text-accent bg-surface"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                <Icon size={14} />
                <span>{t.label}</span>
                {t.count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSel ? "bg-accent/20 text-accent font-bold" : "bg-surface text-text-secondary"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Materials Takeoff */}
        {activeTab === "materials" && (
          <div className="p-4 sm:p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Daftar Kebutuhan Material & Berat Baja (Steel Takeoff)</h3>
                <p className="text-xs text-text-secondary">Berat pelat dihitung otomatis dengan formula massa jenis baja 7.85 g/cm³.</p>
              </div>
              <div className="text-xs font-mono bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
                Subtotal Material: <strong className="text-emerald-500">Rp {curRAB.materials.reduce((s, m) => s + m.totalCost, 0).toLocaleString("id-ID")}</strong> ({totals.totalWeightTon.toFixed(2)} Ton)
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[850px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Nama Komponen / Bagian</th>
                    <th className="py-2.5 px-3 text-left">Spesifikasi Material</th>
                    <th className="py-2.5 px-3 text-center">Tebal (mm)</th>
                    <th className="py-2.5 px-3 text-center">Dimensi (L x P mm)</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Berat/Unit (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Total Berat (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Tarif (Rp/Kg)</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya (IDR)</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {curRAB.materials.map(m => (
                    <tr key={m.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{m.name}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{m.spec}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{m.thicknessMm}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-text-secondary">{m.widthMm} x {m.lengthMm}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{m.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{m.unitWeightKg.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-500">{m.totalWeightKg.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{m.pricePerKg.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">Rp {m.totalCost.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleRemoveMaterial(m.id)}
                          className="p-1 rounded text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Hapus baris"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddMaterial} className="p-4 rounded-xl border border-dashed border-border bg-surface-2/50 space-y-3">
              <div className="flex items-center gap-2">
                <Plus size={14} className="text-accent" />
                <span className="text-xs font-bold text-text-primary">Tambah Baris Komponen / Pelat Baru</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-text-secondary block mb-1">Nama Bagian / Komponen *</label>
                  <input
                    className="input text-xs"
                    placeholder="Contoh: Baffle Plate Internal"
                    value={newMaterial.name}
                    onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-secondary block mb-1">Spesifikasi Material</label>
                  <select
                    className="select text-xs"
                    value={newMaterial.spec}
                    onChange={e => setNewMaterial({ ...newMaterial, spec: e.target.value })}
                  >
                    <option value="ASTM A36">ASTM A36 (Structural Carbon Steel)</option>
                    <option value="SS400">JIS SS400 (Mild Steel)</option>
                    <option value="SA516 Gr.70">ASME SA516 Gr.70 (Boiler & Pressure Vessel)</option>
                    <option value="SUS304">Stainless Steel 304 (Corrosion Resistant)</option>
                    <option value="SM490B">SM490B (High Tensile Beam)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-secondary block mb-1">Tebal x Lebar x Panjang (mm)</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      className="input text-xs font-mono text-center"
                      placeholder="T (mm)"
                      value={newMaterial.thicknessMm}
                      onChange={e => setNewMaterial({ ...newMaterial, thicknessMm: Number(e.target.value) })}
                    />
                    <input
                      type="number"
                      className="input text-xs font-mono text-center"
                      placeholder="L (mm)"
                      value={newMaterial.widthMm}
                      onChange={e => setNewMaterial({ ...newMaterial, widthMm: Number(e.target.value) })}
                    />
                    <input
                      type="number"
                      className="input text-xs font-mono text-center"
                      placeholder="P (mm)"
                      value={newMaterial.lengthMm}
                      onChange={e => setNewMaterial({ ...newMaterial, lengthMm: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1">Qty</label>
                    <input
                      type="number"
                      className="input text-xs font-mono text-center"
                      value={newMaterial.qty}
                      onChange={e => setNewMaterial({ ...newMaterial, qty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-text-secondary block mb-1">Harga (Rp/Kg)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        className="input text-xs font-mono"
                        value={newMaterial.pricePerKg}
                        onChange={e => setNewMaterial({ ...newMaterial, pricePerKg: Number(e.target.value) })}
                      />
                      <button type="submit" className="btn-primary text-xs shrink-0 cursor-pointer">
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Consumables & Welding */}
        {activeTab === "consumables" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Kawat Las & Gas Pelindung (Welding Consumables)</h3>
                <p className="text-xs text-text-secondary">Estimasi konsumsi elektroda las, gas shielding argon/CO2, dan gas cutting.</p>
              </div>
              <div className="text-xs font-mono bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
                Total Konsumabel: <strong className="text-emerald-500">Rp {totals.totalConsumableCost.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Nama Material Konsumabel</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Kebutuhan</th>
                    <th className="py-2.5 px-3 text-center">Satuan (UOM)</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan (IDR)</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {curRAB.consumables.map(c => (
                    <tr key={c.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{c.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{c.qty}</td>
                      <td className="py-2.5 px-3 text-center text-text-secondary">{c.uom}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary">Rp {c.unitPrice.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">Rp {c.totalCost.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Surface Prep & Painting */}
        {activeTab === "paintings" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Surface Preparation & Painting Coating</h3>
                <p className="text-xs text-text-secondary">Hitungan luas area ($m^2$) untuk Sandblasting Sa 2.5, Primer, Intermediate, dan Topcoat.</p>
              </div>
              <div className="text-xs font-mono bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
                Total Pengecatan: <strong className="text-emerald-500">Rp {totals.totalPaintingCost.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Tahapan Pengecatan / Coating System</th>
                    <th className="py-2.5 px-3 text-center">Luas Area (m²)</th>
                    <th className="py-2.5 px-3 text-right">Tarif Jasa & Cat (Rp/m²)</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {curRAB.paintings.map(p => (
                    <tr key={p.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{p.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-500">{p.areaM2} m²</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary">Rp {p.ratePerM2.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">Rp {p.totalCost.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Labors & Man-hours */}
        {activeTab === "labors" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Alokasi Jam Tenaga Kerja (Labor & Man-Hours Breakdown)</h3>
                <p className="text-xs text-text-secondary">Rincian jam kerja terencana untuk Fitter, Welder, Grinder, Blaster, dan Inspektor.</p>
              </div>
              <div className="text-xs font-mono bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
                Total Man-Hours: <strong className="text-blue-500">{totals.totalManHours} Jam</strong> • Rp <strong className="text-emerald-500">{totals.totalLaborCost.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Klasifikasi Tenaga Kerja (Skill Role)</th>
                    <th className="py-2.5 px-3 text-center">Alokasi Jam Kerja (MH)</th>
                    <th className="py-2.5 px-3 text-right">Tarif Upah Standar (Rp/Jam)</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya Upah (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {curRAB.labors.map(l => (
                    <tr key={l.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{l.role}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-500">{l.hours} Jam</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary">Rp {l.hourlyRate.toLocaleString("id-ID")} / jam</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">Rp {l.totalCost.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Subcon & NDT */}
        {activeTab === "subcons" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Jasa Pihak Ketiga, Uji NDT & Sewa Alat Berat</h3>
                <p className="text-xs text-text-secondary">Biaya pengujian Radiografi/Ultrasonik pihak ketiga, sertifikasi, dan crane workshop.</p>
              </div>
              <div className="text-xs font-mono bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
                Total Subcon & Testing: <strong className="text-emerald-500">Rp {totals.totalSubconCost.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Layanan / Jasa Sub-Kontrak</th>
                    <th className="py-2.5 px-3 text-left">Lingkup Pekerjaan & Spesifikasi</th>
                    <th className="py-2.5 px-3 text-right">Nilai Biaya (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {curRAB.subcons.map(s => (
                    <tr key={s.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{s.service}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{s.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">Rp {s.cost.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Rekapitulasi & Pricing Markup */}
        {activeTab === "recap" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Summary Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <FileText size={16} className="text-accent" />
                  Rincian Biaya Langsung (Direct Cost)
                </h4>
                <div className="bg-surface-2 rounded-xl border border-border divide-y divide-border text-xs">
                  <div className="p-3 flex justify-between">
                    <span className="text-text-secondary">1. Biaya Material Utama ({totals.totalWeightTon.toFixed(2)} Ton)</span>
                    <span className="font-mono font-bold text-text-primary">Rp {totals.totalMaterialCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-text-secondary">2. Kawat Las & Gas Konsumabel</span>
                    <span className="font-mono font-bold text-text-primary">Rp totals {totals.totalConsumableCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-text-secondary">3. Surface Preparation & Pengecatan</span>
                    <span className="font-mono font-bold text-text-primary">Rp {totals.totalPaintingCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-text-secondary">4. Tenaga Kerja Langsung ({totals.totalManHours} Jam Kerja)</span>
                    <span className="font-mono font-bold text-text-primary">Rp {totals.totalLaborCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-text-secondary">5. Jasa Subcon, Uji NDT & Sewa Crane</span>
                    <span className="font-mono font-bold text-text-primary">Rp {totals.totalSubconCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="p-3.5 bg-surface flex justify-between text-sm font-bold border-t-2 border-border">
                    <span className="text-text-primary">Total Biaya Langsung (Direct Cost)</span>
                    <span className="font-mono text-accent">Rp {totals.directCost.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Markup & Commercial Parameters */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Sliders size={16} className="text-accent" />
                  Parameter Komersial, Overhead & Laba
                </h4>

                <div className="bg-surface-2 rounded-xl border border-border p-4 space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-text-secondary">Overhead Workshop (% dari Direct Cost)</span>
                      <span className="font-mono font-bold text-text-primary">{curRAB.overheadPct}% (Rp {Math.round(totals.overheadCost).toLocaleString("id-ID")})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={curRAB.overheadPct}
                      onChange={e => setRabs(rabs.map(r => r.id === curRAB.id ? { ...r, overheadPct: Number(e.target.value) } : r))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-text-secondary">Kontinjensi Risiko Proyek (% dari Direct Cost)</span>
                      <span className="font-mono font-bold text-text-primary">{curRAB.contingencyPct}% (Rp {Math.round(totals.contingencyCost).toLocaleString("id-ID")})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={1}
                      value={curRAB.contingencyPct}
                      onChange={e => setRabs(rabs.map(r => r.id === curRAB.id ? { ...r, contingencyPct: Number(e.target.value) } : r))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-text-secondary">Target Gross Profit Margin (%)</span>
                      <span className="font-mono font-bold text-emerald-500">{curRAB.targetMarginPct}% (Rp {Math.round(totals.grossProfit).toLocaleString("id-ID")})</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={curRAB.targetMarginPct}
                      onChange={e => setRabs(rabs.map(r => r.id === curRAB.id ? { ...r, targetMarginPct: Number(e.target.value) } : r))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Final Calculation Result Box */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-surface to-surface-2 border border-emerald-500/30 text-center space-y-1 mt-4">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Rekomendasi Harga Penawaran ke Klien</p>
                    <p className="font-mono font-black text-2xl sm:text-3xl text-emerald-500">
                      Rp {Math.round(totals.sellingPrice).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-text-secondary font-mono">
                      HPP Dasar: Rp {Math.round(totals.totalHPP).toLocaleString("id-ID")} • Tarif Jadi: <strong>Rp {Math.round(totals.sellingPricePerKg).toLocaleString("id-ID")} / Kg</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official Printable RAB Modal */}
      {showPrintModal && (
        <Modal open title={`Lembar Rekapitulasi RAB Resmi — ${curRAB.code}`} onClose={() => setShowPrintModal(false)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-xs text-text-secondary">Pratinjau lembar kalkulasi biaya tender fabrikasi siap cetak.</p>
              <button
                className="btn-primary flex items-center gap-2 text-xs"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Cetak / Export PDF
              </button>
            </div>

            {/* Official Paper Document */}
            <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-300 shadow-sm font-sans text-xs space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div className="space-y-1">
                  <span className="font-black text-xl tracking-tight text-blue-900 font-mono">PT. MANGGALA UTAMA INDONESIA</span>
                  <p className="text-[11px] text-slate-600">Heavy Steel Fabrication, Piping & Tank Manufacturing Division</p>
                  <p className="text-[10px] text-slate-500">Kawasan Industri Cikarang Blok B-12, Bekasi | Telp: (021) 8984-XXXX</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    LEMBAR ESTIMASI & RAB FABRIKASI
                  </span>
                  <p className="font-mono font-bold text-xs text-slate-800 mt-1">{curRAB.code}</p>
                  <p className="text-[10px] text-slate-500">Tanggal: {curRAB.date}</p>
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <p className="text-slate-500">Judul Pekerjaan / Proyek:</p>
                  <p className="font-bold text-slate-900 text-sm">{curRAB.title}</p>
                  <p className="text-slate-500 mt-1">Nama Klien / Pemesan:</p>
                  <p className="font-semibold text-slate-800">{curRAB.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Total Estimasi Berat Bersih:</p>
                  <p className="font-mono font-bold text-base text-blue-900">{totals.totalWeightTon.toFixed(2)} TON ({Math.round(totals.totalWeightKg).toLocaleString("id-ID")} Kg)</p>
                  <p className="text-slate-500 mt-1">Waktu Pelaksanaan:</p>
                  <p className="font-semibold text-slate-800">{curRAB.leadTimeWeeks} Minggu Kalender</p>
                </div>
              </div>

              {/* Cost Summary Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3 border border-slate-900 w-12 text-center">No</th>
                      <th className="py-2 px-3 border border-slate-900">Komponen Biaya Konstruksi Fabrikasi</th>
                      <th className="py-2 px-3 border border-slate-900 text-right">Jumlah Biaya (IDR)</th>
                      <th className="py-2 px-3 border border-slate-900 text-center w-20">Porsi %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono">1</td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">Pengadaan Material Pelat & Profil Baja ({totals.totalWeightTon.toFixed(2)} Ton)</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">Rp {totals.totalMaterialCost.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-600">{((totals.totalMaterialCost / totals.directCost) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono">2</td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">Bahan Habis Pakai: Kawat Las, Gas Shielding & Cutting</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">Rp {totals.totalConsumableCost.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-600">{((totals.totalConsumableCost / totals.directCost) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono">3</td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">Surface Preparation (Sandblasting Sa 2.5) & Pengecatan 3-Layer</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">Rp {totals.totalPaintingCost.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-600">{((totals.totalPaintingCost / totals.directCost) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono">4</td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">Upah Tenaga Kerja Langsung ({totals.totalManHours} Jam Kerja Fitter & Welder)</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">Rp {totals.totalLaborCost.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-600">{((totals.totalLaborCost / totals.directCost) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono">5</td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">Jasa Sub-kontraktor, Pengujian NDT (RT/UT) & Sewa Mobile Crane</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">Rp {totals.totalSubconCost.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-600">{((totals.totalSubconCost / totals.directCost) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-right uppercase">Total Biaya Langsung (Direct Cost)</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono text-blue-900">Rp {totals.directCost.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono">100.0%</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3 border border-slate-200 text-right text-slate-600">Biaya Overhead Bengkel ({curRAB.overheadPct}%)</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono text-slate-700">Rp {Math.round(totals.overheadCost).toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3 border border-slate-200 text-right text-slate-600">Kontinjensi & Risiko Proyek ({curRAB.contingencyPct}%)</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-mono text-slate-700">Rp {Math.round(totals.contingencyCost).toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 border border-slate-200"></td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-right uppercase">Harga Pokok Produksi (HPP Total)</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono text-slate-900">Rp {Math.round(totals.totalHPP).toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 border border-slate-300"></td>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-950 font-bold">
                      <td colSpan={2} className="py-3 px-3 border border-emerald-300 text-right uppercase text-xs">
                        NILAI PENAWARAN REKOMENDASI (Gross Margin {curRAB.targetMarginPct}%)
                      </td>
                      <td className="py-3 px-3 border border-emerald-300 text-right font-mono text-base text-emerald-800">
                        Rp {Math.round(totals.sellingPrice).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 border border-emerald-300 text-center font-mono text-[10px]">FINAL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">Dihitung Oleh (Estimator):</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Eko Prasetyo, S.T.</p>
                  <p className="text-[10px] text-slate-500">Lead Cost Estimator</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Diverifikasi Oleh:</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Supri Santoso</p>
                  <p className="text-[10px] text-slate-500">Production Manager</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Disetujui Oleh (Direksi):</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Ahmad Faisal</p>
                  <p className="text-[10px] text-slate-500">Direktur Operasional</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
