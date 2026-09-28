import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Product } from '../types';

/**
 * Generates a professional-looking PDF document for a prompt,
 * wraps it in a ZIP file, and triggers a download in the user's browser.
 */
export async function downloadPromptAsZip(product: Product): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helper: check if we need a new page ──
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // ── Helper: draw wrapped text and return new Y position ──
  const drawWrappedText = (
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      checkPageBreak(lineHeight);
      pdf.text(line, x, startY);
      startY += lineHeight;
    }
    return startY;
  };

  // ══════════════════════════════════════════
  //  HEADER BAR
  // ══════════════════════════════════════════
  pdf.setFillColor(229, 138, 54); // #E58A36
  pdf.rect(0, 0, pageWidth, 32, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text('V — DIGITAL PRODUCTS STORE', margin, 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text('Premium AI Prompt — Instant Download', margin, 18);

  pdf.setFontSize(7);
  pdf.text(`Product ID: ${product.id.toUpperCase()}`, pageWidth - margin, 12, { align: 'right' });
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 18, { align: 'right' });

  y = 42;

  // ══════════════════════════════════════════
  //  TITLE & CATEGORY
  // ══════════════════════════════════════════
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(20, 20, 20);
  y = drawWrappedText(product.title, margin, y, contentWidth, 9);
  y += 4;

  // Category badge
  pdf.setFillColor(229, 138, 54);
  const catText = product.category.toUpperCase();
  const catWidth = pdf.getTextWidth(catText) + 8;
  pdf.roundedRect(margin, y - 4, catWidth, 7, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text(catText, margin + 4, y);
  y += 10;

  // ══════════════════════════════════════════
  //  DESCRIPTION
  // ══════════════════════════════════════════
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  y = drawWrappedText(product.description, margin, y, contentWidth, 5.5);
  y += 8;

  // ══════════════════════════════════════════
  //  INFO TABLE
  // ══════════════════════════════════════════
  pdf.setDrawColor(220, 220, 220);
  pdf.setFillColor(248, 248, 248);
  pdf.roundedRect(margin, y - 4, contentWidth, 42, 2, 2, 'FD');

  const infoItems = [
    { label: 'Platform', value: product.platform },
    { label: 'Format', value: product.format },
    { label: 'Earning Potential', value: product.earningPotential },
    { label: 'User Rating', value: `★ ${product.rating} / 5.0` },
    { label: 'Downloads', value: product.downloads },
    { label: 'License', value: 'Commercial & Personal (Royalty-free)' },
  ];

  let infoY = y + 1;
  for (const item of infoItems) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(item.label + ':', margin + 5, infoY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 30, 30);
    pdf.text(item.value, margin + 50, infoY);
    infoY += 6.5;
  }
  y = infoY + 6;

  // ══════════════════════════════════════════
  //  PROMPT SECTION
  // ══════════════════════════════════════════
  checkPageBreak(30);

  // Section header
  pdf.setFillColor(20, 20, 20);
  pdf.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(229, 138, 54);
  pdf.text('FULL PROMPT', margin + 5, y + 1);
  y += 12;

  // Prompt body
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 30, 30);
  y = drawWrappedText(product.promptPreview, margin, y, contentWidth, 5);
  y += 12;

  // ══════════════════════════════════════════
  //  HOW TO USE SECTION
  // ══════════════════════════════════════════
  checkPageBreak(50);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(20, 20, 20);
  pdf.text('How To Use This Prompt', margin, y);
  y += 8;

  const steps = [
    'Open your preferred AI platform (ChatGPT, Gemini, Claude, etc.)',
    'Copy the full prompt text from the section above',
    'Paste it into the AI chat and replace any [PLACEHOLDER] fields with your specific details',
    'Press Enter / Send and let the AI generate your professional output',
    'Review, refine if needed, and deliver to your client or use for your own project',
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(50, 50, 50);

  steps.forEach((step, i) => {
    checkPageBreak(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(229, 138, 54);
    pdf.text(`${i + 1}.`, margin, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    y = drawWrappedText(step, margin + 7, y, contentWidth - 7, 5);
    y += 3;
  });
  y += 5;

  // ══════════════════════════════════════════
  //  FOOTER
  // ══════════════════════════════════════════
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, pageHeight - 14, pageWidth, 14, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.text('© V — Digital Products Store  •  All rights reserved  •  Commercial & Personal License', margin, pageHeight - 6);
    pdf.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // ══════════════════════════════════════════
  //  Generate PDF → ZIP → Download
  // ══════════════════════════════════════════
  const pdfBlob = pdf.output('blob');
  const safeName = product.title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+$/, '').toLowerCase();

  const zip = new JSZip();
  zip.file(`${safeName}.pdf`, pdfBlob);

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  // Trigger browser download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates PDFs for all products in the bundle, wraps them in a single ZIP file,
 * and triggers a download in the user's browser.
 */
export async function downloadBundleAsZip(products: Product[]): Promise<void> {
  const zip = new JSZip();

  for (const product of products) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    const drawWrappedText = (
      text: string,
      x: number,
      startY: number,
      maxWidth: number,
      lineHeight: number
    ): number => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        checkPageBreak(lineHeight);
        pdf.text(line, x, startY);
        startY += lineHeight;
      }
      return startY;
    };

    // Header
    pdf.setFillColor(229, 138, 54);
    pdf.rect(0, 0, pageWidth, 32, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text('V — DIGITAL PRODUCTS STORE', margin, 12);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text('Complete AI Prompt Bundle', margin, 18);
    pdf.text(`Product ID: ${product.id.toUpperCase()}`, pageWidth - margin, 12, { align: 'right' });
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 18, { align: 'right' });

    y = 42;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(20, 20, 20);
    y = drawWrappedText(product.title, margin, y, contentWidth, 9);
    y += 4;

    pdf.setFillColor(229, 138, 54);
    const catText = product.category.toUpperCase();
    const catWidth = pdf.getTextWidth(catText) + 8;
    pdf.roundedRect(margin, y - 4, catWidth, 7, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text(catText, margin + 4, y);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    y = drawWrappedText(product.description, margin, y, contentWidth, 5.5);
    y += 8;

    // Prompt Section
    checkPageBreak(30);
    pdf.setFillColor(20, 20, 20);
    pdf.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(229, 138, 54);
    pdf.text('FULL PROMPT', margin + 5, y + 1);
    y += 12;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 30, 30);
    y = drawWrappedText(product.promptPreview, margin, y, contentWidth, 5);

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, pageHeight - 14, pageWidth, 14, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text('© V — Digital Products Store  •  All rights reserved', margin, pageHeight - 6);
      pdf.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }

    const pdfBlob = pdf.output('blob');
    const safeName = product.title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+$/, '').toLowerCase();
    zip.file(`${safeName}.pdf`, pdfBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `V-Digital-Complete-Prompt-Bundle.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
