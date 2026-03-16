'use client';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePdfToPages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Join text items, inserting newlines where items have significant vertical gaps
    let pageText = '';
    let lastY = null;

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const currentY = item.transform[5];
      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        pageText += '\n';
      }
      pageText += item.str;
      lastY = currentY;
    }

    pages.push(pageText.trim());
  }

  return pages.filter(p => p.length > 0);
}
