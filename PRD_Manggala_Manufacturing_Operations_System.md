# PRD Final --- Manggala Manufacturing Operations System (MMOS)

**Versi:** 1.0\
**Tanggal:** Oktober 2026\
**Pemilik Produk:** PT Manggala Utama Indonesia\
**Status:** Draft final untuk validasi proses bisnis sebelum development

------------------------------------------------------------------------

## 1. Ringkasan Produk

Manggala Manufacturing Operations System (MMOS) adalah sistem internal
untuk mengintegrasikan proses komersial, proyek, engineering,
perencanaan material, produksi, quality control, pengadaan, gudang,
pengiriman, dan pengendalian biaya dalam satu alur yang dapat
ditelusuri.

Sistem dirancang untuk mendukung dua model manufaktur:

1.  **Fabrication** --- pembuatan produk dari material mentah, misalnya
    tangki.
2.  **Assembly** --- perakitan beberapa komponen menjadi produk akhir,
    misalnya truk tangki.

MMOS harus mendukung pesanan standar maupun pesanan custom. Data produk,
BOM, routing, kebutuhan material, serta dokumen engineering harus
memiliki versi yang jelas agar perubahan spesifikasi tidak mengacaukan
pekerjaan yang sedang berjalan.

### 1.1 Tujuan bisnis

-   Menyatukan status proyek dan produksi dalam satu sistem.
-   Mengetahui kemajuan aktual setiap proyek, unit, dan work order.
-   Menghitung kebutuhan material dan mengidentifikasi kekurangan
    sebelum pekerjaan dimulai.
-   Melacak material dari pengadaan hingga pemakaian.
-   Mengendalikan revisi desain, BOM, dan instruksi kerja.
-   Mencatat hasil QC, ketidaksesuaian, serta pekerjaan ulang.
-   Membandingkan anggaran dengan komitmen dan biaya aktual.
-   Menghasilkan laporan manajemen yang konsisten dan dapat diaudit.

### 1.2 Prinsip desain

-   Satu sumber data untuk setiap entitas utama.
-   Proyek dan produksi mempunyai status serta persentase progres yang
    berbeda.
-   Transaksi stok dan biaya harus memiliki jejak audit.
-   Dokumen yang sudah dirilis tidak boleh diubah diam-diam; perubahan
    dibuat sebagai revisi.
-   Pekerjaan yang membutuhkan QC tidak boleh dianggap selesai sebelum
    lolos pemeriksaan.
-   Otomatisasi harus bertumpu pada data master dan proses yang sudah
    disepakati.

------------------------------------------------------------------------

## 2. Ruang Lingkup

### 2.1 Termasuk dalam sistem

1.  CRM, pelanggan, prospek, quotation, dan pesanan pelanggan.
2.  Project management dan milestone.
3.  Engineering document control dan revisi produk.
4.  Product master, BOM, routing, dan work center.
5.  Production planning, production order, dan work order.
6.  Material planning / MRP.
7.  Procurement, purchase order, penerimaan, dan vendor.
8.  Warehouse, reservasi, issue, return, dan transfer material.
9.  Fabrication dan assembly tracking.
10. QC, NCR, rework, serta final inspection.
11. Traceability material, komponen, unit, dan dokumen.
12. Project costing, production costing, dan margin.
13. Pengiriman, delivery document, invoice, dan pencatatan pembayaran.
14. Dashboard, laporan, notifikasi, approval, RBAC, dan audit log.

### 2.2 Di luar MVP

-   Integrasi penuh dengan mesin/CNC/PLC atau IoT shop-floor.
-   Payroll dan HRIS.
-   Akuntansi umum lengkap, pajak, dan e-Faktur.
-   Supplier/customer portal eksternal.
-   Mobile app native; tahap awal menggunakan web responsif.
-   AI untuk optimasi jadwal atau prediksi defect.
-   Integrasi WhatsApp otomatis untuk impor PO; dapat menjadi fase
    lanjutan.
-   Multi-company atau multi-currency kompleks kecuali dibutuhkan pada
    discovery.

------------------------------------------------------------------------

## 3. Pengguna dan Hak Akses

  -----------------------------------------------------------------------
  Peran                               Tanggung jawab utama
  ----------------------------------- -----------------------------------
  Owner / Director                    Melihat performa perusahaan,
                                      margin, proyek, dan approval
                                      strategis

  System Admin                        Mengelola konfigurasi, pengguna,
                                      role, master data, dan audit teknis

  Sales / CRM                         Mengelola prospek, pelanggan,
                                      quotation, dan order

  Project Manager                     Mengelola milestone, jadwal,
                                      risiko, progres, dan koordinasi
                                      proyek

  Engineering                         Mengelola spesifikasi, gambar,
                                      revisi, BOM, dan routing

  Production Planner                  Menyusun jadwal, production order,
                                      work order, dan kebutuhan material

  Production Manager / Supervisor     Mengelola pelaksanaan produksi dan
                                      alokasi pekerjaan

  Operator / Technician               Melaporkan pekerjaan, waktu,
                                      kuantitas, pemakaian material, dan
                                      kendala

  Procurement                         Mengelola RFQ bila diperlukan, PO
                                      vendor, serta jadwal kedatangan

  Warehouse                           Mencatat penerimaan, lokasi,
                                      reservasi, issue, return, dan
                                      transfer stok

  QC Inspector                        Melakukan inspeksi dan mencatat
                                      hasil pemeriksaan

  Quality Manager                     Meninjau NCR, disposition, rework,
                                      dan keputusan kualitas

  Finance / Cost Control              Mengelola anggaran, biaya, invoice,
                                      pembayaran, dan margin

  Auditor / Read-only                 Mengakses data dan riwayat tanpa
                                      hak mengubah transaksi
  -----------------------------------------------------------------------

