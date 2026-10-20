"use client";

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse p-1 select-none">
      {/* Top Loading Bar indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-slate-100">
        <div className="h-full w-full route-progress-bar animate-[routeLoadingProgress_1.2s_ease-in-out_infinite]" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#E2E8F0] rounded-lg" />
          <div className="h-4 w-72 bg-[#F1F5F9] rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-[#E2E8F0] rounded-full" />
          <div className="h-8 w-32 bg-[#E2E8F0] rounded-lg" />
        </div>
      </div>

      {/* KPI Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-[#E2E8F0] rounded" />
              <div className="h-8 w-8 bg-[#F1F5F9] rounded-lg" />
            </div>
            <div className="h-8 w-20 bg-[#CBD5E1] rounded" />
            <div className="h-3 w-36 bg-[#F1F5F9] rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton Grid */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-52 bg-[#E2E8F0] rounded" />
            <div className="h-4 w-28 bg-[#F1F5F9] rounded" />
          </div>
          <div className="h-48 w-full bg-[#F8FAFC] rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
              <span className="text-xs text-[#9CA3AF] font-medium">Memuat data Manggala MOS...</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 card p-6 space-y-4">
          <div className="h-4 w-36 bg-[#E2E8F0] rounded" />
          <div className="h-48 w-full bg-[#F8FAFC] rounded-xl flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB] animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
