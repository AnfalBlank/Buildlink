"use client";
import { useState } from "react";
import { leads as initialData } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

type Lead = typeof initialData[0];
const STAGES = ["New", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function LeadsPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add" | "edit"; item?: Lead } | null>(null);
  const [form, setForm] = useState<Partial<Lead>>({});

  const filtered = data.filter(l =>
    l.company.toLowerCase().includes(search.toLowerCase()) ||
    l.contact.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ stage: "New" }); setModal({ type: "add" }); };
  const openEdit = (item: Lead) => { setForm({ ...item }); setModal({ type: "edit", item }); };

  const handleSave = () => {
    if (modal?.type === "add") {
      setData([...data, {
        id: `L${String(data.length + 1).padStart(3, "0")}`,
        code: `LEAD-${String(data.length + 1).padStart(3, "0")}`,
        company: form.company ?? "",
        contact: form.contact ?? "",
        email: form.email ?? "",
        phone: form.phone ?? "",
        source: form.source ?? "Direct",
        stage: form.stage ?? "New",
        estimatedValue: Number(form.estimatedValue) || 0,
        assignedTo: form.assignedTo ?? "",
        createdAt: new Date().toISOString().split("T")[0],
        notes: form.notes ?? "",
      }]);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(l => l.id === modal.item!.id ? { ...l, ...form } as Lead : l));
    }
    setModal(null);
  };

  const stageColor = (s: string) => {
    const m: Record<string, string> = {
      "New": "text-text-secondary bg-surface-2 border-border",
      "Qualification": "text-blue-400 bg-blue-400/10 border-blue-400/30",
      "Proposal": "text-accent-warning bg-accent-warning/10 border-accent-warning/30",
      "Negotiation": "text-purple-400 bg-purple-400/10 border-purple-400/30",
      "Closed Won": "text-accent-success bg-accent-success/10 border-accent-success/30",
      "Closed Lost": "text-accent-alert bg-accent-alert/10 border-accent-alert/30",
    };
    return m[s] ?? "text-text-secondary bg-surface-2 border-border";
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Manajemen prospek & pipeline penjualan"
        actions={<button className="btn-primary flex items-center gap-2" onClick={openAdd}><Plus size={16} />Add Lead</button>}
      />

      {/* Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {STAGES.map(s => {
          const count = data.filter(l => l.stage === s).length;
          const val = data.filter(l => l.stage === s).reduce((a, l) => a + l.estimatedValue, 0);
          return (
            <div key={s} className="card text-center p-3 sm:p-4">
              <p className="text-text-secondary text-xs mb-1 truncate" title={s}>{s}</p>
              <p className="font-mono font-bold text-xl text-accent">{count}</p>
              {val > 0 && <p className="text-text-secondary text-xs mt-1">{(val / 1e6).toFixed(0)}M</p>}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto w-full border border-border rounded-lg">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {["Code", "Company", "Contact", "Source", "Stage", "Est. Value", "Assigned To", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(l => (
                <tr key={l.id} className="table-row-hover">
                  <td className="py-3 px-4 font-mono text-accent text-xs whitespace-nowrap">{l.code}</td>
                  <td className="py-3 px-4 text-text-primary font-medium whitespace-nowrap">{l.company}</td>
                  <td className="py-3 px-4 text-text-secondary whitespace-nowrap">{l.contact}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs whitespace-nowrap">{l.source}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><span className={`badge-status border ${stageColor(l.stage)}`}>{l.stage}</span></td>
                  <td className="py-3 px-4 font-mono text-accent text-xs whitespace-nowrap">{formatCurrency(l.estimatedValue)}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs whitespace-nowrap">{l.assignedTo}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs whitespace-nowrap font-mono">{l.createdAt}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-text-secondary hover:text-accent cursor-pointer" onClick={() => openEdit(l)}><Pencil size={14} /></button>
                      <button className="text-text-secondary hover:text-accent-alert cursor-pointer" onClick={() => setData(data.filter(x => x.id !== l.id))}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal open title={modal.type === "add" ? "Add Lead" : "Edit Lead"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Company", key: "company" },
              { label: "Contact Person", key: "contact" },
              { label: "Email", key: "email" },
              { label: "Phone", key: "phone" },
              { label: "Assigned To", key: "assignedTo" },
              { label: "Est. Value (IDR)", key: "estimatedValue" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <input className="input" value={(form as Record<string, string>)[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Source</label>
              <select className="select" value={form.source ?? "Direct"} onChange={e => setForm({ ...form, source: e.target.value })}>
                {["Direct", "Referral", "Website", "Exhibition", "Cold Call"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Stage</label>
              <select className="select" value={form.stage ?? "New"} onChange={e => setForm({ ...form, stage: e.target.value })}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
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
