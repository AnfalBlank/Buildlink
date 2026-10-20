"use client";
import { useState } from "react";
import { engineeringDocuments as initialData, projects } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Search, Eye, FileText, Upload } from "lucide-react";

type Doc = typeof initialData[0];
const STATUSES = ["Draft","In Review","Approved","Released","Obsolete"];
const TYPES = ["Drawing","WPS","P&ID","Calculation","Datasheet","Work Instruction","Specification"];

export default function EngineeringDocumentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit"|"view";item?:Doc}|null>(null);
  const [form, setForm] = useState<Partial<Doc>>({});

  const filtered = data.filter(d =>
    (statusFilter==="All" || d.status===statusFilter) &&
    (d.code.toLowerCase().includes(search.toLowerCase()) ||
     d.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = () => {
    if (modal?.type==="add") {
      setData([...data, {
        id:`ED${String(data.length+1).padStart(3,"0")}`,
        code:`DOC-ENG-${String(data.length+1).padStart(3,"0")}`,
        title:form.title??"",
        type:form.type??"Drawing",
        revision:"Rev.A",
        projectId:form.projectId??"",
        productId:form.productId??"",
        status:form.status??"Draft",
        owner:form.owner??"",
        approvedBy:(form.approvedBy??null) as string|null,
        releasedAt:(form.releasedAt??null) as string|null,
        description:form.description??"",
      } as Doc]);
    } else if (modal?.type==="edit" && modal.item) {
      setData(data.map(d=>d.id===modal.item!.id?{...d,...form} as Doc:d));
    }
    setModal(null);
  };

  const statusCounts = STATUSES.reduce((acc,s) => ({...acc,[s]:data.filter(d=>d.status===s).length}),{} as Record<string,number>);

  return (
    <div>
      <PageHeader
        title="Engineering Documents"
        subtitle="Dokumen teknik, drawing, dan spesifikasi"
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2"><Upload size={16}/>Upload</button>
            <button className="btn-primary flex items-center gap-2" onClick={()=>{setForm({status:"Draft",type:"Drawing"});setModal({type:"add"});}}><Plus size={16}/>New Document</button>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-3 mb-6">
        {STATUSES.map(s=>(
          <div key={s} className={`card text-center cursor-pointer transition-all ${statusFilter===s?"border-accent":""}`} onClick={()=>setStatusFilter(statusFilter===s?"All":s)}>
            <p className="text-text-secondary text-xs mb-1">{s}</p>
            <p className="font-mono font-bold text-xl text-accent">{statusCounts[s]??0}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"/>
            <input className="input pl-9" placeholder="Search documents..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="select w-44" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Doc Code","Title","Type","Revision","Project","Owner","Approved By","Released","Status",""].map(h=>(
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id} className="table-row-hover">
                <td className="py-3 px-3 font-mono text-accent text-xs">{d.code}</td>
                <td className="py-3 px-3 text-text-primary font-medium max-w-[200px]"><div className="truncate">{d.title}</div></td>
                <td className="py-3 px-3"><span className="badge-status border text-accent bg-accent/10 border-accent/30">{d.type}</span></td>
                <td className="py-3 px-3 font-mono text-text-secondary text-xs">{d.revision}</td>
                <td className="py-3 px-3 text-text-secondary text-xs">{d.projectId}</td>
                <td className="py-3 px-3 text-text-secondary text-xs">{d.owner}</td>
                <td className="py-3 px-3 text-text-secondary text-xs">{d.approvedBy??"-"}</td>
                <td className="py-3 px-3 text-text-secondary text-xs">{d.releasedAt??"-"}</td>
                <td className="py-3 px-3"><StatusBadge status={d.status}/></td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button className="text-text-secondary hover:text-accent" onClick={()=>setModal({type:"view",item:d})}><Eye size={14}/></button>
                    <button className="text-text-secondary hover:text-accent" onClick={()=>{setForm({...d});setModal({type:"edit",item:d});}}><Pencil size={14}/></button>
                    <button className="text-text-secondary hover:text-accent-alert" onClick={()=>setData(data.filter(x=>x.id!==d.id))}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {modal?.type==="view" && modal.item && (
        <Modal open title={`Document — ${modal.item.code}`} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Code",modal.item.code],["Title",modal.item.title],["Type",modal.item.type],
              ["Revision",modal.item.revision],["Project",modal.item.projectId],["Product",modal.item.productId],
              ["Owner",modal.item.owner],["Approved By",modal.item.approvedBy??"-"],
              ["Released At",modal.item.releasedAt??"-"],["Status",modal.item.status],
            ].map(([l,v])=>(
              <div key={l} className="bg-surface-2 rounded-lg p-3">
                <p className="text-text-secondary text-xs mb-1">{l}</p>
                <p className="text-text-primary font-medium text-sm">{v}</p>
              </div>
            ))}
            <div className="col-span-2 bg-surface-2 rounded-lg p-3">
              <p className="text-text-secondary text-xs mb-1">Description</p>
              <p className="text-text-primary text-sm">{modal.item.description}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={()=>setModal(null)}>Close</button>
            {modal.item.status==="Approved" && (
              <button className="btn-primary" onClick={()=>{setData(data.map(d=>d.id===modal.item!.id?{...d,status:"Released",releasedAt:new Date().toISOString().split("T")[0]}:d));setModal(null);}}>
                Release Document
              </button>
            )}
          </div>
        </Modal>
      )}

      {(modal?.type==="add"||modal?.type==="edit") && (
        <Modal open title={modal.type==="add"?"New Document":"Edit Document"} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Title</label>
              <input className="input" value={form.title??""} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Type</label>
              <select className="select" value={form.type??"Drawing"} onChange={e=>setForm({...form,type:e.target.value})}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Project</label>
              <select className="select" value={form.projectId??""} onChange={e=>setForm({...form,projectId:e.target.value})}>
                <option value="">Select...</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.code}</option>)}
              </select>
            </div>
            {[
              {label:"Owner",key:"owner"},
              {label:"Approved By",key:"approvedBy"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <input className="input" value={(form as Record<string,string|null>)[f.key]??""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status??"Draft"} onChange={e=>setForm({...form,status:e.target.value})}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Description</label>
              <textarea className="input min-h-[60px] resize-none" value={form.description??""} onChange={e=>setForm({...form,description:e.target.value})}/>
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
