"use client";
import { useState } from "react";
import { customers as initialData } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Pencil, Trash2, Search, Building2, Phone, Mail, MapPin,
  Eye, Check, Users, ShieldCheck
} from "lucide-react";

type Customer = typeof initialData[0];

export default function CustomersPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add" | "edit" | "view"; item?: Customer } | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "primary" | "danger" | "warning";
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const filtered = data.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ status: "Active" });
    setModal({ type: "add" });
  };

  const openEdit = (item: Customer) => {
    setForm({ ...item });
    setModal({ type: "edit", item });
  };

  const openView = (item: Customer) => setModal({ type: "view", item });

  const executeSave = () => {
    if (modal?.type === "add") {
      const newItem: Customer = {
        id: `C${String(data.length + 1).padStart(3, "0")}`,
        code: `CUST-${String(data.length + 1).padStart(3, "0")}`,
        name: form.name ?? "",
        contact: form.contact ?? "",
        email: form.email ?? "",
        phone: form.phone ?? "",
        city: form.city ?? "",
        status: form.status ?? "Active",
        totalOrders: 0,
        totalValue: 0,
      };
      setData([newItem, ...data]);
      toast.success("Pelanggan Berhasil Ditambahkan", `Klien "${newItem.name}" telah terdaftar di sistem.`);
    } else if (modal?.type === "edit" && modal.item) {
      setData(data.map(c => c.id === modal.item!.id ? ({ ...c, ...form } as Customer) : c));
      toast.info("Perubahan Disimpan", `Data pelanggan "${form.name || modal.item.name}" berhasil diperbarui.`);
    }
    setConfirmState(null);
    setModal(null);
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Nama Perusahaan Wajib Diisi", "Silakan masukkan nama perusahaan pelanggan.");
      return;
    }

    setConfirmState({
      open: true,
      title: modal?.type === "add" ? "Konfirmasi Tambah Pelanggan" : "Konfirmasi Simpan Perubahan",
      message: modal?.type === "add"
        ? `Apakah Anda yakin ingin menambahkan pelanggan "${form.name}"?`
        : `Apakah Anda yakin ingin menyimpan perubahan data untuk "${form.name}"?`,
      variant: "primary",
      confirmText: "Ya, Simpan",
      onConfirm: executeSave,
    });
  };

  const handleRequestDelete = (c: Customer) => {
    setConfirmState({
      open: true,
      title: "Konfirmasi Hapus Pelanggan",
      message: `Apakah Anda yakin ingin menghapus pelanggan "${c.name}" (${c.code})?`,
      variant: "danger",
      confirmText: "Ya, Hapus Data",
      onConfirm: () => {
        setData(prev => prev.filter(x => x.id !== c.id));
        setConfirmState(null);
        toast.warning("Pelanggan Dihapus", `Data "${c.name}" telah dihapus dari sistem.`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelanggan (CRM)"
        subtitle="Master data klien, riwayat kontrak, dan kontak penanggung jawab"
        actions={
          <button className="btn-primary flex items-center gap-2 cursor-pointer shadow-sm" onClick={openAdd}>
            <Plus size={16} />
            <span>Tambah Pelanggan</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Pelanggan", value: data.length, color: "text-[#2563EB]" },
          { label: "Pelanggan Aktif", value: data.filter(c => c.status === "Active").length, color: "text-[#16A34A]" },
          { label: "Total Nilai Kontrak", value: formatCurrency(data.reduce((s, c) => s + c.totalValue, 0)), color: "text-[#2563EB]" },
        ].map(s => (
          <div key={s.label} className="card p-5 hover:border-[#CBD5E1] transition-all">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-2xl sm:text-3xl tracking-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              className="input pl-10 text-xs sm:text-sm"
              placeholder="Cari perusahaan, kontak, atau kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-[#64748B] font-medium ml-auto">
            Menampilkan <strong className="text-[#0F172A]">{filtered.length}</strong> pelanggan
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table min-w-[980px]">
            <thead>
              <tr>
                <th className="w-28">Kode</th>
                <th>Nama Perusahaan</th>
                <th>Kontak PIC</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Kota</th>
                <th>Total Order</th>
                <th>Total Nilai</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map(c => (
                <tr key={c.id} className="table-row-hover group">
                  <td className="py-3.5 px-4 font-mono text-[#2563EB] font-bold text-xs">{c.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">{c.name}</td>
                  <td className="py-3.5 px-4 text-[#475569] text-xs">{c.contact}</td>
                  <td className="py-3.5 px-4 text-[#64748B] text-xs">{c.email}</td>
                  <td className="py-3.5 px-4 text-[#64748B] text-xs font-mono">{c.phone}</td>
                  <td className="py-3.5 px-4 text-[#475569] text-xs">{c.city}</td>
                  <td className="py-3.5 px-4 font-mono text-[#475569] font-medium text-xs">{c.totalOrders}</td>
                  <td className="py-3.5 px-4 font-mono text-[#0F172A] font-semibold text-xs whitespace-nowrap">
                    {formatCurrency(c.totalValue)}
                  </td>
                  <td className="py-3.5 px-4"><StatusBadge status={c.status} /></td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                        title="Lihat Detail"
                        onClick={() => openView(c)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                        title="Edit Pelanggan"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FECACA] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                        title="Hapus Pelanggan"
                        onClick={() => handleRequestDelete(c)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {modal?.type === "view" && modal.item && (
        <Modal open title={`Detail Pelanggan — ${modal.item.code}`} onClose={() => setModal(null)} size="md">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">{modal.item.code}</span>
              <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">{modal.item.name}</h3>
              <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#94A3B8]" />
                <span>{modal.item.city}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { icon: Users, label: "Kontak PIC", val: modal.item.contact },
                { icon: Mail, label: "Email", val: modal.item.email },
                { icon: Phone, label: "Nomor Telepon", val: modal.item.phone },
                { icon: ShieldCheck, label: "Status Klien", val: modal.item.status },
              ].map(f => (
                <div key={f.label} className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-2xs">
                  <p className="text-[#64748B] text-[11px] font-medium flex items-center gap-1 mb-1">
                    <f.icon size={12} className="text-[#94A3B8]" />
                    <span>{f.label}</span>
                  </p>
                  <p className="text-[#0F172A] font-medium text-xs">{f.val}</p>
                </div>
              ))}
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3">
                <p className="text-[#64748B] text-[11px] font-medium mb-1">Total Pesanan</p>
                <p className="text-[#2563EB] font-mono font-bold text-xl">{modal.item.totalOrders}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3">
                <p className="text-[#64748B] text-[11px] font-medium mb-1">Total Nilai Kontrak</p>
                <p className="text-[#16A34A] font-mono font-bold text-lg">{formatCurrency(modal.item.totalValue)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button className="btn-secondary !rounded-xl cursor-pointer" onClick={() => setModal(null)}>Tutup</button>
              <button className="btn-primary !rounded-xl cursor-pointer flex items-center gap-1.5" onClick={() => openEdit(modal.item!)}>
                <Pencil size={14} />
                <span>Edit Pelanggan</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Form Modal with Enhanced UX */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          open
          title={modal.type === "add" ? "Tambah Pelanggan Baru" : `Edit Pelanggan — ${modal.item?.code}`}
          onClose={() => setModal(null)}
          size="md"
        >
          <form onSubmit={handleRequestSave} className="space-y-4">
            <div>
              <label className="form-label">
                Nama Perusahaan <span className="text-[#DC2626]">*</span>
              </label>
              <input
                required
                className="input font-medium"
                placeholder="Contoh: PT Pertamina Trans Kontinental"
                value={form.name ?? ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nama Kontak (PIC)</label>
                <input
                  className="input"
                  placeholder="Contoh: Budi Santoso"
                  value={form.contact ?? ""}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Kota / Lokasi</label>
                <input
                  className="input"
                  placeholder="Contoh: Jakarta / Balikpapan"
                  value={form.city ?? ""}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Email Perusahaan</label>
                <input
                  type="email"
                  className="input"
                  placeholder="kontak@perusahaan.co.id"
                  value={form.email ?? ""}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Nomor Telepon</label>
                <input
                  className="input font-mono"
                  placeholder="021-xxxxxxx / 081xxxx"
                  value={form.phone ?? ""}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Status Pelanggan</label>
              <select
                className="select font-medium"
                value={form.status ?? "Active"}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active (Aktif)</option>
                <option value="Inactive">Inactive (Non-aktif)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                className="btn-secondary !rounded-xl cursor-pointer"
                onClick={() => setModal(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary !rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Check size={16} />
                <span>{modal.type === "add" ? "Simpan Pelanggan" : "Perbarui Pelanggan"}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          confirmText={confirmState.confirmText}
          cancelText="Batal"
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
