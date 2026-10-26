"use client";
import { useState } from "react";
import { workCenters as initialData } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

type WC = typeof initialData[0];

export default function WorkCentersPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{type:"add"|"edit";item?:WC}|null>(null);
  const [form, setForm] = useState<Partial<WC>>({});

  const filtered = data.filter(w => {
    const q = search.toLowerCase();
    return !q || w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
  });

  const handleSave = () => {
    if (modal?.type==="add") {
      setData([...data,{
        id:`WC-${form.id??String(data.length+1).padStart(3,"0")}`,
        name:form.name??"",
        type:form.type??"Labor",
        capacity:Number(form.capacity)||1,
        unit:form.unit??"",
        status:form.status??"Active",
      }]);
    } else if (modal?.type==="edit"&&modal.item) {
      setData(data.map(w=>w.id===modal.item!.id?{...w,...form,capacity:Number(form.capacity)} as WC:w));
    }
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Work Centers"
        subtitle="Pusat kerja: mesin dan tenaga kerja"
        actions={<button className="btn-primary flex items-center gap-2" onClick={()=>{setForm({type:"Labor",status:"Active"});setModal({type:"add"});}}><Plus size={16}/>Add Work Center</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          {label:"Total",val:data.length,cls:"text-accent"},
          {label:"Machine",val:data.filter(w=>w.type==="Machine").length,cls:"text-accent-warning"},
          {label:"Labor",val:data.filter(w=>w.type==="Labor").length,cls:"text-accent"},
        ].map(s=>(
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
            <input className="input pl-9" placeholder="Cari nama / tipe..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto w-full border border-border rounded-lg">
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {["ID","Name","Type","Capacity","Unit","Status",""].map(h=>(
                  <th key={h} className="text-left py-3 px-4 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(w=>(
                <tr key={w.id} className="table-row-hover">
                  <td className="py-3 px-4 font-mono text-accent text-xs whitespace-nowrap">{w.id}</td>
                  <td className="py-3 px-4 text-text-primary font-medium whitespace-nowrap">{w.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><span className={`badge-status border ${w.type==="Machine"?"text-accent-warning bg-accent-warning/10 border-accent-warning/30":"text-accent bg-accent/10 border-accent/30"}`}>{w.type}</span></td>
                  <td className="py-3 px-4 font-mono text-text-secondary whitespace-nowrap">{w.capacity}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs whitespace-nowrap">{w.unit}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><StatusBadge status={w.status}/></td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-text-secondary hover:text-accent cursor-pointer" onClick={()=>{setForm({...w});setModal({type:"edit",item:w});}}><Pencil size={14}/></button>
                      <button className="text-text-secondary hover:text-accent-alert cursor-pointer" onClick={()=>setData(data.filter(x=>x.id!==w.id))}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {(modal?.type==="add"||modal?.type==="edit")&&(
        <Modal open title={modal.type==="add"?"Add Work Center":"Edit Work Center"} onClose={()=>setModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Capacity",key:"capacity"},{label:"Unit",key:"unit",ph:"Shift / Welder / Inspector"}].map(f=>(
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <input className="input" placeholder={(f as {ph?:string}).ph} value={(form as Record<string,string|number>)[f.key]??""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Type</label>
              <select className="select" value={form.type??"Labor"} onChange={e=>setForm({...form,type:e.target.value})}>
                <option>Labor</option><option>Machine</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status??"Active"} onChange={e=>setForm({...form,status:e.target.value})}>
                <option>Active</option><option>Inactive</option><option>Under Maintenance</option>
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
