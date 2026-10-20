"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardType } from "@/lib/roles";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { ExecutiveDashboard } from "@/components/dashboards/ExecutiveDashboard";
import { SalesDashboard } from "@/components/dashboards/SalesDashboard";
import { ProjectDashboard } from "@/components/dashboards/ProjectDashboard";
import { EngineeringDashboard } from "@/components/dashboards/EngineeringDashboard";
import { ProductionDashboard } from "@/components/dashboards/ProductionDashboard";
import { ProcurementDashboard } from "@/components/dashboards/ProcurementDashboard";
import { WarehouseDashboard } from "@/components/dashboards/WarehouseDashboard";
import { QualityDashboard } from "@/components/dashboards/QualityDashboard";
import { FinanceDashboard } from "@/components/dashboards/FinanceDashboard";
import { ReadonlyDashboard } from "@/components/dashboards/ReadonlyDashboard";
import {
  Crown, BarChart3, FolderKanban, Wrench, Factory,
  ShoppingCart, Boxes, ShieldCheck, DollarSign, BookOpen,
  Sparkles,
} from "lucide-react";

const DASHBOARD_TABS: { type: DashboardType; label: string; icon: any; color: string }[] = [
  { type: "executive", label: "Eksekutif", icon: Crown, color: "#2563EB" },
  { type: "sales", label: "Penjualan", icon: BarChart3, color: "#0891B2" },
  { type: "project", label: "Proyek", icon: FolderKanban, color: "#D97706" },
  { type: "engineering", label: "Engineering", icon: Wrench, color: "#059669" },
  { type: "production", label: "Produksi", icon: Factory, color: "#EA580C" },
  { type: "procurement", label: "Pengadaan", icon: ShoppingCart, color: "#4F46E5" },
  { type: "warehouse", label: "Gudang", icon: Boxes, color: "#92400E" },
  { type: "quality", label: "Quality Control", icon: ShieldCheck, color: "#16A34A" },
  { type: "finance", label: "Keuangan", icon: DollarSign, color: "#B45309" },
  { type: "readonly", label: "Auditor", icon: BookOpen, color: "#64748B" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const defaultDashboard = user.roleDefinition.dashboardType || "executive";
  const [activeTab, setActiveTab] = useState<DashboardType>(defaultDashboard);

  // Sync tab when switching role/user
  useEffect(() => {
    setActiveTab(user.roleDefinition.dashboardType || "executive");
  }, [user.roleDefinition.dashboardType]);

  const roleDef = user.roleDefinition;

  return (
    <div className="space-y-5 w-full min-w-0">
      {/* ── Active Role Perspective Banner & Quick Tab Selector ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* User & Role info */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-xs"
              style={{
                background: roleDef.bgColor,
                color: roleDef.color,
                border: `1.5px solid ${roleDef.borderColor}`,
              }}
            >
              {roleDef.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#0F172A]">{user.name}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                  style={{
                    color: roleDef.color,
                    background: roleDef.bgColor,
                    borderColor: roleDef.borderColor,
                  }}
                >
                  {roleDef.label}
                </span>
                <span className="text-xs text-[#94A3B8]">({user.department})</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{roleDef.description}</p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs text-[#64748B] hidden lg:inline">Ganti Pengguna / Role:</span>
            <RoleSwitcher />
          </div>
        </div>

        {/* Dashboard Tabs for quick navigation across role perspectives */}
        <div className="mt-3.5 pt-3 border-t border-[#F1F5F9] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Sparkles size={12} className="text-[#2563EB]" /> Mode Dasbor:
            </span>
            {DASHBOARD_TABS.map(tab => {
              const isActive = activeTab === tab.type;
              const isUserDefault = user.roleDefinition.dashboardType === tab.type;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#0F172A] text-white shadow-sm font-semibold"
                      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] border border-transparent hover:border-[#E2E8F0]"
                  }`}
                >
                  <TabIcon
                    size={13}
                    style={{ color: isActive ? "#FFFFFF" : tab.color }}
                  />
                  <span>{tab.label}</span>
                  {isUserDefault && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#EFF6FF] text-[#2563EB]"
                      }`}
                    >
                      Default
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Dashboard Content ── */}
      <div className="animate-fade-in min-w-0">
        {activeTab === "executive" && <ExecutiveDashboard />}
        {activeTab === "sales" && <SalesDashboard />}
        {activeTab === "project" && <ProjectDashboard />}
        {activeTab === "engineering" && <EngineeringDashboard />}
        {activeTab === "production" && <ProductionDashboard />}
        {activeTab === "procurement" && <ProcurementDashboard />}
        {activeTab === "warehouse" && <WarehouseDashboard />}
        {activeTab === "quality" && <QualityDashboard />}
        {activeTab === "finance" && <FinanceDashboard />}
        {activeTab === "readonly" && <ReadonlyDashboard />}
      </div>
    </div>
  );
}