**Ketentuan akses:** - Terapkan role-based access control (RBAC) dan
pembatasan lingkup data sesuai kebutuhan. - Pisahkan hak membuat,
menyetujui, dan membukukan transaksi penting. - Approval pembelian,
perubahan engineering, dan penyesuaian stok harus mengikuti batas
otorisasi. - Semua perubahan penting menyimpan aktor, waktu, nilai
sebelum/sesudah, alasan, dan referensi transaksi.

------------------------------------------------------------------------

## 4. Alur Bisnis End-to-End

1.  Sales membuat prospek dan data pelanggan.
2.  Sales menyiapkan quotation berdasarkan kebutuhan pelanggan.
3.  Engineering/PM mengklarifikasi spesifikasi, konfigurasi, dan ruang
    lingkup.
4.  Setelah quotation disetujui dan order diterima, sistem membuat
    project.
5.  PM menetapkan milestone, jadwal, anggaran, PIC, dan target delivery.
6.  Engineering merilis spesifikasi, gambar, BOM, dan routing dengan
    versi tertentu.
7.  Production Planner membuat production order untuk jumlah unit yang
    dipesan.
8.  Sistem menghitung kebutuhan material melalui MRP.
9.  Material yang tersedia direservasi; kekurangan diproses melalui
    pembelian.
10. Gudang menerima barang, memeriksa dokumen, kuantitas, dan status QC
    penerimaan.
11. Supervisor merilis work order jika prasyarat material dan dokumen
    terpenuhi atau pengecualian sudah disetujui.
12. Operator mengerjakan operasi fabrication/assembly dan melaporkan
    hasil.
13. QC memeriksa operasi yang diwajibkan; hasil gagal membuka NCR atau
    proses rework.
14. Setelah semua operasi dan final inspection lolos, unit dapat
    dinyatakan siap dikirim.
15. Delivery dicatat dengan dokumen pengiriman dan unit/serial yang
    dikirim.
16. Finance menerbitkan invoice sesuai termin kontrak serta mencatat
    pembayaran.
17. Sistem menghitung biaya aktual, estimasi biaya akhir, dan margin
    proyek.
18. PM/Owner meninjau laporan, deviasi, serta penutupan proyek.

### 4.1 Status proyek yang disarankan

`Draft → Quotation → Awaiting Order → Active → On Hold → Ready for Delivery → Delivered → Completed → Closed`

Status pembatalan dapat disediakan sebagai status terminal terpisah.
Perpindahan status harus memvalidasi prasyarat dan hak akses.

### 4.2 Status production order

`Draft → Planned → Material Check → Released → In Progress → QC / Rework → Completed → Closed`

Status material check dapat mengizinkan rilis parsial hanya jika aturan
perusahaan mengizinkannya dan risiko telah disetujui.

### 4.3 Status work order

`Draft → Ready → In Progress → Paused → Submitted for QC → Accepted / Rework → Completed`

Status harus dapat membedakan pekerjaan yang menunggu material, dokumen,
mesin, tenaga kerja, atau keputusan QC.

------------------------------------------------------------------------

## 5. Modul dan Persyaratan Fungsional

### 5.1 CRM dan Sales

**Fitur** - Kelola prospek, pelanggan, kontak, alamat, dan riwayat
komunikasi. - Buat quotation dengan item, kuantitas, harga, pajak/biaya
bila relevan, masa berlaku, serta termin pembayaran. - Simpan revisi
quotation dan alasan perubahan. - Konversi quotation yang disetujui
menjadi sales order/project tanpa mengetik ulang data. - Lampirkan
dokumen pelanggan dan spesifikasi awal.

**Kriteria penerimaan** - Quotation memiliki nomor unik dan riwayat
revisi. - Quotation yang telah disetujui tidak dapat diubah tanpa revisi
baru. - Sales order menyimpan referensi quotation dan kontrak/PO
pelanggan. - Nilai kontrak menjadi baseline komersial proyek setelah
disetujui.

### 5.2 Project Management

**Fitur** - Project code, nama, pelanggan, PM, tanggal mulai, target
selesai, nilai kontrak, anggaran, dan prioritas. - Milestone,
dependensi, PIC, target date, actual date, status, dan catatan. -
Risk/issue log serta keputusan yang memengaruhi jadwal atau biaya. -
Baseline jadwal dan baseline anggaran dengan mekanisme revisi. -
Lampiran kontrak, notulen, dokumen pengiriman, dan dokumen proyek.

**Kriteria penerimaan** - Setiap project memiliki pemilik dan jadwal
target. - Perubahan baseline menyimpan alasan, pemberi persetujuan, dan
waktu. - Status terlambat dihitung dari tanggal target yang belum
terpenuhi. - Progress proyek tidak disamakan dengan persentase
pengeluaran biaya.

### 5.3 Engineering dan Document Control

**Fitur** - Dokumen spesifikasi, drawing, layout, datasheet, instruksi
kerja, dan dokumen vendor. - Nomor dokumen, revisi, tanggal berlaku,
status, pemilik, serta persetujuan. - Status dokumen: `Draft`,
`In Review`, `Approved`, `Released`, `Obsolete`. - BOM dan routing
mengacu ke revisi produk/dokumen yang dirilis. - Dokumen released tidak
boleh ditimpa; perubahan menghasilkan revisi baru. - Daftar unit/order
yang terdampak jika revisi engineering berubah.

