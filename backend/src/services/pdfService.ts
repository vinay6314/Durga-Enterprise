import PDFDocument from 'pdfkit';

function numberToWords(num: number): string {
  if (num <= 0) return 'Rupees Zero Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const integerPart = Math.floor(num);
  const words = inWords(integerPart);
  return words ? `Rupees ${words} Only` : 'Rupees Zero Only';
}

function drawDurgaLogoEmblem(doc: typeof PDFDocument, x: number, y: number, radius: number = 22) {
  // Electric Sapphire Outer Circle
  doc.circle(x, y, radius).fill('#0284C7');

  const scale = radius / 22;
  const cx = x;
  const cy = y;

  // Light Mint Stroke for 'D' Letter Emblem
  doc
    .path(`M ${cx - 7 * scale} ${cy - 10 * scale} H ${cx + 1 * scale} C ${cx + 7 * scale} ${cy - 10 * scale}, ${cx + 12 * scale} ${cy - 5 * scale}, ${cx + 12 * scale} ${cy} C ${cx + 12 * scale} ${cy + 5 * scale}, ${cx + 7 * scale} ${cy + 10 * scale}, ${cx + 1 * scale} ${cy + 10 * scale} H ${cx - 7 * scale} Z`)
    .lineWidth(2.8 * scale)
    .strokeColor('#E0F2FE')
    .stroke();

  // Sunset Coral Accent Dot at top-right
  doc.circle(cx + 12 * scale, cy - 8 * scale, 2.5 * scale).fill('#F97316');
}

