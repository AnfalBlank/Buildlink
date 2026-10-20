// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) DEFINITIONS
// ============================================================

export type RoleKey =
  | "director"
  | "admin"
  | "sales"
  | "project_manager"
  | "engineering"
  | "production_planner"
  | "production_manager"
  | "operator"
  | "procurement"
  | "warehouse"
  | "qc_inspector"
  | "quality_manager"
  | "finance"
  | "auditor";

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string;      // primary badge color
  bgColor: string;    // badge bg
  borderColor: string; // badge border
  icon: string;       // emoji icon for quick identification
  allowedModules: string[];  // sidebar module keys
  dashboardType: DashboardType;
}

export type DashboardType =
  | "executive"
  | "sales"
  | "project"
  | "engineering"
  | "production"
  | "procurement"
  | "warehouse"
  | "quality"
  | "finance"
  | "readonly";

// Map role labels from dummy-data users to RoleKey
export const roleLabelToKey: Record<string, RoleKey> = {
  "Owner / Director": "director",
  "System Admin": "admin",
  "Sales / CRM": "sales",
  "Project Manager": "project_manager",
  "Engineering": "engineering",
  "Production Planner": "production_planner",
  "Production Manager / Supervisor": "production_manager",
  "Operator / Technician": "operator",
  "Procurement": "procurement",
  "Warehouse": "warehouse",
  "QC Inspector": "qc_inspector",
  "Quality Manager": "quality_manager",
  "Finance / Cost Control": "finance",
  "Auditor / Read-only": "auditor",
};

// All module keys matching sidebar nav groups
export const ALL_MODULES = [
  "dashboard", "crm", "projects", "engineering", "production",
  "mrp", "procurement", "warehouse", "quality", "finance",
  "delivery", "reports", "settings",
];

