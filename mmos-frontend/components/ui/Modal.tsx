"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Light Frosted Backdrop (Not dark, keeps background bright and soft) */}
      <div
        className="fixed inset-0 bg-slate-900/15 backdrop-blur-[2px] backdrop-fade-animation transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Animated Modal Dialog Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full bg-white rounded-2xl border border-[#CBD5E1]/80 shadow-2xl overflow-hidden",
          "modal-enter-animation z-10 my-auto",
          sizes[size]
        )}
      >
        {/* Subtle decorative top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]/60">
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
            title="Tutup (Esc)"
            aria-label="Tutup modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body content with smooth custom scroll */}
        <div className="px-6 py-5 max-h-[78vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