**Kriteria penerimaan** - Work order selalu merekam versi BOM, routing,
dan instruksi kerja yang digunakan. - Revisi baru tidak mengubah riwayat
produksi yang telah dilakukan. - Revisi yang memengaruhi produksi
berjalan memerlukan keputusan dampak dan approval.

### 5.4 Product Master, BOM, dan Routing

**Product master** - Kode produk, nama, tipe (`Standard`, `Configured`,
`Custom`), kategori, satuan, status, dan revisi. - Dapat mendukung
produk akhir, subassembly, komponen, bahan baku, consumable, dan
jasa/subkontrak.

**Bill of Materials (BOM)** - Parent product, komponen, kuantitas, UOM,
scrap allowance, tanggal berlaku, revisi, dan catatan. - Mendukung BOM
bertingkat untuk assembly. - Mendukung komponen alternatif jika
kebijakan perusahaan mengizinkan. - BOM yang telah dipakai pada
production order harus memiliki snapshot/referensi versi yang tidak
berubah.

**Routing** - Urutan operasi, work center, estimasi setup/run time,
kebutuhan skill, instruksi kerja, dan kebutuhan QC. - Contoh operasi:
cutting, rolling, welding, machining, surface treatment, painting,
assembly, wiring, inspection, testing. - Routing dapat berbeda untuk
produk custom berdasarkan revisi yang disetujui.

**Kriteria penerimaan** - Sistem dapat menghitung kebutuhan komponen
dari BOM bertingkat. - Tidak boleh merilis BOM yang mengandung siklus
referensi. - Perubahan BOM/routing yang sudah dirilis harus membuat
revisi baru.

### 5.5 Production Planning dan Work Order

**Fitur** - Production order terhubung ke project/sales order. - Jumlah
unit, tanggal target, prioritas, product revision, BOM revision, dan
routing revision. - Nomor seri/unit untuk produk yang perlu
ditelusuri. - Generate work order per operasi atau kelompok operasi. -
Assign work center, supervisor, operator, dan target tanggal. - Catat
kuantitas baik, reject, rework, jam aktual, downtime, catatan, dan
lampiran foto. - Pause/resume dengan alasan. - Blocker tracking:
material, engineering, mesin, tenaga kerja, atau QC.

**Kriteria penerimaan** - Satu production order dapat menghasilkan
beberapa unit/serial. - Setiap unit dapat dilacak ke operasi yang telah
dan belum selesai. - Work order yang memerlukan QC tidak selesai sebelum
QC pass. - Supervisor dapat melihat pekerjaan terlambat dan blocker
aktif.

### 5.6 Material Requirements Planning (MRP)

**Fitur** - Menghitung kebutuhan material dari demand production order
dan BOM. - Memperhitungkan stok usable, stok teralokasi, safety stock,
scheduled receipts, PO terbuka, lead time, scrap allowance, dan material
yang sedang quality hold. - Menampilkan kekurangan material per proyek,
produk, dan tanggal kebutuhan. - Merekomendasikan pembelian atau
pemindahan stok, bukan langsung membuat PO tanpa persetujuan. -
Mendukung material yang dibeli langsung untuk proyek tertentu. -
Mendukung material substitusi hanya setelah approval engineering.

**Rumus dasar**

`Gross Requirement = Σ (Demand Produk × Kebutuhan Komponen per Produk)`

`Net Requirement = max(0, Gross Requirement + Safety Stock - Usable On-hand - Eligible Scheduled Receipts)`

Perhitungan operasional juga harus memperhitungkan alokasi untuk order
lain, stok quality hold, waktu kedatangan, scrap, dan aturan substitusi.

**Kriteria penerimaan** - MRP menunjukkan alasan setiap material
dinyatakan kurang. - Material yang sudah dialokasikan untuk order lain
tidak dihitung sebagai stok bebas. - Penerimaan PO yang valid
memperbarui ketersediaan sesuai status QC dan kebijakan gudang.

### 5.7 Procurement dan Vendor

**Fitur** - Vendor master, kontak, produk yang disuplai, lead time, dan
catatan kinerja. - Purchase request/requisition dari MRP atau permintaan
langsung yang disetujui. - RFQ/quotation comparison bila diperlukan. -
Purchase order, item, kuantitas, harga, tanggal janji, termin, dan
approval. - Partial delivery, outstanding quantity, keterlambatan, dan
pembatalan. - Direct-to-project purchasing jika barang dikirim langsung
ke lokasi proyek. - Lampiran quotation vendor, PO, surat jalan, invoice,
dan dokumen penerimaan.

**Kriteria penerimaan** - PO mempunyai nomor unik dan alur approval. -
Sistem membedakan jumlah dipesan, diterima, ditolak, dan masih
outstanding. - PO yang telah dibukukan tidak boleh diedit tanpa
perubahan/amendment yang tercatat.

### 5.8 Warehouse dan Inventory

**Fitur** - Penerimaan barang berdasarkan PO atau penerimaan khusus yang
disetujui. - Pemeriksaan kuantitas, UOM, kondisi, batch/lot, serial
number, dan dokumen. - Lokasi gudang/bin jika dibutuhkan. - Status stok:
`Available`, `Reserved`, `Quality Hold`, `Rejected`, `Issued`,
`Returned`. - Reservasi material untuk project/production order. -
Material issue ke work order/unit, material return, transfer,
adjustment, dan stock opname. - Pelacakan nomor batch/serial bila
relevan. - Riwayat transaksi stok dan referensi sumber transaksi.

