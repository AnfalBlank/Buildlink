// ============================================================
// MMOS DUMMY DATA STORE
// ============================================================

// --- CUSTOMERS ---
export const customers = [
  { id: "C001", code: "CUST-001", name: "PT Pertamina Trans Kontinental", contact: "Budi Santoso", email: "budi@ptk.co.id", phone: "021-5551234", city: "Jakarta", status: "Active", totalOrders: 5, totalValue: 4500000000 },
  { id: "C002", code: "CUST-002", name: "PT Elnusa Petrofin", contact: "Dewi Rahayu", email: "dewi@elnusa.co.id", phone: "021-5556789", city: "Jakarta", status: "Active", totalOrders: 3, totalValue: 2800000000 },
  { id: "C003", code: "CUST-003", name: "PT Energi Mega Persada", contact: "Hendra Wijaya", email: "hendra@emp.co.id", phone: "031-5553456", city: "Surabaya", status: "Active", totalOrders: 2, totalValue: 1900000000 },
  { id: "C004", code: "CUST-004", name: "PT Astra Honda Motor", contact: "Sari Indah", email: "sari@ahm.co.id", phone: "021-5557890", city: "Jakarta", status: "Active", totalOrders: 4, totalValue: 3200000000 },
  { id: "C005", code: "CUST-005", name: "PT Pupuk Indonesia", contact: "Roni Kurniawan", email: "roni@pupuk.co.id", phone: "021-5554567", city: "Jakarta", status: "Inactive", totalOrders: 1, totalValue: 750000000 },
];

// --- LEADS ---
export const leads = [
  { id: "L001", code: "LEAD-001", company: "PT Medco Energi", contact: "Ahmad Fauzi", email: "ahmad@medco.co.id", phone: "021-5558901", source: "Referral", stage: "Qualification", estimatedValue: 2000000000, assignedTo: "Andi Sales", createdAt: "2026-09-15", notes: "Butuh 5 unit truk tangki BBM" },
  { id: "L002", code: "LEAD-002", company: "PT Vivo Energy Indonesia", contact: "Lisa Permata", email: "lisa@vivo.co.id", phone: "021-5552345", source: "Website", stage: "Proposal", estimatedValue: 1500000000, assignedTo: "Budi Sales", createdAt: "2026-09-20", notes: "Tertarik tangki stainless 30KL" },
  { id: "L003", code: "LEAD-003", company: "PT Shell Indonesia", contact: "Mark Johnson", email: "mark@shell.co.id", phone: "021-5556677", source: "Exhibition", stage: "Negotiation", estimatedValue: 3500000000, assignedTo: "Andi Sales", createdAt: "2026-10-01", notes: "RFQ sudah dikirim, menunggu approval" },
  { id: "L004", code: "LEAD-004", company: "PT Total Energies", contact: "Pierre Dubois", email: "pierre@total.co.id", phone: "021-5559988", source: "Direct", stage: "Closed Won", estimatedValue: 2200000000, assignedTo: "Cinta Sales", createdAt: "2026-08-10", notes: "Deal sudah closed" },
];

// --- QUOTATIONS ---
export const quotations = [
  { id: "Q001", code: "QUO-2026-001", customer: "PT Pertamina Trans Kontinental", customerId: "C001", date: "2026-08-01", validUntil: "2026-09-01", status: "Approved", total: 1850000000, revision: 2, items: [{ product: "Tangki BBM 16KL", qty: 2, unit: "Unit", unitPrice: 750000000, total: 1500000000 }, { product: "Instalasi & Commissioning", qty: 2, unit: "Job", unitPrice: 75000000, total: 150000000 }, { product: "Dokumen & Sertifikasi", qty: 1, unit: "Lot", unitPrice: 200000000, total: 200000000 }] },
  { id: "Q002", code: "QUO-2026-002", customer: "PT Elnusa Petrofin", customerId: "C002", date: "2026-08-15", validUntil: "2026-09-15", status: "Draft", total: 920000000, revision: 1, items: [{ product: "Truk Tangki 8KL", qty: 1, unit: "Unit", unitPrice: 850000000, total: 850000000 }, { product: "Dokumen Kendaraan", qty: 1, unit: "Lot", unitPrice: 70000000, total: 70000000 }] },
  { id: "Q003", code: "QUO-2026-003", customer: "PT Energi Mega Persada", customerId: "C003", date: "2026-09-01", validUntil: "2026-10-01", status: "Sent", total: 1650000000, revision: 1, items: [{ product: "Tangki Storage 50KL", qty: 1, unit: "Unit", unitPrice: 1500000000, total: 1500000000 }, { product: "Pipa & Fitting", qty: 1, unit: "Lot", unitPrice: 150000000, total: 150000000 }] },
  { id: "Q004", code: "QUO-2026-004", customer: "PT Astra Honda Motor", customerId: "C004", date: "2026-09-10", validUntil: "2026-10-10", status: "Approved", total: 2400000000, revision: 3, items: [{ product: "Truk Tangki Kimia 10KL", qty: 3, unit: "Unit", unitPrice: 800000000, total: 2400000000 }] },
];

// --- SALES ORDERS ---
export const salesOrders = [
  { id: "SO001", code: "SO-2026-001", quotationId: "Q001", customer: "PT Pertamina Trans Kontinental", customerId: "C001", poNumber: "PO-PTK-2026-0234", contractValue: 1850000000, date: "2026-08-10", deliveryDate: "2026-12-31", status: "Active", projectId: "PRJ001", paymentTerms: "30% DP, 40% Progress, 30% Delivery" },
  { id: "SO002", code: "SO-2026-002", quotationId: "Q004", customer: "PT Astra Honda Motor", customerId: "C004", poNumber: "PO-AHM-2026-0567", contractValue: 2400000000, date: "2026-09-15", deliveryDate: "2027-03-31", status: "Active", projectId: "PRJ002", paymentTerms: "20% DP, 50% Progress, 30% Delivery" },
  { id: "SO003", code: "SO-2026-003", quotationId: "Q003", customer: "PT Energi Mega Persada", customerId: "C003", poNumber: "PO-EMP-2026-0123", contractValue: 1650000000, date: "2026-09-20", deliveryDate: "2027-02-28", status: "Draft", projectId: null, paymentTerms: "50% DP, 50% Delivery" },
];

// --- PROJECTS ---
export const projects = [
  { id: "PRJ001", code: "PRJ-2026-001", name: "Tangki BBM 16KL - Pertamina", customer: "PT Pertamina Trans Kontinental", pm: "Reza PM", salesOrderId: "SO001", startDate: "2026-08-15", targetDate: "2026-12-31", status: "Active", priority: "High", contractValue: 1850000000, budget: 1450000000, actualCost: 650000000, progress: 42, description: "Fabrikasi 2 unit tangki BBM 16KL untuk PT Pertamina Trans Kontinental" },
  { id: "PRJ002", code: "PRJ-2026-002", name: "Truk Tangki Kimia 10KL - AHM", customer: "PT Astra Honda Motor", pm: "Sinta PM", salesOrderId: "SO002", startDate: "2026-09-20", targetDate: "2027-03-31", status: "Active", priority: "High", contractValue: 2400000000, budget: 1900000000, actualCost: 320000000, progress: 15, description: "Assembly 3 unit truk tangki kimia 10KL" },
  { id: "PRJ003", code: "PRJ-2025-045", name: "Tangki Storage 20KL - Pupuk", customer: "PT Pupuk Indonesia", pm: "Dino PM", salesOrderId: null, startDate: "2025-06-01", targetDate: "2025-12-31", status: "Completed", priority: "Medium", contractValue: 750000000, budget: 600000000, actualCost: 580000000, progress: 100, description: "Fabrikasi tangki storage solar 20KL" },
  { id: "PRJ004", code: "PRJ-2026-003", name: "Truk Tangki BBM 8KL - Elnusa", customer: "PT Elnusa Petrofin", pm: "Reza PM", salesOrderId: "SO001", startDate: "2026-10-01", targetDate: "2027-01-31", status: "Draft", priority: "Medium", contractValue: 920000000, budget: 720000000, actualCost: 0, progress: 0, description: "Assembly 1 unit truk tangki BBM 8KL" },
];

