"use client";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions, className, icon }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 border border-[#DBEAFE]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