**Kriteria penerimaan** - Setiap perubahan saldo stok berasal dari
transaksi yang tercatat. - Stok quality hold tidak bisa digunakan untuk
produksi. - Adjustment stok memerlukan alasan dan approval sesuai batas
nilai. - Sistem mencegah saldo negatif kecuali kebijakan khusus
disetujui dan diaudit.

### 5.9 Fabrication dan Assembly Tracking

**Fabrication** - Pelacakan operasi per tahapan, misalnya cutting,
forming, welding, grinding, surface preparation, painting, dan
inspection. - Catatan dimensi/parameter yang diwajibkan oleh instruksi
kerja. - Lampiran foto dan hasil pengukuran. - Identifikasi material
yang digunakan, operator, mesin/work center, dan waktu kerja.

**Assembly** - Daftar komponen yang dipasang per unit/serial. -
Verifikasi komponen kritis, serial number, dan hasil pemasangan. -
Checklist torque/electrical/mechanical test jika sesuai produk. - Catat
komponen yang diganti dan alasan penggantian.

**Kriteria penerimaan** - Produk dapat menggunakan proses fabrication,
assembly, atau kombinasi keduanya. - Sistem dapat menunjukkan komponen
dan lot material yang masuk ke unit tertentu. - Pekerjaan tidak dapat
diselesaikan jika checklist wajib belum dipenuhi, kecuali ada override
dengan approval dan audit.

### 5.10 Quality Control, NCR, dan Rework

**Fitur** - Inspection plan per produk/operasi. - Checklist, kriteria
penerimaan, alat ukur, hasil ukur, foto, inspector, tanggal, dan
status. - Status QC: `Pending`, `Pass`, `Fail`, `Conditional Approval`
bila kebijakan mengizinkan. - Non-Conformance Report (NCR) dengan
kategori, tingkat keparahan, penyebab, tindakan korektif, PIC, dan due
date. - Disposition: rework, repair, use-as-is dengan approval, return
to vendor, atau scrap. - Re-inspection setelah rework. - Final
inspection sebelum release/delivery.

**Kriteria penerimaan** - Hasil QC tidak dapat diubah tanpa jejak
revisi. - NCR memiliki PIC dan status tindak lanjut. - Unit yang gagal
final inspection tidak dapat dinyatakan siap dikirim. - Keputusan
use-as-is memerlukan otorisasi yang sesuai.

### 5.11 Traceability

Sistem harus menyediakan penelusuran dua arah: - Dari
material/lot/serial komponen ke semua unit dan project yang
menggunakannya. - Dari unit/serial produk akhir ke BOM, material,
vendor, operasi, operator, QC, NCR, dan dokumen terkait.

**Kriteria penerimaan** - Riwayat unit dapat ditampilkan dalam satu
halaman. - Setiap transaksi penting mempunyai referensi sumber dan
timestamp. - Data historis tetap bisa dibaca setelah produk atau vendor
dinonaktifkan.

### 5.12 Costing dan Finance

**Komponen biaya** - Material aktual yang benar-benar dikonsumsi. -
Tenaga kerja langsung. - Mesin/work center bila dibebankan. - Overhead
sesuai metode yang disepakati. - Subkontrak, pengiriman, dan biaya
proyek lainnya. - Biaya rework dan scrap.

**Konsep biaya** - **Contract Revenue:** nilai kontrak/penjualan yang
disetujui. - **Budget Cost:** anggaran biaya baseline. - **Committed
Cost:** komitmen biaya dari PO/kontrak yang belum sepenuhnya menjadi
biaya aktual. - **Actual Cost:** biaya aktual yang telah dibukukan
sesuai kebijakan. - **Estimate to Complete (ETC):** estimasi biaya yang
masih diperlukan. - **Forecast Final Cost (EAC):** biaya aktual ditambah
estimasi biaya sampai selesai. - **Forecast Margin:** pendapatan yang
diperkirakan dikurangi forecast final cost.

**Rumus dasar** - `EAC = Actual Cost + Estimate to Complete` -
`Forecast Margin = Forecast Revenue - EAC` -
`Forecast Margin % = Forecast Margin / Forecast Revenue × 100%` (jika
forecast revenue \> 0) - `Cost Variance = Budget Cost - EAC`

**Kontrol penting** - Pembelian material tidak otomatis berarti seluruh
nilainya menjadi biaya konsumsi produksi. - Nilai material yang masih
menjadi persediaan tidak boleh dihitung sebagai material terpakai. -
Hindari double-counting antara committed cost dari PO dan actual cost
ketika invoice/biaya dibukukan. - Kebijakan valuasi persediaan, tenaga
kerja, overhead, dan pengakuan biaya harus ditetapkan sebelum
implementasi.

**Invoice dan pembayaran** - Buat invoice berdasarkan termin kontrak,
milestone, atau delivery. - Catat tanggal invoice, jatuh tempo, nilai,
pajak bila relevan, dan status pembayaran. - Catat pembayaran sebagian
dan saldo piutang. - Modul ini merupakan pengendalian biaya proyek,
bukan pengganti otomatis sistem akuntansi lengkap.

### 5.13 Delivery dan Penutupan Proyek

**Fitur** - Checklist release produk. - Unit/serial yang dikirim,
kuantitas, tanggal, alamat, transporter, dan dokumen. - Surat jalan dan
bukti serah terima sebagai lampiran. - Invoice dan pembayaran terkait. -
Project close-out checklist: dokumen akhir, NCR terbuka, biaya, invoice,
dan penerimaan pelanggan.

