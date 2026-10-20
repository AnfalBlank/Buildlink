"use client";
import { useState } from "react";
import { payments as initialData, invoices } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Plus, DollarSign, Search } from "lucide-react";

type Payment = typeof initialData[0];

export default function PaymentsPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{type:"add"}|null>(null);
  const [form, setForm] = useState<Partial<Payment>>({});

  const filtered = data.filter(p => {
    const q = search.toLowerCase();
    const inv = invoices.find(i => i.id === p.invoiceId);
    return !q || p.id.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q) || (inv?.customer ?? "").toLowerCase().includes(q) || p.method.toLowerCase().includes(q);
  });

  const handleSave = () => {
    setData([...data, {
      id: `PAY${String(data.length+1).padStart(3,"0")}`,
      invoiceId: form.invoiceId ?? "",
      date: form.date ?? new Date().toISOString().split("T")[0],
      amount: Number(form.amount) || 0,
      method: form.method ?? "Transfer",
      reference: form.reference ?? "",
      notes: form.notes ?? "",
    }]);
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Pencatatan pembayaran dari pelanggan"
        actions={<button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ method: "Transfer" }); setModal({ type: "add" }); }}><Plus size={16} />Record Payment</button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card"><p className="text-text-secondary text-xs mb-1">Total Payments</p><p className="font-mono font-bold text-2xl text-accent">{data.length}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Total Received</p><p className="font-mono font-bold text-xl text-accent-success">{formatCurrency(data.reduce((s,p) => s+p.amount, 0))}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">This Month</p><p className="font-mono font-bold text-xl text-accent">{data.filter(p=>p.date.startsWith("2026-10")).length} payments</p></div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari payment / customer / referensi..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Payment ID","Invoice Ref","Customer","Date","Amount","Method","Reference","Notes"].map(h => (
              <th key={h} className="text-left py-3 px-4 text-text-secondary font-medium text-xs">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const inv = invoices.find(i => i.id === p.invoiceId);
              return (
                <tr key={p.id} className="table-row-hover">
                  <td className="py-3 px-4 font-mono text-accent text-xs">{p.id}</td>
                  <td className="py-3 px-4 font-mono text-accent-warning text-xs">{p.invoiceId}</td>
                  <td className="py-3 px-4 text-text-primary font-medium">{inv?.customer ?? "-"}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{p.date}</td>
                  <td className="py-3 px-4 font-mono text-accent-success font-bold text-xs">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4"><span className="badge-status border text-accent bg-accent/10 border-accent/30">{p.method}</span></td>
                  <td className="py-3 px-4 font-mono text-text-secondary text-xs">{p.reference}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{p.notes || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>

      {modal?.type === "add" && (
        <Modal open title="Record Payment" onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Invoice</label>
              <select className="select" value={form.invoiceId ?? ""} onChange={e => setForm({ ...form, invoiceId: e.target.value })}>
                <option value="">Select invoice...</option>
                {invoices.filter(i => i.status !== "Paid").map(i => <option key={i.id} value={i.id}>{i.code} — {formatCurrency(i.totalAmount - i.paidAmount)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Payment Date</label>
              <input type="date" className="input" value={form.date ?? ""} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Amount (IDR)</label>
              <input type="number" className="input" value={form.amount ?? ""} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Method</label>
              <select className="select" value={form.method ?? "Transfer"} onChange={e => setForm({ ...form, method: e.target.value })}>
                {["Transfer","Cash","Cheque","RTGS","SWIFT"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Bank Reference</label>
              <input className="input" value={form.reference ?? ""} onChange={e => setForm({ ...form, reference: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Notes</label>
              <input className="input" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