// --- MILESTONES ---
export const milestones = [
  { id: "MS001", projectId: "PRJ001", name: "Design Approval", weight: 10, targetDate: "2026-09-01", actualDate: "2026-09-03", status: "Completed", completion: 100, pic: "Eko Engineering" },
  { id: "MS002", projectId: "PRJ001", name: "Material Procurement", weight: 15, targetDate: "2026-09-20", actualDate: "2026-09-25", status: "Completed", completion: 100, pic: "Hadi Procurement" },
  { id: "MS003", projectId: "PRJ001", name: "Fabrication 50%", weight: 25, targetDate: "2026-10-31", actualDate: null, status: "In Progress", completion: 60, pic: "Supri Production" },
  { id: "MS004", projectId: "PRJ001", name: "Fabrication Complete", weight: 25, targetDate: "2026-11-30", actualDate: null, status: "Pending", completion: 0, pic: "Supri Production" },
  { id: "MS005", projectId: "PRJ001", name: "Final Inspection & Delivery", weight: 25, targetDate: "2026-12-31", actualDate: null, status: "Pending", completion: 0, pic: "Reza PM" },
  { id: "MS006", projectId: "PRJ002", name: "Engineering Release", weight: 15, targetDate: "2026-10-15", actualDate: "2026-10-14", status: "Completed", completion: 100, pic: "Eko Engineering" },
  { id: "MS007", projectId: "PRJ002", name: "Chassis Assembly 1st Unit", weight: 20, targetDate: "2026-11-30", actualDate: null, status: "In Progress", completion: 30, pic: "Supri Production" },
  { id: "MS008", projectId: "PRJ002", name: "All Units Completed", weight: 40, targetDate: "2027-02-28", actualDate: null, status: "Pending", completion: 0, pic: "Supri Production" },
  { id: "MS009", projectId: "PRJ002", name: "Delivery", weight: 25, targetDate: "2027-03-31", actualDate: null, status: "Pending", completion: 0, pic: "Sinta PM" },
];

// --- RISKS ---
export const risks = [
  { id: "R001", projectId: "PRJ001", title: "Keterlambatan material baja", probability: "High", impact: "High", status: "Open", mitigation: "Buffer stock 2 minggu, alternatif vendor", owner: "Hadi Procurement", dueDate: "2026-10-20" },
  { id: "R002", projectId: "PRJ001", title: "Perubahan spesifikasi pelanggan", probability: "Medium", impact: "High", status: "Mitigated", mitigation: "Freeze spec setelah PO signed", owner: "Reza PM", dueDate: "2026-09-01" },
  { id: "R003", projectId: "PRJ002", title: "Keterlambatan chassis dari vendor", probability: "Low", impact: "High", status: "Open", mitigation: "Follow up mingguan ke vendor", owner: "Hadi Procurement", dueDate: "2026-11-01" },
];

// --- ENGINEERING DOCUMENTS ---
export const engineeringDocuments = [
  { id: "ED001", code: "DOC-ENG-001", title: "General Arrangement Drawing - Tangki 16KL", type: "Drawing", revision: "Rev.C", projectId: "PRJ001", productId: "PRD001", status: "Released", owner: "Eko Engineering", approvedBy: "Chief Eng", releasedAt: "2026-09-03", description: "GA drawing tangki BBM 16KL" },
  { id: "ED002", code: "DOC-ENG-002", title: "Welding Procedure Specification", type: "WPS", revision: "Rev.A", projectId: "PRJ001", productId: "PRD001", status: "Released", owner: "Eko Engineering", approvedBy: "Chief Eng", releasedAt: "2026-09-05", description: "WPS untuk pengelasan tangki" },
  { id: "ED003", code: "DOC-ENG-003", title: "Piping & Instrument Diagram", type: "P&ID", revision: "Rev.B", projectId: "PRJ001", productId: "PRD001", status: "Approved", owner: "Eko Engineering", approvedBy: "Chief Eng", releasedAt: null, description: "P&ID sistem piping tangki" },
  { id: "ED004", code: "DOC-ENG-004", title: "Chassis Modification Drawing - Truk 10KL", type: "Drawing", revision: "Rev.A", projectId: "PRJ002", productId: "PRD002", status: "Released", owner: "Dewi Engineering", approvedBy: "Chief Eng", releasedAt: "2026-10-14", description: "Drawing modifikasi chassis truk tangki kimia" },
  { id: "ED005", code: "DOC-ENG-005", title: "Tank Shell Calculation", type: "Calculation", revision: "Rev.A", projectId: "PRJ001", productId: "PRD001", status: "In Review", owner: "Eko Engineering", approvedBy: null, releasedAt: null, description: "Perhitungan ketebalan shell tangki" },
];

// --- PRODUCTS ---
export const products = [
  {
    id: "PRD001",
    code: "PRD-TK-16KL",
    name: "Tangki BBM 16.000 Liter",
    type: "Custom",
    category: "Fabrication",
    uom: "Unit",
    status: "Active",
    revision: "Rev.C",
    bomId: "BOM001",
    routingId: "RTE001",
    description: "Tangki penyimpanan bahan bakar minyak kapasitas 16.000 liter standar Pertamina & ASME Sec.VIII",
    materialCost: 68835000,
    laborCost: 38000000,
    overheadCost: 18165000,
    estimatedHpp: 125000000, // Total HPP / RAB per unit
    sellingPrice: 195000000, // Harga Jual Standar
    targetMargin: 35.9,      // Proyeksi Margin %
  },
  {
    id: "PRD002",
    code: "PRD-TT-10KL",
    name: "Truk Tangki Kimia 10.000 Liter",
    type: "Configured",
    category: "Assembly",
    uom: "Unit",
    status: "Active",
    revision: "Rev.A",
    bomId: "BOM002",
    routingId: "RTE002",
    description: "Truk tangki untuk bahan kimia kapasitas 10.000 liter dengan internal rubber lining",
    materialCost: 45890000,
    laborCost: 32000000,
    overheadCost: 17110000,
    estimatedHpp: 95000000,
    sellingPrice: 145000000,
    targetMargin: 34.5,
  },
  {
    id: "PRD003",
    code: "PRD-TK-20KL",
    name: "Tangki Storage 20.000 Liter",
    type: "Standard",
    category: "Fabrication",
    uom: "Unit",
    status: "Active",
    revision: "Rev.B",
    bomId: "BOM003",
    routingId: "RTE003",
    description: "Tangki penyimpanan solar kapasitas 20.000 liter single wall",
    materialCost: 78000000,
    laborCost: 42000000,
    overheadCost: 20000000,
    estimatedHpp: 140000000,
    sellingPrice: 215000000,
    targetMargin: 34.9,
  },
  {
    id: "MAT001",
    code: "MAT-PL-6MM",
    name: "Plat Baja 6mm",
    type: "Standard",
    category: "Raw Material",
    uom: "Kg",
    status: "Active",
    revision: null,
    bomId: null,
    routingId: null,
    description: "Plat baja karbon SS400 tebal 6mm",
    unitPrice: 18500,
    estimatedHpp: 18500,
    sellingPrice: 23000,
    targetMargin: 19.5,
  },
  {
    id: "MAT002",
    code: "MAT-PL-8MM",
    name: "Plat Baja 8mm",
    type: "Standard",
    category: "Raw Material",
    uom: "Kg",
    status: "Active",
    revision: null,
    bomId: null,
    routingId: null,
    description: "Plat baja karbon tebal 8mm untuk bottom plate",
    unitPrice: 22000,
    estimatedHpp: 22000,
    sellingPrice: 27500,
    targetMargin: 20.0,
  },
  {
    id: "MAT003",
    code: "MAT-PIP-3IN",
    name: "Pipa SCH40 3 inch",
    type: "Standard",
    category: "Raw Material",
    uom: "Meter",
    status: "Active",
    revision: null,
    bomId: null,
    routingId: null,
    description: "Pipa seamless baja SCH40 diameter 3 inch",
    unitPrice: 650000,
    estimatedHpp: 650000,
    sellingPrice: 780000,
    targetMargin: 16.7,
  },
  {
    id: "MAT004",
    code: "MAT-VLV-3IN",
    name: "Ball Valve 3 inch",
    type: "Standard",
    category: "Component",
    uom: "Pcs",
    status: "Active",
    revision: null,
    bomId: null,
    routingId: null,
    description: "Ball valve stainless steel SS316 flange 150#",
    unitPrice: 3250000,
    estimatedHpp: 3250000,
    sellingPrice: 3900000,
    targetMargin: 16.7,
  },
  {
    id: "MAT005",
    code: "MAT-CAT-EP",
    name: "Cat Epoxy Primer",
    type: "Standard",
    category: "Consumable",
    uom: "Liter",
    status: "Active",
    revision: null,
    bomId: null,
    routingId: null,
    description: "Cat epoxy primer dua komponen tahan korosi",
    unitPrice: 140000,
    estimatedHpp: 140000,
    sellingPrice: 175000,
    targetMargin: 20.0,
  },
];