**Kriteria penerimaan** - Unit tidak dapat dikirim sebelum memenuhi
release criteria atau memiliki pengecualian yang disetujui. - Jumlah
unit dikirim tidak boleh melebihi jumlah yang tersedia/dirilis. - Proyek
hanya dapat ditutup oleh role berwenang setelah checklist selesai atau
pengecualian tercatat.

------------------------------------------------------------------------

## 6. Model Progress dan Jadwal

Progress proyek dan progress produksi harus dipisahkan.

### 6.1 Progress proyek

Milestone memiliki bobot yang disetujui dan nilai penyelesaian aktual.

`Project Progress = Σ (Bobot Milestone × Persentase Penyelesaian Milestone)`

Total bobot milestone harus 100%. Perubahan bobot setelah baseline perlu
approval dan tidak boleh menghapus nilai historis.

### 6.2 Progress unit

`Unit Progress = Σ (Bobot Operasi × Persentase Penyelesaian Operasi)`

Bobot dapat berdasarkan estimasi jam kerja, kompleksitas, atau metode
yang ditetapkan perusahaan. Metode harus konsisten untuk produk yang
sebanding.

### 6.3 Progress production order

Progress order dapat dihitung dari rata-rata berbobot progress unit:

`Order Progress = Σ (Bobot Unit × Progress Unit) / Σ Bobot Unit`

Untuk unit yang setara, bobot unit dapat sama. Untuk unit dengan
konfigurasi berbeda, gunakan bobot yang disepakati.

### 6.4 Aturan progress

-   Progress tidak boleh dihitung hanya dari jumlah material yang dibeli
    atau uang yang dikeluarkan.
-   Operasi yang wajib QC baru dianggap selesai setelah QC pass.
-   Data aktual dan baseline harus tetap dapat dibandingkan.
-   Perubahan scope, bobot, atau urutan kerja harus tercatat.
-   Dashboard harus menampilkan rencana vs aktual, keterlambatan, dan
    blocker.

------------------------------------------------------------------------

## 7. Data Model Konseptual

Model berikut merupakan baseline awal; detail kolom, constraint, dan
relasi harus difinalisasi saat desain database.

### 7.1 Identity dan authorization

-   `users`
-   `roles`
-   `permissions`
-   `user_roles`
-   `role_permissions`
-   `approval_rules`
-   `approval_requests`

### 7.2 CRM dan commercial

-   `customers`
-   `customer_contacts`
-   `leads`
-   `quotations`
-   `quotation_items`
-   `sales_orders`
-   `sales_order_items`
-   `contracts`
-   `payment_terms`

### 7.3 Project

-   `projects`
-   `project_members`
-   `project_milestones`
-   `project_baselines`
-   `project_risks`
-   `project_issues`
-   `project_documents`

### 7.4 Engineering dan product

-   `products`
-   `product_revisions`
-   `product_configurations`
-   `engineering_documents`
-   `document_revisions`
-   `bom_headers`
-   `bom_lines`
-   `routing_headers`
-   `routing_operations`
-   `work_centers`
-   `inspection_plans`

### 7.5 Production

-   `production_orders`
-   `production_order_units`
-   `work_orders`
-   `work_order_operations`
-   `work_order_assignments`
-   `operation_reports`
-   `labor_entries`
-   `machine_entries`
-   `serial_numbers`
-   `component_installations`

### 7.6 Material dan procurement

-   `materials`
-   `material_categories`
-   `uoms`
-   `uom_conversions`
-   `warehouses`
-   `warehouse_bins`
-   `inventory_balances`
-   `inventory_transactions`
-   `material_reservations`
-   `material_issues`
-   `material_returns`
-   `vendors`
-   `vendor_products`
-   `purchase_requests`
-   `purchase_request_lines`
-   `purchase_orders`
-   `purchase_order_lines`
-   `goods_receipts`
-   `goods_receipt_lines`
-   `stock_counts`

### 7.7 Quality dan traceability

-   `quality_inspections`
-   `quality_inspection_results`
-   `non_conformance_reports`
-   `corrective_actions`
-   `rework_orders`
-   `material_lot_links`
-   `unit_traceability_links`
-   `release_checklists`

### 7.8 Finance dan costing

-   `project_budgets`
-   `project_budget_lines`
-   `cost_transactions`
-   `cost_allocations`
-   `cost_forecasts`
-   `invoices`
-   `invoice_lines`
-   `payments`
-   `payment_allocations`
-   `delivery_orders`
-   `delivery_order_lines`

### 7.9 Platform dan audit

-   `attachments`
-   `notifications`
-   `activity_logs`
-   `audit_logs`
-   `number_sequences`
-   `system_settings`
-   `integration_logs`

### 7.10 Prinsip database

-   Gunakan primary key stabil dan kode bisnis yang unik.
-   Simpan `created_at`, `created_by`, `updated_at`, dan status bila
    relevan.
-   Gunakan foreign key dan constraint untuk menjaga integritas.
-   Transaksi stok dan biaya sebaiknya bersifat append-only; koreksi
    dilakukan dengan transaksi pembalik atau adjustment yang diaudit.
-   Gunakan decimal/numeric untuk nilai uang dan kuantitas yang
    memerlukan presisi; jangan gunakan floating point untuk nominal
    keuangan.
