"use client";
import { cn, getStatusColor } from "@/lib/utils";

interface BadgeProps { status: string; className?: string; }

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span className={cn("badge-status border", getStatusColor(status), className)}>
      {status}
    </span>
  );
}

interface PillProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray" | "cyan" | "orange";
  className?: string;
}

export function Pill({ children, color = "gray", className }: PillProps) {
  const colors = {
    blue:   "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    green:  "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    red:    "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    yellow: "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    purple: "text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]",
    gray:   "text-[#4B5563] bg-[#F1F5F9] border-[#E2E8F0]",
    cyan:   "text-[#0891B2] bg-[#ECFEFF] border-[#A5F3FC]",
    orange: "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
  };
  return <span className={cn("badge-status border", colors[color], className)}>{children}</span>;
}
