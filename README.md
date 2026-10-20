# BuildLink MMOS — Manggala Manufacturing Operations System

Sistem ERP & Operasional Manufaktur Terintegrasi untuk Industri Manufaktur Presisi, Rekayasa Alat Berat, Fabrikasi Tangki & Struktur Baja.

> **Powered by PT. Manggala Utama Indonesia — Solusi Sistem Terintegrasi 2026**

---

## 🚀 Fitur Utama Sistem

### 1. 📊 Executive Dashboard & Real-Time Monitoring
- Ringkasan KPI performa operasional: Proyek Berjalan, Nilai Kontrak Komersial, Overall Equipment Effectiveness (OEE), Work Orders, dan Defisit Material.
- Jam digital real-time dengan hari, tanggal, bulan, tahun, dan waktu WIB.
- Fitur **Internal Team Chat** lintas divisi (Project Management, Produksi, Engineering, QC, Pengadaan, Cost Control).

### 2. 📂 Project Management & Tracking
- Manajemen proyek terintegrasi: *Tracker, Milestones, Analisis Risiko & Isu*.
- Dialog konfirmasi aksi CRUD (*ConfirmDialog*) dan notifikasi toast global.

### 3. 💼 CRM & Komersial
- **Customers**: Manajemen data pelanggan dan prospek.
- **Quotations**: Surat penawaran harga resmi, multi-revisi, cetak PDF resmi berstandar kop surat perusahaan.
- **Sales Orders**: Konfirmasi kontrak pesanan, termin pembayaran, target serah terima, dan cetak SO resmi.

### 4. ⚙️ Engineering & BOM (Bill of Materials)
- Master Data Produk & Material dengan kalkulasi **Estimasi HPP / RAB**.
- Breakdown HPP: *Biaya Material (BOM), Tenaga Kerja (Labor), Overhead & QC*, serta proyeksi margin keuntungan (%).
- Struktur BOM bertingkat dengan harga satuan estimasi dan subtotal per komponen.
- Lembar cetak / ekspor PDF resmi Dokumen RAB & Struktur BOM.

### 5. 📦 Material Requirements Planning (MRP)
- Kalkulasi Gross-to-Net terotomatisasi berdasarkan SPK, stok gudang, dan lead time pengadaan.
- Deteksi defisit stok (*Shortage Alert*) dengan 1-click generator Purchase Request (PR).
- Eksekusi kalkulasi ulang MRP dengan simulasi algoritma sinkronisasi.

### 6. 🏭 Produksi & Shop Floor
- **Production Orders (SPK)**: Surat Perintah Kerja fabrikasi dengan rincian stempel pengesahan dan cetak SPK resmi.
- **Work Orders**: Monitoring operasi mesin, routing fabrikasi, dan status pengerjaan.

### 7. 🛒 Pengadaan (Procurement)
- **Purchase Orders (PO)**: Penerbitan dan persetujuan PO dengan cetak PO resmi bertanda tangan.
- **Goods Receipt (GRN)**: Penerimaan barang dan verifikasi kualitas kedatangan material.

### 8. 🏬 Saldo & Inventaris Gudang (Warehouse)
- Manajemen stok fisik (*Available, Reserved untuk SPK, Quality Hold, Total Fisik*).
- Form penyesuaian stok (*Stock Adjustment / Opname*) dengan dialog konfirmasi sebelum eksekusi.
- Cetak Laporan Saldo Inventaris Gudang resmi.

### 9. 🛡️ Quality Control (QC & QA)
- Pemeriksaan dimensi toleransi presisi, pengujian visual NDT, dan pengesahan hasil (*Pass / Fail / Conditional*).
- Otomasi pembukaan tiket NCR (Non-Conformance Report) jika terjadi deviasi / *Fail*.
- Cetak Sertifikat Hasil Uji Mutu (*Certificate of Inspection*).

### 10. 🚚 Pengiriman & Logistik (Delivery)
- Surat Jalan Pengiriman (Delivery Order) resmi dengan verifikasi checklist kelengkapan barang dan tanda tangan basah.

### 11. 💰 Keuangan & Faktur (Finance & Invoicing)
- Faktur Tagihan Penjualan (Invoices) resmi dengan kop surat, rincian rekening bank, PPN 11%, dan verifikasi pelunasan.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Animations**: CSS Keyframe Transitions & Micro-Interactions
- **Automated Verification**: Playwright CLI

---

## 🏃‍♂️ Cara Menjalankan Secara Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/AnfalBlank/Buildlink.git
   cd Buildlink/mmos-frontend
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```

4. **Buka di peramban**:
   Akses `http://localhost:3000`

---

## 📄 Lisensi & Hak Cipta

Hak Cipta © 2026 PT. Manggala Utama Indonesia. Seluruh hak cipta dilindungi undang-undang.