export async function generateSalesChallanPdf(challanData: any, activeUser?: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 25, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // ==========================================
      // 0. PAGE OUTER BORDER & CANVAS (SAPPHIRE CYAN THEME)
      // ==========================================
      const margin = 30;
      const pageWidth = doc.page.width; // 595.28
      const pageHeight = doc.page.height; // 841.89
      const contentWidth = pageWidth - margin * 2; // 535.28

      // Soft white canvas fill
      doc.rect(0, 0, pageWidth, pageHeight).fill('#FFFFFF');

      // Double Outer Page Frame (Deep Sapphire Outer, Electric Cyan Inner)
      doc
        .rect(margin, margin, contentWidth, pageHeight - margin * 2)
        .lineWidth(1.2)
        .strokeColor('#0F172A')
        .stroke();

      doc
        .rect(margin + 2.5, margin + 2.5, contentWidth - 5, pageHeight - margin * 2 - 5)
        .lineWidth(0.5)
        .strokeColor('#06B6D4')
        .stroke();

      // ==========================================
      // 1. COMPANY HEADER SECTION WITH LOGO (DEEP SAPPHIRE & CYAN)
      // ==========================================
      // Draw Durga Logo next to company title
      drawDurgaLogoEmblem(doc, margin + 26, margin + 24, 14);

      // Company Banner Rectangle (Deep Sapphire Header Bar)
      doc
        .rect(margin + 46, margin + 12, 210, 24)
        .fillAndStroke('#0F172A', '#0284C7');

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#FFFFFF')
        .text('DURGA ENTERPRISE INC.', margin + 54, margin + 18);

      // Contact details with bullet/icon styling
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#334155')
        .text('Plot 88, Logistics Park, Sector 18, NY 122015', margin + 16, margin + 42)
        .text('billing@durgaenterprise.com', margin + 16, margin + 52);

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#0284C7')
        .text('+91 98765 43210  |  GST: 27AABCD1234E1Z5', margin + 16, margin + 62);

      // ==========================================
      // 2. COMPANY LOGO BADGE & STATUS PILL (TOP-RIGHT)
      // ==========================================
      const logoX = margin + contentWidth - 45;
      const logoY = margin + 42;

      // Render official Durga Enterprise Logo Emblem in top right
      drawDurgaLogoEmblem(doc, logoX, logoY, 22);

      // Subtext below top-right logo
      doc
        .font('Helvetica-Bold')
        .fontSize(6.5)
        .fillColor('#4338CA')
        .text('DURGA ENTERPRISE', logoX - 35, logoY + 25, { align: 'center', width: 70 });

      const challanStatus = String(challanData.status || 'CONFIRMED').toUpperCase();
      const badgeTextColor = challanStatus === 'CONFIRMED' ? '#15803D' : challanStatus === 'DRAFT' ? '#B45309' : '#B91C1C';

      // ==========================================
      // 3. METADATA GRID BOXES (WITH CHALLAN STATUS ROW)
      // ==========================================
      const gridY = margin + 85;
      const gridBoxW = 250;
      const labelColWLeft = 95;
      const labelColWRight = 110;

      const customer = typeof challanData.customerSnapshot === 'string'
        ? JSON.parse(challanData.customerSnapshot)
        : challanData.customerSnapshot || challanData.customer || {};

      const createdDate = new Date(challanData.createdAt);
      const invoiceDateStr = createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      // Calculate Due Date (30 days from creation)
      const dueDateObj = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dueDateStr = dueDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const totalAmt = Number(challanData.totalAmount || 0);

      const leftRows = [
        { label: 'CLIENT NAME:', value: customer.name || 'BOPPANA NAGA VENKATA VINAY' },
        { label: 'BUSINESS / ORG:', value: customer.businessName || 'Durga Enterprise' },
        { label: 'DELIVERY ADDRESS:', value: customer.address || '1-39, main road, near ramalayam' },
        { label: 'PHONE / CONTACT:', value: customer.mobile ? `${customer.mobile}${customer.email ? ' | ' + customer.email : ''}` : 'N/A' },
        { label: 'GSTIN / REG NO.:', value: customer.gstNumber || 'UNREGISTERED / RETAIL' },
      ];

      const rightRows = [
        { label: 'INVOICE NO.:', value: challanData.challanNumber || 'SCH-2026-0001' },
        { label: 'DOCUMENT TYPE:', value: 'TAX INVOICE / DISPATCH' },
        { label: 'CHALLAN STATUS:', value: challanStatus },
        { label: 'INVOICE DATE:', value: invoiceDateStr },
        { label: 'TOTAL AMOUNT:', value: `Rs. ${totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
      ];

      // Calculate dynamic row heights per row based on text content length
      doc.font('Helvetica').fontSize(7.5);
      const leftRowHeights = leftRows.map(row => {
        const valW = gridBoxW - labelColWLeft - 10;
        const valH = doc.heightOfString(row.value, { width: valW });
        return Math.max(18, valH + 6);
      });

      const rightRowHeights = rightRows.map(row => {
        const valW = gridBoxW - labelColWRight - 10;
        const valH = doc.heightOfString(row.value, { width: valW });
        return Math.max(18, valH + 6);
      });

      // Synchronize left & right row heights for symmetrical grid alignment
      const rowHeights = leftRows.map((_, i) => Math.max(leftRowHeights[i], rightRowHeights[i]));
      const gridBoxH = rowHeights.reduce((sum, h) => sum + h, 0);

      // --- Left Metadata Box (CLEAN MODERN WHITE CARD WITH BLUE ACCENT BORDER) ---
      const leftGridX = margin + 12;
      doc.rect(leftGridX, gridY, gridBoxW, gridBoxH).fillAndStroke('#FFFFFF', '#0284C7');

      let currentRyLeft = gridY;
      leftRows.forEach((row, i) => {
        const rH = rowHeights[i];
        if (i > 0) {
          doc.moveTo(leftGridX, currentRyLeft).lineTo(leftGridX + gridBoxW, currentRyLeft).strokeColor('#E2E8F0').lineWidth(0.6).stroke();
        }

        doc.moveTo(leftGridX + labelColWLeft, currentRyLeft).lineTo(leftGridX + labelColWLeft, currentRyLeft + rH).strokeColor('#0284C7').lineWidth(0.6).stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#0284C7')
          .text(row.label, leftGridX + 6, currentRyLeft + 4, { width: labelColWLeft - 8 });

        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#0F172A')
          .text(row.value, leftGridX + labelColWLeft + 6, currentRyLeft + 4, { width: gridBoxW - labelColWLeft - 10 });

        currentRyLeft += rH;
      });

      // --- Right Metadata Box (ROYAL INDIGO STYLED PAYMENT & DATES) ---
      const rightGridX = margin + contentWidth - 262;
      doc.rect(rightGridX, gridY, gridBoxW, gridBoxH).fillAndStroke('#FFFFFF', '#6366F1');

      let currentRyRight = gridY;
      rightRows.forEach((row, i) => {
        const rH = rowHeights[i];
        if (i > 0) {
          doc.moveTo(rightGridX, currentRyRight).lineTo(rightGridX + gridBoxW, currentRyRight).strokeColor('#E2E8F0').lineWidth(0.6).stroke();
        }

        doc.moveTo(rightGridX + labelColWRight, currentRyRight).lineTo(rightGridX + labelColWRight, currentRyRight + rH).strokeColor('#6366F1').lineWidth(0.6).stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#4338CA')
          .text(row.label, rightGridX + 6, currentRyRight + 4, { width: labelColWRight - 8 });

        const isStatusRow = row.label === 'CHALLAN STATUS:';
        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor(isStatusRow ? badgeTextColor : '#0F172A')
          .text(row.value, rightGridX + labelColWRight + 6, currentRyRight + 4, { width: gridBoxW - labelColWRight - 10 });

        currentRyRight += rH;
      });

      // ==========================================
      // 4. CENTER BANNER BAR (CRIMSON RED TITLE WITH STATUS)
      // ==========================================
      const bannerY = gridY + gridBoxH + 10;
      const bannerW = contentWidth - 24;

      doc
        .rect(margin + 12, bannerY, bannerW, 22)
        .fillAndStroke('#E11D48', '#BE123C');

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#FFFFFF')
        .text(`TAX INVOICE / SALES CHALLAN  |  [ ${challanStatus} ]`, margin + 12, bannerY + 6, { align: 'center', width: bannerW });

      // ==========================================
      // 5. LINE ITEMS TABLE WITH PROPER COLUMN WIDTHS
      // ==========================================
      const tableY = bannerY + 30;
      const colX = [
        margin + 12,                  // 0: S.No (38px)
        margin + 50,                  // 1: Date (70px)
        margin + 120,                 // 2: SKU / Code (85px)
        margin + 205,                 // 3: Qty (45px)
        margin + 250,                 // 4: Product Description (153.28px)
        margin + 403.28,              // 5: Unit Price (60px)
        margin + 463.28,              // 6: Line Total (60px)
        margin + 12 + bannerW         // 7: Table End (523.28px)
      ];

      // Pre-calculate dynamic row heights for all table rows based on text content
      doc.font('Helvetica-Bold').fontSize(7.5);
      const items = Array.isArray(challanData.items) ? challanData.items : [];
      const numRows = Math.max(10, items.length);

      const tableRowHeights: number[] = [];
      for (let r = 0; r < numRows; r++) {
        const item = items[r];
        if (item) {
          const prod = typeof item.productSnapshot === 'string'
            ? JSON.parse(item.productSnapshot)
            : item.productSnapshot || {};
          const specW = colX[5] - colX[4] - 10;
          const skuW = colX[3] - colX[2] - 6;
          const specH = doc.heightOfString(prod.name || 'Product', { width: specW });
          const skuH = doc.heightOfString(prod.sku || 'N/A', { width: skuW });
          tableRowHeights.push(Math.max(20, Math.max(specH, skuH) + 10));
        } else {
          tableRowHeights.push(20);
        }
      }

      const headerHeight = 22;
      const totalTableRowsH = tableRowHeights.reduce((sum, h) => sum + h, 0);
      const tableHeight = headerHeight + totalTableRowsH;

      // Table Header Fill & Outer Rect (Charcoal Sapphire #0F172A)
      doc
        .rect(colX[0], tableY, bannerW, tableHeight)
        .lineWidth(1)
        .strokeColor('#0F172A')
        .stroke();

      doc.rect(colX[0], tableY, bannerW, headerHeight).fill('#0F172A');
      doc.moveTo(colX[0], tableY + headerHeight).lineTo(colX[7], tableY + headerHeight).strokeColor('#06B6D4').lineWidth(1.5).stroke();

      // Header Labels (Pure White, S.NO instead of SERIAL NO. to prevent line wrapping)
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
      doc.text('S.NO', colX[0], tableY + 7, { width: colX[1] - colX[0], align: 'center' });
      doc.text('DATE', colX[1], tableY + 7, { width: colX[2] - colX[1], align: 'center' });
      doc.text('SKU / CODE', colX[2], tableY + 7, { width: colX[3] - colX[2], align: 'center' });
      doc.text('QTY', colX[3], tableY + 7, { width: colX[4] - colX[3], align: 'center' });
      doc.text('PRODUCT DESCRIPTION', colX[4], tableY + 7, { width: colX[5] - colX[4], align: 'center' });
      doc.text('UNIT PRICE', colX[5], tableY + 7, { width: colX[6] - colX[5], align: 'center' });
      doc.text('TOTAL', colX[6], tableY + 7, { width: colX[7] - colX[6], align: 'center' });

      // Render Rows with Dynamic Auto-Expanding Heights
      let currentRy = tableY + headerHeight;
      for (let r = 0; r < numRows; r++) {
        const rH = tableRowHeights[r];

        // Alternating row background colors (#FFFFFF and #F8FAFC)
        const rowBg = r % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(colX[0], currentRy, bannerW, rH).fill(rowBg);

        // Horizontal Row Border
        doc.moveTo(colX[0], currentRy).lineTo(colX[7], currentRy).strokeColor('#E2E8F0').lineWidth(0.6).stroke();

        const item = items[r];
        if (item) {
          const prod = typeof item.productSnapshot === 'string'
            ? JSON.parse(item.productSnapshot)
            : item.productSnapshot || {};

          const itemDateStr = createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0F172A');
          doc.text(`${r + 1}`, colX[0], currentRy + 5, { width: colX[1] - colX[0], align: 'center' });
          doc.text(itemDateStr, colX[1], currentRy + 5, { width: colX[2] - colX[1], align: 'center' });

          // Dedicated SKU / Item Code Column
          doc.font('Helvetica-Bold').fillColor('#7C3AED');
          doc.text(`${prod.sku || 'N/A'}`, colX[2] + 4, currentRy + 5, { width: colX[3] - colX[2] - 8, align: 'center' });

          // Quantity
          doc.font('Helvetica-Bold').fillColor('#0891B2');
          doc.text(`${item.quantity}`, colX[3], currentRy + 5, { width: colX[4] - colX[3], align: 'center' });

          // Specifications (Product Name ONLY, dynamically wraps and fits within rH)
          doc.font('Helvetica-Bold').fillColor('#0F172A');
          doc.text(`${prod.name || 'Product'}`, colX[4] + 6, currentRy + 5, { width: colX[5] - colX[4] - 12 });

          // Unit Price & Total
          doc.font('Helvetica-Bold').fillColor('#0F172A');
          doc.text(`Rs. ${Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, colX[5], currentRy + 5, { width: colX[6] - colX[5] - 6, align: 'right' });
          doc.text(`Rs. ${Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, colX[6], currentRy + 5, { width: colX[7] - colX[6] - 6, align: 'right' });
        } else {
          // Empty placeholder row (clean dash when there is no item)
          doc.font('Helvetica').fontSize(7.5).fillColor('#94A3B8');
          doc.text('-', colX[2], currentRy + 5, { width: colX[3] - colX[2], align: 'center' });
          doc.text('-', colX[5], currentRy + 5, { width: colX[6] - colX[5], align: 'center' });
          doc.text('-', colX[6], currentRy + 5, { width: colX[7] - colX[6], align: 'center' });
        }

        currentRy += rH;
      }

      // Vertical Column Dividers spanning full dynamic table height
      for (let c = 1; c < colX.length - 1; c++) {
        doc.moveTo(colX[c], tableY).lineTo(colX[c], tableY + tableHeight).strokeColor('#CBD5E1').lineWidth(0.6).stroke();
      }

      // ==========================================
      // 6. BOTTOM TOTALS GRID BOX & AUTHORIZED SIGNATORY (DYNAMICALLY POSITIONED)
      // ==========================================
      const bottomY = tableY + tableHeight + 12;

      // --- Full-Width TOTALS GRID BOX (CLEAN OVERLAP-FREE BORDER RENDERING) ---
      const totalBoxX = margin + 12;
      const totalBoxW = bannerW;
      const summaryRowH = 23;

      const discountAmt = 0;
      const taxRatePct = 18.0;
      const subtotalAmt = totalAmt;

      const summaryRows = [
        { label: 'SUBTOTAL:', val: `Rs. ${subtotalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, highlight: false, bg: '#FFFFFF', color: '#0F172A' },
        { label: 'DISCOUNT 0.00%:', val: `Rs. ${discountAmt.toFixed(2)}`, highlight: false, bg: '#FFF1F2', color: '#E11D48' },
        { label: `TAX ${taxRatePct.toFixed(2)}%:`, val: `(Incl. in Total)`, highlight: false, bg: '#ECFDF5', color: '#059669' },
        { label: 'TOTAL AMOUNT:', val: `Rs. ${totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, highlight: true, bg: '#0F172A', color: '#F59E0B' },
      ];

      const midDividerX = totalBoxX + 260;

      // 1. Draw Row Background Fills First
      summaryRows.forEach((sRow, idx) => {
        const sY = bottomY + idx * summaryRowH;
        doc.rect(totalBoxX, sY, totalBoxW, summaryRowH).fill(sRow.bg);
      });

      // 2. Draw Crisp Outer Box Border Frame (Over Row Fills)
      doc
        .rect(totalBoxX, bottomY, totalBoxW, summaryRowH * 4)
        .lineWidth(1)
        .strokeColor('#E11D48')
        .stroke();

      // 3. Draw Internal Horizontal Row Dividers
      for (let idx = 1; idx < summaryRows.length; idx++) {
        const sY = bottomY + idx * summaryRowH;
        doc.moveTo(totalBoxX, sY).lineTo(totalBoxX + totalBoxW, sY).strokeColor('#CBD5E1').lineWidth(0.6).stroke();
      }

      // 4. Draw Center Vertical Divider Line
      doc.moveTo(midDividerX, bottomY).lineTo(midDividerX, bottomY + summaryRowH * 4).strokeColor('#E11D48').lineWidth(0.6).stroke();

      // 5. Draw Labels and Values with Guaranteed Padding
      summaryRows.forEach((sRow, idx) => {
        const sY = bottomY + idx * summaryRowH;

        const labelColor = sRow.highlight ? '#FFFFFF' : '#0F172A';
        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(labelColor)
          .text(sRow.label, totalBoxX + 12, sY + 7, { width: midDividerX - totalBoxX - 20 });

        const valWidth = (totalBoxX + totalBoxW - 16) - (midDividerX + 12);
        doc
          .font('Helvetica-Bold')
          .fontSize(sRow.highlight ? 10 : 8.5)
          .fillColor(sRow.color)
          .text(sRow.val, midDividerX + 12, sY + 7, { width: valWidth, align: 'right' });
      });

      // ==========================================
      // 7. AUTHORIZED SIGNATORY & STAMP SEAL AT BOTTOM OF PDF
      // ==========================================
      const totalBoxH = summaryRowH * 4;
      const sigSectionY = bottomY + totalBoxH + 12;

      const issuerName = activeUser?.name || challanData.createdBy?.name || 'Vinay Choudary';
      const issuerRole = activeUser?.role || challanData.createdBy?.role || 'ADMIN';

      // Left Issuer Info
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#0F172A')
        .text(`Issued by: ${issuerName} (${issuerRole})`, margin + 12, sigSectionY);

      doc
        .font('Helvetica-Oblique')
        .fontSize(7)
        .fillColor('#64748B')
        .text('Computer generated invoice snapshot. Subject to Durga Enterprise jurisdiction.', margin + 12, sigSectionY + 12);

      // Header text on right
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#E11D48')
        .text('For DURGA ENTERPRISE', 360, sigSectionY, { align: 'right', width: 180 });

      // Official Stamp Seal Emblem centered at X=470, Y=sigSectionY + 40
      const sealX = 470;
      const sealY = sigSectionY + 40;
      const sealR = 26;

      doc.circle(sealX, sealY, sealR).lineWidth(1.4).strokeColor('#0F172A').stroke();
      doc.circle(sealX, sealY, sealR - 3).lineWidth(0.6).strokeColor('#06B6D4').stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(5.5)
        .fillColor('#0F172A')
        .text('DURGA', sealX - 22, sealY - 18, { align: 'center', width: 44 });

      doc
        .font('Helvetica-Bold')
        .fontSize(5)
        .fillColor('#0F172A')
        .text('ENTERPRISE', sealX - 22, sealY - 11, { align: 'center', width: 44 });

      doc
        .font('Times-BoldItalic')
        .fontSize(issuerName.length > 15 ? 6 : 7.5)
        .fillColor('#E11D48')
        .text(issuerName, sealX - 22, sealY - 2, { align: 'center', width: 44 });

      doc.moveTo(sealX - 16, sealY + 7).lineTo(sealX + 16, sealY + 7).strokeColor('#06B6D4').lineWidth(0.5).stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(3.8)
        .fillColor('#0891B2')
        .text('AUTHORIZED SIGNATORY', sealX - 22, sealY + 11, { align: 'center', width: 44 });

      // Subtext below stamp
      doc
        .font('Helvetica-Oblique')
        .fontSize(7.5)
        .fillColor('#64748B')
        .text('Authorized Signatory', 380, sigSectionY + 72, { align: 'right', width: 160 });

      // ==========================================
      // 8. FOOTER COPYRIGHT LINE
      // ==========================================
      const footerLineY = pageHeight - margin - 15;
      doc
        .font('Helvetica-Bold')
        .fontSize(6.5)
        .fillColor('#0284C7')
        .text('COPYRIGHT © DURGA ENTERPRISE OPERATIONS PORTAL', margin + 12, footerLineY);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateStockLogsPdf(movements: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      const margin = 30;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const contentWidth = pageWidth - margin * 2; // 535.28

      // Helper to render top decorative bar & company logo emblem header
      const drawCompanyBrandingHeader = () => {
        // Decorative top border bar
        doc.rect(margin, margin, contentWidth, 5).fill('#E11D48');
        doc.rect(margin, margin + 5, contentWidth, 2).fill('#06B6D4');

        // Top Left Logo Emblem + Company Info
        drawDurgaLogoEmblem(doc, margin + 24, margin + 27, 13);

        doc
          .font('Helvetica-Bold')
          .fontSize(13)
          .fillColor('#E11D48')
          .text('DURGA ENTERPRISE (PVT) LTD', margin + 44, margin + 17);

        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor('#475569')
          .text('San Andreas Industrial Area, Sector 4', margin + 44, margin + 34)
          .text('Phone: +91 98765 43210 | Email: ops@durgaenterprise.com', margin + 44, margin + 45);

        // Top Right Logo Emblem
        const logoX = margin + contentWidth - 45;
        const logoY = margin + 30;

        drawDurgaLogoEmblem(doc, logoX, logoY, 16);

        doc
          .font('Helvetica-Bold')
          .fontSize(6)
          .fillColor('#4338CA')
          .text('DURGA ENTERPRISE', logoX - 35, logoY + 19, { align: 'center', width: 70 });
      };

      // Render initial Page 1 Branding
      drawCompanyBrandingHeader();

      // Title Banner
      const bannerY = margin + 65;
      const bannerW = contentWidth - 24;

      doc.rect(margin + 12, bannerY, bannerW, 22).fillAndStroke('#E11D48', '#BE123C');
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#FFFFFF')
        .text('STOCK MOVEMENT AUDIT LOG REPORT', margin + 12, bannerY + 6, { align: 'center', width: bannerW });

      // Summary Metadata Box
      const gridY = bannerY + 30;
      const gridBoxW = bannerW;
      const totalIn = movements.reduce((sum, m) => sum + (m.movementType === 'IN' ? m.quantityChanged : 0), 0);
      const totalOut = movements.reduce((sum, m) => sum + (m.movementType === 'OUT' ? m.quantityChanged : 0), 0);
      const generatedDate = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      doc.rect(margin + 12, gridY, gridBoxW, 24).fillAndStroke('#F8FAFC', '#CBD5E1');

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A');
      doc.text(`REPORT GENERATED: ${generatedDate}`, margin + 20, gridY + 8);
      doc.text(`TOTAL LOGS: ${movements.length}`, margin + 220, gridY + 8);
      doc.fillColor('#15803D').text(`STOCK IN (+): ${totalIn}`, margin + 320, gridY + 8);
      doc.fillColor('#B91C1C').text(`STOCK OUT (-): ${totalOut}`, margin + 420, gridY + 8);

      // Data Table
      const tableY = gridY + 32;
      const colX = [
        margin + 12,          // 0: S.No (30px)
        margin + 42,          // 1: Date (85px)
        margin + 127,         // 2: Product Name (110px)
        margin + 237,         // 3: SKU (75px)
        margin + 312,         // 4: Type (55px)
        margin + 367,         // 5: Qty (45px)
        margin + 412,         // 6: Reason (75px)
        margin + 487,         // 7: User (66.28px)
        margin + 12 + bannerW // 8: Table End
      ];

      const headerHeight = 22;

      // Calculate row heights
      doc.font('Helvetica-Bold').fontSize(7);
      const tableRowHeights: number[] = movements.map(m => {
        const nameW = colX[3] - colX[2] - 8;
        const reasonW = colX[7] - colX[6] - 8;
        const nameH = doc.heightOfString(m.product?.name || 'Product', { width: nameW });
        const reasonH = doc.heightOfString(m.reason || 'Manual Adjustment', { width: reasonW });
        return Math.max(22, Math.max(nameH, reasonH) + 16);
      });

      const totalTableRowsH = tableRowHeights.reduce((sum, h) => sum + h, 0);
      const tableHeight = headerHeight + totalTableRowsH;

      // Header Fill & Labels helper for pages
      const drawTableHeaderRow = (topY: number) => {
        doc.rect(colX[0], topY, bannerW, headerHeight).fill('#0F172A');
        doc.moveTo(colX[0], topY + headerHeight).lineTo(colX[8], topY + headerHeight).strokeColor('#06B6D4').lineWidth(1.5).stroke();

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#FFFFFF');
        doc.text('S.NO', colX[0], topY + 7, { width: colX[1] - colX[0], align: 'center' });
        doc.text('DATE & TIME', colX[1], topY + 7, { width: colX[2] - colX[1], align: 'center' });
        doc.text('PRODUCT NAME', colX[2], topY + 7, { width: colX[3] - colX[2], align: 'center' });
        doc.text('SKU / CODE', colX[3], topY + 7, { width: colX[4] - colX[3], align: 'center' });
        doc.text('TYPE', colX[4], topY + 7, { width: colX[5] - colX[4], align: 'center' });
        doc.text('QTY', colX[5], topY + 7, { width: colX[6] - colX[5], align: 'center' });
        doc.text('REASON / REF', colX[6], topY + 7, { width: colX[7] - colX[6], align: 'center' });
        doc.text('USER', colX[7], topY + 7, { width: colX[8] - colX[7], align: 'center' });
      };

      // Draw initial table header on Page 1
      drawTableHeaderRow(tableY);

      let pageHeaderTopY = tableY;
      let currentRy = tableY + headerHeight;
      const maxTableY = pageHeight - margin - 60;

      const drawFixedBottomSection = () => {
        const footerY = pageHeight - margin - 15;
        const sigY = footerY - 32;

        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#E11D48')
          .text('For DURGA ENTERPRISE', 360, sigY, { align: 'right', width: 180 });

        doc
          .font('Times-BoldItalic')
          .fontSize(7)
          .fillColor('#E11D48')
          .text('B.N.V. Vinay', 380, sigY + 10, { align: 'right', width: 160 });

        doc
          .font('Helvetica-Oblique')
          .fontSize(6)
          .fillColor('#64748B')
          .text('Authorized Signatory', 380, sigY + 19, { align: 'right', width: 160 });

        doc
          .font('Helvetica-Bold')
          .fontSize(6)
          .fillColor('#0284C7')
          .text('COPYRIGHT © DURGA ENTERPRISE OPERATIONS PORTAL', margin + 12, footerY);
      };

      // Close and seal table box for the current page
      const sealTableBoxForPage = (topHeaderY: number, endY: number) => {
        // Draw bottom horizontal border line
        doc.moveTo(colX[0], endY).lineTo(colX[8], endY).strokeColor('#0F172A').lineWidth(1).stroke();

        // Draw inner vertical column dividers spanning only actual page rows
        for (let c = 1; c < colX.length - 1; c++) {
          doc.moveTo(colX[c], topHeaderY).lineTo(colX[c], endY).strokeColor('#CBD5E1').lineWidth(0.6).stroke();
        }

        // Draw outer border rect wrapping exact page table block
        doc.rect(colX[0], topHeaderY, bannerW, endY - topHeaderY).lineWidth(1).strokeColor('#0F172A').stroke();
      };

      movements.forEach((log, idx) => {
        const rH = tableRowHeights[idx];

        // Check if row exceeds page capacity; if so, seal page table box and paginate
        if (currentRy + rH > maxTableY) {
          sealTableBoxForPage(pageHeaderTopY, currentRy);
          drawFixedBottomSection();

          // Start new page
          doc.addPage();

          // Draw full company branding & logo emblem on new page
          drawCompanyBrandingHeader();

          // Draw Table Header Bar on new page below logo header
          pageHeaderTopY = margin + 65;
          drawTableHeaderRow(pageHeaderTopY);
          currentRy = pageHeaderTopY + headerHeight;
        }

        const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(colX[0], currentRy, bannerW, rH).fill(rowBg);
        doc.moveTo(colX[0], currentRy).lineTo(colX[8], currentRy).strokeColor('#E2E8F0').lineWidth(0.6).stroke();

        const logDateStr = new Date(log.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0F172A');
        doc.text(`${idx + 1}`, colX[0], currentRy + 5, { width: colX[1] - colX[0], align: 'center' });
        doc.text(logDateStr, colX[1], currentRy + 5, { width: colX[2] - colX[1], align: 'center' });

        doc.text(`${log.product?.name || 'N/A'}`, colX[2] + 4, currentRy + 5, { width: colX[3] - colX[2] - 8 });
        doc.font('Helvetica-Bold').fillColor('#7C3AED').text(`${log.product?.sku || 'N/A'}`, colX[3] + 2, currentRy + 5, { width: colX[4] - colX[3] - 4, align: 'center' });

        // Movement Type Badge
        const isStockIn = log.movementType === 'IN';
        const typeColor = isStockIn ? '#15803D' : '#B91C1C';
        doc.font('Helvetica-Bold').fillColor(typeColor).text(`STOCK ${log.movementType}`, colX[4], currentRy + 5, { width: colX[5] - colX[4], align: 'center' });

        // Quantity
        const qtyStr = isStockIn ? `+${log.quantityChanged}` : `-${log.quantityChanged}`;
        doc.font('Helvetica-Bold').fillColor(typeColor).text(qtyStr, colX[5], currentRy + 5, { width: colX[6] - colX[5], align: 'center' });

        // Reason & Recorded By User
        doc.font('Helvetica').fillColor('#0F172A').text(`${log.reason || 'N/A'}`, colX[6] + 4, currentRy + 5, { width: colX[7] - colX[6] - 8 });
        doc.font('Helvetica-Bold').fillColor('#334155').text(`${log.createdBy?.name || 'System'}`, colX[7] + 2, currentRy + 5, { width: colX[8] - colX[7] - 4, align: 'center' });

        currentRy += rH;
      });

      // Seal table box on final page
      sealTableBoxForPage(pageHeaderTopY, currentRy);

      // Draw fixed bottom section on final page
      drawFixedBottomSection();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}





