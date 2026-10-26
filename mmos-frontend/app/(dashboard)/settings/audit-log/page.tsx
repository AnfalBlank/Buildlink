"use client";
import { useState } from "react";
import { auditLogs } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, FileSearch } from "lucide-react";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("All");

  const entities = ["All", ...new Set(auditLogs.map(l => l.entity))];

  const filtered = auditLogs.filter(l =>
    (entityFilter === "All" || l.entity === entityFilter) &&
    (l.user.toLowerCase().includes(search.toLowerCase()) ||
     l.entityCode.toLowerCase().includes(search.toLowerCase()) ||
     l.action.toLowerCase().includes(search.toLowerCase()) ||
     l.detail.toLowerCase().includes(search.toLowerCase()))
  );

  const actionColor = (a: string) => {
    if (a === "Pass" || a === "Approved" || a === "Released" || a === "Accepted") return "text-accent-success bg-accent-success/10 border-accent-success/30";
    if (a === "Fail" || a === "Rejected" || a === "Cancelled") return "text-accent-alert bg-accent-alert/10 border-accent-alert/30";
    if (a === "Created" || a === "Issued" || a === "Receipt") return "text-accent bg-accent/10 border-accent/30";
    return "text-accent-warning bg-accent-warning/10 border-accent-warning/30";
  };

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Riwayat semua perubahan transaksi penting"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="card"><p className="text-text-secondary text-xs mb-1">Total Events</p><p className="font-mono font-bold text-2xl text-accent">{auditLogs.length}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Unique Users</p><p className="font-mono font-bold text-2xl text-accent">{new Set(auditLogs.map(l=>l.user)).size}</p></div>
        <div className="card"><p className="text-text-secondary text-xs mb-1">Entity Types</p><p className="font-mono font-bold text-2xl text-accent">{new Set(auditLogs.map(l=>l.entity)).size}</p></div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="input pl-9" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-52" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
            {entities.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto w-full"><table className="w-full text-sm min-w-[750px]">
          <thead><tr className="border-b border-border">
            {["Timestamp","User","Action","Entity","Entity Code","Detail"].map(h => (
              <th key={h} className="text-left py-3 px-3 text-text-secondary font-medium text-xs whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="table-row-hover">
                <td className="py-3 px-3 font-mono text-text-secondary text-xs whitespace-nowrap">{log.timestamp}</td>
                <td className="py-3 px-3 text-text-primary font-medium text-xs whitespace-nowrap">{log.user}</td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className={`badge-status border ${actionColor(log.action)}`}>{log.action}</span>
                </td>
                <td className="py-3 px-3 whitespace-nowrap"><span className="badge-status border text-accent bg-accent/10 border-accent/30">{log.entity}</span></td>
                <td className="py-3 px-3 font-mono text-accent text-xs whitespace-nowrap">{log.entityCode}</td>
                <td className="py-3 px-3 text-text-secondary text-xs max-w-[280px] whitespace-nowrap"><div className="truncate">{log.detail}</div></td>
              </tr>
            ))}
          </tbody>
        </table></div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileSearch size={40} className="text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No audit log entries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
