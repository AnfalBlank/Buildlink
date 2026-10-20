"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning" | "info" | "success";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const displayMessage = description || message || "";

  const cfgMap = {
    primary: {
      icon: CheckCircle2,
      iconColor: "text-[#2563EB]",
      iconBg: "bg-[#EFF6FF] border-[#BFDBFE]",
      btnClass: "btn-primary",
      accentBar: "bg-gradient-to-r from-[#2563EB] to-[#60A5FA]"
    },
    info: {
      icon: Info,
      iconColor: "text-[#2563EB]",
      iconBg: "bg-[#EFF6FF] border-[#BFDBFE]",
      btnClass: "btn-primary",
      accentBar: "bg-gradient-to-r from-[#2563EB] to-[#60A5FA]"
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-[#16A34A]",
      iconBg: "bg-[#F0FDF4] border-[#BBF7D0]",
      btnClass: "bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white shadow-sm font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150",
      accentBar: "bg-gradient-to-r from-[#16A34A] to-[#4ADE80]"
    },
    danger: {
      icon: Trash2,
      iconColor: "text-[#DC2626]",
      iconBg: "bg-[#FEF2F2] border-[#FECACA]",
      btnClass: "bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-sm font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#DC2626]",
      accentBar: "bg-gradient-to-r from-[#DC2626] to-[#F87171]"
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-[#D97706]",
      iconBg: "bg-[#FFFBEB] border-[#FDE68A]",
      btnClass: "bg-[#D97706] hover:bg-[#B45309] text-white shadow-sm font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150",
      accentBar: "bg-gradient-to-r from-[#D97706] to-[#FBBF24]"
    },
  };

  const cfg = cfgMap[variant] || cfgMap.primary;
  const Icon = cfg.icon;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Light frosted backdrop (clean and not dark) */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] backdrop-fade-animation transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-2xl border border-[#CBD5E1]/80 shadow-2xl overflow-hidden modal-enter-animation z-10 my-auto"
      >
        {/* Accent Bar */}
        <div className={cn("h-1 w-full", cfg.accentBar)} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", cfg.iconBg, cfg.iconColor)}>
              <Icon size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">{displayMessage}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-secondary !rounded-xl !py-2 !px-4 text-xs sm:text-sm cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(cfg.btnClass, "!rounded-xl !py-2 !px-4 text-xs sm:text-sm cursor-pointer flex items-center gap-1.5")}
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
