'use client';
import mammoth from 'mammoth';

const WORDS_PER_PAGE = 400;

export async function parseDocxToPages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const fullText = result.value;

  const paragraphs = fullText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const pages = [];
  let currentPage = [];
  let wordCount = 0;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).length;
    if (wordCount + paraWords > WORDS_PER_PAGE && currentPage.length > 0) {
      pages.push(currentPage.join('\n\n'));
      currentPage = [para];
      wordCount = paraWords;
    } else {
      currentPage.push(para);
      wordCount += paraWords;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n\n'));
  }

  return pages.length > 0 ? pages : [''];
}
