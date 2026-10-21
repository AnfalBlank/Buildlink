"use client";
import { useState } from "react";
import { workOrders as initialData, productionOrders, workCenters } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Eye, Clock, AlertCircle, Search } from "lucide-react";

type WO = typeof initialData[0];
const STATUSES = ["Draft","Ready","In Progress","Paused","Submitted for QC","Accepted","Rework","Completed"];

export default function WorkOrdersPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit"|"view";item?:WO}|null>(null);
  const [form, setForm] = useState<Partial<WO>>({});

  const filtered = (statusFilter==="All" ? data : data.filter(w=>w.status===statusFilter))
    .filter(w => {
      const q = search.toLowerCase();
      return !q || w.code.toLowerCase().includes(q) || w.operation.toLowerCase().includes(q) || w.serial.toLowerCase().includes(q);
    });

  const handleSave = () => {
    if (modal?.type==="add") {
      const po = productionOrders.find(p=>p.id===form.productionOrderId);
      setData([...data,{
        id:`WO${String(data.length+1).padStart(3,"0")}`,
        code:`WO-2026-${String(data.length+1).padStart(3,"0")}`,
        productionOrderId:form.productionOrderId??"",
        serial:form.serial??"",
        operation:form.operation??"",
        seq:Number(form.seq)||10,
        workCenter:form.workCenter??"",
        assignedTo:form.assignedTo??"",
        targetDate:form.targetDate??"",
        status:form.status??"Draft",
        estimatedHours:Number(form.estimatedHours)||0,
        actualHours:0,
        qtyGood:0,
        qtyReject:0,
        notes:form.notes??"",
      }]);
    } else if (modal?.type==="edit"&&modal.item) {
      setData(data.map(w=>w.id===modal.item!.id?{...w,...form,seq:Number(form.seq),estimatedHours:Number(form.estimatedHours),actualHours:Number(form.actualHours)} as WO:w));
    }
    setModal(null);
  };

  const efficiencyPct = (w: WO) => w.actualHours>0&&w.estimatedHours>0 ? Math.round((w.estimatedHours/w.actualHours)*100) : null;

  return (
    <div>
      <PageHeader
        title="Work Orders"
        subtitle="Work order per operasi dan unit"
        actions={<button className="btn-primary flex items-center gap-2" onClick={()=>{setForm({status:"Draft",seq:10});setModal({type:"add"});}}><Plus size={16}/>New Work Order</button>}
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {["All","Draft","Ready","In Progress","Paused","Submitted for QC","Completed"].map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter===s?"bg-accent/10 border-accent text-accent":"bg-surface-2 border-border text-text-secondary hover:text-text-primary"}`}>
            {s} {s==="All"?`(${data.length})`:data.filter(w=>w.status===s).length>0?`(${data.filter(w=>w.status===s).length})`:""}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari kode / operasi / serial..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">Semua Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto w-full"><table className="w-full text-sm min-w-[950px]">
          <thead><tr className="border-b border-border">
            {["Code","Serial","Operation","Seq","Work Center","Assigned To","Target","Est.h","Act.h","Eff%","Status",""].map(h=>(
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(w=>{
              const eff = efficiencyPct(w);
              return (
                <tr key={w.id} className="table-row-hover">
                  <td className="py-3 px-3 font-mono text-accent text-xs whitespace-nowrap">{w.code}</td>
                  <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{w.serial}</td>
                  <td className="py-3 px-3 text-text-primary font-medium max-w-[140px] whitespace-nowrap"><div className="truncate">{w.operation}</div></td>
                  <td className="py-3 px-3 font-mono text-text-secondary whitespace-nowrap">{w.seq}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{w.workCenter}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{w.assignedTo}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">{w.targetDate}</td>
                  <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{w.estimatedHours}h</td>
                  <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{w.actualHours>0?`${w.actualHours}h`:"-"}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {eff!=null ? <span className={`font-mono text-xs font-bold ${eff>=90?"text-accent-success":eff>=75?"text-accent-warning":"text-accent-alert"}`}>{eff}%</span> : <span className="text-text-secondary text-xs">-</span>}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={w.status}/></td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-text-secondary hover:text-accent" onClick={()=>setModal({type:"view",item:w})}><Eye size={14}/></button>
                      <button className="text-text-secondary hover:text-accent" onClick={()=>{setForm({...w});setModal({type:"edit",item:w});}}><Pencil size={14}/></button>
                      <button className="text-text-secondary hover:text-accent-alert" onClick={()=>setData(data.filter(x=>x.id!==w.id))}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>

      {modal?.type==="view"&&modal.item&&(
        <Modal open title={`Work Order — ${modal.item.code}`} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              ["WO Code",modal.item.code],["Production Order",modal.item.productionOrderId],["Serial",modal.item.serial],
              ["Operation",modal.item.operation],["Seq",String(modal.item.seq)],["Work Center",modal.item.workCenter],
              ["Assigned To",modal.item.assignedTo],["Target Date",modal.item.targetDate],["Status",modal.item.status],
              ["Est. Hours",`${modal.item.estimatedHours}h`],["Actual Hours",`${modal.item.actualHours}h`],
              ["Qty Good",String(modal.item.qtyGood)],
            ].map(([l,v])=>(
              <div key={l} className="bg-surface-2 rounded-lg p-3">
                <p className="text-text-secondary text-xs mb-1">{l}</p>
                <p className="text-text-primary font-medium text-sm">{v}</p>
              </div>
            ))}
          </div>
          {modal.item.notes&&(
            <div className="bg-surface-2 rounded-lg p-3 mb-4">
              <p className="text-text-secondary text-xs mb-1">Notes</p>
              <p className="text-text-primary text-sm">{modal.item.notes}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={()=>setModal(null)}>Close</button>
            {modal.item.status==="In Progress"&&(
              <button className="btn-primary" onClick={()=>{setData(data.map(w=>w.id===modal.item!.id?{...w,status:"Submitted for QC"}:w));setModal(null);}}>
                Submit for QC
              </button>
            )}
          </div>
        </Modal>
      )}

      {(modal?.type==="add"||modal?.type==="edit")&&(
        <Modal open title={modal.type==="add"?"New Work Order":"Edit Work Order"} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Production Order</label>
              <select className="select" value={form.productionOrderId??""} onChange={e=>setForm({...form,productionOrderId:e.target.value})}>
                <option value="">Select...</option>
                {productionOrders.map(p=><option key={p.id} value={p.id}>{p.code}</option>)}
              </select>
            </div>
            {[
              {label:"Serial Number",key:"serial"},{label:"Operation Name",key:"operation"},
              {label:"Sequence",key:"seq"},{label:"Assigned To",key:"assignedTo"},
              {label:"Est. Hours",key:"estimatedHours"},{label:"Target Date",key:"targetDate",type:"date"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-text-secondary text-xs mb-1.5 block">{f.label}</label>
                <input type={f.type??"text"} className="input" value={(form as Record<string,string|number>)[f.key]??""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
              </div>
            ))}
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Work Center</label>
              <select className="select" value={form.workCenter??""} onChange={e=>setForm({...form,workCenter:e.target.value})}>
                <option value="">Select...</option>
                {workCenters.map(w=><option key={w.id} value={w.id}>{w.id} — {w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status??"Draft"} onChange={e=>setForm({...form,status:e.target.value})}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Notes</label>
              <textarea className="input min-h-[60px] resize-none" value={form.notes??""} onChange={e=>setForm({...form,notes:e.target.value})}/>
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