-   Simpan snapshot versi BOM/routing pada production order.
-   Gunakan soft delete hanya untuk master data yang aman dinonaktifkan;
    jangan menghapus transaksi historis.
-   File disimpan di object storage, sementara metadata, permission, dan
    referensinya berada di database.

------------------------------------------------------------------------

## 8. Dashboard dan Laporan

### 8.1 Executive dashboard

-   Jumlah project aktif, terlambat, on hold, dan selesai.
-   Nilai kontrak proyek aktif.
-   Forecast margin dan proyek dengan deviasi biaya tinggi.
-   Production order berdasarkan status.
-   Unit siap kirim dan unit yang tertahan QC.
-   Material shortage kritis.
-   Invoice outstanding dan overdue.

### 8.2 Production dashboard

-   Work order hari ini dan minggu ini.
-   Planned vs actual output.
-   Operasi terlambat dan blocker.
-   Jam kerja aktual vs estimasi.
-   Reject, rework, dan first-pass yield jika data sudah memadai.
-   Kapasitas work center jika jadwal kapasitas telah dimodelkan.

### 8.3 Project report

-   Milestone plan vs actual.
-   Progress proyek vs progress produksi.
-   Jadwal dan biaya baseline vs forecast.
-   Risk, issue, dan keputusan terbuka.
-   Delivery schedule dan invoice milestone.

### 8.4 Procurement dan inventory report

-   Material shortage per tanggal kebutuhan.
-   PO outstanding dan overdue.
-   Stock on hand, reserved, quality hold, dan available.
-   Material consumption per project/unit.
-   Perputaran dan umur stok bila diperlukan.

### 8.5 Quality report

-   QC pass/fail per produk/operasi.
-   NCR terbuka, usia NCR, dan due date.
-   Rework dan scrap.
-   Vendor defect bila data tersedia.

### 8.6 Finance dan cost report

-   Budget vs committed vs actual vs EAC.
-   Forecast margin per project.
-   Invoice issued, paid, outstanding, dan overdue.
-   Biaya material, tenaga kerja, overhead, subkontrak, dan rework.

------------------------------------------------------------------------

## 9. Notifikasi dan Approval

### 9.1 Notifikasi

-   Quotation atau sales order menunggu persetujuan.
-   Perubahan engineering memengaruhi production order aktif.
-   Material shortage sebelum tanggal kebutuhan.
-   PO mendekati atau melewati tanggal janji.
-   Work order ditugaskan, terlambat, atau terblokir.
-   QC gagal atau NCR mendekati jatuh tempo.
-   Forecast biaya melewati threshold.
-   Invoice mendekati jatuh tempo atau overdue.
-   Project milestone terlambat.

### 9.2 Approval yang disarankan

-   Quotation/discount di atas batas.
-   Sales order/kontrak.
-   Baseline project dan revisi baseline.
-   Release engineering.
-   Purchase request dan purchase order berdasarkan nominal.
-   Substitusi material.
-   Stock adjustment.
-   NCR disposition dan use-as-is.
-   Perubahan biaya atau scope.
-   Final release dan project close-out.

Batas nominal dan matriks approval harus dikonfigurasi sesuai struktur
organisasi PT Manggala Utama Indonesia.

------------------------------------------------------------------------

## 10. Non-Functional Requirements

Target awal berikut perlu divalidasi melalui pengujian dan kondisi
operasional nyata.

  -----------------------------------------------------------------------
  Area                                Target awal
  ----------------------------------- -----------------------------------
  Performance                         p95 API \< 500 ms untuk operasi
                                      sederhana pada beban normal

  Availability                        Target 99,5% per bulan, di luar
                                      maintenance terjadwal yang
                                      disepakati

  Backup                              Backup otomatis harian dan
                                      verifikasi pemulihan berkala

  RPO                                 Maksimal kehilangan data 24 jam
                                      sebagai target awal

  RTO                                 Target pemulihan layanan maksimal 8
                                      jam

  Security                            HTTPS, password hashing yang kuat,
                                      validasi input, session security,
                                      dan least privilege

  Audit                               Perubahan transaksi penting dapat
                                      ditelusuri

  Responsive                          Desktop, tablet, dan ponsel untuk
                                      fungsi operasional utama

  Accessibility                       Label form, navigasi keyboard
                                      dasar, kontras yang memadai

  Data integrity                      Validasi server-side, foreign key,
                                      constraint, dan transaksi database

  Observability                       Error logging, health checks, dan
                                      monitoring job/background process

  File management                     Pembatasan tipe/ukuran file, akses
                                      berbasis permission, dan backup
                                      metadata
  -----------------------------------------------------------------------

Persyaratan keamanan dan pemulihan harus disesuaikan dengan sensitivitas
dokumen engineering, kontrak, serta data keuangan.

------------------------------------------------------------------------

## 11. Rekomendasi Arsitektur Teknis

### 11.1 Pendekatan

Mulai dengan **modular monolith** agar pengembangan, deployment, dan
pemeliharaan lebih sederhana. Batas modul tetap jelas sehingga layanan
dapat dipisahkan di kemudian hari jika skala dan kebutuhan mengharuskan.

### 11.2 Stack yang direkomendasikan

-   **Frontend:** Next.js App Router + TypeScript.
-   **UI:** Tailwind CSS + shadcn/ui + Lucide.
-   **Visualisasi:** Recharts untuk chart dashboard.
-   **Backend:** Next.js server-side modules / route handlers dengan
    validasi skema.
