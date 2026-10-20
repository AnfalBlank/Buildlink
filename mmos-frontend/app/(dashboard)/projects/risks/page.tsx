"use client";
import { useState } from "react";
import { risks as initialData, projects } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, AlertTriangle, Search } from "lucide-react";

type Risk = typeof initialData[0];

const riskLevel = (p: string, i: string) => {
  if (p==="High"&&i==="High") return { label:"Critical", cls:"text-accent-alert bg-accent-alert/10 border-accent-alert/30" };
  if ((p==="High"&&i==="Medium")||(p==="Medium"&&i==="High")) return { label:"High", cls:"text-orange-400 bg-orange-400/10 border-orange-400/30" };
  if (p==="Medium"&&i==="Medium") return { label:"Medium", cls:"text-accent-warning bg-accent-warning/10 border-accent-warning/30" };
  return { label:"Low", cls:"text-accent-success bg-accent-success/10 border-accent-success/30" };
};

export default function RisksPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit";item?:Risk}|null>(null);
  const [form, setForm] = useState<Partial<Risk>>({});

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (modal?.type==="add") {
      setData([...data, {
        id:`R${String(data.length+1).padStart(3,"0")}`,
        projectId:form.projectId??"",
        title:form.title??"",
        probability:form.probability??"Medium",
        impact:form.impact??"Medium",
        status:form.status??"Open",
        mitigation:form.mitigation??"",
        owner:form.owner??"",
        dueDate:form.dueDate??"",
      }]);
    } else if (modal?.type==="edit" && modal.item) {
      setData(data.map(r=>r.id===modal.item!.id?{...r,...form} as Risk:r));
    }
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Risks & Issues"
        subtitle="Log risiko dan isu proyek"
        actions={<button className="btn-primary flex items-center gap-2" onClick={()=>{setForm({probability:"Medium",impact:"Medium",status:"Open"});setModal({type:"add"});}}><Plus size={16}/>Add Risk</button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:"Critical",count:data.filter(r=>{const l=riskLevel(r.probability,r.impact);return l.label==="Critical";}).length,cls:"text-accent-alert"},
          {label:"High",count:data.filter(r=>riskLevel(r.probability,r.impact).label==="High").length,cls:"text-orange-400"},
          {label:"Open",count:data.filter(r=>r.status==="Open").length,cls:"text-accent-warning"},
          {label:"Mitigated",count:data.filter(r=>r.status==="Mitigated").length,cls:"text-accent-success"},
        ].map(s=>(
          <div key={s.label} className="card text-center">
            <p className="text-text-secondary text-xs mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl ${s.cls}`}>{s.count}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari judul / owner..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">Semua Status</option>
            {["Open","Mitigated","Closed"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Project","Title","Probability","Impact","Risk Level","Status","Owner","Due Date","Mitigation",""].map(h=>(
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(r=>{
              const level = riskLevel(r.probability, r.impact);
              return (
                <tr key={r.id} className="table-row-hover">
                  <td className="py-3 px-3 text-text-secondary text-xs">{r.projectId}</td>
                  <td className="py-3 px-3 text-text-primary font-medium max-w-[160px]"><div className="truncate">{r.title}</div></td>
                  <td className="py-3 px-3"><span className="badge-status border text-text-secondary bg-surface-2 border-border">{r.probability}</span></td>
                  <td className="py-3 px-3"><span className="badge-status border text-text-secondary bg-surface-2 border-border">{r.impact}</span></td>
                  <td className="py-3 px-3"><span className={`badge-status border ${level.cls}`}>{level.label}</span></td>
                  <td className="py-3 px-3"><span className={`badge-status border ${r.status==="Open"?"text-accent-alert bg-accent-alert/10 border-accent-alert/30":"text-accent-success bg-accent-success/10 border-accent-success/30"}`}>{r.status}</span></td>
                  <td className="py-3 px-3 text-text-secondary text-xs">{r.owner}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs">{r.dueDate}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs max-w-[180px]"><div className="truncate">{r.mitigation}</div></td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button className="text-text-secondary hover:text-accent" onClick={()=>{setForm({...r});setModal({type:"edit",item:r});}}><Pencil size={14}/></button>
                      <button className="text-text-secondary hover:text-accent-alert" onClick={()=>setData(data.filter(x=>x.id!==r.id))}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>

      {(modal?.type==="add"||modal?.type==="edit") && (
        <Modal open title={modal.type==="add"?"Add Risk":"Edit Risk"} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Project</label>
              <select className="select" value={form.projectId??""} onChange={e=>setForm({...form,projectId:e.target.value})}>
                <option value="">Select...</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.code}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Title</label>
              <input className="input" value={form.title??""} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            {[
              {label:"Probability",key:"probability",opts:["Low","Medium","High"]},
              {label:"Impact",key:"impact",opts:["Low","Medium","High"]},
              {label:"Status",key:"status",opts:["Open","Mitigated","Closed"]},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <select className="select" value={(form as Record<string,string>)[f.key]??""} onChange={e=>setForm({...form,[f.key]:e.target.value})}>
                  {f.opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Owner</label>
              <input className="input" value={form.owner??""} onChange={e=>setForm({...form,owner:e.target.value})}/>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Due Date</label>
              <input type="date" className="input" value={form.dueDate??""} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
            </div>
            <div className="col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Mitigation Plan</label>
              <textarea className="input min-h-[60px] resize-none" value={form.mitigation??""} onChange={e=>setForm({...form,mitigation:e.target.value})}/>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
