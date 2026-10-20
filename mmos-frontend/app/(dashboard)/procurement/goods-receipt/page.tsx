"use client";
import { useState } from "react";
import { goodsReceipts as initialData, purchaseOrders } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Eye, Truck, Search } from "lucide-react";

type GR = typeof initialData[0];

export default function GoodsReceiptPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{type:"view"|"add";item?:GR}|null>(null);
  const [form, setForm] = useState<Partial<{poId:string;receivedBy:string;receivedDate:string}>>({});

  const filtered = data.filter(gr => {
    const q = search.toLowerCase();
    const matchSearch = !q || gr.code.toLowerCase().includes(q) || gr.vendor.toLowerCase().includes(q) || gr.poId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || gr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    const po = purchaseOrders.find(p => p.id === form.poId);
    if (!po) return;
    const newGR: GR = {
      id: `GR${String(data.length+1).padStart(3,"0")}`,
      code: `GR-2026-${String(data.length+1).padStart(3,"0")}`,
      poId: form.poId ?? "",
      vendor: po.vendor,
      receivedDate: form.receivedDate ?? new Date().toISOString().split("T")[0],
      receivedBy: form.receivedBy ?? "",
      status: "Partial",
      items: po.items.map(i => ({ material: i.material, qty: i.qty - i.qtyReceived, uom: i.uom, qcStatus: "Pending", notes: "" })),
    };
    setData([...data, newGR]);
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Goods Receipt"
        subtitle="Penerimaan barang dari vendor"
        actions={<button className="btn-primary flex items-center gap-2" onClick={() => { setForm({}); setModal({ type: "add" }); }}><Plus size={16} />New GR</button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total GR", val: data.length, cls: "text-accent" },
          { label: "Accepted", val: data.filter(g => g.status === "Accepted").length, cls: "text-accent-success" },
          { label: "Partial", val: data.filter(g => g.status === "Partial").length, cls: "text-accent-warning" },
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
            <input className="input pl-9" placeholder="Cari kode / vendor / PO..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">Semua Status</option>
            {["Draft","Received","Partially Received","Inspecting","Accepted","Rejected"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["GR Code","Ref PO","Vendor","Received Date","Received By","Status","Items",""].map(h => (
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(gr => (
              <tr key={gr.id} className="table-row-hover">
                <td className="py-3 px-3 font-mono text-accent text-xs">{gr.code}</td>
                <td className="py-3 px-3 font-mono text-text-secondary text-xs">{gr.poId}</td>
                <td className="py-3 px-3 text-text-primary font-medium">{gr.vendor}</td>
                <td className="py-3 px-3 text-text-secondary text-xs">{gr.receivedDate}</td>
                <td className="py-3 px-3 text-text-secondary text-xs">{gr.receivedBy}</td>
                <td className="py-3 px-3"><StatusBadge status={gr.status} /></td>
                <td className="py-3 px-3 font-mono text-text-secondary">{gr.items.length}</td>
                <td className="py-3 px-3">
                  <button className="text-text-secondary hover:text-accent" onClick={() => setModal({ type: "view", item: gr })}><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {modal?.type === "view" && modal.item && (
        <Modal open title={`Goods Receipt — ${modal.item.code}`} onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[["GR Code",modal.item.code],["Ref PO",modal.item.poId],["Vendor",modal.item.vendor],
              ["Received Date",modal.item.receivedDate],["Received By",modal.item.receivedBy],["Status",modal.item.status]
            ].map(([l,v]) => (
              <div key={l} className="bg-surface-2 rounded-lg p-3">
                <p className="text-text-secondary text-xs mb-1">{l}</p>
                <p className="text-text-primary font-medium text-sm">{v}</p>
              </div>
            ))}
          </div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Received Items</h4>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Material","Qty Received","UOM","QC Status","Notes"].map(h => (
                <th key={h} className="text-left py-2 px-3 text-text-secondary text-xs">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {modal.item.items.map((item, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3 text-text-primary">{item.material}</td>
                  <td className="py-2 px-3 font-mono text-text-secondary">{item.qty}</td>
                  <td className="py-2 px-3 text-text-secondary text-xs">{item.uom}</td>
                  <td className="py-2 px-3">
                    <span className={`badge-status border ${item.qcStatus==="Pass"?"text-accent-success bg-accent-success/10 border-accent-success/30":item.qcStatus==="Fail"?"text-accent-alert bg-accent-alert/10 border-accent-alert/30":"text-accent-warning bg-accent-warning/10 border-accent-warning/30"}`}>{item.qcStatus}</span>
                  </td>
                  <td className="py-2 px-3 text-text-secondary text-xs">{item.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setModal(null)}>Close</button>
            {modal.item.status !== "Accepted" && (
              <button className="btn-primary" onClick={() => { setData(data.map(g => g.id === modal.item!.id ? { ...g, status: "Accepted" } : g)); setModal(null); }}>
                Accept All
              </button>
            )}
          </div>
        </Modal>
      )}

      {modal?.type === "add" && (
        <Modal open title="New Goods Receipt" onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Reference PO</label>
              <select className="select" value={form.poId ?? ""} onChange={e => setForm({ ...form, poId: e.target.value })}>
                <option value="">Select PO...</option>
                {purchaseOrders.filter(p => p.status !== "Received").map(p => <option key={p.id} value={p.id}>{p.code} — {p.vendor}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Received Date</label>
              <input type="date" className="input" value={form.receivedDate ?? ""} onChange={e => setForm({ ...form, receivedDate: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Received By</label>
              <input className="input" value={form.receivedBy ?? ""} onChange={e => setForm({ ...form, receivedBy: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate}>Create GR</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
