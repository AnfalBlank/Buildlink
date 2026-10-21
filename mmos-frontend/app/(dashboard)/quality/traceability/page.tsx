"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { 
  FileCheck2, Search, Plus, Eye, Printer, Layers, 
  Tag, HardDrive, CheckCircle2, ShieldCheck, Scale, 
  Flame, Sparkles, Building2, Calendar, FileText, ArrowUpDown, 
  MapPin, Wrench, RefreshCw, ZoomIn, ZoomOut, X 
} from "lucide-react";

// --- Types ---
interface MTCRecord {
  id: string;
  heatNumber: string;
  mtcNumber: string;
  millOrigin: string;
  grade: string;
  productType: "Plate" | "Pipe" | "Beam" | "Forging";
  originalDimensions: string;
  initialQty: number;
  totalWeightKg: number;
  dateReceived: string;
  poReference: string;
  chemical: {
    c: number;
    mn: number;
    p: number;
    s: number;
    si: number;
  };
  mechanical: {
    yieldStrengthMpa: number;
    tensileStrengthMpa: number;
    elongationPct: number;
  };
  status: "Conforming" | "Pending Lab Test" | "Quarantined";
  certificateScanUrl: string;
}

interface ComponentTraceItem {
  id: string;
  unitSerial: string;
  projectName: string;
  componentName: string;
  heatNumber: string;
  mtcNumber: string;
  grade: string;
  jointId: string;
  welderId: string;
  ndtMethod: string;
  ndtResult: "Pass" | "Fail" | "Pending";
}

interface RemnantPlate {
  id: string;
  code: string;
  heatNumber: string;
  grade: string;
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  weightKg: number;
  locationRack: string;
  estimatedValue: number;
  status: "Available" | "Reserved" | "Scrap";
  reservedForWO?: string;
  dateLogged: string;
}

// Preset Dummy Data
const INITIAL_MTCS: MTCRecord[] = [
  {
    id: "MTC001",
    heatNumber: "HT-KS-2023-11456",
    mtcNumber: "KS/MTC/2023-11456",
    millOrigin: "PT Krakatau Steel (Persero) Tbk",
    grade: "ASTM A572 Grade 50",
    productType: "Plate",
    originalDimensions: "25mm x 2500mm x 12000mm",
    initialQty: 5,
    totalWeightKg: 29437,
    dateReceived: "2026-09-23",
    poReference: "PO-2026-001",
    chemical: { c: 0.14, mn: 0.12, p: 0.06, s: 0.03, si: 0.90 },
    mechanical: { yieldStrengthMpa: 690, tensileStrengthMpa: 650, elongationPct: 13 },
    status: "Conforming",
    certificateScanUrl: "/evidence/mtc_certificate_sample.jpg",
  },
  {
    id: "MTC002",
    heatNumber: "HT-GG-99482-B",
    mtcNumber: "GG/QA/2026-0881",
    millOrigin: "PT Gunung Garuda",
    grade: "ASTM A36 / SS400",
    productType: "Plate",
    originalDimensions: "12mm x 2400mm x 9400mm",
    initialQty: 10,
    totalWeightKg: 21252,
    dateReceived: "2026-10-02",
    poReference: "PO-2026-002",
    chemical: { c: 0.18, mn: 0.65, p: 0.02, s: 0.02, si: 0.22 },
    mechanical: { yieldStrengthMpa: 310, tensileStrengthMpa: 460, elongationPct: 24 },
    status: "Conforming",
    certificateScanUrl: "/evidence/mtc_certificate_sample.jpg",
  },
  {
    id: "MTC003",
    heatNumber: "HT-NIPPON-8419",
    mtcNumber: "NSC-MTC-2026-4401",
    millOrigin: "Nippon Steel Corporation",
    grade: "ASME SA516 Gr. 70 (HIC Tested)",
    productType: "Plate",
    originalDimensions: "16mm x 2500mm x 6000mm",
    initialQty: 4,
    totalWeightKg: 7536,
    dateReceived: "2026-10-10",
    poReference: "PO-2026-003",
    chemical: { c: 0.22, mn: 1.15, p: 0.012, s: 0.003, si: 0.35 },
    mechanical: { yieldStrengthMpa: 360, tensileStrengthMpa: 525, elongationPct: 23 },
    status: "Conforming",
    certificateScanUrl: "/evidence/mtc_certificate_sample.jpg",
  },
  {
    id: "MTC004",
    heatNumber: "HT-BAO-67210",
    mtcNumber: "BAO-QC-2026-902",
    millOrigin: "Baosteel Group",
    grade: "ASTM A106 Gr. B Seamless",
    productType: "Pipe",
    originalDimensions: "SCH 40 Dia 4 Inch x 6000mm",
    initialQty: 24,
    totalWeightKg: 2320,
    dateReceived: "2026-10-15",
    poReference: "PO-2026-004",
    chemical: { c: 0.21, mn: 0.85, p: 0.015, s: 0.01, si: 0.28 },
    mechanical: { yieldStrengthMpa: 295, tensileStrengthMpa: 455, elongationPct: 28 },
    status: "Conforming",
    certificateScanUrl: "/evidence/mtc_certificate_sample.jpg",
  },
];

