"use client";
import { useState } from "react";
import { routings as initialData, products, workCenters } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Eye, ChevronDown, ChevronRight, ShieldCheck, Search } from "lucide-react";

type Routing = typeof initialData[0];

export default function RoutingPage() {
  const [data] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["RTE001"]);
  const [modal, setModal] = useState<{type:"view";item:Routing}|null>(null);

  const toggle = (id: string) => setExpanded(e => e.includes(id) ? e.filter(x=>x!==id) : [...e,id]);

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const prod = products.find(p => p.id === r.productId);
    return !q || r.code.toLowerCase().includes(q) || (prod?.name ?? "").toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Routing"
        subtitle="Urutan operasi produksi per produk"
        actions={<button className="btn-primary flex items-center gap-2"><Plus size={16}/>New Routing</button>}
      />

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input className="input pl-9" placeholder="Cari kode / produk..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(r=>{
          const prod = products.find(p=>p.id===r.productId);
          const open = expanded.includes(r.id);
          return (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between cursor-pointer" onClick={()=>toggle(r.id)}>
                <div className="flex items-center gap-3">
                  {open ? <ChevronDown size={16} className="text-accent"/> : <ChevronRight size={16} className="text-text-secondary"/>}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-accent text-sm">{r.code}</span>
                      <StatusBadge status={r.status}/>
                    </div>
                    <p className="text-text-secondary text-xs mt-0.5">{prod?.name ?? r.productId} — {r.revision}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-xs">{r.operations.length} operations</span>
                  <button className="text-text-secondary hover:text-accent" onClick={e=>{e.stopPropagation();setModal({type:"view",item:r});}}><Eye size={14}/></button>
                  <button className="text-text-secondary hover:text-accent" onClick={e=>e.stopPropagation()}><Pencil size={14}/></button>
                </div>
              </div>

              {open && (
                <div className="mt-4 overflow-x-auto w-full border border-border rounded-lg">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead><tr className="border-b border-border bg-surface-2">
                      {["Seq","Operation Name","Work Center","Setup (h)","Run (h)","Skill Required","Requires QC"].map(h=>(
                        <th key={h} className="text-left py-2.5 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {r.operations.map(op=>(
                        <tr key={op.seq} className="hover:bg-surface-2">
                          <td className="py-2.5 px-3 font-mono text-accent font-bold whitespace-nowrap">{op.seq}</td>
                          <td className="py-2.5 px-3 text-text-primary font-medium whitespace-nowrap">{op.name}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap"><span className="badge-status border text-accent bg-accent/10 border-accent/30">{op.workCenter}</span></td>
                          <td className="py-2.5 px-3 font-mono text-text-secondary whitespace-nowrap">{op.setupTime}h</td>
                          <td className="py-2.5 px-3 font-mono text-text-secondary whitespace-nowrap">{op.runTime}h</td>
                          <td className="py-2.5 px-3 text-text-secondary text-xs whitespace-nowrap">{op.skill}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{op.requiresQC?<span className="flex items-center gap-1 text-accent-warning text-xs"><ShieldCheck size={12}/>QC Required</span>:<span className="text-text-secondary text-xs">-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal?.type==="view"&&(
        <Modal open title={`Routing — ${modal.item.code}`} onClose={()=>setModal(null)} size="xl">
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[["Code",modal.item.code],["Product",products.find(p=>p.id===modal.item.productId)?.name??modal.item.productId],
              ["Revision",modal.item.revision],["Status",modal.item.status],
              ["Total Ops",String(modal.item.operations.length)],
              ["Total Est. Hours",String(modal.item.operations.reduce((s,o)=>s+o.setupTime+o.runTime,0))+"h"]
            ].map(([l,v])=>(
              <div key={l} className="bg-surface-2 rounded-lg p-3">
                <p className="text-text-secondary text-xs mb-1">{l}</p>
                <p className="text-text-primary font-medium text-sm truncate">{v}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto w-full border border-border rounded-lg">
            <table className="w-full min-w-[600px] text-sm">
              <thead><tr className="border-b border-border bg-surface-2">
                {["Seq","Operation","Work Center","Setup","Run","Skill","QC"].map(h=>(
                  <th key={h} className="text-left py-2.5 px-3 text-text-secondary text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {modal.item.operations.map(op=>(
                  <tr key={op.seq}>
                    <td className="py-2 px-3 font-mono text-accent font-bold whitespace-nowrap">{op.seq}</td>
                    <td className="py-2 px-3 text-text-primary whitespace-nowrap">{op.name}</td>
                    <td className="py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{op.workCenter}</td>
                    <td className="py-2 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{op.setupTime}h</td>
                    <td className="py-2 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{op.runTime}h</td>
                    <td className="py-2 px-3 text-text-secondary text-xs whitespace-nowrap">{op.skill}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{op.requiresQC?<ShieldCheck size={14} className="text-accent-warning"/>:<span className="text-text-secondary">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button className="btn-secondary" onClick={()=>setModal(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
