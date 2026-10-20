"use client";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

// Semantic colors only — each has a purpose (status indicator), not decoration
const fills = {
  blue:   "bg-[#2563EB]",
  green:  "bg-[#16A34A]",
  red:    "bg-[#DC2626]",
  yellow: "bg-[#D97706]",
  purple: "bg-[#7C3AED]",
  cyan:   "bg-[#0891B2]",
};

const heights = { xs: "h-1", sm: "h-1.5", md: "h-2.5" };

export function ProgressBar({ value, max = 100, color = "blue", size = "sm", showLabel = false, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 bg-[#E2E8F0] rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", fills[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-semibold text-[#4B5563] w-9 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
}

/* ── Circular ring progress ── */
interface RingProgressProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export function RingProgress({ value, size = 52, stroke = 4, color = "#2563EB", label }: RingProgressProps) {
  const r = (size - stroke * 2) / 2;
  const circumference = r * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-progress">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-bold text-xs" style={{ color }}>{label ?? `${value}%`}</span>
      </div>
    </div>
  );
}