const INITIAL_TRACE_ITEMS: ComponentTraceItem[] = [
  { id: "t1", unitSerial: "SN-TK-001", projectName: "Fabrikasi Tangki Storage CPO 5.000 KL", componentName: "Shell Plate Ring 1 Course A", heatNumber: "HT-KS-2023-11456", mtcNumber: "KS/MTC/2023-11456", grade: "ASTM A572 Gr.50", jointId: "JNT-SH-01", welderId: "WLD-01 (Budi 6G)", ndtMethod: "RT 100%", ndtResult: "Pass" },
  { id: "t2", unitSerial: "SN-TK-001", projectName: "Fabrikasi Tangki Storage CPO 5.000 KL", componentName: "Shell Plate Ring 1 Course B", heatNumber: "HT-KS-2023-11456", mtcNumber: "KS/MTC/2023-11456", grade: "ASTM A572 Gr.50", jointId: "JNT-SH-02", welderId: "WLD-02 (Roni 3G)", ndtMethod: "RT 100%", ndtResult: "Pass" },
  { id: "t3", unitSerial: "SN-TK-001", projectName: "Fabrikasi Tangki Storage CPO 5.000 KL", componentName: "Bottom Annular Plate Segment 1", heatNumber: "HT-GG-99482-B", mtcNumber: "GG/QA/2026-0881", grade: "ASTM A36", jointId: "JNT-AN-01", welderId: "WLD-01 (Budi 6G)", ndtMethod: "Vacuum Box", ndtResult: "Pass" },
  { id: "t4", unitSerial: "SN-TK-001", projectName: "Fabrikasi Tangki Storage CPO 5.000 KL", componentName: "Manhole Neck 24 Inch Flange", heatNumber: "HT-NIPPON-8419", mtcNumber: "NSC-MTC-2026-4401", grade: "SA516 Gr.70", jointId: "JNT-MH-01", welderId: "WLD-03 (Andi 6G)", ndtMethod: "UT & MPI", ndtResult: "Pass" },
  { id: "t5", unitSerial: "SN-TK-001", projectName: "Fabrikasi Tangki Storage CPO 5.000 KL", componentName: "Inlet Nozzle N1 Pipe 4 Inch", heatNumber: "HT-BAO-67210", mtcNumber: "BAO-QC-2026-902", grade: "A106 Gr.B", jointId: "JNT-NZ-01", welderId: "WLD-03 (Andi 6G)", ndtMethod: "PT (Penetrant)", ndtResult: "Pass" },
  { id: "t6", unitSerial: "SN-TT-001", projectName: "Tangki Trailer Fuel 32.000L", componentName: "Bulkhead Compartment 1", heatNumber: "HT-GG-99482-B", mtcNumber: "GG/QA/2026-0881", grade: "ASTM A36", jointId: "JNT-TT-04", welderId: "WLD-02 (Roni 3G)", ndtMethod: "Visual & UT", ndtResult: "Pass" },
];

