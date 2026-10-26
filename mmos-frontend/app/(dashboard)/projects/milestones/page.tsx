"use client";
import { useState } from "react";
import { milestones as initialData, projects } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

type Milestone = typeof initialData[0];

export default function MilestonesPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit";item?:Milestone}|null>(null);
  const [form, setForm] = useState<Partial<Milestone>>({});

  const filtered = data
    .filter(m => projectFilter === "All" || m.projectId === projectFilter)
    .filter(m => {
      const q = search.toLowerCase();
      return !q || m.name.toLowerCase().includes(q) || m.pic.toLowerCase().includes(q);
    });

  const handleSave = () => {
    if (modal?.type === "add") {
      setData([...data, {
        id: `MS${String(data.length+1).padStart(3,"0")}`,
        projectId: form.projectId ?? "",
        name: form.name ?? "",
        weight: Number(form.weight)||0,
        targetDate: form.targetDate ?? "",
        actualDate: form.actualDate ?? null,
        status: form.status ?? "Pending",
        completion: Number(form.completion)||0,
        pic: form.pic ?? "",
      }]);
    } else if (modal?.type==="edit" && modal.item) {
      setData(data.map(m => m.id===modal.item!.id ? {...m,...form,weight:Number(form.weight),completion:Number(form.completion)} as Milestone : m));
    }
    setModal(null);
  };

  const projectProgress = (pId: string) => {
    const ms = data.filter(m => m.projectId === pId);
    return ms.reduce((s,m) => s + (m.weight * m.completion / 100), 0).toFixed(1);
  };

  return (
    <div>
      <PageHeader
        title="Project Milestones"
        subtitle="Milestone dan progres tiap proyek"
        actions={<button className="btn-primary flex items-center gap-2" onClick={()=>{setForm({status:"Pending",completion:0});setModal({type:"add"});}}><Plus size={16}/>Add Milestone</button>}
      />

      {/* Per-project summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {projects.filter(p=>p.status==="Active").map(p=>(
          <div key={p.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-text-primary font-semibold text-sm">{p.name}</p>
              <span className="font-mono text-accent text-sm font-bold">{projectProgress(p.id)}%</span>
            </div>
            <ProgressBar value={Number(projectProgress(p.id))} showLabel size="sm"/>
            <div className="mt-3 space-y-1.5">
              {data.filter(m=>m.projectId===p.id).map(m=>(
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary truncate max-w-[200px]">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-secondary">{m.weight}%</span>
                    <StatusBadge status={m.status}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari milestone / PIC..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-56" value={projectFilter} onChange={e=>setProjectFilter(e.target.value)}>
            <option value="All">All Projects</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto w-full border border-border rounded-lg">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {["Project","Milestone","Weight","Target Date","Actual Date","Completion","PIC","Status",""].map(h=>(
                  <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m=>(
                <tr key={m.id} className="table-row-hover">
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{m.projectId}</td>
                  <td className="py-3 px-3 text-text-primary font-medium whitespace-nowrap">{m.name}</td>
                  <td className="py-3 px-3 font-mono text-accent whitespace-nowrap">{m.weight}%</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap font-mono">{m.targetDate}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap font-mono">{m.actualDate ?? "—"}</td>
                  <td className="py-3 px-3 w-28 whitespace-nowrap"><ProgressBar value={m.completion} size="sm" showLabel/></td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{m.pic}</td>
                  <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={m.status}/></td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-text-secondary hover:text-accent cursor-pointer" onClick={()=>{setForm({...m});setModal({type:"edit",item:m});}}><Pencil size={14}/></button>
                      <button className="text-text-secondary hover:text-accent-alert cursor-pointer" onClick={()=>setData(data.filter(x=>x.id!==m.id))}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal?.type==="add"||modal?.type==="edit") && (
        <Modal open title={modal.type==="add"?"Add Milestone":"Edit Milestone"} onClose={()=>setModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Project</label>
              <select className="select" value={form.projectId??""} onChange={e=>setForm({...form,projectId:e.target.value})}>
                <option value="">Select project...</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Milestone Name</label>
              <input className="input" value={form.name??""} onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            {[
              {label:"Weight (%)",key:"weight"},
              {label:"PIC",key:"pic"},
              {label:"Target Date",key:"targetDate",type:"date"},
              {label:"Actual Date",key:"actualDate",type:"date"},
              {label:"Completion (%)",key:"completion"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <input type={f.type??"text"} className="input" value={(form as Record<string,string>)[f.key]??""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status??"Pending"} onChange={e=>setForm({...form,status:e.target.value})}>
                {["Pending","In Progress","Completed","Delayed"].map(s=><option key={s}>{s}</option>)}
              </select>
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
