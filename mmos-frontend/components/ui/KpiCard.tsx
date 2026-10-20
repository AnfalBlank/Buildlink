"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
  className?: string;
}

// R-29: single accent palette. Colors are semantic indicators, not decoration.
const colorMap = {
  blue:   { val: "text-[#2563EB]", icon: "bg-[#EFF6FF] text-[#2563EB]", border: "border-[#DBEAFE]" },
  green:  { val: "text-[#16A34A]", icon: "bg-[#F0FDF4] text-[#16A34A]", border: "border-[#DCFCE7]" },
  red:    { val: "text-[#DC2626]", icon: "bg-[#FEF2F2] text-[#DC2626]", border: "border-[#FECACA]" },
  yellow: { val: "text-[#D97706]", icon: "bg-[#FFFBEB] text-[#D97706]", border: "border-[#FDE68A]" },
  purple: { val: "text-[#7C3AED]", icon: "bg-[#F5F3FF] text-[#7C3AED]", border: "border-[#DDD6FE]" },
  cyan:   { val: "text-[#0891B2]", icon: "bg-[#ECFEFF] text-[#0891B2]", border: "border-[#A5F3FC]" },
};

export function KpiCard({ title, value, subtitle, icon: Icon, trend, color = "blue", className }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("card flex flex-col justify-between gap-2.5 min-w-0 transition-all duration-150 hover:border-[#CBD5E1]", className)}>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide truncate">{title}</p>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", c.icon)}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p className={cn("font-mono font-bold text-2xl sm:text-3xl leading-none tracking-tight truncate", c.val)}>{value}</p>
        {subtitle && <p className="text-xs text-[#6B7280] mt-1.5 truncate">{subtitle}</p>}
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium pt-1 border-t border-[#F1F5F9] truncate",
          trend.value >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"
        )}>
          {trend.value >= 0 ? <TrendingUp size={12} className="shrink-0" /> : <TrendingDown size={12} className="shrink-0" />}
          <span className="truncate">{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