const INITIAL_REMNANTS: RemnantPlate[] = [
  { id: "rem1", code: "REM-PL-12MM-001", heatNumber: "HT-GG-99482-B", grade: "ASTM A36", thicknessMm: 12, widthMm: 1200, lengthMm: 2400, weightKg: 271, locationRack: "Rak Pelat Sisa A-01", estimatedValue: 5284500, status: "Available", dateLogged: "2026-10-18" },
  { id: "rem2", code: "REM-PL-25MM-002", heatNumber: "HT-KS-2023-11456", grade: "ASTM A572 Gr.50", thicknessMm: 25, widthMm: 850, lengthMm: 1800, weightKg: 300, locationRack: "Rak Pelat Sisa A-03", estimatedValue: 6600000, status: "Available", dateLogged: "2026-10-19" },
  { id: "rem3", code: "REM-PL-16MM-003", heatNumber: "HT-NIPPON-8419", grade: "SA516 Gr.70", thicknessMm: 16, widthMm: 950, lengthMm: 1400, weightKg: 167, locationRack: "Rak Pelat Khusus B-02", estimatedValue: 4342000, status: "Reserved", reservedForWO: "WO-2026-003 (Manhole Reinforcement)", dateLogged: "2026-10-20" },
  { id: "rem4", code: "REM-PL-10MM-004", heatNumber: "HT-GG-99482-B", grade: "ASTM A36", thicknessMm: 10, widthMm: 600, lengthMm: 900, weightKg: 42, locationRack: "Bunkar Potongan C-01", estimatedValue: 819000, status: "Available", dateLogged: "2026-10-20" },
];