// --- BOM ---
export const boms = [
  {
    id: "BOM001",
    code: "BOM-PRD-TK-16KL",
    productId: "PRD001",
    revision: "Rev.C",
    status: "Released",
    createdAt: "2026-09-02",
    totalMaterialCost: 68835000,
    items: [
      { id: "BI001", material: "Plat Baja 6mm", materialId: "MAT001", qty: 1800, uom: "Kg", scrapPct: 5, unitPrice: 18500, subtotalCost: 34965000, notes: "Shell body & roof plate" },
      { id: "BI002", material: "Plat Baja 8mm", materialId: "MAT002", qty: 400, uom: "Kg", scrapPct: 3, unitPrice: 22000, subtotalCost: 9064000, notes: "Bottom base plate" },
      { id: "BI003", material: "Pipa SCH40 3 inch", materialId: "MAT003", qty: 12, uom: "Meter", scrapPct: 2, unitPrice: 650000, subtotalCost: 7956000, notes: "Inlet & outlet manifold piping" },
      { id: "BI004", material: "Ball Valve 3 inch", materialId: "MAT004", qty: 4, uom: "Pcs", scrapPct: 0, unitPrice: 3250000, subtotalCost: 13000000, notes: "Isolating emergency valves" },
      { id: "BI005", material: "Cat Epoxy Primer", materialId: "MAT005", qty: 25, uom: "Liter", scrapPct: 10, unitPrice: 140000, subtotalCost: 3850000, notes: "Internal primer protective coating" },
    ],
  },
  {
    id: "BOM002",
    code: "BOM-PRD-TT-10KL",
    productId: "PRD002",
    revision: "Rev.A",
    status: "Released",
    createdAt: "2026-10-13",
    totalMaterialCost: 45890000,
    items: [
      { id: "BI006", material: "Plat Baja 6mm", materialId: "MAT001", qty: 1200, uom: "Kg", scrapPct: 5, unitPrice: 18500, subtotalCost: 23310000, notes: "Tank cylinder body" },
      { id: "BI007", material: "Ball Valve 3 inch", materialId: "MAT004", qty: 6, uom: "Pcs", scrapPct: 0, unitPrice: 3250000, subtotalCost: 19500000, notes: "Chemical discharge valves" },
      { id: "BI008", material: "Cat Epoxy Primer", materialId: "MAT005", qty: 20, uom: "Liter", scrapPct: 10, unitPrice: 140000, subtotalCost: 3080000, notes: "Corrosion resistant coating" },
    ],
  },
];

// --- ROUTING ---
export const routings = [
  { id: "RTE001", code: "RTE-PRD-TK-16KL", productId: "PRD001", revision: "Rev.C", status: "Released", operations: [
    { seq: 10, name: "Cutting & Marking", workCenter: "WC-CUT", setupTime: 2, runTime: 8, requiresQC: false, skill: "Welder" },
    { seq: 20, name: "Rolling & Forming", workCenter: "WC-ROLL", setupTime: 1, runTime: 12, requiresQC: false, skill: "Operator" },
    { seq: 30, name: "Fit Up & Welding", workCenter: "WC-WELD", setupTime: 2, runTime: 40, requiresQC: true, skill: "Welder Certified" },
    { seq: 40, name: "NDT / Radiography", workCenter: "WC-QC", setupTime: 1, runTime: 8, requiresQC: true, skill: "QC Inspector" },
    { seq: 50, name: "Hydrostatic Test", workCenter: "WC-TEST", setupTime: 2, runTime: 6, requiresQC: true, skill: "QC Inspector" },
    { seq: 60, name: "Surface Preparation", workCenter: "WC-BLAST", setupTime: 1, runTime: 8, requiresQC: false, skill: "Blaster" },
    { seq: 70, name: "Painting", workCenter: "WC-PAINT", setupTime: 2, runTime: 12, requiresQC: true, skill: "Painter" },
    { seq: 80, name: "Piping Installation", workCenter: "WC-PIPE", setupTime: 1, runTime: 16, requiresQC: false, skill: "Pipefitter" },
    { seq: 90, name: "Final Inspection", workCenter: "WC-QC", setupTime: 1, runTime: 4, requiresQC: true, skill: "QC Inspector" },
  ]},
  { id: "RTE002", code: "RTE-PRD-TT-10KL", productId: "PRD002", revision: "Rev.A", status: "Released", operations: [
    { seq: 10, name: "Chassis Preparation", workCenter: "WC-MACH", setupTime: 2, runTime: 8, requiresQC: false, skill: "Mechanic" },
    { seq: 20, name: "Tank Fabrication", workCenter: "WC-WELD", setupTime: 2, runTime: 30, requiresQC: true, skill: "Welder Certified" },
    { seq: 30, name: "Tank Installation on Chassis", workCenter: "WC-ASSY", setupTime: 1, runTime: 16, requiresQC: true, skill: "Mechanic" },
    { seq: 40, name: "Piping & Valve Assembly", workCenter: "WC-PIPE", setupTime: 1, runTime: 12, requiresQC: false, skill: "Pipefitter" },
    { seq: 50, name: "Painting & Finishing", workCenter: "WC-PAINT", setupTime: 2, runTime: 8, requiresQC: false, skill: "Painter" },
    { seq: 60, name: "Final Inspection & Road Test", workCenter: "WC-QC", setupTime: 1, runTime: 6, requiresQC: true, skill: "QC Inspector" },
  ]},
];

// --- WORK CENTERS ---
export const workCenters = [
  { id: "WC-CUT", name: "Cutting Station", type: "Machine", capacity: 2, unit: "Shift", status: "Active" },
  { id: "WC-ROLL", name: "Rolling Machine", type: "Machine", capacity: 1, unit: "Shift", status: "Active" },
  { id: "WC-WELD", name: "Welding Bay", type: "Labor", capacity: 6, unit: "Welder", status: "Active" },
  { id: "WC-QC", name: "QC Inspection Area", type: "Labor", capacity: 3, unit: "Inspector", status: "Active" },
  { id: "WC-TEST", name: "Hydro Test Area", type: "Machine", capacity: 1, unit: "Shift", status: "Active" },
  { id: "WC-BLAST", name: "Blasting Booth", type: "Machine", capacity: 1, unit: "Shift", status: "Active" },
  { id: "WC-PAINT", name: "Painting Booth", type: "Machine", capacity: 2, unit: "Shift", status: "Active" },
  { id: "WC-PIPE", name: "Piping Fabrication", type: "Labor", capacity: 4, unit: "Fitter", status: "Active" },
  { id: "WC-ASSY", name: "Assembly Bay", type: "Labor", capacity: 4, unit: "Mechanic", status: "Active" },
  { id: "WC-MACH", name: "Machine Shop", type: "Machine", capacity: 2, unit: "Shift", status: "Active" },
];

// --- PRODUCTION ORDERS ---
export const productionOrders = [
  { id: "PO001", code: "PROD-2026-001", projectId: "PRJ001", salesOrderId: "SO001", product: "Tangki BBM 16KL", productId: "PRD001", qty: 2, bomRevision: "Rev.C", routingRevision: "Rev.C", targetDate: "2026-11-30", status: "In Progress", priority: "High", progress: 42, units: [
    { serial: "SN-TK-001", status: "In Progress", progress: 55 },
    { serial: "SN-TK-002", status: "In Progress", progress: 28 },
  ]},
  { id: "PO002", code: "PROD-2026-002", projectId: "PRJ002", salesOrderId: "SO002", product: "Truk Tangki Kimia 10KL", productId: "PRD002", qty: 3, bomRevision: "Rev.A", routingRevision: "Rev.A", targetDate: "2027-02-28", status: "Released", priority: "High", progress: 15, units: [
    { serial: "SN-TT-001", status: "In Progress", progress: 35 },
    { serial: "SN-TT-002", status: "Ready", progress: 5 },
    { serial: "SN-TT-003", status: "Draft", progress: 0 },
  ]},
];

// --- WORK ORDERS ---
export const workOrders = [
  { id: "WO001", code: "WO-2026-001", productionOrderId: "PO001", serial: "SN-TK-001", operation: "Fit Up & Welding", seq: 30, workCenter: "WC-WELD", assignedTo: "Budi Welder", targetDate: "2026-10-10", status: "Completed", estimatedHours: 40, actualHours: 42, qtyGood: 1, qtyReject: 0, notes: "Selesai tepat waktu" },
  { id: "WO002", code: "WO-2026-002", productionOrderId: "PO001", serial: "SN-TK-001", operation: "NDT / Radiography", seq: 40, workCenter: "WC-QC", assignedTo: "QC Andi", targetDate: "2026-10-12", status: "Submitted for QC", estimatedHours: 8, actualHours: 7, qtyGood: 0, qtyReject: 0, notes: "" },
  { id: "WO003", code: "WO-2026-003", productionOrderId: "PO001", serial: "SN-TK-002", operation: "Fit Up & Welding", seq: 30, workCenter: "WC-WELD", assignedTo: "Roni Welder", targetDate: "2026-10-20", status: "In Progress", estimatedHours: 40, actualHours: 22, qtyGood: 0, qtyReject: 0, notes: "Progress 55%" },
  { id: "WO004", code: "WO-2026-004", productionOrderId: "PO002", serial: "SN-TT-001", operation: "Chassis Preparation", seq: 10, workCenter: "WC-MACH", assignedTo: "Heri Mechanic", targetDate: "2026-10-25", status: "Completed", estimatedHours: 8, actualHours: 9, qtyGood: 1, qtyReject: 0, notes: "" },
  { id: "WO005", code: "WO-2026-005", productionOrderId: "PO002", serial: "SN-TT-001", operation: "Tank Fabrication", seq: 20, workCenter: "WC-WELD", assignedTo: "Budi Welder", targetDate: "2026-11-10", status: "In Progress", estimatedHours: 30, actualHours: 12, qtyGood: 0, qtyReject: 0, notes: "" },
];

