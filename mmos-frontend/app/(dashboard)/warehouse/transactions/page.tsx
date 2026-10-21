"use client";
import { useState } from "react";
import { inventoryTransactions as initialData } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "lucide-react";

type Tx = typeof initialData[0];

const typeIcon = (t: string) => {
  if (t === "Receipt") return <ArrowDownToLine size={14} className="text-accent-success" />;
  if (t === "Issue") return <ArrowUpFromLine size={14} className="text-accent-warning" />;
  return <ArrowLeftRight size={14} className="text-accent" />;
};

const typeColor = (t: string) =>
  t === "Receipt" ? "text-accent-success bg-accent-success/10 border-accent-success/30" :
  t === "Issue" ? "text-accent-warning bg-accent-warning/10 border-accent-warning/30" :
  "text-accent bg-accent/10 border-accent/30";

export default function TransactionsPage() {
  const [data] = useState(initialData);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = data.filter(t =>
    (typeFilter === "All" || t.type === typeFilter) &&
    (t.material.toLowerCase().includes(search.toLowerCase()) ||
     t.reference.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Stock Transactions"
        subtitle="Riwayat semua pergerakan stok"
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Receipt", val: data.filter(t => t.type === "Receipt").length, cls: "text-accent-success" },
          { label: "Issue", val: data.filter(t => t.type === "Issue").length, cls: "text-accent-warning" },
          { label: "Transfer", val: data.filter(t => t.type === "Transfer").length, cls: "text-accent" },
        ].map(s => (
          <div key={s.label} className="card text-center p-3 sm:p-4 cursor-pointer" onClick={() => setTypeFilter(typeFilter === s.label ? "All" : s.label)}>
            <p className="text-text-secondary text-xs mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Search material or reference..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-full sm:w-40" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option>Receipt</option><option>Issue</option><option>Transfer</option>
          </select>
        </div>
        <div className="overflow-x-auto w-full border border-border rounded-lg">
          <table className="w-full min-w-[950px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {["Date","Type","Material","Qty","UOM","Warehouse","Reference","User","Bal. Before","Bal. After"].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(tx => (
                <tr key={tx.id} className="table-row-hover">
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap font-mono">{tx.date}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {typeIcon(tx.type)}
                      <span className={`badge-status border ${typeColor(tx.type)}`}>{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-text-primary font-medium whitespace-nowrap">{tx.material}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`font-mono font-bold ${tx.type === "Receipt" ? "text-accent-success" : tx.type === "Issue" ? "text-accent-warning" : "text-accent"}`}>
                      {tx.type === "Issue" ? `-${tx.qty}` : `+${tx.qty}`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{tx.uom}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{tx.warehouse}</td>
                  <td className="py-3 px-3 font-mono text-accent text-xs whitespace-nowrap">{tx.reference}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{tx.user}</td>
                  <td className="py-3 px-3 font-mono text-text-secondary whitespace-nowrap">{tx.balanceBefore}</td>
                  <td className="py-3 px-3 font-mono font-bold text-text-primary whitespace-nowrap">{tx.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
