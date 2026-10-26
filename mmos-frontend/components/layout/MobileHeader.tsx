"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MessageSquare, Bell, X, Check, CheckCheck } from "lucide-react";
import { notifications as initialNotifications } from "@/lib/dummy-data";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";

export function MobileHeader() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read);

  // Hydration-safe live real-time clock
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formattedTimeFull = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  const formattedTimeShort = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <>
      <header className="md:hidden h-14 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-2.5 sm:px-3 flex items-center justify-between sticky top-0 z-40 shrink-0 select-none shadow-xs">
        {/* Left section: Buildlink Logo & Live Clock */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <Link href="/" className="flex items-center shrink-0 group" title="MMOS Buildlink">
            <Image
              src="/buildlink.png"
              alt="Buildlink Logo"
              width={105}
              height={26}
              priority
              className="h-6 sm:h-7 w-auto object-contain object-left transition-transform duration-200 group-active:scale-95"
            />
          </Link>

          {/* Live Realtime Clock Pill (Always rendered, hydration safe) */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-mono font-bold text-[#0F172A] shadow-2xs shrink-0 select-none"
            suppressHydrationWarning
            title="Waktu Real-time MMOS (WIB)"
          >
            <Clock size={11} className="text-[#16A34A] animate-pulse shrink-0" />
            <span suppressHydrationWarning className="tracking-tight">
              {mounted && now ? (
                <>
                  <span className="inline min-[400px]:hidden">{formattedTimeShort}</span>
                  <span className="hidden min-[400px]:inline">{formattedTimeFull}</span>
                </>
              ) : (
                "--:--"
              )}
            </span>
            <span className="text-[8px] sm:text-[9px] text-[#64748B] font-sans font-normal hidden min-[360px]:inline">
              WIB
            </span>
          </div>
        </div>

        {/* Right section: Chat Button, Notif Button, and RoleSwitcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Chat Button */}
          <button
            type="button"
            id="mobile-chat-btn"
            onClick={() => setShowChat(true)}
            className="relative w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] active:scale-90 transition-all cursor-pointer shadow-2xs"
            aria-label="Chat Tim"
            title="Chat Tim Fabrikasi"
          >
            <MessageSquare size={15} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white shadow-xs">
              3
            </span>
          </button>

          {/* Notifications Button & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              id="mobile-notif-btn"
              onClick={() => setShowNotif(v => !v)}
              className="relative w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] text-[#475569] active:scale-90 transition-all cursor-pointer shadow-2xs"
              aria-label="Notifikasi"
              title="Notifikasi Sistem"
            >
              <Bell size={15} />
              {unread.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white shadow-xs">
                  {unread.length}
                </span>
              )}
            </button>

            {/* Mobile Notification Popover Sheet */}
            {showNotif && (
              <div 
                id="mobile-notif-popover"
                className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-20px)] bg-white rounded-2xl border border-[#CBD5E1]/90 shadow-2xl z-50 animate-slide-down overflow-hidden"
              >
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#F1F5F9] bg-[#F8FAFC]/80">
                  <div className="flex items-center gap-1.5">
                    <Bell size={13} className="text-[#2563EB]" />
                    <span className="text-xs font-bold text-[#0F172A]">Notifikasi Sistem</span>
                  </div>
                  {unread.length > 0 ? (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                    >
                      Tandai dibaca
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#94A3B8]">Semua dibaca</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
                  {notifications.slice(0, 5).map(n => {
                    const dot =
                      n.type === "alert"
                        ? "bg-red-500"
                        : n.type === "warning"
                        ? "bg-yellow-500"
                        : n.type === "success"
                        ? "bg-green-500"
                        : "bg-blue-500";
                    return (
                      <div
                        key={n.id}
                        onClick={() =>
                          setNotifications(prev =>
                            prev.map(item => (item.id === n.id ? { ...item, read: true } : item))
                          )
                        }
                        className={`px-3.5 py-2.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                          !n.read ? "bg-[#EFF6FF]/40" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0F172A] truncate">{n.title}</p>
                            <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">{n.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <RoleSwitcher />
        </div>
      </header>

      {/* Internal Team Chat Drawer */}
      <ChatDrawer open={showChat} onClose={() => setShowChat(false)} />
    </>
  );
}