// --- VENDORS ---
export const vendors = [
  { id: "VND001", code: "VND-001", name: "PT Krakatau Steel", contact: "Agus Vendor", email: "agus@kras.co.id", phone: "021-6661234", city: "Cilegon", category: "Steel Supplier", rating: 4.5, status: "Active", leadTime: 14 },
  { id: "VND002", code: "VND-002", name: "PT Tira Austenite", contact: "Sinta Vendor", email: "sinta@tira.co.id", phone: "021-6665678", city: "Jakarta", category: "Valve Supplier", rating: 4.2, status: "Active", leadTime: 7 },
  { id: "VND003", code: "VND-003", name: "PT Merk Paint", contact: "Dodi Vendor", email: "dodi@merkpaint.co.id", phone: "021-6669012", city: "Jakarta", category: "Paint Supplier", rating: 3.8, status: "Active", leadTime: 5 },
  { id: "VND004", code: "VND-004", name: "PT Gunawan Steel", contact: "Yuni Vendor", email: "yuni@gunsteel.co.id", phone: "031-6663456", city: "Surabaya", category: "Steel Supplier", rating: 4.0, status: "Active", leadTime: 21 },
];

// --- PURCHASE ORDERS ---
export const purchaseOrders = [
  { id: "PRC001", code: "PO-2026-001", vendorId: "VND001", vendor: "PT Krakatau Steel", projectId: "PRJ001", date: "2026-09-10", deliveryDate: "2026-09-24", status: "Received", total: 180000000, approvedBy: "Manager Procurement", items: [
    { id: "POI001", material: "Plat Baja 6mm", materialId: "MAT001", qty: 3600, uom: "Kg", unitPrice: 22000, total: 79200000, qtyReceived: 3600, qtyRejected: 0 },
    { id: "POI002", material: "Plat Baja 8mm", materialId: "MAT002", qty: 800, uom: "Kg", unitPrice: 25000, total: 20000000, qtyReceived: 800, qtyRejected: 0 },
  ]},
  { id: "PRC002", code: "PO-2026-002", vendorId: "VND002", vendor: "PT Tira Austenite", projectId: "PRJ001", date: "2026-09-12", deliveryDate: "2026-09-19", status: "Received", total: 14000000, approvedBy: "Manager Procurement", items: [
    { id: "POI003", material: "Ball Valve 3 inch", materialId: "MAT004", qty: 8, uom: "Pcs", unitPrice: 1750000, total: 14000000, qtyReceived: 8, qtyRejected: 0 },
  ]},
  { id: "PRC003", code: "PO-2026-003", vendorId: "VND001", vendor: "PT Krakatau Steel", projectId: "PRJ002", date: "2026-10-05", deliveryDate: "2026-10-26", status: "Partially Received", total: 132000000, approvedBy: "Manager Procurement", items: [
    { id: "POI004", material: "Plat Baja 6mm", materialId: "MAT001", qty: 3600, uom: "Kg", unitPrice: 22000, total: 79200000, qtyReceived: 1800, qtyRejected: 0 },
    { id: "POI005", material: "Plat Baja 8mm", materialId: "MAT002", qty: 800, uom: "Kg", unitPrice: 25000, total: 20000000, qtyReceived: 400, qtyRejected: 0 },
  ]},
  { id: "PRC004", code: "PO-2026-004", vendorId: "VND003", vendor: "PT Merk Paint", projectId: "PRJ001", date: "2026-10-01", deliveryDate: "2026-10-08", status: "Sent", total: 6250000, approvedBy: null, items: [
    { id: "POI006", material: "Cat Epoxy Primer", materialId: "MAT005", qty: 50, uom: "Liter", unitPrice: 125000, total: 6250000, qtyReceived: 0, qtyRejected: 0 },
  ]},
];

// --- GOODS RECEIPTS ---
export const goodsReceipts = [
  { id: "GR001", code: "GR-2026-001", poId: "PRC001", vendor: "PT Krakatau Steel", receivedDate: "2026-09-23", receivedBy: "Gudang Andi", status: "Accepted", items: [
    { material: "Plat Baja 6mm", qty: 3600, uom: "Kg", qcStatus: "Pass", notes: "Sesuai spesifikasi" },
    { material: "Plat Baja 8mm", qty: 800, uom: "Kg", qcStatus: "Pass", notes: "Sesuai spesifikasi" },
  ]},
  { id: "GR002", code: "GR-2026-002", poId: "PRC002", vendor: "PT Tira Austenite", receivedDate: "2026-09-18", receivedBy: "Gudang Andi", status: "Accepted", items: [
    { material: "Ball Valve 3 inch", qty: 8, uom: "Pcs", qcStatus: "Pass", notes: "" },
  ]},
  { id: "GR003", code: "GR-2026-003", poId: "PRC003", vendor: "PT Krakatau Steel", receivedDate: "2026-10-20", receivedBy: "Gudang Budi", status: "Partial", items: [
    { material: "Plat Baja 6mm", qty: 1800, uom: "Kg", qcStatus: "Pass", notes: "Partial delivery" },
    { material: "Plat Baja 8mm", qty: 400, uom: "Kg", qcStatus: "Pass", notes: "Partial delivery" },
  ]},
];

// --- INVENTORY ---
export const inventory = [
  { id: "INV001", materialId: "MAT001", material: "Plat Baja 6mm", warehouse: "GDG-01", available: 920, reserved: 1200, qualityHold: 0, total: 2120, uom: "Kg", lastUpdated: "2026-10-14" },
  { id: "INV002", materialId: "MAT002", material: "Plat Baja 8mm", warehouse: "GDG-01", available: 400, reserved: 400, qualityHold: 0, total: 800, uom: "Kg", lastUpdated: "2026-10-20" },
  { id: "INV003", materialId: "MAT004", material: "Ball Valve 3 inch", warehouse: "GDG-02", available: 4, reserved: 4, qualityHold: 0, total: 8, uom: "Pcs", lastUpdated: "2026-09-18" },
  { id: "INV004", materialId: "MAT005", material: "Cat Epoxy Primer", warehouse: "GDG-02", available: 0, reserved: 0, qualityHold: 0, total: 0, uom: "Liter", lastUpdated: "2026-10-01" },
  { id: "INV005", materialId: "MAT003", material: "Pipa SCH40 3 inch", warehouse: "GDG-01", available: 6, reserved: 12, qualityHold: 0, total: 18, uom: "Meter", lastUpdated: "2026-10-05" },
];

// --- INVENTORY TRANSACTIONS ---
export const inventoryTransactions = [
  { id: "IT001", date: "2026-09-23", type: "Receipt", materialId: "MAT001", material: "Plat Baja 6mm", qty: 3600, uom: "Kg", reference: "GR-2026-001", warehouse: "GDG-01", user: "Gudang Andi", balanceBefore: 0, balanceAfter: 3600 },
  { id: "IT002", date: "2026-09-23", type: "Receipt", materialId: "MAT002", material: "Plat Baja 8mm", qty: 800, uom: "Kg", reference: "GR-2026-001", warehouse: "GDG-01", user: "Gudang Andi", balanceBefore: 0, balanceAfter: 800 },
  { id: "IT003", date: "2026-10-05", type: "Issue", materialId: "MAT001", material: "Plat Baja 6mm", qty: 1800, uom: "Kg", reference: "WO-2026-001", warehouse: "GDG-01", user: "Gudang Budi", balanceBefore: 3600, balanceAfter: 1800 },
  { id: "IT004", date: "2026-10-05", type: "Issue", materialId: "MAT002", material: "Plat Baja 8mm", qty: 400, uom: "Kg", reference: "WO-2026-001", warehouse: "GDG-01", user: "Gudang Budi", balanceBefore: 800, balanceAfter: 400 },
  { id: "IT005", date: "2026-10-20", type: "Receipt", materialId: "MAT001", material: "Plat Baja 6mm", qty: 1800, uom: "Kg", reference: "GR-2026-003", warehouse: "GDG-01", user: "Gudang Budi", balanceBefore: 1800, balanceAfter: 3600 },
  { id: "IT006", date: "2026-10-20", type: "Issue", materialId: "MAT001", material: "Plat Baja 6mm", qty: 880, uom: "Kg", reference: "WO-2026-003", warehouse: "GDG-01", user: "Gudang Budi", balanceBefore: 3600, balanceAfter: 2720 },
];

