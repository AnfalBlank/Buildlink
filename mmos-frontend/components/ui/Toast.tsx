"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Global dispatcher that functions anywhere in the browser
export const showToast = (type: ToastType, title: string, message?: string, duration = 4500) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("mmos-toast", {
        detail: { type, title, message, duration },
      })
    );
  }
};

export const toast = {
  success: (title: string, message?: string, duration?: number) => showToast("success", title, message, duration),
  error: (title: string, message?: string, duration?: number) => showToast("error", title, message, duration),
  warning: (title: string, message?: string, duration?: number) => showToast("warning", title, message, duration),
  info: (title: string, message?: string, duration?: number) => showToast("info", title, message, duration),
};

const ToastContext = createContext<{ toast: typeof toast }>({ toast });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
      }>;
      const { type, title, message, duration = 4500 } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);

      setToasts(prev => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    window.addEventListener("mmos-toast", handleToastEvent);
    return () => window.removeEventListener("mmos-toast", handleToastEvent);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast floating container mounted directly to body */}
      {mounted &&
        createPortal(
          <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
            {toasts.map(t => {
              const cfg = {
                success: {
                  icon: CheckCircle2,
                  color: "text-[#16A34A]",
                  bg: "bg-[#F0FDF4]",
                  border: "border-[#BBF7D0]",
                  bar: "bg-[#16A34A]",
                },
                error: {
                  icon: AlertCircle,
                  color: "text-[#DC2626]",
                  bg: "bg-[#FEF2F2]",
                  border: "border-[#FECACA]",
                  bar: "bg-[#DC2626]",
                },
                warning: {
                  icon: AlertTriangle,
                  color: "text-[#D97706]",
                  bg: "bg-[#FFFBEB]",
                  border: "border-[#FDE68A]",
                  bar: "bg-[#D97706]",
                },
                info: {
                  icon: Info,
                  color: "text-[#2563EB]",
                  bg: "bg-[#EFF6FF]",
                  border: "border-[#BFDBFE]",
                  bar: "bg-[#2563EB]",
                },
              }[t.type];

              const Icon = cfg.icon;

              return (
                <div
                  key={t.id}
                  className={cn(
                    "pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md border rounded-xl shadow-2xl p-4",
                    "transition-all duration-300 ease-out transform translate-x-0 flex items-start gap-3",
                    "border-[#E2E8F0] ring-1 ring-black/5"
                  )}
                >
                  {/* Left accent strip */}
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", cfg.bar)} />

                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-0.5 border",
                      cfg.bg,
                      cfg.color,
                      cfg.border
                    )}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#0F172A] leading-tight">{t.title}</p>
                    {t.message && (
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{t.message}</p>
                    )}
                  </div>

                  <button
                    onClick={() => removeToast(t.id)}
                    className="text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                    aria-label="Tutup notifikasi"
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context;
}