-   **Database:** PostgreSQL.
-   **ORM:** Drizzle atau Prisma; pilih satu dan konsisten.
-   **File storage:** S3-compatible object storage.
-   **Background jobs:** worker/queue untuk notifikasi, ekspor besar,
    dan proses asynchronous.
-   **Testing:** unit/integration test dengan Vitest dan end-to-end
    dengan Playwright.
-   **Deployment:** VPS atau cloud dengan staging, production, automated
    backup, dan CI/CD.

### 11.3 Prinsip implementasi

-   Pisahkan business logic dari komponen UI.
-   Semua perubahan transaksi kritis melalui service/domain layer.
-   Validasi dilakukan di client dan server; validasi server adalah
    sumber kebenaran.
-   Gunakan database transaction untuk operasi multi-tabel yang harus
    konsisten.
-   Terapkan pagination, filtering, dan sorting di server untuk daftar
    besar.
-   Jangan mengandalkan nilai progress atau total biaya yang dikirim
    dari browser; hitung ulang di server.
-   Terapkan migration versioning dan strategi rollback.
-   Jangan menyimpan rahasia API atau kredensial di repository.
-   Gunakan staging dan UAT sebelum rilis production.

------------------------------------------------------------------------

## 12. Roadmap MVP

Estimasi awal: **14--18 minggu**, dengan asumsi tim pengembang tersedia,
keputusan proses bisnis cepat, dan master data siap. Ini bukan jaminan
durasi; scope dan kesiapan data sangat memengaruhi timeline.

  -----------------------------------------------------------------------
  Periode                 Fokus                   Hasil utama
  ----------------------- ----------------------- -----------------------
  Minggu 1--2             Discovery dan fondasi   Validasi alur, role,
                                                  master data,
                                                  arsitektur, dan
                                                  database baseline

  Minggu 3--5             CRM, sales, project,    Prospek hingga project
                          budget                  dan baseline
                                                  biaya/jadwal

  Minggu 6--8             Engineering, product,   Revisi dokumen, BOM
                          BOM, routing            bertingkat, routing,
                                                  dan work center

  Minggu 9--11            MRP, procurement,       Perencanaan material,
                          inventory, production   PO, penerimaan, issue,
                                                  production/work order

  Minggu 12--14           QC, NCR, costing,       QC gate, rework,
                          delivery, finance dasar traceability, biaya,
                                                  delivery, invoice dasar

  Minggu 15--18           UAT, pilot, training,   Perbaikan UAT, migrasi
                          go-live                 master data, SOP,
                                                  pelatihan, pilot dan
                                                  rilis
  -----------------------------------------------------------------------

### 12.1 Urutan prioritas

**P0 --- wajib untuk MVP** - Login, role, audit dasar. - Customer,
quotation, sales order, project. - Product/material master. - BOM,
routing, revision control. - Production order dan work order. - MRP
dasar, purchase order, goods receipt, inventory transaction. - Operation
report dan QC gate. - Project costing dasar dan dashboard inti.

**P1 --- penting setelah alur inti stabil** - NCR/rework yang lebih
lengkap. - Traceability mendalam per lot/serial. - Invoice dan
pembayaran lebih lengkap. - Notifikasi otomatis dan laporan ekspor. -
Kapasitas work center dan analisis performa produksi.

**P2 --- lanjutan** - Supplier portal, WhatsApp integration, machine/IoT
integration, advanced scheduling, predictive analytics, dan mobile app
native.

------------------------------------------------------------------------

## 13. Acceptance Criteria / Definition of Done

  -----------------------------------------------------------------------
  ID                                  Kriteria penerimaan
  ----------------------------------- -----------------------------------
  AC-01                               Pengguna hanya dapat mengakses
                                      fitur sesuai role dan lingkup
                                      otorisasi

  AC-02                               Quotation dapat dibuat, direvisi,
                                      disetujui, dan dikonversi menjadi
                                      order tanpa input ulang

  AC-03                               Project memiliki milestone,
                                      baseline, PIC, target date, dan
                                      riwayat perubahan

  AC-04                               Dokumen engineering memiliki nomor,
                                      revisi, status, dan approval

  AC-05                               Production order merekam versi
                                      produk, BOM, dan routing yang
                                      digunakan

  AC-06                               BOM bertingkat menghasilkan
                                      kebutuhan material yang benar pada
                                      skenario uji

  AC-07                               MRP memperhitungkan stok usable,
                                      reserved, scheduled receipts, dan
                                      lead time

  AC-08                               PO mendukung partial receipt dan
                                      menunjukkan outstanding quantity

  AC-09                               Transaksi gudang mencatat sumber,
                                      waktu, pengguna, dan saldo
                                      sebelum/sesudah

  AC-10                               Material quality hold tidak dapat
                                      di-issue ke produksi

  AC-11                               Work order mencatat operasi,
                                      pelaksana, waktu, kuantitas, dan
                                      blocker

  AC-12                               Operasi wajib QC tidak dapat
                                      diselesaikan sebelum hasil QC pass

  AC-13                               QC fail dapat membuat NCR/rework
                                      dan mewajibkan pemeriksaan ulang

  AC-14                               Unit/serial dapat ditelusuri ke
                                      material, operasi, QC, dan dokumen
                                      terkait

  AC-15                               Dashboard membedakan progress
                                      proyek dari progress produksi

  AC-16                               Laporan biaya membedakan budget,
                                      committed, actual, ETC, dan EAC
                                      tanpa double-counting

  AC-17                               Unit yang belum memenuhi release
                                      criteria tidak dapat dikirim tanpa
                                      pengecualian berotorisasi

  AC-18                               Transaksi kritis dan perubahan
                                      konfigurasi dapat ditelusuri
                                      melalui audit log
  -----------------------------------------------------------------------