// --- MRP ---
export const mrpData = [
  { id: "MRP001", material: "Plat Baja 6mm", materialId: "MAT001", projectId: "PRJ001", productionOrderId: "PO001", grossRequirement: 1890, onHand: 920, reserved: 1200, scheduledReceipt: 0, netRequirement: 2170, status: "Shortage", requiredDate: "2026-10-25", leadTime: 14, recommendedPO: 2200 },
  { id: "MRP002", material: "Cat Epoxy Primer", materialId: "MAT005", projectId: "PRJ001", productionOrderId: "PO001", grossRequirement: 55, onHand: 0, reserved: 0, scheduledReceipt: 0, netRequirement: 55, status: "Shortage", requiredDate: "2026-11-01", leadTime: 5, recommendedPO: 60 },
  { id: "MRP003", material: "Pipa SCH40 3 inch", materialId: "MAT003", projectId: "PRJ001", productionOrderId: "PO001", grossRequirement: 12, onHand: 6, reserved: 12, scheduledReceipt: 0, netRequirement: 18, status: "Shortage", requiredDate: "2026-10-30", leadTime: 7, recommendedPO: 20 },
  { id: "MRP004", material: "Plat Baja 6mm", materialId: "MAT001", projectId: "PRJ002", productionOrderId: "PO002", grossRequirement: 1260, onHand: 920, reserved: 1200, scheduledReceipt: 1800, netRequirement: 0, status: "OK", requiredDate: "2026-11-15", leadTime: 14, recommendedPO: 0 },
  { id: "MRP005", material: "Ball Valve 3 inch", materialId: "MAT004", projectId: "PRJ002", productionOrderId: "PO002", grossRequirement: 6, onHand: 4, reserved: 4, scheduledReceipt: 0, netRequirement: 6, status: "Shortage", requiredDate: "2026-11-20", leadTime: 7, recommendedPO: 6 },
];

// --- QC INSPECTIONS ---
export const qcInspections = [
  { id: "QCI001", code: "QCI-2026-001", workOrderId: "WO001", serial: "SN-TK-001", operation: "Fit Up & Welding", inspector: "QC Andi", date: "2026-10-11", status: "Pass", criteria: "Visual inspection, dimensi sesuai drawing", result: "Lulus semua kriteria", notes: "" },
  { id: "QCI002", code: "QCI-2026-002", workOrderId: "WO002", serial: "SN-TK-001", operation: "NDT / Radiography", inspector: "QC Andi", date: "2026-10-12", status: "Pending", criteria: "RT 100% sambungan utama", result: null, notes: "Menunggu hasil film" },
  { id: "QCI003", code: "QCI-2026-003", workOrderId: "WO004", serial: "SN-TT-001", operation: "Chassis Preparation", inspector: "QC Budi", date: "2026-10-24", status: "Pass", criteria: "Dimensi frame, alignment", result: "Lulus", notes: "" },
  { id: "QCI004", code: "QCI-2026-004", workOrderId: null, serial: "SN-TK-001", operation: "Hydrostatic Test", inspector: "QC Andi", date: "2026-10-05", status: "Fail", criteria: "Tekanan 1.5x design pressure selama 1 jam", result: "Ditemukan kebocoran di manhole flange", notes: "Perlu perbaikan gasket dan re-torque bolt" },
];

// --- NCR ---
export const ncrs = [
  { id: "NCR001", code: "NCR-2026-001", qcInspectionId: "QCI004", serial: "SN-TK-001", title: "Kebocoran Manhole Flange", category: "Fabrication Defect", severity: "Major", description: "Ditemukan kebocoran pada manhole flange saat hydrostatic test tekanan 1.5x design pressure", disposition: "Rework", rootCause: "Gasket tidak terpasang sempurna, torque bolt tidak sesuai spesifikasi", correctiveAction: "Ganti gasket, torque ulang semua bolt sesuai torque chart", pic: "Supri Production", dueDate: "2026-10-20", status: "Resolved", closedDate: "2026-10-19" },
  { id: "NCR002", code: "NCR-2026-002", qcInspectionId: null, serial: "SN-TK-002", title: "Undercut Welding Joint", category: "Welding Defect", severity: "Minor", description: "Ditemukan undercut pada sambungan longitudinal shell", disposition: "Rework", rootCause: "Parameter welding tidak sesuai WPS", correctiveAction: "Grinding dan build up welding sesuai WPS", pic: "Budi Welder", dueDate: "2026-10-25", status: "Open", closedDate: null },
];

// --- REWORK ORDERS ---
export const reworkOrders = [
  { id: "RW001", code: "RW-2026-001", ncrId: "NCR001", serial: "SN-TK-001", operation: "Repair Gasket & Re-torque Bolt", assignedTo: "Roni Mechanic", startDate: "2026-10-17", completedDate: "2026-10-19", status: "Completed", result: "Re-inspection Pass", laborHours: 4, notes: "Gasket diganti, semua bolt di-torque sesuai spesifikasi" },
];

// --- INVOICES ---
export const invoices = [
  { id: "INV001", code: "INV-2026-001", projectId: "PRJ001", salesOrderId: "SO001", customer: "PT Pertamina Trans Kontinental", date: "2026-08-10", dueDate: "2026-09-10", type: "Down Payment", amount: 555000000, taxAmount: 0, totalAmount: 555000000, status: "Paid", paidDate: "2026-08-25", paidAmount: 555000000, notes: "DP 30%" },
  { id: "INV002", code: "INV-2026-002", projectId: "PRJ001", salesOrderId: "SO001", customer: "PT Pertamina Trans Kontinental", date: "2026-10-01", dueDate: "2026-11-01", type: "Progress Billing", amount: 740000000, taxAmount: 0, totalAmount: 740000000, status: "Partially Paid", paidDate: "2026-10-10", paidAmount: 400000000, notes: "Progress billing 40%" },
  { id: "INV003", code: "INV-2026-003", projectId: "PRJ002", salesOrderId: "SO002", customer: "PT Astra Honda Motor", date: "2026-09-20", dueDate: "2026-10-20", type: "Down Payment", amount: 480000000, taxAmount: 0, totalAmount: 480000000, status: "Paid", paidDate: "2026-10-05", paidAmount: 480000000, notes: "DP 20%" },
  { id: "INV004", code: "INV-2026-004", projectId: "PRJ001", salesOrderId: "SO001", customer: "PT Pertamina Trans Kontinental", date: "2026-12-01", dueDate: "2026-12-31", type: "Final Billing", amount: 555000000, taxAmount: 0, totalAmount: 555000000, status: "Unpaid", paidDate: null, paidAmount: 0, notes: "Final billing 30%" },
];

// --- PAYMENTS ---
export const payments = [
  { id: "PAY001", invoiceId: "INV001", date: "2026-08-25", amount: 555000000, method: "Transfer", reference: "TRF-PTK-001", notes: "" },
  { id: "PAY002", invoiceId: "INV002", date: "2026-10-10", amount: 400000000, method: "Transfer", reference: "TRF-PTK-002", notes: "Partial payment" },
  { id: "PAY003", invoiceId: "INV003", date: "2026-10-05", amount: 480000000, method: "Transfer", reference: "TRF-AHM-001", notes: "" },
];

// --- DELIVERY ORDERS ---
export const deliveryOrders = [
  { id: "DO001", code: "DO-2026-001", projectId: "PRJ003", salesOrderId: null, customer: "PT Pupuk Indonesia", deliveryDate: "2025-12-28", units: ["SN-TS-001"], transporter: "PT Andalas Cargo", driver: "Pak Joko", truckPlate: "B 1234 ABC", destinationAddress: "Jl. Thamrin No.1, Jakarta", status: "Delivered", invoiceId: null, notes: "Termasuk dokumen as-built" },
];

// --- PROJECT COSTS ---
export const projectCosts = [
  { projectId: "PRJ001", budgetMaterial: 800000000, budgetLabor: 250000000, budgetOverhead: 150000000, budgetSubcon: 100000000, budgetTotal: 1300000000, committedMaterial: 332250000, committedLabor: 0, committedSubcon: 0, actualMaterial: 98800000, actualLabor: 45000000, actualOverhead: 18000000, actualSubcon: 0, actualTotal: 161800000, etc: 1100000000, eac: 1261800000, forecastRevenue: 1850000000, forecastMargin: 588200000 },
  { projectId: "PRJ002", budgetMaterial: 1100000000, budgetLabor: 350000000, budgetOverhead: 200000000, budgetSubcon: 150000000, budgetTotal: 1800000000, committedMaterial: 132000000, committedLabor: 0, committedSubcon: 0, actualMaterial: 25200000, actualLabor: 12000000, actualOverhead: 5000000, actualSubcon: 0, actualTotal: 42200000, etc: 1700000000, eac: 1742200000, forecastRevenue: 2400000000, forecastMargin: 657800000 },
];

