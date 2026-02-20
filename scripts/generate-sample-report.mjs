import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Colors ──────────────────────────────────────────────────────────────
const COLORS = {
  emerald: [16, 185, 129],       // #10b981
  emeraldDark: [5, 150, 105],    // #059669
  emeraldLight: [209, 250, 229], // #d1fae5
  red: [239, 68, 68],            // #ef4444
  redLight: [254, 226, 226],     // #fee2e2
  amber: [245, 158, 11],         // #f59e0b
  amberLight: [254, 243, 199],   // #fef3c7
  darkText: [24, 24, 27],        // #18181b
  medText: [63, 63, 70],         // #3f3f46
  lightText: [113, 113, 122],    // #71717a
  tableHeader: [244, 244, 245],  // #f4f4f5
  tableBorder: [228, 228, 231],  // #e4e4e7
  white: [255, 255, 255],
  bgLight: [250, 250, 250],      // #fafafa
  photoBorder: [200, 205, 215],  // #c8cdd7
};

function setColor(doc, colorArr) {
  doc.setTextColor(colorArr[0], colorArr[1], colorArr[2]);
}

function setFill(doc, colorArr) {
  doc.setFillColor(colorArr[0], colorArr[1], colorArr[2]);
}

function setDraw(doc, colorArr) {
  doc.setDrawColor(colorArr[0], colorArr[1], colorArr[2]);
}

// ── Page setup ──────────────────────────────────────────────────────────
const PAGE_WIDTH = 210;  // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function loadImageBuffer(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (err) {
    console.warn(`Warning: Could not load image ${filePath}: ${err.message}`);
    return null;
  }
}

function loadImageAsBase64(filePath) {
  const buffer = loadImageBuffer(filePath);
  return buffer ? buffer.toString('base64') : null;
}

// Parse JPEG dimensions from buffer header
function getJpegDimensions(buffer) {
  try {
    let offset = 2; // Skip SOI marker (0xFFD8)
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xFF) break;
      const marker = buffer[offset + 1];
      // SOF markers (0xC0-0xC3, 0xC5-0xC7, 0xC9-0xCB, 0xCD-0xCF)
      if (
        (marker >= 0xC0 && marker <= 0xC3) ||
        (marker >= 0xC5 && marker <= 0xC7) ||
        (marker >= 0xC9 && marker <= 0xCB) ||
        (marker >= 0xCD && marker <= 0xCF)
      ) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const segLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segLength;
    }
  } catch (e) { /* fallback */ }
  return null;
}

// Calculate "object-fit: contain" dimensions (fit within cell, maintain aspect ratio)
function fitContain(imgW, imgH, cellW, cellH) {
  const imgAspect = imgW / imgH;
  const cellAspect = cellW / cellH;
  let drawW, drawH, drawX, drawY;
  if (imgAspect > cellAspect) {
    // Image is wider than cell - fit to width, center vertically
    drawW = cellW;
    drawH = cellW / imgAspect;
    drawX = 0;
    drawY = (cellH - drawH) / 2;
  } else {
    // Image is taller than cell - fit to height, center horizontally
    drawH = cellH;
    drawW = cellH * imgAspect;
    drawX = (cellW - drawW) / 2;
    drawY = 0;
  }
  return { drawX, drawY, drawW, drawH };
}

