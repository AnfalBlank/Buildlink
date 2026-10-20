import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Project
    Draft:               "text-[#4B5563] bg-[#F1F5F9] border-[#E2E8F0]",
    Quotation:           "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    "Awaiting Order":    "text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]",
    Active:              "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    "On Hold":           "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    "Ready for Delivery":"text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    Delivered:           "text-[#0891B2] bg-[#ECFEFF] border-[#A5F3FC]",
    Completed:           "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    Closed:              "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]",
    Cancelled:           "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    // Production
    Planned:             "text-[#0891B2] bg-[#ECFEFF] border-[#A5F3FC]",
    Released:            "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    "In Progress":       "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    "Material Check":    "text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]",
    "QC / Rework":       "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
    Paused:              "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    "Submitted for QC":  "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    Accepted:            "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    Rework:              "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
    Ready:               "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    // Documents
    "In Review":         "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    Approved:            "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    Obsolete:            "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]",
    // QC
    Pass:                "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    Fail:                "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    Pending:             "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    "Conditional Approval": "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
    // Inventory
    Available:           "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    Reserved:            "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    "Quality Hold":      "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
    Rejected:            "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    Issued:              "text-[#0891B2] bg-[#ECFEFF] border-[#A5F3FC]",
    Returned:            "text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]",
    // PO
    Sent:                "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    "Partially Received":"text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
    Received:            "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    // Invoice
    Unpaid:              "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    Paid:                "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    "Partially Paid":    "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    Overdue:             "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    // NCR
    Open:                "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    Resolved:            "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    // Tasks
    "Selesai":           "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    "Berjalan":          "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
    "Tertahan":          "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
    "Terlambat":         "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
    "Belum Mulai":       "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]",
  };
  return map[status] ?? "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]";
}
