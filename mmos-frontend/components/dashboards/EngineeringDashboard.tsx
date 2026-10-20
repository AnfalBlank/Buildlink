"use client";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { engineeringDocuments, products } from "@/lib/dummy-data";
import {
  Wrench, FileText, Package, ChevronRight,
  ArrowUpRight, Layers, CheckCircle2, Clock,
} from "lucide-react";
import Link from "next/link";

export function EngineeringDashboard() {
  const releasedDocs = engineeringDocuments.filter(d => d.status === "Released");
  const pendingDocs = engineeringDocuments.filter(d => d.status === "In Review" || d.status === "Draft");
  const totalProducts = products.length;
  const activeBOMs = products.filter(p => (p as any).bomItems?.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Dasbor Engineering</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Dokumen teknis, produk & BOM management</p>
        </div>
        <Link href="/engineering/documents"
          className="flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm">
          <FileText size={14} /> Dokumen Engineering
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Dokumen Dirilis" value={releasedDocs.length}
          subtitle={`${engineeringDocuments.length} total dokumen`}
          icon={CheckCircle2} color="green" />
        <KpiCard title="Pending Review" value={pendingDocs.length}
          subtitle="Dokumen menunggu approval"
          icon={Clock} color={pendingDocs.length > 0 ? "yellow" : "green"} />
        <KpiCard title="Total Produk" value={totalProducts}
          subtitle={`${activeBOMs} produk dengan BOM`}
          icon={Package} color="blue" />
        <KpiCard title="Routing Aktif" value={3}
          subtitle="Routing produksi terdefinisi"
          icon={Layers} color="purple" />
      </div>

      {/* Recent Documents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#111827]">Dokumen Terbaru</p>
          <Link href="/engineering/documents" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {engineeringDocuments.slice(0, 5).map(doc => {
            const statusColor = doc.status === "Released" ? "#16A34A" : doc.status === "Approved" ? "#2563EB" : "#D97706";
            return (
              <div key={doc.id} className="flex items-center gap-4 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[#111827] truncate">{doc.title}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <span className="font-mono text-[10px] bg-[#F1F5F9] px-1.5 py-0.5 rounded">{doc.code}</span>
                    <span className="text-[#D1D5DB]">·</span>
                    Rev {doc.revision}
                    <span className="text-[#D1D5DB]">·</span>
                    {doc.type}
                  </div>
                </div>
                <Link href="/engineering/documents" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white">
                  <ArrowUpRight size={14} className="text-[#2563EB]" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#111827]">Produk & BOM</p>
          <Link href="/engineering/products" className="flex items-center gap-1 text-[#2563EB] text-xs font-medium hover:underline">
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map(p => (
            <div key={p.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#111827] truncate">{p.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">{p.code}</span>
                <span className="text-[#D1D5DB]">·</span>
                <span>{p.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
