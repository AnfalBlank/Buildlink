"use client";
import { useState } from "react";
import { users as initialData } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, ShieldAlert, Search } from "lucide-react";

type User = typeof initialData[0];
const ROLES = [
  "Owner / Director","System Admin","Sales / CRM","Project Manager","Engineering",
  "Production Planner","Production Manager / Supervisor","Operator / Technician",
  "Procurement","Warehouse","QC Inspector","Quality Manager","Finance / Cost Control","Auditor / Read-only"
];

export default function UsersPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modal, setModal] = useState<{type:"add"|"edit";item?:User}|null>(null);
  const [form, setForm] = useState<Partial<User>>({});

  const filtered = data.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSave = () => {
    if (modal?.type === "add") {
      setData([...data, {
        id: `USR${String(data.length+1).padStart(3,"0")}`,
        name: form.name ?? "",
        email: form.email ?? "",
        role: form.role ?? "Operator / Technician",
        department: form.department ?? "",
        status: form.status ?? "Active",
      }]);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(u => u.id === modal.item!.id ? { ...u, ...form } as User : u));
    }
    setModal(null);
  };

  const roleColor = (role: string) => {
    if (role.includes("Owner") || role.includes("Director")) return "text-accent bg-accent/10 border-accent/30";
    if (role.includes("Admin")) return "text-purple-400 bg-purple-400/10 border-purple-400/30";
    if (role.includes("Manager")) return "text-accent-warning bg-accent-warning/10 border-accent-warning/30";
    return "text-text-secondary bg-surface-2 border-border";
  };

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="Manajemen pengguna dan hak akses"
        actions={<button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ status: "Active" }); setModal({ type: "add" }); }}><Plus size={16} />Add User</button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card"><p className="text-text-secondary text-xs mb-1">Total Users</p><p className="font-mono font-bold text-2xl text-accent">{data.length}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Active</p><p className="font-mono font-bold text-2xl text-accent-success">{data.filter(u=>u.status==="Active").length}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Roles Used</p><p className="font-mono font-bold text-2xl text-accent">{new Set(data.map(u=>u.role)).size}</p></div>
      </div>

      {/* Role matrix */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-accent"/>Role Summary</h3>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => {
            const count = data.filter(u => u.role === r).length;
            return (
              <div key={r} className={`px-3 py-1.5 rounded-lg border text-xs ${count > 0 ? "border-border text-text-primary bg-surface-2" : "border-border/30 text-text-secondary/50"}`}>
                {r} <span className={`font-mono font-bold ml-1 ${count > 0 ? "text-accent" : "text-text-secondary/30"}`}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-52" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="All">Semua Role</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Name","Email","Role","Department","Status",""].map(h => (
              <th key={h} className="text-left py-3 px-4 text-text-secondary font-medium text-xs">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="table-row-hover">
                <td className="py-3 px-4 text-text-primary font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold">
                      {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary text-xs">{u.email}</td>
                <td className="py-3 px-4"><span className={`badge-status border ${roleColor(u.role)}`}>{u.role}</span></td>
                <td className="py-3 px-4 text-text-secondary text-xs">{u.department}</td>
                <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="text-text-secondary hover:text-accent" onClick={() => { setForm({ ...u }); setModal({ type: "edit", item: u }); }}><Pencil size={14} /></button>
                    <button className="text-text-secondary hover:text-accent-alert" onClick={() => setData(data.filter(x => x.id !== u.id))}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal open title={modal.type === "add" ? "Add User" : "Edit User"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-text-secondary text-xs mb-1.5 block">Full Name</label>
              <input className="input" value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Email</label>
              <input type="email" className="input" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Department</label>
              <input className="input" value={form.department ?? ""} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Role</label>
              <select className="select" value={form.role ?? ROLES[0]} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
              <select className="select" value={form.status ?? "Active"} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
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