// --- USERS ---
export const users = [
  { id: "USR001", name: "Ahmad Faisal", email: "faisal@manggala.co.id", role: "Owner / Director", department: "Management", status: "Active" },
  { id: "USR002", name: "Reza Mahendra", email: "reza@manggala.co.id", role: "Project Manager", department: "Project", status: "Active" },
  { id: "USR003", name: "Eko Prasetyo", email: "eko@manggala.co.id", role: "Engineering", department: "Engineering", status: "Active" },
  { id: "USR004", name: "Hadi Susanto", email: "hadi@manggala.co.id", role: "Procurement", department: "Procurement", status: "Active" },
  { id: "USR005", name: "Supri Santoso", email: "supri@manggala.co.id", role: "Production Manager / Supervisor", department: "Production", status: "Active" },
  { id: "USR006", name: "Andi QC", email: "andi@manggala.co.id", role: "QC Inspector", department: "Quality", status: "Active" },
  { id: "USR007", name: "Sinta Dewi", email: "sinta@manggala.co.id", role: "Finance / Cost Control", department: "Finance", status: "Active" },
];

// --- AUDIT LOGS ---
export const auditLogs = [
  { id: "AL001", timestamp: "2026-10-14 09:12:33", user: "Eko Prasetyo", action: "Released", entity: "Engineering Document", entityCode: "DOC-ENG-001", detail: "Status changed from Approved to Released" },
  { id: "AL002", timestamp: "2026-10-12 14:35:01", user: "QC Andi", action: "Pass", entity: "QC Inspection", entityCode: "QCI-2026-001", detail: "QC Pass - Fit Up & Welding SN-TK-001" },
  { id: "AL003", timestamp: "2026-10-10 10:00:22", user: "Hadi Susanto", action: "Created", entity: "Purchase Order", entityCode: "PO-2026-004", detail: "PO dibuat, menunggu approval" },
  { id: "AL004", timestamp: "2026-10-09 16:45:00", user: "Sinta Dewi", action: "Partially Paid", entity: "Invoice", entityCode: "INV-2026-002", detail: "Payment received IDR 400.000.000" },
  { id: "AL005", timestamp: "2026-10-07 08:30:11", user: "Gudang Budi", action: "Issued", entity: "Inventory", entityCode: "IT006", detail: "Issue 880 Kg Plat Baja 6mm ke WO-2026-003" },
  { id: "AL006", timestamp: "2026-10-05 11:20:44", user: "QC Andi", action: "Fail", entity: "QC Inspection", entityCode: "QCI-2026-004", detail: "Hydrostatic test FAIL - kebocoran manhole" },
];

// --- NOTIFICATIONS ---
export const notifications = [
  { id: "N001", type: "warning", title: "Material Shortage", message: "Cat Epoxy Primer shortage untuk PRJ-2026-001", createdAt: "2026-10-14 08:00", read: false },
  { id: "N002", type: "alert", title: "PO Overdue", message: "PO-2026-004 melewati tanggal delivery yang dijanjikan", createdAt: "2026-10-13 09:00", read: false },
  { id: "N003", type: "info", title: "Work Order Assigned", message: "WO-2026-005 telah di-assign ke Budi Welder", createdAt: "2026-10-12 14:00", read: true },
  { id: "N004", type: "warning", title: "Invoice Due Soon", message: "INV-2026-004 jatuh tempo 31 Desember 2026", createdAt: "2026-10-10 10:00", read: true },
  { id: "N005", type: "success", title: "NCR Resolved", message: "NCR-2026-001 telah diselesaikan dan QC re-inspection Pass", createdAt: "2026-10-19 16:00", read: false },
];

// --- DASHBOARD SUMMARY ---
export const dashboardSummary = {
  activeProjects: 2,
  delayedProjects: 0,
  onHoldProjects: 0,
  completedProjects: 1,
  totalContractValue: 4250000000,
  forecastMargin: 1246000000,
  productionOrders: { total: 2, inProgress: 1, released: 1 },
  unitsReadyToShip: 0,
  unitsOnQCHold: 1,
  materialShortage: 4,
  invoiceOutstanding: 895000000,
  invoiceOverdue: 0,
  chartData: {
    projectProgress: [
      { month: "Aug", planned: 10, actual: 8 },
      { month: "Sep", planned: 25, actual: 22 },
      { month: "Oct", planned: 45, actual: 42 },
      { month: "Nov", planned: 65, actual: 0 },
      { month: "Dec", planned: 100, actual: 0 },
    ],
    costTrend: [
      { month: "Aug", budget: 100000000, actual: 0, committed: 0 },
      { month: "Sep", budget: 300000000, actual: 42000000, committed: 200000000 },
      { month: "Oct", budget: 600000000, actual: 161800000, committed: 332250000 },
      { month: "Nov", budget: 900000000, actual: 0, committed: 0 },
      { month: "Dec", budget: 1300000000, actual: 0, committed: 0 },
    ],
    woStatus: [
      { name: "Completed", value: 2, color: "#32D74B" },
      { name: "In Progress", value: 2, color: "#00E5FF" },
      { name: "Submitted QC", value: 1, color: "#FFD60A" },
      { name: "Draft", value: 0, color: "#98989D" },
    ],
  },
};

// ============================================================
// PROJECT TRACKER — TASK BREAKDOWN PER PROJECT
// ============================================================

export interface ProjectTask {
  id: string;
  milestoneId: string;
  projectId: string;
  nama: string;
  deskripsi: string;
  pic: string;
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  status: "Belum Mulai" | "Berjalan" | "Selesai" | "Tertahan" | "Terlambat";
  targetMulai: string;
  targetSelesai: string;
  aktualSelesai: string | null;
  persentase: number;
  bobot: number; // bobot dalam milestone (total = 100)
  estimasiJam: number;
  aktualJam: number;
  workOrderId: string | null;
  catatan: string;
  tags: string[];
}

