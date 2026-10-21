"use client";

import { useState, useRef } from "react";
import { 
  Camera, Upload, Eye, Trash2, X, ZoomIn, ZoomOut, CheckCircle2, 
  Sparkles, Image as ImageIcon, Calendar, User, Tag, HardDrive 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhotoEvidenceItem {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  timestamp: string;
  inspector?: string;
  category?: string;
  fileSize?: string;
}

export const EVIDENCE_PRESETS: Record<"qc" | "ncr" | "delivery" | "goods-receipt", PhotoEvidenceItem[]> = {
  qc: [
    {
      id: "preset-qc-weld-01",
      url: "/evidence/qc_weld_inspection.jpg",
      title: "Uji Dimensi & Visual Pengelasan (TIG Weld)",
      caption: "Pemeriksaan visual fillet weld dan verifikasi toleransi flange bevel ±0.02mm dengan jangka sorong digital.",
      timestamp: "2026-10-21 14:30 WIB",
      inspector: "Andi Saputra, A.Md. (QC)",
      category: "QC Dimension & NDT",
      fileSize: "981 KB",
    },
  ],
  ncr: [
    {
      id: "preset-ncr-defect-01",
      url: "/evidence/ncr_defect_sample.jpg",
      title: "Temuan Cacat Porositas Las & Peeling Coating",
      caption: "Temuan crack porositas pada sambungan balok baja struktural dan coating peel. Diberi penanda panah kuning & tag reject NCR #10245-A.",
      timestamp: "2026-10-21 15:10 WIB",
      inspector: "B. Davis (QA Specialist)",
      category: "Physical Defect Evidence",
      fileSize: "923 KB",
    },
  ],
  delivery: [
    {
      id: "preset-delivery-lashing-01",
      url: "/evidence/delivery_lashing.jpg",
      title: "Inspeksi Pemuatan Truk & Pengikatan Lashing",
      caption: "Balok struktur baja terikat kencang dengan heavy-duty ratchet straps oranye, bantalan sudut pelindung terpasang pada flatbed trailer.",
      timestamp: "2026-10-21 16:00 WIB",
      inspector: "Supri Santoso (Logistik)",
      category: "Pre-dispatch Lashing",
      fileSize: "1.03 MB",
    },
  ],
  "goods-receipt": [
    {
      id: "preset-gr-receiving-01",
      url: "/evidence/goods_receipt_inspection.jpg",
      title: "Penerimaan Material Pipa & Barcode Label",
      caption: "Verifikasi ketebalan dinding pipa SCH40 dengan caliper digital, label barcode penerimaan gudang terpasang rapi.",
      timestamp: "2026-10-21 11:45 WIB",
      inspector: "Gudang Andi",
      category: "Inbound Verification",
      fileSize: "1.02 MB",
    },
  ],
};

interface PhotoEvidenceUploadProps {
  photos: PhotoEvidenceItem[];
  onChange?: (photos: PhotoEvidenceItem[]) => void;
  readOnly?: boolean;
  maxPhotos?: number;
  presetType?: "qc" | "ncr" | "delivery" | "goods-receipt";
  title?: string;
  description?: string;
  allowCamera?: boolean;
  defaultInspector?: string;
}

export function PhotoEvidenceUpload({
  photos = [],
  onChange,
  readOnly = false,
  maxPhotos = 6,
  presetType = "qc",
  title = "Bukti Foto Pemeriksaan Fisik",
  description = "Unggah dokumentasi foto lapangan sebagai bukti verifikasi mutu dan checklist operasional.",
  allowCamera = true,
  defaultInspector = "QC Inspector Lapangan",
}: PhotoEvidenceUploadProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvidenceItem | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || !onChange) return;
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        const sizeKb = Math.round(file.size / 1024);
        const fileSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

        const newPhoto: PhotoEvidenceItem = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url,
          title: file.name.replace(/\.[^/.]+$/, ""),
          caption: "Foto dokumentasi langsung lapangan",
          timestamp: new Date().toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB",
          inspector: defaultInspector,
          fileSize,
          category: "Dokumentasi Lapangan",
        };

        onChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    onChange(photos.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    if (!onChange) return;
    onChange(
      photos.map(p => (p.id === id ? { ...p, caption: newCaption } : p))
    );
  };

  const handleLoadPreset = () => {
    if (!onChange) return;
    const presets = EVIDENCE_PRESETS[presetType] || [];
    if (presets.length === 0) return;

    // Check if preset is already in photos
    const exists = photos.some(p => p.url === presets[0].url);
    if (exists) {
      // Just duplicate with new ID for testing multiple photos
      const dup: PhotoEvidenceItem = {
        ...presets[0],
        id: `photo-preset-${Date.now()}`,
        timestamp: new Date().toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
      };
      onChange([...photos, dup]);
    } else {
      onChange([...photos, presets[0]]);
    }
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-accent" />
            <h4 className="text-xs sm:text-sm font-bold text-text-primary">{title}</h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary">
              {photos.length} / {maxPhotos} Foto
            </span>
          </div>
          {description && (
            <p className="text-[11px] text-text-secondary mt-0.5">{description}</p>
          )}
        </div>

        {/* Action Buttons for Upload / Camera / Demo Preset */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Quick Demo Preset Button */}
            <button
              type="button"
              onClick={handleLoadPreset}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Gunakan contoh foto inspeksi nyata pabrik"
            >
              <Sparkles size={13} />
              <span>Contoh Foto Bukti</span>
            </button>

            {/* Direct Camera Button (Mobile Optimized) */}
            {allowCamera && (
              <>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="Ambil foto langsung kamera handphone"
                >
                  <Camera size={13} />
                  <span>Kamera HP</span>
                </button>
              </>
            )}

            {/* Upload File Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-surface-2 border border-border text-text-primary hover:border-accent hover:text-accent transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Unggah berkas foto dari penyimpanan"
            >
              <Upload size={13} />
              <span>Unggah</span>
            </button>
          </div>
        )}
      </div>

      {/* Photo Gallery Grid */}
      {photos.length === 0 ? (
        <div 
          onClick={() => !readOnly && fileInputRef.current?.click()}
          className={cn(
            "p-6 rounded-xl border-2 border-dashed border-border/80 bg-surface/50 text-center transition-all",
            !readOnly && "cursor-pointer hover:border-accent/60 hover:bg-surface-2/40"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-2 text-accent">
            <ImageIcon size={22} />
          </div>
          <p className="text-xs font-semibold text-text-primary">Belum ada foto bukti yang dilampirkan</p>
          <p className="text-[11px] text-text-secondary mt-0.5 max-w-sm mx-auto">
            {!readOnly 
              ? "Klik untuk memilih berkas foto, gunakan tombol 'Kamera HP' di smartphone, atau klik 'Contoh Foto Bukti'."
              : "Tidak ada dokumentasi visual yang disertakan pada catatan ini."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative bg-surface-2 border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={() => {
                  setSelectedPhoto(photo);
                  setIsZoomed(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title || `Bukti foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover overlay with zoom hint */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black/60 text-white text-xs flex items-center gap-1 backdrop-blur-xs">
                    <ZoomIn size={14} /> Perbesar
                  </span>
                </div>

                {/* Category badge */}
                {photo.category && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                    {photo.category}
                  </span>
                )}

                {/* Delete button (if editable) */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleRemovePhoto(photo.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer z-10"
                    title="Hapus foto ini"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Photo Meta & Caption */}
              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5 text-xs">
                <div>
                  <p className="font-semibold text-text-primary text-xs line-clamp-1" title={photo.title}>
                    {photo.title || `Foto Bukti #${index + 1}`}
                  </p>

                  {!readOnly ? (
                    <input
                      type="text"
                      className="w-full mt-1 px-2 py-1 text-[11px] rounded bg-surface border border-border text-text-primary focus:outline-none focus:border-accent"
                      placeholder="Tambah keterangan foto..."
                      value={photo.caption || ""}
                      onChange={e => handleUpdateCaption(photo.id, e.target.value)}
                    />
                  ) : (
                    <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed" title={photo.caption}>
                      {photo.caption || "Tanpa keterangan"}
                    </p>
                  )}
                </div>

                <div className="pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px] text-text-secondary">
                  <span className="truncate max-w-[120px]" title={photo.inspector}>
                    {photo.inspector || "Inspector"}
                  </span>
                  <span className="font-mono shrink-0">{photo.timestamp.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Camera size={16} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-text-primary truncate">
                    {selectedPhoto.title || "Detail Bukti Foto Pemeriksaan"}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                    {selectedPhoto.category && (
                      <span className="flex items-center gap-1">
                        <Tag size={11} /> {selectedPhoto.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={11} /> {selectedPhoto.timestamp}
                    </span>
                    {selectedPhoto.fileSize && (
                      <span className="flex items-center gap-1 font-mono">
                        <HardDrive size={11} /> {selectedPhoto.fileSize}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isZoomed ? "Ukuran Pas" : "Perbesar 100%"}
                >
                  {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
                  <span className="hidden sm:inline">{isZoomed ? "Fit" : "Zoom"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Image Stage */}
            <div className={cn(
              "relative bg-slate-950 flex items-center justify-center overflow-auto p-2 sm:p-4 min-h-[300px] max-h-[68vh]",
              isZoomed && "cursor-grab"
            )}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || "High resolution inspection preview"}
                className={cn(
                  "rounded-lg object-contain transition-all duration-200 select-none",
                  isZoomed ? "max-w-none w-[150%] sm:w-[180%]" : "max-w-full max-h-[60vh]"
                )}
              />
            </div>

            {/* Lightbox Footer Details */}
            <div className="p-3 sm:p-4 bg-surface-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Keterangan / Temuan Inspeksi:</p>
                <p className="text-text-primary text-xs sm:text-sm font-medium leading-relaxed">
                  {selectedPhoto.caption || "Tidak ada keterangan khusus."}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <div className="px-3 py-1.5 rounded-lg bg-surface border border-border text-right">
                  <p className="text-[10px] text-text-secondary">Diverifikasi Oleh:</p>
                  <p className="text-xs font-bold text-text-primary">{selectedPhoto.inspector || "Inspector Lapangan"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="btn-secondary !py-2 !px-4 text-xs cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
