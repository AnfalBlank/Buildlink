"use client";
import { useState } from "react";
import { ncrs as initialData } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Eye, Pencil, Search } from "lucide-react";
import { PhotoEvidenceUpload, PhotoEvidenceItem, EVIDENCE_PRESETS } from "@/components/ui/PhotoEvidenceUpload";

export interface NCR {
  id: string;
  code: string;
  qcInspectionId: string | null;
  serial: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  disposition: string;
  rootCause: string;
  correctiveAction: string;
  pic: string;
  dueDate: string;
  status: string;
  closedDate: string | null;
  photos?: PhotoEvidenceItem[];
}
const DISPOSITIONS = ["Rework","Repair","Use-as-is","Return to Vendor","Scrap"];
const CATEGORIES = ["Fabrication Defect","Welding Defect","Dimensional Defect","Material Defect","Assembly Defect","Documentation"];

export default function NCRPage() {
  const [data, setData] = useState<NCR[]>(() =>
    initialData.map(n => {
      if (n.id === "NCR001" || n.id === "NCR002") {
        return {
          ...n,
          photos: [...EVIDENCE_PRESETS.ncr],
        };
      }
      return { ...n, photos: [] };
    })
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit"|"view";item?:NCR}|null>(null);
  const [form, setForm] = useState<Partial<NCR>>({});
  const [formPhotos, setFormPhotos] = useState<PhotoEvidenceItem[]>([]);

  const filtered = data.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.code.toLowerCase().includes(q) || n.serial.toLowerCase().includes(q) || n.title.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (modal?.type === "add") {
      const newNCR: NCR = {
        id: `NCR${String(data.length+1).padStart(3,"0")}`,
        code: `NCR-2026-${String(data.length+1).padStart(3,"0")}`,
        qcInspectionId: form.qcInspectionId ?? null,
        serial: form.serial ?? "",
        title: form.title ?? "",
        category: form.category ?? "Fabrication Defect",
        severity: form.severity ?? "Minor",
        description: form.description ?? "",
        disposition: form.disposition ?? "Rework",
        rootCause: form.rootCause ?? "",
        correctiveAction: form.correctiveAction ?? "",
        pic: form.pic ?? "",
        dueDate: form.dueDate ?? "",
        status: "Open",
        closedDate: null,
        photos: formPhotos,
      };
      setData([...data, newNCR]);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(n => n.id === modal.item!.id ? { ...n, ...form, photos: formPhotos } as NCR : n));
    }
    setModal(null);
    setFormPhotos([]);
  };

  return (
    <div>
      <PageHeader
        title="Non-Conformance Reports (NCR)"
        subtitle="Laporan ketidaksesuaian kualitas & arsip bukti visual cacat"
        actions={
          <button 
            className="btn-primary flex items-center gap-2" 
            onClick={() => { 
              setForm({ severity: "Minor", disposition: "Rework", status: "Open" }); 
              setFormPhotos([]);
              setModal({ type: "add" }); 
            }}
          >
            <Plus size={16} /> New NCR
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Open", val: data.filter(n => n.status === "Open").length, cls: "text-accent-alert" },
          { label: "In Progress", val: data.filter(n => n.status === "In Progress").length, cls: "text-accent-warning" },
          { label: "Resolved", val: data.filter(n => n.status === "Resolved").length, cls: "text-accent-success" },
          { label: "Critical/Major", val: data.filter(n => n.severity === "Major" || n.severity === "Critical").length, cls: "text-accent-alert" },
        ].map(s => (
          <div key={s.label} className={`card text-center ${s.label === "Open" && s.val > 0 ? "border-accent-alert/30" : ""}`}>
            <p className="text-text-secondary text-xs mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari kode / serial / judul..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">Semua Status</option>
            {["Open","In Progress","Closed"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto w-full"><table className="w-full text-sm min-w-[900px]">
          <thead><tr className="border-b border-border">
            {["Code","Serial","Title","Category","Severity","Disposition","PIC","Due Date","Status","Foto Bukti",""].map(h => (
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(n => (
              <tr key={n.id} className="table-row-hover">
                <td className="py-3 px-3 font-mono text-accent-alert text-xs whitespace-nowrap">{n.code}</td>
                <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{n.serial}</td>
                <td className="py-3 px-3 text-text-primary font-medium max-w-[160px] whitespace-nowrap"><div className="truncate">{n.title}</div></td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{n.category}</td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className={`badge-status border ${n.severity === "Major" || n.severity === "Critical" ? "text-accent-alert bg-accent-alert/10 border-accent-alert/30" : "text-accent-warning bg-accent-warning/10 border-accent-warning/30"}`}>{n.severity}</span>
                </td>
                <td className="py-3 px-3 whitespace-nowrap"><span className="badge-status border text-accent bg-accent/10 border-accent/30">{n.disposition}</span></td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{n.pic}</td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{n.dueDate}</td>
                <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={n.status} /></td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {n.photos && n.photos.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      ✓ {n.photos.length} Foto
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-secondary">Tidak ada</span>
                  )}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-text-secondary hover:text-accent cursor-pointer" title="Lihat Detail NCR" onClick={() => setModal({ type: "view", item: n })}><Eye size={14} /></button>
                    <button className="text-text-secondary hover:text-accent cursor-pointer" title="Edit NCR" onClick={() => { setForm({ ...n }); setFormPhotos(n.photos ? [...n.photos] : []); setModal({ type: "edit", item: n }); }}><Pencil size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {modal?.type === "view" && modal.item && (
        <Modal open title={`NCR — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              ["Code",modal.item.code],["Serial",modal.item.serial],["Category",modal.item.category],
              ["Severity",modal.item.severity],["Disposition",modal.item.disposition],["Status",modal.item.status],
              ["PIC",modal.item.pic],["Due Date",modal.item.dueDate],["Closed Date",modal.item.closedDate??"-"],
            ].map(([l,v]) => (
              <div key={l} className="bg-surface-2 rounded-lg p-3">
                <p className="text-text-secondary text-xs mb-1">{l}</p>
                <p className="text-text-primary font-medium text-sm">{v}</p>
              </div>
            ))}
          </div>

          {[["Description",modal.item.description],["Root Cause",modal.item.rootCause],["Corrective Action",modal.item.correctiveAction]].map(([l,v]) => (
            <div key={l} className="bg-surface-2 rounded-lg p-3 mb-3">
              <p className="text-text-secondary text-xs mb-1">{l}</p>
              <p className="text-text-primary text-sm">{v}</p>
            </div>
          ))}

          {/* Photo Evidence Section */}
          <div className="pt-2 border-t border-border mb-3">
            <PhotoEvidenceUpload
              readOnly
              photos={modal.item.photos || []}
              title="Bukti Foto Temuan Cacat Mutu (Defect Evidence)"
              description="Dokumentasi visual cacat material, keretakan, atau deviasi fabrikasi terkait tiket NCR ini."
            />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
            <button className="btn-secondary" onClick={() => setModal(null)}>Close</button>
            {modal.item.status === "Open" && (
              <button className="btn-primary" onClick={() => {
                setData(data.map(n => n.id === modal.item!.id ? { ...n, status: "Resolved", closedDate: new Date().toISOString().split("T")[0] } : n));
                setModal(null);
              }}>Mark Resolved</button>
            )}
          </div>
        </Modal>
      )}

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal open title={modal.type === "add" ? "New NCR" : "Edit NCR"} onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Serial Number</label>
              <input className="input" value={form.serial ?? ""} onChange={e => setForm({ ...form, serial: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Title</label>
              <input className="input" value={form.title ?? ""} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Category</label>
              <select className="select" value={form.category ?? CATEGORIES[0]} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Severity</label>
              <select className="select" value={form.severity ?? "Minor"} onChange={e => setForm({ ...form, severity: e.target.value })}>
                {["Minor","Major","Critical"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Disposition</label>
              <select className="select" value={form.disposition ?? "Rework"} onChange={e => setForm({ ...form, disposition: e.target.value })}>
                {DISPOSITIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">PIC</label>
              <input className="input" value={form.pic ?? ""} onChange={e => setForm({ ...form, pic: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Due Date</label>
              <input type="date" className="input" value={form.dueDate ?? ""} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status ?? "Open"} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Open","In Progress","Resolved","Closed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {[["Description","description"],["Root Cause","rootCause"],["Corrective Action","correctiveAction"]].map(([l,k]) => (
              <div key={k} className="sm:col-span-2">
                <label className="text-text-secondary text-xs mb-1.5 block">{l}</label>
                <textarea className="input min-h-[60px] resize-none" value={(form as Record<string,string>)[k] ?? ""} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}

            {/* Photo Evidence in NCR Form */}
            <div className="sm:col-span-2 pt-2 border-t border-border">
              <PhotoEvidenceUpload
                photos={formPhotos}
                onChange={setFormPhotos}
                presetType="ncr"
                title="Unggah Bukti Foto Cacat Mutu"
                description="Lampirkan foto fisik cacat, hasil penetrant test, atau dimensi di luar toleransi."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-border">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