// PRJ001 — Tangki BBM 16KL — Pertamina
export const projectTasks: ProjectTask[] = [
  // MS001 — Design Approval (bobot 10, completion 100%)
  {
    id: "T001", milestoneId: "MS001", projectId: "PRJ001",
    nama: "Review Spesifikasi Teknis", deskripsi: "Review dan klarifikasi spesifikasi teknis dari pelanggan",
    pic: "Eko Engineering", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-08-15", targetSelesai: "2026-08-20", aktualSelesai: "2026-08-19",
    persentase: 100, bobot: 30, estimasiJam: 8, aktualJam: 6,
    workOrderId: null, catatan: "Spesifikasi diklarifikasi via rapat online", tags: ["engineering", "review"]
  },
  {
    id: "T002", milestoneId: "MS001", projectId: "PRJ001",
    nama: "Buat General Arrangement Drawing", deskripsi: "Pembuatan drawing GA tangki 16KL sesuai spec pelanggan",
    pic: "Eko Engineering", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-08-20", targetSelesai: "2026-08-28", aktualSelesai: "2026-08-27",
    persentase: 100, bobot: 40, estimasiJam: 24, aktualJam: 22,
    workOrderId: null, catatan: "Drawing Rev.C disetujui pelanggan", tags: ["drawing", "engineering"]
  },
  {
    id: "T003", milestoneId: "MS001", projectId: "PRJ001",
    nama: "Approval Drawing dari Pelanggan", deskripsi: "Submit dan dapatkan approval resmi dari PT Pertamina",
    pic: "Reza PM", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-08-28", targetSelesai: "2026-09-01", aktualSelesai: "2026-09-03",
    persentase: 100, bobot: 30, estimasiJam: 4, aktualJam: 4,
    workOrderId: null, catatan: "Terlambat 2 hari karena revisi minor customer", tags: ["approval", "customer"]
  },

  // MS002 — Material Procurement (bobot 15, completion 100%)
  {
    id: "T004", milestoneId: "MS002", projectId: "PRJ001",
    nama: "Buat Material Requisition", deskripsi: "Identifikasi dan buat daftar kebutuhan material berdasarkan BOM",
    pic: "Hadi Procurement", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-09-03", targetSelesai: "2026-09-05", aktualSelesai: "2026-09-05",
    persentase: 100, bobot: 15, estimasiJam: 6, aktualJam: 5,
    workOrderId: null, catatan: "MR dibuat berdasarkan BOM Rev.C", tags: ["procurement", "MR"]
  },
  {
    id: "T005", milestoneId: "MS002", projectId: "PRJ001",
    nama: "Tender & Pemilihan Vendor Baja", deskripsi: "RFQ ke 3 vendor, evaluasi, dan pemilihan vendor terbaik",
    pic: "Hadi Procurement", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-09-05", targetSelesai: "2026-09-10", aktualSelesai: "2026-09-09",
    persentase: 100, bobot: 20, estimasiJam: 16, aktualJam: 14,
    workOrderId: null, catatan: "PT Krakatau Steel terpilih dengan harga terbaik", tags: ["procurement", "vendor"]
  },
  {
    id: "T006", milestoneId: "MS002", projectId: "PRJ001",
    nama: "Issue Purchase Order Plat Baja", deskripsi: "Penerbitan PO ke PT Krakatau Steel untuk plat 6mm dan 8mm",
    pic: "Hadi Procurement", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-09-09", targetSelesai: "2026-09-11", aktualSelesai: "2026-09-10",
    persentase: 100, bobot: 15, estimasiJam: 4, aktualJam: 3,
    workOrderId: null, catatan: "PO-2026-001 diterbitkan, nilai Rp 180jt", tags: ["PO", "procurement"]
  },
  {
    id: "T007", milestoneId: "MS002", projectId: "PRJ001",
    nama: "Penerimaan & Inspeksi Material", deskripsi: "Terima material dari vendor, inspeksi dimensi dan sertifikat material",
    pic: "Gudang Andi", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-09-22", targetSelesai: "2026-09-25", aktualSelesai: "2026-09-25",
    persentase: 100, bobot: 30, estimasiJam: 12, aktualJam: 10,
    workOrderId: null, catatan: "Semua material diterima dan lulus QC incoming", tags: ["gudang", "QC"]
  },
  {
    id: "T008", milestoneId: "MS002", projectId: "PRJ001",
    nama: "Issue Material ke Workshop", deskripsi: "Pengeluaran material dari gudang ke area fabrikasi",
    pic: "Gudang Budi", prioritas: "Sedang", status: "Selesai",
    targetMulai: "2026-09-25", targetSelesai: "2026-09-26", aktualSelesai: "2026-09-26",
    persentase: 100, bobot: 20, estimasiJam: 4, aktualJam: 4,
    workOrderId: "WO001", catatan: "Material issued sesuai WO-2026-001", tags: ["gudang", "issue"]
  },

  // MS003 — Fabrication 50% (bobot 25, completion 60%)
  {
    id: "T009", milestoneId: "MS003", projectId: "PRJ001",
    nama: "Marking & Cutting Plat", deskripsi: "Marking dimensi dan cutting plat sesuai shop drawing",
    pic: "Budi Welder", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-09-27", targetSelesai: "2026-10-02", aktualSelesai: "2026-10-01",
    persentase: 100, bobot: 15, estimasiJam: 16, aktualJam: 14,
    workOrderId: "WO001", catatan: "Cutting selesai lebih cepat 1 hari", tags: ["fabrikasi", "cutting"]
  },
  {
    id: "T010", milestoneId: "MS003", projectId: "PRJ001",
    nama: "Rolling Shell Tangki", deskripsi: "Proses rolling plat menjadi bentuk silinder tangki",
    pic: "Budi Welder", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-10-01", targetSelesai: "2026-10-05", aktualSelesai: "2026-10-04",
    persentase: 100, bobot: 15, estimasiJam: 20, aktualJam: 18,
    workOrderId: "WO001", catatan: "Rolling 2 shell selesai, dimensi OK", tags: ["fabrikasi", "rolling"]
  },
  {
    id: "T011", milestoneId: "MS003", projectId: "PRJ001",
    nama: "Fit-Up & Welding Shell", deskripsi: "Pemasangan dan pengelasan sambungan longitudinal dan circumferential",
    pic: "Roni Welder", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-10-04", targetSelesai: "2026-10-12", aktualSelesai: "2026-10-11",
    persentase: 100, bobot: 25, estimasiJam: 40, aktualJam: 42,
    workOrderId: "WO001", catatan: "WPS-001 digunakan, semua sambungan selesai", tags: ["welding", "fabrikasi"]
  },
  {
    id: "T012", milestoneId: "MS003", projectId: "PRJ001",
    nama: "NDT / Radiographic Test", deskripsi: "Pengujian NDT 100% sambungan utama sesuai standar",
    pic: "QC Andi", prioritas: "Tinggi", status: "Berjalan",
    targetMulai: "2026-10-11", targetSelesai: "2026-10-14", aktualSelesai: null,
    persentase: 70, bobot: 20, estimasiJam: 8, aktualJam: 5,
    workOrderId: "WO002", catatan: "RT 70% selesai, menunggu hasil film terakhir", tags: ["QC", "NDT"]
  },
  {
    id: "T013", milestoneId: "MS003", projectId: "PRJ001",
    nama: "Hydrostatic Test Unit-1", deskripsi: "Uji tekanan hidrostatik 1.5x design pressure selama 1 jam",
    pic: "QC Andi", prioritas: "Tinggi", status: "Tertahan",
    targetMulai: "2026-10-14", targetSelesai: "2026-10-15", aktualSelesai: null,
    persentase: 0, bobot: 15, estimasiJam: 6, aktualJam: 0,
    workOrderId: null, catatan: "Menunggu hasil RT selesai sebelum hydro test", tags: ["QC", "hydrotest"]
  },
  {
    id: "T014", milestoneId: "MS003", projectId: "PRJ001",
    nama: "Welding Unit-2 (Shell)", deskripsi: "Pengelasan shell tangki unit kedua",
    pic: "Roni Welder", prioritas: "Sedang", status: "Berjalan",
    targetMulai: "2026-10-10", targetSelesai: "2026-10-20", aktualSelesai: null,
    persentase: 55, bobot: 10, estimasiJam: 40, aktualJam: 22,
    workOrderId: "WO003", catatan: "Progress 55%, on track", tags: ["welding", "fabrikasi"]
  },

  // MS004 — Fabrication Complete (bobot 25, completion 0%)
  {
    id: "T015", milestoneId: "MS004", projectId: "PRJ001",
    nama: "Surface Preparation & Blasting", deskripsi: "Sand blasting Sa 2.5 untuk semua permukaan tangki",
    pic: "Tim Blasting", prioritas: "Sedang", status: "Belum Mulai",
    targetMulai: "2026-10-25", targetSelesai: "2026-10-29", aktualSelesai: null,
    persentase: 0, bobot: 20, estimasiJam: 16, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["surface", "blasting"]
  },
  {
    id: "T016", milestoneId: "MS004", projectId: "PRJ001",
    nama: "Painting & Coating", deskripsi: "Pengecatan epoxy primer + topcoat sesuai spec",
    pic: "Tim Painting", prioritas: "Sedang", status: "Belum Mulai",
    targetMulai: "2026-10-29", targetSelesai: "2026-11-05", aktualSelesai: null,
    persentase: 0, bobot: 20, estimasiJam: 20, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["painting", "coating"]
  },
  {
    id: "T017", milestoneId: "MS004", projectId: "PRJ001",
    nama: "Instalasi Piping & Valve", deskripsi: "Pemasangan sistem perpipaan, valve, dan aksesoris tangki",
    pic: "Tim Piping", prioritas: "Sedang", status: "Belum Mulai",
    targetMulai: "2026-11-05", targetSelesai: "2026-11-15", aktualSelesai: null,
    persentase: 0, bobot: 30, estimasiJam: 24, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["piping", "assembly"]
  },
  {
    id: "T018", milestoneId: "MS004", projectId: "PRJ001",
    nama: "Final Assembly & Nameplate", deskripsi: "Pemasangan nameplate, label, dan accessories terakhir",
    pic: "Supri Production", prioritas: "Rendah", status: "Belum Mulai",
    targetMulai: "2026-11-15", targetSelesai: "2026-11-18", aktualSelesai: null,
    persentase: 0, bobot: 10, estimasiJam: 8, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["assembly", "finishing"]
  },
  {
    id: "T019", milestoneId: "MS004", projectId: "PRJ001",
    nama: "Hydrostatic Test Unit-2", deskripsi: "Uji tekanan unit kedua setelah fabrikasi selesai",
    pic: "QC Andi", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2026-11-18", targetSelesai: "2026-11-20", aktualSelesai: null,
    persentase: 0, bobot: 20, estimasiJam: 6, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["QC", "hydrotest"]
  },

  // MS005 — Final Inspection & Delivery (bobot 25, completion 0%)
  {
    id: "T020", milestoneId: "MS005", projectId: "PRJ001",
    nama: "Pre-delivery Inspection", deskripsi: "Final inspection sebelum pengiriman, cek semua parameter",
    pic: "QC Andi", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2026-12-10", targetSelesai: "2026-12-13", aktualSelesai: null,
    persentase: 0, bobot: 30, estimasiJam: 12, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["QC", "final inspection"]
  },
  {
    id: "T021", milestoneId: "MS005", projectId: "PRJ001",
    nama: "Penerbitan Dokumen Akhir", deskripsi: "Siapkan as-built drawing, sertifikat, dan dokumen operasional",
    pic: "Eko Engineering", prioritas: "Sedang", status: "Belum Mulai",
    targetMulai: "2026-12-13", targetSelesai: "2026-12-20", aktualSelesai: null,
    persentase: 0, bobot: 25, estimasiJam: 16, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["dokumen", "as-built"]
  },
  {
    id: "T022", milestoneId: "MS005", projectId: "PRJ001",
    nama: "Pengiriman & Serah Terima", deskripsi: "Mobilisasi unit ke lokasi pelanggan dan serah terima resmi",
    pic: "Reza PM", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2026-12-20", targetSelesai: "2026-12-31", aktualSelesai: null,
    persentase: 0, bobot: 45, estimasiJam: 20, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["delivery", "serah terima"]
  },

  // PRJ002 — Truk Tangki Kimia 10KL — AHM
  {
    id: "T023", milestoneId: "MS006", projectId: "PRJ002",
    nama: "Penerbitan Engineering Package", deskripsi: "Rilis complete engineering package ke produksi",
    pic: "Dewi Engineering", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-10-01", targetSelesai: "2026-10-14", aktualSelesai: "2026-10-14",
    persentase: 100, bobot: 50, estimasiJam: 40, aktualJam: 38,
    workOrderId: null, catatan: "Engineering package Rev.A dirilis", tags: ["engineering"]
  },
  {
    id: "T024", milestoneId: "MS006", projectId: "PRJ002",
    nama: "Approval Internal Engineering", deskripsi: "Review dan approval Chief Engineer",
    pic: "Chief Eng", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-10-12", targetSelesai: "2026-10-14", aktualSelesai: "2026-10-14",
    persentase: 100, bobot: 50, estimasiJam: 8, aktualJam: 6,
    workOrderId: null, catatan: "Approved tanpa revisi", tags: ["approval", "engineering"]
  },
  {
    id: "T025", milestoneId: "MS007", projectId: "PRJ002",
    nama: "Persiapan & Modifikasi Chassis Unit-1", deskripsi: "Persiapan chassis truk untuk mounting tangki",
    pic: "Heri Mechanic", prioritas: "Tinggi", status: "Selesai",
    targetMulai: "2026-10-20", targetSelesai: "2026-10-25", aktualSelesai: "2026-10-24",
    persentase: 100, bobot: 20, estimasiJam: 8, aktualJam: 9,
    workOrderId: "WO004", catatan: "Selesai, alignment OK", tags: ["assembly", "chassis"]
  },
  {
    id: "T026", milestoneId: "MS007", projectId: "PRJ002",
    nama: "Fabrikasi Tangki Kimia Unit-1", deskripsi: "Fabrikasi vessel tangki kimia stainless 316L",
    pic: "Budi Welder", prioritas: "Tinggi", status: "Berjalan",
    targetMulai: "2026-10-25", targetSelesai: "2026-11-10", aktualSelesai: null,
    persentase: 40, bobot: 40, estimasiJam: 30, aktualJam: 12,
    workOrderId: "WO005", catatan: "Progress welding 40%", tags: ["fabrikasi", "welding"]
  },
  {
    id: "T027", milestoneId: "MS007", projectId: "PRJ002",
    nama: "Mounting Tangki ke Chassis Unit-1", deskripsi: "Pemasangan tangki ke chassis dan pengencangan",
    pic: "Heri Mechanic", prioritas: "Sedang", status: "Belum Mulai",
    targetMulai: "2026-11-10", targetSelesai: "2026-11-20", aktualSelesai: null,
    persentase: 0, bobot: 25, estimasiJam: 16, aktualJam: 0,
    workOrderId: null, catatan: "Menunggu fabrikasi tangki selesai", tags: ["assembly", "mounting"]
  },
  {
    id: "T028", milestoneId: "MS007", projectId: "PRJ002",
    nama: "Persiapan Chassis Unit-2 & Unit-3", deskripsi: "Persiapan chassis untuk unit 2 dan 3 secara paralel",
    pic: "Heri Mechanic", prioritas: "Sedang", status: "Berjalan",
    targetMulai: "2026-10-28", targetSelesai: "2026-11-10", aktualSelesai: null,
    persentase: 20, bobot: 15, estimasiJam: 16, aktualJam: 3,
    workOrderId: null, catatan: "Baru mulai, on track", tags: ["assembly", "chassis"]
  },
  {
    id: "T029", milestoneId: "MS008", projectId: "PRJ002",
    nama: "Fabrikasi & Assembly Unit-2", deskripsi: "Fabrikasi tangki dan assembly lengkap unit kedua",
    pic: "Tim Produksi", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2026-12-01", targetSelesai: "2027-01-20", aktualSelesai: null,
    persentase: 0, bobot: 35, estimasiJam: 80, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["fabrikasi", "assembly"]
  },
  {
    id: "T030", milestoneId: "MS008", projectId: "PRJ002",
    nama: "Fabrikasi & Assembly Unit-3", deskripsi: "Fabrikasi tangki dan assembly lengkap unit ketiga",
    pic: "Tim Produksi", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2027-01-01", targetSelesai: "2027-02-15", aktualSelesai: null,
    persentase: 0, bobot: 35, estimasiJam: 80, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["fabrikasi", "assembly"]
  },
  {
    id: "T031", milestoneId: "MS008", projectId: "PRJ002",
    nama: "QC Semua Unit (Inspeksi Final)", deskripsi: "Final inspection 3 unit sebelum delivery",
    pic: "QC Budi", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2027-02-15", targetSelesai: "2027-02-25", aktualSelesai: null,
    persentase: 0, bobot: 30, estimasiJam: 24, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["QC", "final inspection"]
  },
  {
    id: "T032", milestoneId: "MS009", projectId: "PRJ002",
    nama: "Pengurusan Dokumen Kendaraan", deskripsi: "STNK, KIR, dan dokumen kendaraan niaga",
    pic: "Admin", prioritas: "Sedang", status: "Belum Mulai",
    targetMulai: "2027-03-01", targetSelesai: "2027-03-20", aktualSelesai: null,
    persentase: 0, bobot: 30, estimasiJam: 20, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["dokumen", "administrasi"]
  },
  {
    id: "T033", milestoneId: "MS009", projectId: "PRJ002",
    nama: "Pengiriman 3 Unit ke AHM", deskripsi: "Mobilisasi dan serah terima 3 unit truk tangki ke pelanggan",
    pic: "Sinta PM", prioritas: "Tinggi", status: "Belum Mulai",
    targetMulai: "2027-03-20", targetSelesai: "2027-03-31", aktualSelesai: null,
    persentase: 0, bobot: 70, estimasiJam: 16, aktualJam: 0,
    workOrderId: null, catatan: "", tags: ["delivery", "serah terima"]
  },
];