export default function MaterialTraceabilityPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "offcut" ? "offcut" : "mtc";

  const [activeTab, setActiveTab] = useState<"mtc" | "weldmap" | "offcut">(initialTab);
  const [mtcList, setMtcList] = useState<MTCRecord[]>(INITIAL_MTCS);
  const [traceList, setTraceList] = useState<ComponentTraceItem[]>(INITIAL_TRACE_ITEMS);
  const [remnantList, setRemnantList] = useState<RemnantPlate[]>(INITIAL_REMNANTS);

  const [search, setSearch] = useState("");
  const [selectedMtc, setSelectedMtc] = useState<MTCRecord | null>(null);
  const [showAddMtcModal, setShowAddMtcModal] = useState(false);
  const [showAddRemnantModal, setShowAddRemnantModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState<RemnantPlate | null>(null);
  const [showMdrPrintModal, setShowMdrPrintModal] = useState(false);

  // Filtered lists
  const filteredMtc = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return mtcList;
    return mtcList.filter(m => 
      m.heatNumber.toLowerCase().includes(q) ||
      m.mtcNumber.toLowerCase().includes(q) ||
      m.millOrigin.toLowerCase().includes(q) ||
      m.grade.toLowerCase().includes(q)
    );
  }, [mtcList, search]);

  const filteredTrace = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return traceList;
    return traceList.filter(t => 
      t.unitSerial.toLowerCase().includes(q) ||
      t.componentName.toLowerCase().includes(q) ||
      t.heatNumber.toLowerCase().includes(q) ||
      t.welderId.toLowerCase().includes(q)
    );
  }, [traceList, search]);

  const filteredRemnants = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return remnantList;
    return remnantList.filter(r => 
      r.code.toLowerCase().includes(q) ||
      r.heatNumber.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q) ||
      r.locationRack.toLowerCase().includes(q)
    );
  }, [remnantList, search]);

  // KPIs
  const totalRemnantValue = useMemo(() => {
    return remnantList.filter(r => r.status === "Available" || r.status === "Reserved")
      .reduce((s, r) => s + r.estimatedValue, 0);
  }, [remnantList]);

  const totalRemnantWeight = useMemo(() => {
    return remnantList.filter(r => r.status === "Available" || r.status === "Reserved")
      .reduce((s, r) => s + r.weightKg, 0);
  }, [remnantList]);

  const handleAllocateRemnant = (targetWO: string) => {
    if (!showAllocateModal) return;
    setRemnantList(remnantList.map(r => 
      r.id === showAllocateModal.id ? { ...r, status: "Reserved", reservedForWO: targetWO } : r
    ));
    toast.success("Pelat Sisa Dialokasikan", `${showAllocateModal.code} dialokasikan ke ${targetWO}. Menghemat pengadaan pelat baru!`);
    setShowAllocateModal(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Traceability & Sisa Pelat (Offcut)"
        subtitle="Registrasi nomor coran (Heat Number), sertifikat Mill Test Certificate (MTC), peta penelusuran unit (Weld Map), dan efisiensi sisa pelat potong"
        actions={
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary flex items-center gap-1.5 text-xs cursor-pointer"
              onClick={() => setShowMdrPrintModal(true)}
            >
              <Printer size={15} /> Cetak Buku Laporan MDR
            </button>
            {activeTab === "mtc" && (
              <button
                className="btn-primary flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                onClick={() => setShowAddMtcModal(true)}
              >
                <Plus size={15} /> Daftarkan Heat No / MTC
              </button>
            )}
            {activeTab === "offcut" && (
              <button
                className="btn-primary flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                onClick={() => setShowAddRemnantModal(true)}
              >
                <Plus size={15} /> Catat Pelat Sisa Baru
              </button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3.5 border-blue-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <FileCheck2 size={16} className="text-blue-500" />
            <span>Heat Number MTC Terdaftar</span>
          </div>
          <p className="font-mono font-bold text-2xl text-blue-500">{mtcList.length}</p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">Krakatau Steel, GG, Nippon Steel</p>
        </div>

        <div className="card p-3.5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Kesesuaian Uji Laboratorium</span>
          </div>
          <p className="font-mono font-bold text-2xl text-emerald-500">100%</p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">Uji Tarik & Kimia Conforming</p>
        </div>

        <div className="card p-3.5 border-amber-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <Layers size={16} className="text-amber-500" />
            <span>Pelat Sisa (Offcut) Aktif</span>
          </div>
          <p className="font-mono font-bold text-2xl text-amber-500">
            {remnantList.filter(r => r.status === "Available").length} <span className="text-xs font-normal">Lembar</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">
            Total {totalRemnantWeight} Kg Siap Digunakan
          </p>
        </div>

        <div className="card p-3.5 border-purple-500/20">
          <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
            <Sparkles size={16} className="text-purple-500" />
            <span>Nilai Efisiensi Pelat Sisa</span>
          </div>
          <p className="font-mono font-bold text-2xl text-purple-500">
            Rp {(totalRemnantValue / 1000000).toFixed(1)} <span className="text-xs font-normal">Jt</span>
          </p>
          <p className="text-[10px] text-text-secondary font-mono mt-0.5">Penghematan Pengadaan Baja</p>
        </div>
      </div>

      {/* Tab Controls & Search */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-surface p-1 rounded-xl border border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("mtc")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "mtc" ? "bg-accent text-white shadow-xs" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <FileCheck2 size={14} />
              <span>1. Katalog Heat Number & MTC</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{mtcList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("weldmap")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "weldmap" ? "bg-accent text-white shadow-xs" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Wrench size={14} />
              <span>2. Peta Penelusuran Unit (Weld Map)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{traceList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("offcut")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "offcut" ? "bg-accent text-white shadow-xs" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers size={14} />
              <span>3. Pelat Sisa / Offcut Bengkel</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{remnantList.length}</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              className="input pl-9 text-xs"
              placeholder="Cari Heat No, MTC, Serial, atau Grade..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1: MTC Log */}
        {activeTab === "mtc" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Registrasi Heat Number & Sertifikat Asal Pabrik Baja</h3>
                <p className="text-xs text-text-secondary">Arsip Mill Test Certificate lengkap dengan data komposisi kimia dan uji kekuatan tarik.</p>
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[950px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Nomor Coran (Heat Number)</th>
                    <th className="py-2.5 px-3 text-left">Pabrik Baja (Mill Origin)</th>
                    <th className="py-2.5 px-3 text-left">Grade & Spesifikasi</th>
                    <th className="py-2.5 px-3 text-left">Dimensi Awal</th>
                    <th className="py-2.5 px-3 text-right">Total Berat (Kg)</th>
                    <th className="py-2.5 px-3 text-center">Komposisi Kimia (% C / Mn / Si)</th>
                    <th className="py-2.5 px-3 text-center">Uji Tarik (Yield / Tensile)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMtc.map(m => (
                    <tr key={m.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-accent">{m.heatNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{m.millOrigin}</td>
                      <td className="py-2.5 px-3 font-semibold text-text-secondary">{m.grade}</td>
                      <td className="py-2.5 px-3 font-mono text-text-secondary">{m.originalDimensions}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-text-primary">{m.totalWeightKg.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-text-secondary">
                        C: {m.chemical.c}% | Mn: {m.chemical.mn}% | Si: {m.chemical.si}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-600">
                        {m.mechanical.yieldStrengthMpa} / {m.mechanical.tensileStrengthMpa} MPa
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedMtc(m)}
                          className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={13} /> Lihat Scan MTC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Weld & Component Traceability Map */}
        {activeTab === "weldmap" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Peta Penelusuran Komponen & Pengelasan (Weld & Component Map)</h3>
                <p className="text-xs text-text-secondary">Pelacakan Heat Number pada serial unit untuk persyaratan inspeksi ASME / Migas / MDR.</p>
              </div>
              <button
                onClick={() => setShowMdrPrintModal(true)}
                className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Cetak Buku MDR Traceability
              </button>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[950px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Unit Serial</th>
                    <th className="py-2.5 px-3 text-left">Nama Komponen / Bagian</th>
                    <th className="py-2.5 px-3 text-left">Heat Number Terpasang</th>
                    <th className="py-2.5 px-3 text-left">No. Sertifikat MTC</th>
                    <th className="py-2.5 px-3 text-center">Joint ID Las</th>
                    <th className="py-2.5 px-3 text-left">Welder ID (Juru Las)</th>
                    <th className="py-2.5 px-3 text-center">Metode NDT</th>
                    <th className="py-2.5 px-3 text-center">Hasil Uji NDT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTrace.map(t => (
                    <tr key={t.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-text-primary">{t.unitSerial}</td>
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{t.componentName}</td>
                      <td className="py-2.5 px-3 font-mono text-accent font-semibold">{t.heatNumber}</td>
                      <td className="py-2.5 px-3 font-mono text-text-secondary">{t.mtcNumber}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{t.jointId}</td>
                      <td className="py-2.5 px-3 text-text-secondary font-medium">{t.welderId}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{t.ndtMethod}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                          {t.ndtResult}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Remnant & Offcut Management */}
        {activeTab === "offcut" && (
          <div className="p-4 sm:p-5 space-y-5">
            {/* Visual Storage Rack Banner */}
            <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col md:flex-row items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/evidence/offcut_remnant_plates.jpg"
                alt="Offcut Remnant Plates Yard"
                className="w-full md:w-56 h-36 object-cover rounded-lg border border-border shadow-xs shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Gudang Pelat Sisa Bengkel Fabrikasi
                  </span>
                  <span className="text-xs text-text-secondary font-mono">Standar ISO 9001: Traceability & Efisiensi Bahan</span>
                </div>
                <h4 className="font-bold text-sm text-text-primary">
                  Pemanfaatan Pelat Sisa Potongan CNC Plasma & Oxy-Fuel
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Setiap sisa pelat potong yang memiliki dimensi di atas 500mm x 500mm wajib dicatat dengan barcode remnant dan Heat Number aslinya. Pelat sisa dapat langsung dialokasikan ke Work Order baru tanpa harus mengajukan pembelian pelat utuh baru.
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs">
                  <span className="text-emerald-500 font-bold font-mono">
                    Total Nilai Terhemat: Rp {totalRemnantValue.toLocaleString("id-ID")}
                  </span>
                  <span className="text-text-secondary">•</span>
                  <span className="text-blue-500 font-mono font-semibold">
                    Berat Sisa Tersedia: {totalRemnantWeight} Kg
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-border rounded-xl">
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-text-secondary">
                    <th className="py-2.5 px-3 text-left">Kode Remnant</th>
                    <th className="py-2.5 px-3 text-left">Asal Heat Number & Grade</th>
                    <th className="py-2.5 px-3 text-center">Tebal (mm)</th>
                    <th className="py-2.5 px-3 text-center">Dimensi Sisa (L x P mm)</th>
                    <th className="py-2.5 px-3 text-right">Berat Sisa (Kg)</th>
                    <th className="py-2.5 px-3 text-left">Lokasi Rak Gudang</th>
                    <th className="py-2.5 px-3 text-right">Nilai Estimasi (IDR)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRemnants.map(r => (
                    <tr key={r.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-accent">{r.code}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-text-primary font-semibold">{r.heatNumber}</span>
                        <span className="text-text-secondary block text-[10px]">{r.grade}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{r.thicknessMm} mm</td>
                      <td className="py-2.5 px-3 text-center font-mono text-text-secondary">{r.widthMm} x {r.lengthMm}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-500">{r.weightKg} Kg</td>
                      <td className="py-2.5 px-3 text-text-secondary flex items-center gap-1">
                        <MapPin size={12} className="text-amber-500 shrink-0" /> {r.locationRack}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">
                        Rp {r.estimatedValue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.status === "Available"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                        }`}>
                          {r.status === "Reserved" ? `Reserved (${r.reservedForWO?.split(" ")[0]})` : r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {r.status === "Available" ? (
                          <button
                            onClick={() => setShowAllocateModal(r)}
                            className="btn-primary py-1 px-2.5 text-xs cursor-pointer shadow-xs"
                          >
                            Alokasikan ke WO
                          </button>
                        ) : (
                          <span className="text-[11px] text-text-secondary font-mono">Teralokasi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / View MTC Modal */}
      {selectedMtc && (
        <Modal open title={`Mill Test Certificate (MTC) — ${selectedMtc.mtcNumber}`} onClose={() => setSelectedMtc(null)} size="lg">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-2 rounded-xl border border-border">
              <div>
                <p className="text-xs text-text-secondary font-medium">Nomor Coran (Heat Number):</p>
                <p className="font-mono font-bold text-base text-accent">{selectedMtc.heatNumber}</p>
                <p className="text-xs text-text-secondary mt-0.5">{selectedMtc.millOrigin} • {selectedMtc.grade}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedMtc.certificateScanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                >
                  <Eye size={13} /> Buka Berkas Penuh
                </a>
                <button
                  onClick={() => window.print()}
                  className="btn-primary flex items-center gap-1.5 text-xs"
                >
                  <Printer size={13} /> Cetak
                </button>
              </div>
            </div>

            {/* Scanned Document Stage */}
            <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-center max-h-[55vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMtc.certificateScanUrl}
                alt="Mill Test Certificate"
                className="max-h-[50vh] object-contain rounded shadow-lg"
              />
            </div>

            {/* Test Results Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-2 rounded-xl border border-border space-y-1">
                <p className="font-bold text-text-primary text-xs uppercase tracking-wider">Komposisi Kimia Aktual (Chemical Analysis):</p>
                <div className="grid grid-cols-5 gap-2 pt-1 font-mono text-center">
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">C %</span>
                    <strong className="text-text-primary">{selectedMtc.chemical.c}</strong>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">Mn %</span>
                    <strong className="text-text-primary">{selectedMtc.chemical.mn}</strong>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">P %</span>
                    <strong className="text-text-primary">{selectedMtc.chemical.p}</strong>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">S %</span>
                    <strong className="text-text-primary">{selectedMtc.chemical.s}</strong>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">Si %</span>
                    <strong className="text-text-primary">{selectedMtc.chemical.si}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-2 rounded-xl border border-border space-y-1">
                <p className="font-bold text-text-primary text-xs uppercase tracking-wider">Uji Sifat Mekanik (Mechanical Properties):</p>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">Yield (MPa)</span>
                    <strong className="text-emerald-500">{selectedMtc.mechanical.yieldStrengthMpa}</strong>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">Tensile (MPa)</span>
                    <strong className="text-emerald-500">{selectedMtc.mechanical.tensileStrengthMpa}</strong>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-border">
                    <span className="text-[10px] text-text-secondary block">Elongation</span>
                    <strong className="text-blue-500">{selectedMtc.mechanical.elongationPct}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setSelectedMtc(null)}>
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Allocate Remnant Modal */}
      {showAllocateModal && (
        <Modal open title={`Alokasikan Pelat Sisa — ${showAllocateModal.code}`} onClose={() => setShowAllocateModal(null)} size="md">
          <div className="space-y-4">
            <div className="p-3 bg-surface-2 rounded-xl border border-border space-y-1 text-xs">
              <p className="text-text-secondary">Material Potongan Terpilih:</p>
              <p className="font-bold text-text-primary text-sm">{showAllocateModal.code} ({showAllocateModal.grade})</p>
              <p className="font-mono text-text-secondary">
                Tebal: {showAllocateModal.thicknessMm}mm • Dimensi: {showAllocateModal.widthMm} x {showAllocateModal.lengthMm} mm • Berat: {showAllocateModal.weightKg} Kg
              </p>
              <p className="text-emerald-500 font-bold font-mono">
                Nilai Penghematan: Rp {showAllocateModal.estimatedValue.toLocaleString("id-ID")}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1.5">
                Pilih Surat Perintah Kerja (SPK / Work Order) Tujuan:
              </label>
              <select id="select-wo" className="select text-xs w-full">
                <option value="WO-2026-001 (Fit-Up & Shell Tangki CPO)">WO-2026-001 — Fit-Up & Shell Tangki CPO (SN-TK-001)</option>
                <option value="WO-2026-002 (Perakitan Rangka Baffle & Gusset)">WO-2026-002 — Perakitan Rangka Baffle & Gusset (SN-TK-001)</option>
                <option value="WO-2026-003 (Penguatan Manhole Flange)">WO-2026-003 — Penguatan Manhole Flange (SN-TT-001)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button className="btn-secondary text-xs" onClick={() => setShowAllocateModal(null)}>Batal</button>
              <button
                className="btn-primary text-xs"
                onClick={() => {
                  const selectEl = document.getElementById("select-wo") as HTMLSelectElement;
                  handleAllocateRemnant(selectEl ? selectEl.value : "WO-2026-001");
                }}
              >
                Konfirmasi Alokasi Sisa Pelat
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official MDR Print Modal */}
      {showMdrPrintModal && (
        <Modal open title="Manufacturer Data Report (MDR) — Material Traceability Log" onClose={() => setShowMdrPrintModal(false)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-xs text-text-secondary">Dokumen resmi penyerahan data material fabrikasi untuk inspektor pihak ketiga (MDR Databook).</p>
              <button
                className="btn-primary flex items-center gap-2 text-xs"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Cetak / Export PDF
              </button>
            </div>

            {/* Official Paper Document */}
            <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-300 shadow-sm font-sans text-xs space-y-5">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div>
                  <span className="font-black text-xl tracking-tight text-blue-900 font-mono">PT. MANGGALA UTAMA INDONESIA</span>
                  <p className="text-[11px] text-slate-600">Departemen Quality Assurance & Metrology Inspection</p>
                  <p className="text-[10px] text-slate-500">Standar Acuan: ASME Sec. VIII Div. 1 / API 650 / AWS D1.1</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    MATERIAL TRACEABILITY RECORD (MTR)
                  </span>
                  <p className="font-mono font-bold text-xs text-slate-800 mt-1">DOC-MDR-2026-001</p>
                  <p className="text-[10px] text-slate-500">Unit: SN-TK-001</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3 border border-slate-900">No</th>
                      <th className="py-2 px-3 border border-slate-900">Komponen Unit</th>
                      <th className="py-2 px-3 border border-slate-900">Heat Number</th>
                      <th className="py-2 px-3 border border-slate-900">MTC Ref No.</th>
                      <th className="py-2 px-3 border border-slate-900 text-center">Joint ID</th>
                      <th className="py-2 px-3 border border-slate-900 text-center">NDT</th>
                      <th className="py-2 px-3 border border-slate-900 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {traceList.map((t, idx) => (
                      <tr key={t.id}>
                        <td className="py-2 px-3 border border-slate-200 text-center font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 border border-slate-200 font-medium">{t.componentName}</td>
                        <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-slate-800">{t.heatNumber}</td>
                        <td className="py-2 px-3 border border-slate-200 font-mono text-slate-600">{t.mtcNumber}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-mono font-bold">{t.jointId}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-600">{t.ndtMethod}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-bold text-emerald-700">ACCEPTED</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-6 text-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">QC Material Inspector:</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Andi Saputra, A.Md.</p>
                  <p className="text-[10px] text-slate-500">QC Specialist</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Third-Party / Client Inspector:</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-900 underline">Ir. Bambang Trihatmojo</p>
                  <p className="text-[10px] text-slate-500">Authorized Inspection Agency (AIA)</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