function generateReport() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 0;

  // ── Load inspection photos (safe only: no brand names, no identifiable designs) ──
  const DIR1 = '/tmp/inspection-photos';   // GRAN LIVING inspection
  const DIR2 = '/tmp/inspection-photos2';  // VOLERO inspection
  const inspectionPhotos = [
    // Measurements (from VOLERO - plain green texture, very clean)
    { file: path.join(DIR2, 'sizeFrontPhoto.jpg'), label: 'Size Measurement (Front)' },
    { file: path.join(DIR2, 'sizeSidePhoto.jpg'), label: 'Size Measurement (Side)' },
    { file: path.join(DIR2, 'moisturePhoto.jpg'), label: 'Moisture Check' },
    { file: path.join(DIR1, 'pileHeightPhoto.jpg'), label: 'Pile Height Check' },
    // Equipment & Process (from both - equipment focus, no design visible)
    { file: path.join(DIR2, 'metalCheckingPhoto.jpg'), label: 'Metal Detection' },
    { file: path.join(DIR1, 'metalCheckingPhoto.jpg'), label: 'Metal Detection (Close-up)' },
    { file: path.join(DIR1, 'productNetWeightPhoto.jpg'), label: 'Product Net Weight' },
    { file: path.join(DIR1, 'stackedGoodsPhoto.jpg'), label: 'Stacked Goods' },
  ];

  // Pre-load all photos with dimensions
  const loadedPhotos = inspectionPhotos.map((photo) => {
    const buffer = loadImageBuffer(photo.file);
    if (!buffer) return null;
    const dims = getJpegDimensions(buffer);
    return {
      ...photo,
      base64: buffer.toString('base64'),
      width: dims ? dims.width : 1600,
      height: dims ? dims.height : 1200,
    };
  }).filter((p) => p !== null);

  console.log(`Loaded ${loadedPhotos.length} of ${inspectionPhotos.length} photos`);

  // ── Helper: draw top accent bar on new pages ─────────────────────────
  function drawAccentBar() {
    setFill(doc, COLORS.emerald);
    doc.rect(0, 0, PAGE_WIDTH, 3, 'F');
  }

  // ── Helper: check page break ──────────────────────────────────────────
  function checkPageBreak(neededHeight) {
    if (y + neededHeight > PAGE_HEIGHT - 25) {
      doc.addPage();
      drawAccentBar();
      y = MARGIN;
      return true;
    }
    return false;
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1: HEADER SECTION
  // ════════════════════════════════════════════════════════════════════════

  // Top accent bar
  drawAccentBar();

  y = 14;

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  setColor(doc, COLORS.darkText);
  doc.text('Sunrise Textiles Pvt. Ltd.', MARGIN, y);

  // Right side: Report ID and Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.lightText);
  doc.text('Document No', PAGE_WIDTH - MARGIN, y - 5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(doc, COLORS.darkText);
  doc.text('ST/IP/2026-0215', PAGE_WIDTH - MARGIN, y, { align: 'right' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.lightText);
  doc.text('15 February 2026', PAGE_WIDTH - MARGIN, y, { align: 'right' });

  // Title
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setColor(doc, COLORS.emeraldDark);
  doc.text('Quality Inspection Report', MARGIN, y);

  // Divider
  y += 4;
  setDraw(doc, COLORS.tableBorder);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  // ════════════════════════════════════════════════════════════════════════
  // INSPECTION DETAILS TABLE
  // ════════════════════════════════════════════════════════════════════════

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.darkText);
  doc.text('Inspection Details', MARGIN, y);

  y += 5;

  const detailsLeft = [
    ['Buyer', 'West Elm'],
    ['OPS Number', 'ST-26-832'],
    ['Design No', 'SW-442 (Hand Tufted Wool)'],
    ['Inspection Type', 'Final (Pre-shipment)'],
  ];
  const detailsRight = [
    ['Lot Size', '120 pcs'],
    ['Order Qty', '120 pcs'],
    ['Sample Size', '20 pcs'],
    ['AQL Level', '2.5 / Level II'],
  ];

  const colLeft = MARGIN;
  const colMid = MARGIN + CONTENT_WIDTH / 2;
  const labelWidth = 34;
  const labelWidthRight = 28;
  const rowHeight = 7;

  // Background for details
  setFill(doc, COLORS.bgLight);
  doc.roundedRect(MARGIN, y - 1, CONTENT_WIDTH, detailsLeft.length * rowHeight + 3, 2, 2, 'F');

  for (let i = 0; i < detailsLeft.length; i++) {
    const rowY = y + 4 + i * rowHeight;

    // Left column
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(doc, COLORS.lightText);
    doc.text(detailsLeft[i][0], colLeft + 4, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.darkText);
    doc.text(detailsLeft[i][1], colLeft + 4 + labelWidth, rowY);

    // Right column
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(doc, COLORS.lightText);
    doc.text(detailsRight[i][0], colMid + 4, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.darkText);
    doc.text(detailsRight[i][1], colMid + 4 + labelWidthRight, rowY);
  }

  y += detailsLeft.length * rowHeight + 7;

  // ════════════════════════════════════════════════════════════════════════
  // RESULT BANNER
  // ════════════════════════════════════════════════════════════════════════

  y += 3;
  const bannerH = 22;
  setFill(doc, COLORS.emeraldLight);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, bannerH, 3, 3, 'F');

  // Left border accent
  setFill(doc, COLORS.emerald);
  doc.roundedRect(MARGIN, y, 4, bannerH, 3, 3, 'F');
  doc.rect(MARGIN + 2, y, 2, bannerH, 'F');

  // Checkmark circle
  const circleX = MARGIN + 16;
  const circleY = y + bannerH / 2;
  setFill(doc, COLORS.emerald);
  doc.circle(circleX, circleY, 6, 'F');

  // Checkmark (drawn as lines)
  doc.setLineWidth(0.8);
  setDraw(doc, COLORS.white);
  doc.line(circleX - 3, circleY, circleX - 0.5, circleY + 2.5);
  doc.line(circleX - 0.5, circleY + 2.5, circleX + 3.5, circleY - 2.5);

  // PASSED text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(doc, COLORS.emeraldDark);
  doc.text('PASSED', MARGIN + 28, y + bannerH / 2 + 1.5, { baseline: 'middle' });

  // Subtitle with counts
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, COLORS.emerald);
  doc.text('Accepted: 19  |  Rejected: 1  |  Within AQL 2.5', MARGIN + 66, y + bannerH / 2 + 1.5, { baseline: 'middle' });

  y += bannerH + 5;

  // ════════════════════════════════════════════════════════════════════════
  // DEFECT SUMMARY TABLE
  // ════════════════════════════════════════════════════════════════════════

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.darkText);
  doc.text('Defect Summary', MARGIN, y);

  y += 5;

  const tableX = MARGIN;
  const tableW = CONTENT_WIDTH;
  const cols = [0, tableW * 0.32, tableW * 0.50, tableW * 0.70];
  const colWidths = [tableW * 0.32, tableW * 0.18, tableW * 0.20, tableW * 0.30];
  const thHeight = 8;
  const tdHeight = 8;

  // Table header
  setFill(doc, COLORS.emeraldDark);
  doc.roundedRect(tableX, y, tableW, thHeight, 1.5, 1.5, 'F');
  // Cover bottom corners
  doc.rect(tableX, y + thHeight - 1.5, tableW, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.white);
  const headers = ['Category', 'Found', 'AQL Limit', 'Status'];
  headers.forEach((h, i) => {
    doc.text(h, tableX + cols[i] + 6, y + 5.5);
  });

  y += thHeight;

  const defectRows = [
    { category: 'Critical', found: '0', limit: '0', status: 'Pass', color: COLORS.emerald, bgColor: null },
    { category: 'Major', found: '1', limit: '1', status: 'Pass', color: COLORS.emerald, bgColor: COLORS.bgLight },
    { category: 'Minor', found: '2', limit: '3', status: 'Pass', color: COLORS.emerald, bgColor: null },
  ];

  defectRows.forEach((row) => {
    // Alternating background
    if (row.bgColor) {
      setFill(doc, row.bgColor);
      doc.rect(tableX, y, tableW, tdHeight, 'F');
    }

    // Bottom border
    setDraw(doc, COLORS.tableBorder);
    doc.setLineWidth(0.2);
    doc.line(tableX, y + tdHeight, tableX + tableW, y + tdHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.darkText);
    doc.text(row.category, tableX + cols[0] + 6, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, COLORS.medText);
    doc.text(row.found, tableX + cols[1] + 6, y + 5.5);
    doc.text(row.limit, tableX + cols[2] + 6, y + 5.5);

    // Status badge
    const badgeW = 14;
    const badgeH = 5;
    const badgeX = tableX + cols[3] + 5;
    const badgeY = y + 1.5;
    setFill(doc, COLORS.emeraldLight);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    setColor(doc, COLORS.emeraldDark);
    doc.text('Pass', badgeX + badgeW / 2, badgeY + 3.5, { align: 'center' });

    y += tdHeight;
  });

  y += 8;

  // ════════════════════════════════════════════════════════════════════════
  // CHECKLIST RESULTS
  // ════════════════════════════════════════════════════════════════════════

  checkPageBreak(90);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.darkText);
  doc.text('Checklist Results', MARGIN, y);
  y += 5;

  const checklistSections = [
    {
      name: 'Construction',
      items: [
        { name: 'Warp Count (per 6 inches)', status: 'pass' },
        { name: 'Weft Count (per 6 inches)', status: 'pass' },
        { name: 'Pile Height', status: 'pass' },
        { name: 'GSM', status: 'pass' },
      ],
    },
    {
      name: 'Visual',
      items: [
        { name: 'Color Matching', status: 'minor', note: '1 minor' },
        { name: 'Pattern Alignment', status: 'pass' },
      ],
    },
    {
      name: 'Dimensions',
      items: [
        { name: 'Length', status: 'pass' },
        { name: 'Width', status: 'pass' },
        { name: 'Corner Squareness', status: 'pass' },
      ],
    },
    {
      name: 'Finishing',
      items: [
        { name: 'Binding', status: 'major', note: '1 major' },
        { name: 'Fringe', status: 'minor', note: '1 minor' },
        { name: 'Backing', status: 'pass' },
      ],
    },
    {
      name: 'Packing',
      items: [
        { name: 'Labels', status: 'pass' },
        { name: 'Poly Bag', status: 'pass' },
        { name: 'Carton', status: 'pass' },
      ],
    },
  ];

  checklistSections.forEach((section) => {
    checkPageBreak(12 + section.items.length * 6);

    // Section header
    setFill(doc, COLORS.tableHeader);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.darkText);
    doc.text(section.name, MARGIN + 5, y + 4.8);

    // Section overall status
    const sectionAllPass = section.items.every((item) => item.status === 'pass');
    const hasMajor = section.items.some((item) => item.status === 'major');
    if (sectionAllPass) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setColor(doc, COLORS.emerald);
      doc.text('ALL PASS', PAGE_WIDTH - MARGIN - 5, y + 4.8, { align: 'right' });
    } else if (hasMajor) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setColor(doc, COLORS.amber);
      doc.text('ISSUES NOTED', PAGE_WIDTH - MARGIN - 5, y + 4.8, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setColor(doc, COLORS.amber);
      doc.text('MINOR ISSUE', PAGE_WIDTH - MARGIN - 5, y + 4.8, { align: 'right' });
    }

    y += 8;

    section.items.forEach((item) => {
      // Divider line
      setDraw(doc, [240, 240, 240]);
      doc.setLineWidth(0.15);
      doc.line(MARGIN + 4, y + 5.5, PAGE_WIDTH - MARGIN - 4, y + 5.5);

      // Status indicator dot
      if (item.status === 'pass') {
        setFill(doc, COLORS.emerald);
      } else if (item.status === 'major') {
        setFill(doc, COLORS.red);
      } else {
        setFill(doc, COLORS.amber);
      }
      doc.circle(MARGIN + 8, y + 3.2, 1.5, 'F');

      // Item name
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      setColor(doc, COLORS.medText);
      doc.text(item.name, MARGIN + 14, y + 4);

      // Status text
      if (item.status === 'pass') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        setColor(doc, COLORS.emerald);
        doc.text('Pass', PAGE_WIDTH - MARGIN - 5, y + 4, { align: 'right' });
      } else if (item.status === 'major') {
        // Red badge
        const badgeW = 18;
        const badgeX = PAGE_WIDTH - MARGIN - 5 - badgeW;
        setFill(doc, COLORS.redLight);
        doc.roundedRect(badgeX, y + 0.5, badgeW, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        setColor(doc, COLORS.red);
        doc.text(item.note, badgeX + badgeW / 2, y + 3.8, { align: 'center' });
      } else {
        // Amber badge
        const badgeW = 18;
        const badgeX = PAGE_WIDTH - MARGIN - 5 - badgeW;
        setFill(doc, COLORS.amberLight);
        doc.roundedRect(badgeX, y + 0.5, badgeW, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        setColor(doc, COLORS.amber);
        doc.text(item.note, badgeX + badgeW / 2, y + 3.8, { align: 'center' });
      }

      y += 6;
    });

    y += 2;
  });

  y += 2;

  // ════════════════════════════════════════════════════════════════════════
  // DEFECT DETAIL
  // ════════════════════════════════════════════════════════════════════════

  checkPageBreak(55);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.darkText);
  doc.text('Defect Detail', MARGIN, y);
  y += 5;

  // Table header
  const dColWidths = [CONTENT_WIDTH * 0.07, CONTENT_WIDTH * 0.14, CONTENT_WIDTH * 0.38, CONTENT_WIDTH * 0.22, CONTENT_WIDTH * 0.19];
  const dCols = [];
  let accum = 0;
  dColWidths.forEach((w) => {
    dCols.push(accum);
    accum += w;
  });

  setFill(doc, COLORS.emeraldDark);
  doc.roundedRect(tableX, y, tableW, thHeight, 1.5, 1.5, 'F');
  doc.rect(tableX, y + thHeight - 1.5, tableW, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, COLORS.white);
  const dHeaders = ['#', 'Severity', 'Description', 'Code', 'Qty'];
  dHeaders.forEach((h, i) => {
    doc.text(h, tableX + dCols[i] + 5, y + 5.5);
  });

  y += thHeight;

  const defects = [
    { num: '1', severity: 'Major', desc: 'Binding loose at corner', code: 'BND-4IN', qty: '1 pc', sevColor: COLORS.red, sevBg: COLORS.redLight },
    { num: '2', severity: 'Minor', desc: 'Slight color variation', code: 'CLR-VAR', qty: '1 pc', sevColor: COLORS.amber, sevBg: COLORS.amberLight },
    { num: '3', severity: 'Minor', desc: 'Fringe length uneven', code: 'FRG-LEN', qty: '1 pc', sevColor: COLORS.amber, sevBg: COLORS.amberLight },
  ];

  defects.forEach((d, i) => {
    if (i % 2 === 1) {
      setFill(doc, COLORS.bgLight);
      doc.rect(tableX, y, tableW, tdHeight, 'F');
    }

    setDraw(doc, COLORS.tableBorder);
    doc.setLineWidth(0.2);
    doc.line(tableX, y + tdHeight, tableX + tableW, y + tdHeight);

    // Number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(doc, COLORS.lightText);
    doc.text(d.num, tableX + dCols[0] + 5, y + 5.5);

    // Severity badge
    const sevBadgeW = 16;
    const sevBadgeX = tableX + dCols[1] + 4;
    setFill(doc, d.sevBg);
    doc.roundedRect(sevBadgeX, y + 1.5, sevBadgeW, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setColor(doc, d.sevColor);
    doc.text(d.severity, sevBadgeX + sevBadgeW / 2, y + 4.8, { align: 'center' });

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(doc, COLORS.darkText);
    doc.text(d.desc, tableX + dCols[2] + 5, y + 5.5);

    // Code
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, COLORS.lightText);
    doc.text(d.code, tableX + dCols[3] + 5, y + 5.5);

    // Qty
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(doc, COLORS.medText);
    doc.text(d.qty, tableX + dCols[4] + 5, y + 5.5);

    y += tdHeight;
  });

  y += 8;

  // ════════════════════════════════════════════════════════════════════════
  // INSPECTOR & REMARKS
  // ════════════════════════════════════════════════════════════════════════

  checkPageBreak(45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.darkText);
  doc.text('Inspector & Remarks', MARGIN, y);
  y += 5;

  // Inspector card
  setFill(doc, COLORS.bgLight);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 30, 2, 2, 'F');

  // Left border accent
  setFill(doc, COLORS.emerald);
  doc.roundedRect(MARGIN, y, 3, 30, 2, 2, 'F');
  doc.rect(MARGIN + 1.5, y, 1.5, 30, 'F');

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.lightText);
  doc.text('Inspector', MARGIN + 8, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(doc, COLORS.darkText);
  doc.text('Ramesh Kumar', MARGIN + 8 + 22, y);

  y += 3;
  setDraw(doc, COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 7, y, PAGE_WIDTH - MARGIN - 5, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.lightText);
  doc.text('Remarks', MARGIN + 8, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.medText);

  const remarks =
    'Overall quality is good. Minor binding issue noted on one piece, within acceptable limits. Color variation is negligible and within buyer tolerance. Lot is recommended for shipment.';
  const splitRemarks = doc.splitTextToSize(remarks, CONTENT_WIDTH - 20);
  doc.text(splitRemarks, MARGIN + 8, y);

  y += splitRemarks.length * 4 + 6;

  // ════════════════════════════════════════════════════════════════════════
  // SIGNATURE LINE
  // ════════════════════════════════════════════════════════════════════════

  checkPageBreak(25);

  y += 2;

  // Two signature blocks side by side
  const sigW = (CONTENT_WIDTH - 20) / 2;

  // Inspector signature
  setDraw(doc, COLORS.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + sigW, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(doc, COLORS.lightText);
  doc.text('Inspector Signature', MARGIN, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, COLORS.medText);
  doc.text('Ramesh Kumar', MARGIN, y + 8);

  // Client signature
  const sigX2 = PAGE_WIDTH - MARGIN - sigW;
  doc.setLineWidth(0.3);
  doc.line(sigX2, y, PAGE_WIDTH - MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(doc, COLORS.lightText);
  doc.text('Client Representative', sigX2, y + 4);

  y += 15;

  // ════════════════════════════════════════════════════════════════════════
  // PHOTO DOCUMENTATION (4-column grid like the real app)
  // ════════════════════════════════════════════════════════════════════════

  // Check if enough space for title + at least one row of photos (~60mm)
  checkPageBreak(60);

  y += 3;

  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.darkText);
  doc.text('Photo Documentation', MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, COLORS.lightText);
  doc.text(`${loadedPhotos.length} photos`, MARGIN + 42, y);

  y += 4;

  // Divider
  setDraw(doc, COLORS.tableBorder);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  y += 4;

  // ── Photo grid layout constants ─────────────────────────────────────
  const GRID_COLS = 4;
  const GAP = 3;
  const LABEL_H = 8;  // height reserved for label below image
  const gridWidth = CONTENT_WIDTH;
  const cellW = (gridWidth - GAP * (GRID_COLS - 1)) / GRID_COLS; // ~42mm each
  const cellImgH = 34; // Fixed cell image height
  const ROW_TOTAL_H = cellImgH + LABEL_H + GAP; // total height per row

  // Group photos into categories for a professional layout
  const photoGroups = [
    {
      title: 'Measurements & Construction',
      photos: loadedPhotos.filter((p) =>
        ['Size Measurement (Front)', 'Size Measurement (Side)', 'Moisture Check', 'Pile Height Check'].includes(p.label)
      ),
    },
    {
      title: 'Equipment & Goods',
      photos: loadedPhotos.filter((p) =>
        ['Metal Detection', 'Metal Detection (Close-up)', 'Product Net Weight', 'Stacked Goods'].includes(p.label)
      ),
    },
  ];

  // Render each group
  photoGroups.forEach((group) => {
    if (group.photos.length === 0) return;

    const firstRowH = 10 + ROW_TOTAL_H; // section title + first row

    // Check if at least the section title + first row fits
    if (y + firstRowH > PAGE_HEIGHT - 20) {
      doc.addPage();
      drawAccentBar();
      y = MARGIN;
    }

    // Section group header
    setFill(doc, COLORS.tableHeader);
    doc.roundedRect(MARGIN, y, gridWidth, 7, 1, 1, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.emeraldDark);
    doc.text(group.title, MARGIN + 4, y + 5);
    y += 10;

    // Render photos in rows of 4
    for (let i = 0; i < group.photos.length; i += GRID_COLS) {
      // Check page break for each row
      if (y + ROW_TOTAL_H > PAGE_HEIGHT - 20) {
        doc.addPage();
        drawAccentBar();
        y = MARGIN;
      }

      const rowPhotos = group.photos.slice(i, i + GRID_COLS);

      rowPhotos.forEach((photo, col) => {
        const cellX = MARGIN + col * (cellW + GAP);
        const innerW = cellW - 1;
        const innerH = cellImgH - 1;
        const innerX = cellX + 0.5;
        const innerY = y + 0.5;

        // ── Cell background ──
        setFill(doc, COLORS.bgLight);
        doc.rect(cellX, y, cellW, cellImgH, 'F');

        // ── Image border (gray) ──
        setDraw(doc, COLORS.photoBorder);
        doc.setLineWidth(0.3);
        doc.rect(cellX, y, cellW, cellImgH, 'S');

        // ── Embed photo with proper aspect ratio (contain fit) ──
        try {
          const fit = fitContain(photo.width, photo.height, innerW, innerH);
          doc.addImage(
            photo.base64, 'JPEG',
            innerX + fit.drawX, innerY + fit.drawY,
            fit.drawW, fit.drawH
          );
        } catch (err) {
          // Fallback: draw placeholder
          doc.setFontSize(6);
          setColor(doc, COLORS.lightText);
          doc.text('Error', cellX + cellW / 2, y + cellImgH / 2, { align: 'center' });
        }

        // ── Label below photo ──
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        setColor(doc, COLORS.medText);

        // Truncate label if too wide
        let label = photo.label;
        const maxLabelW = cellW - 2;
        while (doc.getTextWidth(label) > maxLabelW && label.length > 3) {
          label = label.slice(0, -1);
        }
        if (label !== photo.label) label += '..';

        doc.text(label, cellX + cellW / 2, y + cellImgH + 4, { align: 'center' });
      });

      y += ROW_TOTAL_H;
    }

    y += 2; // gap between groups
  });

  // ════════════════════════════════════════════════════════════════════════
  // FOOTER (applied to all pages)
  // ════════════════════════════════════════════════════════════════════════

  drawFooter(doc);

  // ── Save ────────────────────────────────────────────────────────────────
  const outputDir = path.resolve(__dirname, '..', 'public');
  const outputPath = path.join(outputDir, 'sample-report.pdf');

  // Ensure public directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`PDF generated successfully: ${outputPath}`);
  console.log(`File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`Pages: ${doc.getNumberOfPages()}`);
}

function drawFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Bottom divider
    setDraw(doc, COLORS.tableBorder);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 16, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16);

    // RugQC branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(doc, COLORS.emerald);
    doc.text('RugQC', MARGIN, PAGE_HEIGHT - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, COLORS.lightText);
    doc.text('Automated Quality Inspection Platform', MARGIN + 14, PAGE_HEIGHT - 11);

    // Confidentiality notice
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    setColor(doc, COLORS.lightText);
    doc.text('This report is confidential and intended for authorized personnel only.', MARGIN, PAGE_HEIGHT - 7);

    // Page number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, COLORS.lightText);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 11, { align: 'right' });
  }
}

// ── Run ─────────────────────────────────────────────────────────────────
generateReport();