// --- PROJECT ACTIVITY LOG ---
export interface ProjectActivity {
  id: string;
  projectId: string;
  waktu: string;
  pengguna: string;
  aksi: string;
  detail: string;
  tipe: "info" | "success" | "warning" | "danger";
}

export const projectActivities: ProjectActivity[] = [
  { id: "PA001", projectId: "PRJ001", waktu: "2026-10-14 16:30", pengguna: "QC Andi", aksi: "NDT Dimulai", detail: "Radiographic test 70% sambungan utama SN-TK-001 dimulai", tipe: "info" },
  { id: "PA002", projectId: "PRJ001", waktu: "2026-10-12 14:20", pengguna: "Roni Welder", aksi: "Welding Selesai", detail: "Fit-up & welding shell unit-1 selesai, siap NDT", tipe: "success" },
  { id: "PA003", projectId: "PRJ001", waktu: "2026-10-11 09:00", pengguna: "QC Andi", aksi: "QC Pass", detail: "Inspeksi fit-up SN-TK-001 lulus semua kriteria", tipe: "success" },
  { id: "PA004", projectId: "PRJ001", waktu: "2026-10-05 11:20", pengguna: "QC Andi", aksi: "QC Fail", detail: "Hydrostatic test gagal — kebocoran manhole flange, NCR-2026-001 dibuat", tipe: "danger" },
  { id: "PA005", projectId: "PRJ001", waktu: "2026-10-01 08:00", pengguna: "Budi Welder", aksi: "Cutting Selesai", detail: "Marking & cutting plat selesai lebih cepat 1 hari", tipe: "success" },
  { id: "PA006", projectId: "PRJ001", waktu: "2026-09-25 15:00", pengguna: "Gudang Andi", aksi: "Material Diterima", detail: "GR-2026-001: 3.600 Kg plat 6mm + 800 Kg plat 8mm diterima, QC Pass", tipe: "success" },
  { id: "PA007", projectId: "PRJ001", waktu: "2026-09-10 10:00", pengguna: "Hadi Procurement", aksi: "PO Diterbitkan", detail: "PO-2026-001 ke PT Krakatau Steel Rp 180jt, target kirim 24 Sep", tipe: "info" },
  { id: "PA008", projectId: "PRJ001", waktu: "2026-09-03 13:00", pengguna: "Eko Engineering", aksi: "Drawing Disetujui", detail: "GA Drawing Rev.C disetujui PT Pertamina, siap release ke produksi", tipe: "success" },
  { id: "PA009", projectId: "PRJ002", waktu: "2026-10-24 17:00", pengguna: "Heri Mechanic", aksi: "Chassis Selesai", detail: "Modifikasi chassis unit-1 selesai, alignment verified", tipe: "success" },
  { id: "PA010", projectId: "PRJ002", waktu: "2026-10-14 09:00", pengguna: "Chief Eng", aksi: "Engineering Dirilis", detail: "Complete engineering package Rev.A dirilis ke produksi", tipe: "success" },
];
