"use client";
import { useState } from "react";
import { reworkOrders as initialData, ncrs } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Eye, Pencil, Search } from "lucide-react";

type RW = typeof initialData[0];

export default function ReworkPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit"|"view";item?:RW}|null>(null);
  const [form, setForm] = useState<Partial<RW>>({});

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.code.toLowerCase().includes(q) || r.serial.toLowerCase().includes(q) || r.operation.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (modal?.type === "add") {
      const ncr = ncrs.find(n => n.id === form.ncrId);
      setData([...data, {
        id: `RW${String(data.length+1).padStart(3,"0")}`,
        code: `RW-2026-${String(data.length+1).padStart(3,"0")}`,
        ncrId: form.ncrId ?? "",
        serial: ncr?.serial ?? form.serial ?? "",
        operation: form.operation ?? "",
        assignedTo: form.assignedTo ?? "",
        startDate: form.startDate ?? "",
        completedDate: form.completedDate ?? null,
        status: form.status ?? "In Progress",
        result: form.result ?? null,
        laborHours: Number(form.laborHours) || 0,
        notes: form.notes ?? "",
      }]);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(r => r.id === modal.item!.id ? { ...r, ...form, laborHours: Number(form.laborHours) } as RW : r));
    }
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Rework Orders"
        subtitle="Pekerjaan perbaikan berdasarkan NCR"
        actions={<button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ status: "In Progress" }); setModal({ type: "add" }); }}><Plus size={16} />New Rework Order</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "In Progress", val: data.filter(r => r.status === "In Progress").length, cls: "text-accent-warning" },
          { label: "Completed", val: data.filter(r => r.status === "Completed").length, cls: "text-accent-success" },
          { label: "Total Labor Hours", val: data.reduce((s, r) => s + r.laborHours, 0) + "h", cls: "text-accent" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-text-secondary text-xs mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari kode / serial / operasi..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">Semua Status</option>
            {["In Progress","Completed","Pending"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto w-full"><table className="w-full text-sm min-w-[900px]">
          <thead><tr className="border-b border-border">
            {["Code","NCR Ref","Serial","Operation","Assigned To","Start","Completed","Labor Hrs","Status","Result",""].map(h => (
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="table-row-hover">
                <td className="py-3 px-3 font-mono text-accent text-xs whitespace-nowrap">{r.code}</td>
                <td className="py-3 px-3 font-mono text-accent-alert text-xs whitespace-nowrap">{r.ncrId}</td>
                <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{r.serial}</td>
                <td className="py-3 px-3 text-text-primary font-medium max-w-[160px] whitespace-nowrap"><div className="truncate">{r.operation}</div></td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{r.assignedTo}</td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{r.startDate}</td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{r.completedDate ?? "—"}</td>
                <td className="py-3 px-3 font-mono text-text-secondary whitespace-nowrap">{r.laborHours}h</td>
                <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                <td className="py-3 px-3 text-text-secondary text-xs max-w-[120px] whitespace-nowrap"><div className="truncate">{r.result ?? "—"}</div></td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-text-secondary hover:text-accent" onClick={() => setModal({ type: "view", item: r })}><Eye size={14} /></button>
                    <button className="text-text-secondary hover:text-accent" onClick={() => { setForm({ ...r }); setModal({ type: "edit", item: r }); }}><Pencil size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {modal?.type === "view" && modal.item && (
        <Modal open title={`Rework Order — ${modal.item.code}`} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[["Code",modal.item.code],["NCR Ref",modal.item.ncrId],["Serial",modal.item.serial],
              ["Operation",modal.item.operation],["Assigned To",modal.item.assignedTo],["Start Date",modal.item.startDate],
              ["Completed",modal.item.completedDate??"-"],["Labor Hours",`${modal.item.laborHours}h`],["Status",modal.item.status],
              ["Result",modal.item.result??"-"]
            ].map(([l,v]) => (
              <div key={l} className="bg-surface-2 rounded-lg p-3">
                <p className="text-text-secondary text-xs mb-1">{l}</p>
                <p className="text-text-primary font-medium text-sm">{v}</p>
              </div>
            ))}
          </div>
          {modal.item.notes && (
            <div className="bg-surface-2 rounded-lg p-3 mt-3">
              <p className="text-text-secondary text-xs mb-1">Notes</p>
              <p className="text-text-primary text-sm">{modal.item.notes}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setModal(null)}>Close</button>
            {modal.item.status === "In Progress" && (
              <button className="btn-primary" onClick={() => {
                setData(data.map(r => r.id === modal.item!.id ? { ...r, status: "Completed", completedDate: new Date().toISOString().split("T")[0] } : r));
                setModal(null);
              }}>Complete Rework</button>
            )}
          </div>
        </Modal>
      )}

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal open title={modal.type === "add" ? "New Rework Order" : "Edit Rework Order"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">NCR Reference</label>
              <select className="select" value={form.ncrId ?? ""} onChange={e => setForm({ ...form, ncrId: e.target.value })}>
                <option value="">Select NCR...</option>
                {ncrs.map(n => <option key={n.id} value={n.id}>{n.code} — {n.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Operation</label>
              <input className="input" value={form.operation ?? ""} onChange={e => setForm({ ...form, operation: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Assigned To</label>
              <input className="input" value={form.assignedTo ?? ""} onChange={e => setForm({ ...form, assignedTo: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Start Date</label>
              <input type="date" className="input" value={form.startDate ?? ""} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Estimated Labor Hours</label>
              <input type="number" className="input" value={form.laborHours ?? ""} onChange={e => setForm({ ...form, laborHours: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status ?? "In Progress"} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["In Progress","Completed","On Hold"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Notes</label>
              <textarea className="input min-h-[60px] resize-none" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