### 13.1 Skenario UAT utama

Uji end-to-end minimal pada **tiga unit truk tangki** atau satu produk
nyata yang mewakili fabrication dan assembly:

1.  Buat quotation dan sales order.
2.  Buat project dan baseline.
3.  Rilis revisi engineering, BOM, dan routing.
4.  Buat production order untuk tiga unit.
5.  Jalankan MRP dan identifikasi kekurangan.
6.  Buat PO, terima material, dan lakukan QC penerimaan.
7.  Reservasi dan issue material ke work order.
8.  Laporkan operasi fabrication dan assembly.
9.  Simulasikan QC fail, buat NCR/rework, lalu lakukan re-inspection.
10. Lakukan final inspection dan release.
11. Catat delivery.
12. Catat biaya material yang benar-benar dikonsumsi dan biaya lain.
13. Terbitkan invoice sesuai aturan termin dan catat pembayaran.
14. Verifikasi progress, traceability, audit log, serta forecast margin.

Hasil UAT harus dibandingkan dengan perhitungan manual yang disetujui
oleh pemilik proses.

------------------------------------------------------------------------

## 14. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Master material dan UOM MRP dan stok tidak      Bersihkan data,
  tidak konsisten         akurat                  tetapkan kode/UOM baku,
                                                  dan validasi konversi

  BOM belum               Kebutuhan material      Mulai dari satu produk
  terdokumentasi          salah                   prioritas dan lakukan
                                                  validasi engineering

  Proses custom terlalu   Scope melebar           Gunakan product
  beragam                                         configuration dan
                                                  approval untuk
                                                  exception

  Revisi engineering      Rework dan salah        Versioning, release
  tidak terkendali        produksi                gate, dan impact
                                                  assessment

  Transaksi gudang        Stok sistem berbeda     SOP transaksi
  terlambat dicatat       dari fisik              real-time, stock
                                                  opname, dan dashboard
                                                  data quality

  Biaya aktual tidak      Margin proyek tidak     Sepakati kebijakan
  lengkap                 dapat dipercaya         material, labor,
                                                  overhead, scrap, dan
                                                  subcontracting

  Pengguna melewati       Data tidak lengkap      Training, SOP, champion
  sistem                                          per fungsi, dan audit
                                                  penggunaan

  Scope creep             Timeline dan biaya      P0/P1/P2, change
                          membengkak              request, dan keputusan
                                                  sponsor

  Backup tidak pernah     Risiko kehilangan data  Jadwalkan restore drill
  diuji                                           dan dokumentasikan
                                                  hasilnya
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 15. Keputusan yang Harus Difinalisasi Sebelum Development

1.  **Produk pilot:** produk nyata mana yang menjadi golden workflow
    pertama---disarankan satu produk yang mencakup fabrication dan
    assembly.
2.  **Tipe order:** mana yang standar, configured, dan custom; siapa
    yang menyetujui konfigurasi.
3.  **Master material:** kode, kategori, UOM, konversi, minimum stock,
    dan aturan substitusi.
4.  **BOM dan routing:** pemilik data, struktur bertingkat, scrap
    allowance, dan proses QC.
5.  **Nomor serial/lot:** produk atau material apa yang wajib
    ditelusuri.
6.  **Work center:** apakah kapasitas mesin dan kalender kerja masuk
    MVP.
7.  **Costing:** metode valuasi stok, tarif tenaga kerja, overhead,
    scrap, rework, dan subkontrak.
8.  **Procurement:** batas approval, vendor comparison, partial receipt,
    dan direct-to-project.
9.  **Gudang:** jumlah gudang/lokasi, aturan transfer, stock opname, dan
    apakah stok negatif dilarang.
10. **QC:** inspection plan, parameter wajib, disposition, dan otoritas
    use-as-is.
11. **Finance:** termin invoice, pembayaran sebagian, pajak, dan batas
    integrasi dengan akuntansi.
12. **Approval matrix:** siapa menyetujui quotation, PO, perubahan
    engineering, adjustment, dan release.
13. **Pengguna dan beban:** jumlah pengguna, perangkat lapangan,
    kebutuhan akses simultan, dan jaringan di area produksi.
14. **Migrasi data:** data awal apa yang tersedia dan siapa yang
    bertanggung jawab membersihkannya.
15. **Deployment dan keamanan:** hosting, backup, retensi dokumen, akses
    remote, dan pemulihan bencana.

------------------------------------------------------------------------

## 16. Rekomendasi Implementasi

Jangan membangun semua modul secara bersamaan. Mulai dengan satu
**golden workflow** yang benar-benar mewakili operasi perusahaan:

**Quotation → Project → Engineering release → BOM/MRP → Procurement →
Fabrication/Assembly → QC/Rework → Actual Cost → Delivery.**

Validasi alur ini menggunakan satu produk nyata, data material yang
benar, dan pengguna dari fungsi terkait. Setelah hasilnya konsisten
dengan proses manual dan lolos UAT, perluas ke variasi produk, laporan,
integrasi, serta otomasi lainnya.

**Hasil yang dituju:** MMOS menjadi sumber data operasional yang dapat
dipercaya untuk menjawab tiga pertanyaan utama: *apa yang sedang
dikerjakan, apa yang menghambat penyelesaian, dan berapa biaya serta
margin aktual proyek tersebut?*
