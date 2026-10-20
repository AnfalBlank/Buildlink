"use client";
import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, ChevronDown, PanelLeftClose, PanelLeftOpen,
  User, LogOut, Shield, MessageSquare, Clock, Calendar
} from "lucide-react";
import { notifications as initialNotifications } from "@/lib/dummy-data";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { RoleIcon } from "@/components/ui/RoleIcon";

interface TopBarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function TopBar({ onToggleSidebar, sidebarCollapsed }: TopBarProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter(n => !n.read);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Live real-time clock state
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Indonesian date and time formatting
  const formattedDay = now
    ? now.toLocaleDateString("id-ID", { weekday: "long" })
    : "";
  const formattedDate = now
    ? now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const formattedTime = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  return (
    <>
      <header className="h-16 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30 gap-3 select-none">
        {/* Left section: Sidebar toggle & Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0 max-w-xl">
          {/* Sidebar toggle button (shown only when sidebar is collapsed, preventing duplicate buttons) */}
          {onToggleSidebar && sidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold
                bg-[#EFF6FF] border-[#2563EB]/30 text-[#2563EB] hover:bg-[#DBEAFE] hover:border-[#2563EB]
                transition-all duration-200 shrink-0 shadow-xs cursor-pointer group"
              title="Buka sidebar (Ctrl+B)"
              aria-label="Buka Sidebar"
            >
              <PanelLeftOpen size={16} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden sm:inline">Buka Sidebar</span>
            </button>
          )}

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs md:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Cari proyek, order, material..."
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-1.5 text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 w-full transition-all"
            />
          </div>
        </div>

        {/* Center/Right section: Realtime Clock, Status, Chat, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Clock & Date Badge */}
          {now && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <div className="flex items-center gap-1.5 text-[#475569] font-medium border-r border-[#E2E8F0] pr-2.5">
                <Calendar size={13} className="text-[#2563EB]" />
                <span className="capitalize">{formattedDay}</span>, {formattedDate}
              </div>
              <div className="flex items-center gap-1.5 text-[#0F172A] font-mono font-bold tabular-nums">
                <Clock size={13} className="text-[#16A34A] animate-pulse" />
                <span>{formattedTime}</span>
                <span className="text-[10px] text-[#64748B] font-sans font-normal">WIB</span>
              </div>
            </div>
          )}

          {/* System online badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[#16A34A] text-xs font-semibold">Online</span>
          </div>

          {/* Chat Antar User Button */}
          <button
            onClick={() => setShowChat(true)}
            className="relative w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#EFF6FF] hover:border-[#BFDBFE] hover:text-[#2563EB] transition-all focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer text-[#4B5563]"
            aria-label="Chat Tim Internal"
            title="Chat Tim Internal"
          >
            <MessageSquare size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white shadow-xs">
              3
            </span>
          </button>

          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(v => !v)}
              className="relative w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              aria-label="Notifikasi"
              title="Notifikasi"
            >
              <Bell size={16} className="text-[#4B5563]" />
              {unread.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white shadow-xs">
                  {unread.length}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#CBD5E1]/80 shadow-2xl z-50 animate-slide-down overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]/70">
                  <span className="text-sm font-bold text-[#0F172A]">Notifikasi Sistem</span>
                  {unread.length > 0 ? (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
                    >
                      Tandai semua dibaca
                    </button>
                  ) : (
                    <span className="text-xs text-[#94A3B8]">Semua telah dibaca</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                  {notifications.slice(0, 5).map(n => {
                    const dot = n.type === "alert" ? "bg-red-500" : n.type === "warning" ? "bg-yellow-500" :
                      n.type === "success" ? "bg-green-500" : "bg-blue-500";
                    return (
                      <div
                        key={n.id}
                        onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))}
                        className={`px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${!n.read ? "bg-[#EFF6FF]/40" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0F172A] truncate">{n.title}</p>
                            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                            <p className="text-[11px] text-[#94A3B8] mt-1 font-mono">{n.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                style={{
                  background: user.roleDefinition.bgColor,
                  color: user.roleDefinition.color,
                  border: `1.5px solid ${user.roleDefinition.borderColor}`,
                }}
              >
                {user.initials}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-[#0F172A] text-xs font-bold block leading-tight">{user.name}</span>
                <span className="text-[#64748B] text-[10px] block leading-tight">{user.roleDefinition.shortLabel}</span>
              </div>
              <ChevronDown size={13} className="text-[#64748B] hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-[#CBD5E1]/80 shadow-2xl z-50 animate-slide-down py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                  <div className="flex items-center gap-2">
                    <RoleIcon roleKey={user.role} size={15} style={{ color: user.roleDefinition.color }} />
                    <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{user.email}</p>
                  <span
                    className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                    style={{
                      color: user.roleDefinition.color,
                      background: user.roleDefinition.bgColor,
                      borderColor: user.roleDefinition.borderColor,
                    }}
                  >
                    {user.roleDefinition.label}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer"
                  >
                    <User size={14} className="text-[#94A3B8]" />
                    <span>Profil Pengguna</span>
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer"
                  >
                    <Shield size={14} className="text-[#94A3B8]" />
                    <span>Hak Akses ({user.roleDefinition.allowedModules.length} Modul)</span>
                  </button>
                </div>
                <div className="border-t border-[#F1F5F9] pt-1">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-2 text-left text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Internal Chat Drawer */}
      <ChatDrawer open={showChat} onClose={() => setShowChat(false)} />
    </>
  );
}