export const ROLES: Record<RoleKey, RoleDefinition> = {
  director: {
    key: "director",
    label: "Owner / Director",
    shortLabel: "Director",
    description: "Akses penuh ke seluruh modul dan dashboard eksekutif",
    color: "#2563EB",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    icon: "crown",
    allowedModules: ALL_MODULES,
    dashboardType: "executive",
  },
  admin: {
    key: "admin",
    label: "System Admin",
    shortLabel: "Admin",
    description: "Akses penuh ke semua modul termasuk pengaturan sistem",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    icon: "shield",
    allowedModules: ALL_MODULES,
    dashboardType: "executive",
  },
  sales: {
    key: "sales",
    label: "Sales / CRM",
    shortLabel: "Sales",
    description: "Kelola pelanggan, prospek, penawaran & sales order",
    color: "#0891B2",
    bgColor: "#ECFEFF",
    borderColor: "#A5F3FC",
    icon: "trending-up",
    allowedModules: ["dashboard", "crm", "projects", "delivery", "reports"],
    dashboardType: "sales",
  },
  project_manager: {
    key: "project_manager",
    label: "Project Manager",
    shortLabel: "PM",
    description: "Kelola proyek, milestone, risiko, dan koordinasi lintas departemen",
    color: "#D97706",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    icon: "folder-kanban",
    allowedModules: ["dashboard", "crm", "projects", "engineering", "production", "mrp", "procurement", "warehouse", "quality", "finance", "delivery", "reports"],
    dashboardType: "project",
  },
  engineering: {
    key: "engineering",
    label: "Engineering",
    shortLabel: "Eng",
    description: "Kelola dokumen teknis, BOM, routing & work center",
    color: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    icon: "wrench",
    allowedModules: ["dashboard", "engineering", "production", "mrp", "quality", "reports"],
    dashboardType: "engineering",
  },
  production_planner: {
    key: "production_planner",
    label: "Production Planner",
    shortLabel: "Planner",
    description: "Perencanaan produksi, MRP, dan jadwal work order",
    color: "#EA580C",
    bgColor: "#FFF7ED",
    borderColor: "#FED7AA",
    icon: "calendar",
    allowedModules: ["dashboard", "engineering", "production", "mrp", "warehouse", "quality", "reports"],
    dashboardType: "production",
  },
  production_manager: {
    key: "production_manager",
    label: "Production Manager / Supervisor",
    shortLabel: "Prod. Mgr",
    description: "Supervisi produksi, work order, dan kontrol kualitas",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    icon: "factory",
    allowedModules: ["dashboard", "engineering", "production", "mrp", "warehouse", "quality", "delivery", "reports"],
    dashboardType: "production",
  },
  operator: {
    key: "operator",
    label: "Operator / Technician",
    shortLabel: "Operator",
    description: "Input hasil kerja, update status work order",
    color: "#6B7280",
    bgColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    icon: "cog",
    allowedModules: ["dashboard", "production", "quality"],
    dashboardType: "production",
  },
  procurement: {
    key: "procurement",
    label: "Procurement",
    shortLabel: "Proc",
    description: "Kelola vendor, purchase order, dan penerimaan barang",
    color: "#4F46E5",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    icon: "shopping-cart",
    allowedModules: ["dashboard", "mrp", "procurement", "warehouse", "reports"],
    dashboardType: "procurement",
  },
  warehouse: {
    key: "warehouse",
    label: "Warehouse",
    shortLabel: "Gudang",
    description: "Kelola inventori, transaksi stok, penerimaan & pengeluaran",
    color: "#92400E",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    icon: "boxes",
    allowedModules: ["dashboard", "warehouse", "procurement", "delivery", "reports"],
    dashboardType: "warehouse",
  },
  qc_inspector: {
    key: "qc_inspector",
    label: "QC Inspector",
    shortLabel: "QC Insp",
    description: "Lakukan inspeksi kualitas, NCR, dan rework tracking",
    color: "#16A34A",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    icon: "check-circle",
    allowedModules: ["dashboard", "quality", "production", "reports"],
    dashboardType: "quality",
  },
  quality_manager: {
    key: "quality_manager",
    label: "Quality Manager",
    shortLabel: "QC Mgr",
    description: "Supervisi seluruh proses kualitas dan sertifikasi",
    color: "#16A34A",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    icon: "award",
    allowedModules: ["dashboard", "quality", "production", "engineering", "reports"],
    dashboardType: "quality",
  },
  finance: {
    key: "finance",
    label: "Finance / Cost Control",
    shortLabel: "Finance",
    description: "Kelola costing, invoice, pembayaran, dan laporan keuangan",
    color: "#B45309",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    icon: "dollar-sign",
    allowedModules: ["dashboard", "finance", "procurement", "reports"],
    dashboardType: "finance",
  },
  auditor: {
    key: "auditor",
    label: "Auditor / Read-only",
    shortLabel: "Auditor",
    description: "Akses baca ke semua data untuk audit dan compliance",
    color: "#64748B",
    bgColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    icon: "file-search",
    allowedModules: ALL_MODULES,
    dashboardType: "readonly",
  },
};

// Sidebar nav module key mapping – maps nav label → module key
export const navLabelToModule: Record<string, string> = {
  "Dasbor": "dashboard",
  "CRM & Penjualan": "crm",
  "Proyek": "projects",
  "Engineering": "engineering",
  "Produksi": "production",
  "MRP": "mrp",
  "Pengadaan": "procurement",
  "Gudang": "warehouse",
  "Quality Control": "quality",
  "Keuangan": "finance",
  "Pengiriman": "delivery",
  "Laporan": "reports",
  "Pengaturan": "settings",
};

// Get allowed nav items for a role
export function getFilteredNav(roleKey: RoleKey) {
  const role = ROLES[roleKey];
  return role.allowedModules;
}

// Helper: check if a role can access a module
export function canAccess(roleKey: RoleKey, moduleKey: string): boolean {
  return ROLES[roleKey].allowedModules.includes(moduleKey);
}
