"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES, RoleKey, roleLabelToKey } from "@/lib/roles";
import { Users, ChevronDown, Check, ArrowLeftRight } from "lucide-react";
import { RoleIcon } from "@/components/ui/RoleIcon";

export function RoleSwitcher() {
  const { user, switchUser, allUsers } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roleDef = user.roleDefinition;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 rounded-xl border border-dashed text-xs font-medium
          transition-all duration-200 cursor-pointer group hover:shadow-sm shrink-0"
        style={{
          borderColor: roleDef.borderColor,
          background: roleDef.bgColor,
          color: roleDef.color,
        }}
        title="Ganti Role / User (Demo)"
      >
        <ArrowLeftRight size={12} className="transition-transform duration-200 group-hover:rotate-180 shrink-0 opacity-70" />
        <span className="inline-flex items-center gap-1">
          <RoleIcon roleKey={roleDef.key} size={13} />
          <span className="hidden min-[400px]:inline text-[11px] font-semibold">{roleDef.shortLabel}</span>
        </span>
        <ChevronDown size={11} className={`transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-[#CBD5E1]/80 shadow-2xl z-50 overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]/70">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0F172A]">Switch User / Role</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">Pilih user untuk melihat tampilan per-role</p>
          </div>

          {/* User list */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
            {allUsers.filter(u => u.status === "Active").map(u => {
              const isActive = u.id === user.id;
              const rKey = roleLabelToKey[u.role] ?? "director";
              const rDef = ROLES[rKey];
              const initials = u.name.split(" ").map(n => n[0]).join("").slice(0, 2);

              return (
                <button
                  key={u.id}
                  onClick={() => { switchUser(u.id); setOpen(false); }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all duration-150 cursor-pointer group
                    ${isActive
                      ? "bg-[#EFF6FF]/60"
                      : "hover:bg-[#F8FAFC]"
                    }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{ background: rDef.bgColor, color: rDef.color, border: `1.5px solid ${rDef.borderColor}` }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border"
                        style={{ color: rDef.color, background: rDef.bgColor, borderColor: rDef.borderColor }}
                      >
                        <RoleIcon roleKey={rDef.key} size={11} />
                        {rDef.shortLabel}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">·</span>
                      <span className="text-[10px] text-[#64748B] truncate">{u.department}</span>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]/50">
            <p className="text-[10px] text-[#94A3B8] text-center">
              🔄 Switching user akan mengubah dashboard, sidebar & akses modul
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
