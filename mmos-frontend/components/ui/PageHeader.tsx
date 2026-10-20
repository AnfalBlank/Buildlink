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
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6", className)}>
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0 border border-[#DBEAFE] mt-0.5 sm:mt-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5 line-clamp-2">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
