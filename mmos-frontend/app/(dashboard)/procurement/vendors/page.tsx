"use client";
import { useState } from "react";
import { vendors as initialData } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";

type Vendor = typeof initialData[0];

export default function VendorsPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{type:"add"|"edit";item?:Vendor}|null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({});

  const filtered = data.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (modal?.type === "add") {
      setData([...data, {
        id: `VND${String(data.length+1).padStart(3,"0")}`,
        code: `VND-${String(data.length+1).padStart(3,"0")}`,
        name: form.name ?? "", contact: form.contact ?? "",
        email: form.email ?? "", phone: form.phone ?? "",
        city: form.city ?? "", category: form.category ?? "",
        rating: Number(form.rating) || 3.0,
        status: form.status ?? "Active",
        leadTime: Number(form.leadTime) || 7,
      }]);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(v => v.id === modal.item!.id ? { ...v, ...form, rating: Number(form.rating), leadTime: Number(form.leadTime) } as Vendor : v));
    }
    setModal(null);
  };

  const StarRating = ({ val }: { val: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= Math.round(val) ? "text-accent-warning fill-accent-warning" : "text-border"} />
      ))}
      <span className="text-text-secondary text-xs ml-1">{val.toFixed(1)}</span>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Master data pemasok dan supplier"
        actions={<button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ status: "Active" }); setModal({ type: "add" }); }}><Plus size={16} />Add Vendor</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="card"><p className="text-text-secondary text-xs mb-1">Total Vendors</p><p className="font-mono font-bold text-2xl text-accent">{data.length}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Active</p><p className="font-mono font-bold text-2xl text-accent-success">{data.filter(v=>v.status==="Active").length}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Avg Rating</p><p className="font-mono font-bold text-2xl text-accent-warning">{(data.reduce((s,v)=>s+v.rating,0)/data.length).toFixed(1)}</p></div>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto w-full"><table className="w-full text-sm min-w-[850px]">
          <thead><tr className="border-b border-border">
            {["Code","Vendor Name","Contact","Email","City","Category","Lead Time","Rating","Status",""].map(h => (
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="table-row-hover">
                <td className="py-3 px-3 font-mono text-accent text-xs whitespace-nowrap">{v.code}</td>
                <td className="py-3 px-3 text-text-primary font-medium whitespace-nowrap">{v.name}</td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{v.contact}</td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{v.email}</td>
                <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{v.city}</td>
                <td className="py-3 px-3 whitespace-nowrap"><span className="badge-status border text-accent bg-accent/10 border-accent/30">{v.category}</span></td>
                <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{v.leadTime}d</td>
                <td className="py-3 px-3 whitespace-nowrap"><StarRating val={v.rating} /></td>
                <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={v.status} /></td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-text-secondary hover:text-accent" onClick={() => { setForm({ ...v }); setModal({ type: "edit", item: v }); }}><Pencil size={14} /></button>
                    <button className="text-text-secondary hover:text-accent-alert" onClick={() => setData(data.filter(x => x.id !== v.id))}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal open title={modal.type === "add" ? "Add Vendor" : "Edit Vendor"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Vendor Name", key: "name" }, { label: "Contact Person", key: "contact" },
              { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
              { label: "City", key: "city" }, { label: "Category", key: "category" },
              { label: "Lead Time (days)", key: "leadTime" }, { label: "Rating (1-5)", key: "rating" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <input className="input" value={(form as Record<string,string|number>)[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status ?? "Active"} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Inactive</option><option>Blacklisted</option>
              </select>
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
