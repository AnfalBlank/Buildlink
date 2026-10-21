"use client";
import { useState } from "react";
import { deliveryOrders as initialData, projects, productionOrders } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Eye, Pencil, Truck, CheckCircle2, Search, Printer,
  Calendar, ArrowUpDown, ShieldCheck, MapPin, User, FileText
} from "lucide-react";

type DO = typeof initialData[0];

const CHECKLIST = [
  "Final inspection QC passed & certificate signed",
  "NCRs closed or waived with QA manager approval",
  "As-built drawing & operation manual complete",
  "Customer sign-off & road permit received",
  "Down payment & milestone invoice verified",
  "Physical delivery note & seal inspection completed",
];

export default function DeliveryPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("deliveryDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<{ type: "add" | "view" | "checklist"; item?: DO } | null>(null);
  const [form, setForm] = useState<Partial<DO>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // Confirm dialog state
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
    .filter(d => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.code.toLowerCase().includes(q) ||
        d.customer.toLowerCase().includes(q) ||
        d.transporter.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || d.status === statusFilter;

      let matchPeriod = true;
      if (periodFilter === "Recent") {
        matchPeriod = d.deliveryDate.startsWith("2025") || d.deliveryDate.startsWith("2026");
      }

      return matchSearch && matchStatus && matchPeriod;
    })
    .sort((a, b) => {
      let valA = a[sortField as keyof DO] ?? "";
      let valB = b[sortField as keyof DO] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      toast.error("Validasi", "Silakan pilih proyek terkait.");
      return;
    }

    const proj = projects.find(p => p.id === form.projectId);
    setConfirmState({
      open: true,
      title: "Konfirmasi Buat Surat Jalan",
      message: `Terbitkan Surat Jalan Pengiriman (DO) baru untuk ${proj?.customer}?`,
      variant: "primary",
      confirmText: "Ya, Terbitkan DO",
      action: () => executeSave(),
    });
  };

  const executeSave = () => {
    const proj = projects.find(p => p.id === form.projectId);
    const newDO: DO = {
      id: `DO${String(data.length + 1).padStart(3, "0")}`,
      code: `DO-2026-${String(data.length + 1).padStart(3, "0")}`,
      projectId: form.projectId ?? "",
      salesOrderId: null,
      customer: proj?.customer ?? "",
      deliveryDate: form.deliveryDate ?? new Date().toISOString().split("T")[0],
      units: form.units?.length ? form.units : ["SN-UNIT-001"],
      transporter: form.transporter ?? "PT Andalas Cargo",
      driver: form.driver ?? "",
      truckPlate: form.truckPlate ?? "",
      destinationAddress: form.destinationAddress ?? "",
      status: "Planned",
      invoiceId: null,
      notes: form.notes ?? "",
    };

    setData([newDO, ...data]);
    setModal(null);
    setConfirmState(null);
    toast.success("Surat Jalan Dibuat", `Delivery order ${newDO.code} berhasil disimpan.`);
  };

  const handleConfirmDelivery = (d: DO) => {
    setConfirmState({
      open: true,
      title: "Konfirmasi Serah Terima Unit",
      message: `Konfirmasi bahwa unit pengiriman ${d.code} telah diterima oleh pelanggan ${d.customer}? Status akan diubah menjadi 'Delivered'.`,
      variant: "primary",
      confirmText: "Konfirmasi Selesai",
      action: () => {
        setData(data.map(item => (item.id === d.id ? { ...item, status: "Delivered" } : item)));
        toast.success("Pengiriman Selesai", `DO ${d.code} telah berstatus Delivered.`);
        setConfirmState(null);
        setModal(null);
      },
    });
  };

  const handleApproveRelease = (d: DO) => {
    setConfirmState({
      open: true,
      title: "Persetujuan Rilis Pengiriman",
      message: `Semua ${CHECKLIST.length} item checklist telah terpenuhi. Berikan otorisasi rilis jalan untuk unit ${d.code}?`,
      variant: "primary",
      confirmText: "Otorisasi Rilis",
      action: () => {
        setData(data.map(item => (item.id === d.id ? { ...item, status: "Ready for Delivery" } : item)));
        toast.success("Otorisasi Berhasil", `Unit ${d.code} siap diberangkatkan.`);
        setConfirmState(null);
        setModal(null);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Surat Jalan & Pengiriman (Delivery Orders)"
        subtitle="Dokumen pengiriman, checklist serah terima unit, dan ekspedisi transporter"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#2563EB]"
              title="Cetak Rekap Surat Jalan"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>
            <button
              className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
              onClick={() => {
                setForm({
                  deliveryDate: new Date().toISOString().split("T")[0],
                  transporter: "PT Andalas Cargo",
                });
                setModal({ type: "add" });
              }}
            >
              <Plus size={16} />
              <span>Surat Jalan Baru</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Surat Jalan (DO)", val: `${data.length} DO`, cls: "text-[#2563EB]" },
          { label: "Telah Terkirim (Delivered)", val: `${data.filter(d => d.status === "Delivered").length} DO`, cls: "text-[#16A34A]" },
          { label: "Jadwal Siap Kirim (Planned)", val: `${data.filter(d => d.status === "Planned" || d.status === "Ready for Delivery").length} DO`, cls: "text-[#D97706]" },
        ].map(s => (
          <div key={s.label} className="card p-4 transition-all hover:border-[#CBD5E1]">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="input !pl-10"
                placeholder="Cari kode DO, klien, atau vendor ekspedisi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="select w-44"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              {["Planned", "Ready for Delivery", "In Transit", "Delivered"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span>Urutkan:</span>
            <button
              onClick={() => handleSort("deliveryDate")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "deliveryDate" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>Tanggal Kirim</span>
              <ArrowUpDown size={12} />
            </button>
            <button
              onClick={() => handleSort("code")}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                sortField === "code" ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold" : "bg-white border-[#E2E8F0]"
              }`}
            >
              <span>No DO</span>
              <ArrowUpDown size={12} />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="table min-w-[1050px]">
            <thead>
              <tr>
                <th onClick={() => handleSort("code")} className="cursor-pointer hover:text-[#2563EB] whitespace-nowrap">
                  NO. SURAT JALAN
                </th>
                <th className="whitespace-nowrap">PELANGGAN / PENERIMA</th>
                <th className="whitespace-nowrap">PROYEK</th>
                <th onClick={() => handleSort("deliveryDate")} className="cursor-pointer hover:text-[#2563EB] whitespace-nowrap">
                  TANGGAL KIRIM
                </th>
                <th className="whitespace-nowrap">UNIT / SERIAL NUMBER</th>
                <th className="whitespace-nowrap">EKSPEDISI / DRIVER</th>
                <th className="whitespace-nowrap">NO. POLISI</th>
                <th className="whitespace-nowrap">STATUS</th>
                <th className="text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#94A3B8]">
                    Tidak ada surat jalan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="font-mono font-bold text-[#2563EB] whitespace-nowrap">{d.code}</td>
                    <td className="font-semibold text-[#0F172A] max-w-[180px] whitespace-nowrap">
                      <div className="truncate" title={d.customer}>{d.customer}</div>
                    </td>
                    <td className="font-mono text-xs text-[#64748B] whitespace-nowrap">{d.projectId}</td>
                    <td className="text-xs text-[#475569] font-mono whitespace-nowrap">{d.deliveryDate}</td>
                    <td className="whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        {d.units.map(u => (
                          <span key={u} className="font-mono text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded border border-[#BFDBFE]">
                            {u}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-xs text-[#475569] whitespace-nowrap">
                      <div className="font-medium text-[#0F172A]">{d.transporter}</div>
                      <div className="text-[#64748B] text-[11px]">{d.driver || "Driver Assigned"}</div>
                    </td>
                    <td className="font-mono text-xs text-[#64748B] whitespace-nowrap">{d.truckPlate || "—"}</td>
                    <td className="whitespace-nowrap"><StatusBadge status={d.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Lihat Surat Jalan & Cetak"
                          onClick={() => setModal({ type: "view", item: d })}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors cursor-pointer"
                          title="Checklist Otorisasi Rilis"
                          onClick={() => {
                            setChecks({});
                            setModal({ type: "checklist", item: d });
                          }}
                        >
                          Checklist
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

      {/* View Detail & Official Surat Jalan Print Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Surat Jalan Resmi — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-5">
            {/* Kop Surat Header */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">PT. MANGGALA UTAMA INDONESIA</h3>
                  <p className="text-xs text-[#64748B]">Divisi Logistik & Serah Terima Unit Manufaktur</p>
                  <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">MMOS Plant 1, Karawang International Industrial City</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
                    SURAT JALAN PENGIRIMAN
                  </span>
                  <p className="font-mono font-bold text-sm text-[#0F172A] mt-1.5">{modal.item.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                <div>
                  <p className="text-[#64748B] font-medium">Kepada Yth (Penerima):</p>
                  <p className="font-bold text-[#0F172A] mt-0.5">{modal.item.customer}</p>
                  <p className="text-[11px] text-[#64748B] font-mono">Proyek: {modal.item.projectId}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Tanggal Keberangkatan:</p>
                  <p className="font-semibold text-[#0F172A] mt-0.5 font-mono">{modal.item.deliveryDate}</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Ekspedisi / Armada:</p>
                  <p className="font-semibold text-[#0F172A] mt-0.5">{modal.item.transporter}</p>
                  <p className="text-[11px] text-[#64748B] font-mono">{modal.item.truckPlate} ({modal.item.driver})</p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">Status Pengiriman:</p>
                  <div className="mt-0.5"><StatusBadge status={modal.item.status} /></div>
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl flex items-start gap-3">
              <MapPin size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Alamat Tujuan Penyerahan:</p>
                <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                  {modal.item.destinationAddress || "Jl. Lapangan Migas Blok B-4, Fasilitas Penerimaan Klien"}
                </p>
              </div>
            </div>

            {/* Units Shipped */}
            <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Daftar Fisik Unit / Serial Number Yang Dikirim
              </h4>
              <div className="flex gap-2 flex-wrap">
                {modal.item.units.map(u => (
                  <div key={u} className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono font-bold text-[#2563EB]">
                    {u} — Tangki Siap Operasi
                  </div>
                ))}
              </div>
            </div>

            {/* Tanda Tangan Serah Terima */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs pt-3 border-t border-[#F1F5F9]">
              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Diserahkan Oleh (Pabrik)</p>
                <div className="h-12 flex items-end justify-center font-bold text-[#0F172A]">Supri Santoso</div>
                <p className="text-[10px] text-[#94A3B8]">Production Manager</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Pengemudi Ekspedisi</p>
                <div className="h-12 flex items-end justify-center font-bold text-[#0F172A]">{modal.item.driver || "Pak Joko"}</div>
                <p className="text-[10px] text-[#94A3B8]">Driver Ekspedisi</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl">
                <p className="text-[#64748B]">Diterima Oleh (Klien)</p>
                <div className="h-12 flex items-end justify-center font-bold text-[#0F172A]">( Tanda Tangan & Cap )</div>
                <p className="text-[10px] text-[#94A3B8]">{modal.item.customer}</p>
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
                <span>Cetak Surat Jalan (DO)</span>
              </button>

              <div className="flex items-center gap-2">
                <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setModal(null)}>
                  Tutup
                </button>
                {modal.item.status !== "Delivered" && (
                  <button
                    className="btn-primary !rounded-xl !py-2 !px-4 text-sm flex items-center gap-1.5 cursor-pointer"
                    onClick={() => handleConfirmDelivery(modal.item!)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Konfirmasi Serah Terima</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Release Checklist Modal */}
      {modal?.type === "checklist" && modal.item && (
        <Modal open title={`Checklist Otorisasi Pelepasan — ${modal.item.code}`} onClose={() => setModal(null)} size="md">
          <div className="space-y-4">
            <p className="text-xs text-[#64748B]">
              Seluruh parameter kualitas, kepatuhan keselamatan, dan administrasi wajib diverifikasi sebelum unit meninggalkan gerbang pabrik.
            </p>

            <div className="space-y-2">
              {CHECKLIST.map(item => (
                <label
                  key={item}
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#2563EB]"
                    checked={!!checks[item]}
                    onChange={e => setChecks({ ...checks, [item]: e.target.checked })}
                  />
                  <span className={`text-xs font-medium flex-1 ${checks[item] ? "text-[#16A34A] font-bold" : "text-[#0F172A]"}`}>
                    {item}
                  </span>
                  {checks[item] && <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />}
                </label>
              ))}
            </div>

            <div className="p-3 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] flex items-center justify-between text-xs">
              <span className="text-[#1E40AF] font-semibold">Progres Checklist:</span>
              <span className="font-mono font-bold text-[#2563EB]">
                {Object.values(checks).filter(Boolean).length} dari {CHECKLIST.length} terpenuhi
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
              <button className="btn-secondary !rounded-xl !py-2 !px-4 text-sm" onClick={() => setModal(null)}>
                Batal
              </button>
              <button
                className={`btn-primary !rounded-xl !py-2 !px-5 text-sm font-semibold flex items-center gap-1.5 ${
                  Object.values(checks).filter(Boolean).length < CHECKLIST.length ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={Object.values(checks).filter(Boolean).length < CHECKLIST.length}
                onClick={() => handleApproveRelease(modal.item!)}
              >
                <ShieldCheck size={16} />
                <span>Otorisasi Rilis Unit</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {modal?.type === "add" && (
        <Modal open title="Buat Surat Jalan Pengiriman Baru" onClose={() => setModal(null)} size="md">
          <form onSubmit={handleRequestSave} className="space-y-4">
            <div>
              <label className="form-label">
                Pilih Proyek / Kontrak <span className="text-[#DC2626]">*</span>
              </label>
              <select
                className="select"
                value={form.projectId ?? ""}
                onChange={e => setForm({ ...form, projectId: e.target.value })}
                required
              >
                <option value="">Pilih proyek yang akan dikirim...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name} ({p.customer})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Tanggal Pengiriman</label>
                <input
                  type="date"
                  className="input font-mono"
                  value={form.deliveryDate ?? ""}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Nama Ekspedisi / Transporter</label>
                <input
                  className="input"
                  placeholder="Contoh: PT Andalas Cargo"
                  value={form.transporter ?? ""}
                  onChange={e => setForm({ ...form, transporter: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Nama Pengemudi (Driver)</label>
                <input
                  className="input"
                  placeholder="Contoh: Joko Widodo"
                  value={form.driver ?? ""}
                  onChange={e => setForm({ ...form, driver: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Nomor Polisi Kendaraan</label>
                <input
                  className="input font-mono"
                  placeholder="Contoh: B 9821 TYN"
                  value={form.truckPlate ?? ""}
                  onChange={e => setForm({ ...form, truckPlate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Alamat Lengkap Tujuan</label>
              <textarea
                className="textarea"
                placeholder="Alamat fasilitas klien, PIC lapangan, dan patokan lokasi..."
                value={form.destinationAddress ?? ""}
                onChange={e => setForm({ ...form, destinationAddress: e.target.value })}
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
                Terbitkan Surat Jalan
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
          onConfirm={confirmState.action}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
