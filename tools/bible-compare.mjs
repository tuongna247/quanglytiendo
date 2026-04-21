#!/usr/bin/env node
/**
 * Bible JSON comparison and auto-fix tool
 * Usage:
 *   node bible-compare.mjs report   → so sánh 2 file và xuất báo cáo
 *   node bible-compare.mjs fix      → tự động sửa lỗi encoding trong file hiện tại
 *   node bible-compare.mjs diff     → show diffs dạng đọc được (sách/chương/câu)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CURRENT_FILE = resolve(__dirname, '../web/public/bible.json');
const REFERENCE_FILE = resolve('D:/Projects/GitLap/kinhthanhmoingay/DoKinhThanh_Golang/web/public/bible.json');

// Các sách Kinh Thánh theo thứ tự (để hiển thị tên sách)
const BOOK_NAMES = {
  gn: 'Sáng Thế Ký', ex: 'Xuất Ê-díp-tô Ký', lv: 'Lê-vi Ký', nm: 'Dân Số Ký',
  dt: 'Phục Truyền Luật Lệ Ký', jos: 'Giô-suê', jdg: 'Các Quan Xét', ru: 'Ru-tơ',
  '1sa': '1 Sa-mu-ên', '2sa': '2 Sa-mu-ên', '1ki': '1 Các Vua', '2ki': '2 Các Vua',
  '1ch': '1 Sử Ký', '2ch': '2 Sử Ký', ezr: 'E-xơ-ra', ne: 'Nê-hê-mi',
  est: 'Ê-xơ-tê', job: 'Gióp', ps: 'Thi Thiên', pr: 'Châm Ngôn',
  ec: 'Truyền Đạo', ss: 'Nhã Ca', is: 'Ê-sai', jer: 'Giê-rê-mi',
  lam: 'Ca Thương', eze: 'Ê-xê-chi-ên', da: 'Đa-ni-ên', hos: 'Ô-sê',
  joe: 'Giô-ên', am: 'A-mốt', ob: 'Áp-đia', jon: 'Giô-na', mi: 'Mi-chê',
  nah: 'Na-hum', hab: 'Ha-ba-cúc', zep: 'Sô-phô-ni', hag: 'A-ghê',
  zec: 'Xa-cha-ri', mal: 'Ma-la-chi',
  mt: 'Ma-thi-ơ', mk: 'Mác', lk: 'Lu-ca', jn: 'Giăng', act: 'Công Vụ',
  ro: 'Rô-ma', '1co': '1 Cô-rinh-tô', '2co': '2 Cô-rinh-tô', gal: 'Ga-la-ti',
  eph: 'Ê-phê-sô', php: 'Phi-líp', col: 'Cô-lô-se', '1th': '1 Tê-sa-lô-ni-ca',
  '2th': '2 Tê-sa-lô-ni-ca', '1ti': '1 Ti-mô-thê', '2ti': '2 Ti-mô-thê',
  tit: 'Tít', phm: 'Phi-lê-môn', heb: 'Hê-bơ-rơ', jas: 'Gia-cơ',
  '1pe': '1 Phi-e-rơ', '2pe': '2 Phi-e-rơ', '1jn': '1 Giăng', '2jn': '2 Giăng',
  '3jn': '3 Giăng', jud: 'Giu-đe', rev: 'Khải Huyền',
};

function loadBible(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Xây dựng map: bookId → chapterIndex → verseIndex → text
function buildIndex(bible) {
  const index = new Map();
  for (const book of bible) {
    const chapMap = new Map();
    book.chapters.forEach((verses, ci) => {
      const verseMap = new Map();
      verses.forEach((v, vi) => verseMap.set(vi, v));
      chapMap.set(ci, verseMap);
    });
    index.set(book.id, chapMap);
  }
  return index;
}

function formatRef(bookId, chapterIdx, verseIdx) {
  const name = BOOK_NAMES[bookId] || bookId.toUpperCase();
  return `${name} ${chapterIdx + 1}:${verseIdx + 1}`;
}

// Phát hiện câu bị cắt ngắn (< 15 ký tự và không phải câu ngắn bình thường)
function isTruncated(text) {
  const t = text.trim();
  if (t.length < 15 && !t.match(/^\d+$/) && t.split(' ').length < 3) return true;
  return false;
}

// Kiểm tra lỗi encoding phổ biến
const ENCODING_PATTERNS = [
  { pattern: /\bAên\b/g,  fix: 'Ăn',  desc: 'Aên → Ăn' },
  { pattern: /\baên\b/g,  fix: 'ăn',  desc: 'aên → ăn' },
  { pattern: /\bAét\b/g,  fix: 'Ắt',  desc: 'Aét → Ắt' },
  { pattern: /\baét\b/g,  fix: 'ắt',  desc: 'aét → ắt' },
  { pattern: /\bAân\b/g,  fix: 'Ân',  desc: 'Aân → Ân' },
  { pattern: /\baân\b/g,  fix: 'ân',  desc: 'aân → ân' },
  { pattern: /\bAâu\b/g,  fix: 'Âu',  desc: 'Aâu → Âu' },
  { pattern: /\baâu\b/g,  fix: 'âu',  desc: 'aâu → âu' },
  { pattern: /\bAên\b/g,  fix: 'Ăn',  desc: 'Aên → Ăn (duplicate check)' },
  { pattern: /đí gì\b/g,  fix: 'gì',  desc: 'đí gì → gì' },
];

function checkEncodingErrors(text) {
  const errors = [];
  for (const { pattern, desc } of ENCODING_PATTERNS) {
    if (pattern.test(text)) {
      errors.push(desc);
      pattern.lastIndex = 0;
    }
  }
  return errors;
}

function autoFixEncoding(text) {
  let result = text;
  for (const { pattern, fix } of ENCODING_PATTERNS) {
    result = result.replace(pattern, fix);
    pattern.lastIndex = 0;
  }
  return result;
}

// ── COMMANDS ────────────────────────────────────────────────────────────────

function cmdDiff() {
  console.log('So sánh 2 file bible.json...\n');
  const current = loadBible(CURRENT_FILE);
  let reference;
  try {
    reference = loadBible(REFERENCE_FILE);
  } catch {
    console.log('⚠️  Không tìm thấy file tham chiếu DoKinhThanh.\n   Chỉ kiểm tra lỗi encoding trong file hiện tại.\n');
    reference = null;
  }

  const curIdx = buildIndex(current);
  const refIdx = reference ? buildIndex(reference) : null;

  let diffCount = 0;
  const results = [];

  for (const book of current) {
    const bookId = book.id;
    const refBook = refIdx?.get(bookId);

    book.chapters.forEach((verses, ci) => {
      verses.forEach((verse, vi) => {
        const ref = refBook?.get(ci)?.get(vi);
        const encodingErrs = checkEncodingErrors(verse);
        const truncated = isTruncated(verse);
        const refTruncated = ref ? isTruncated(ref) : false;

        const issues = [];

        if (encodingErrs.length > 0) {
          issues.push({ type: 'encoding', desc: encodingErrs.join(', ') });
        }
        if (truncated) {
          issues.push({ type: 'truncated', desc: `Câu bị cắt ngắn: "${verse.trim()}"` });
        }
        if (ref && ref !== verse) {
          if (!refTruncated && !truncated) {
            issues.push({ type: 'content', desc: `Khác nội dung\n    CURRENT: ${verse.trim()}\n    REFERENCE: ${ref.trim()}` });
          } else if (!refTruncated && truncated) {
            issues.push({ type: 'truncated-fix', desc: `Câu đầy đủ trong reference:\n    REFERENCE: ${ref.trim()}` });
          }
        }

        if (issues.length > 0) {
          diffCount++;
          results.push({ ref: formatRef(bookId, ci, vi), issues });
        }
      });
    });
  }

  for (const { ref, issues } of results) {
    console.log(`📍 ${ref}`);
    for (const issue of issues) {
      const icon = issue.type === 'encoding' ? '🔤' : issue.type === 'truncated' ? '✂️' : issue.type === 'truncated-fix' ? '🔧' : '⚠️';
      console.log(`  ${icon} [${issue.type}] ${issue.desc}`);
    }
    console.log();
  }

  console.log(`\n✅ Tổng cộng: ${diffCount} câu có vấn đề`);
}

function cmdReport() {
  console.log('Tạo báo cáo chi tiết...\n');
  const current = loadBible(CURRENT_FILE);
  let reference;
  try {
    reference = loadBible(REFERENCE_FILE);
  } catch {
    reference = null;
  }

  const refIdx = reference ? buildIndex(reference) : null;
  const stats = { encoding: 0, truncated: 0, content: 0, total: 0 };
  const lines = ['# Báo cáo kiểm tra Bible JSON', `**File:** ${CURRENT_FILE}`, `**Ngày:** ${new Date().toLocaleDateString('vi-VN')}`, ''];

  for (const book of current) {
    const bookId = book.id;
    const refBook = refIdx?.get(bookId);
    const bookIssues = [];

    book.chapters.forEach((verses, ci) => {
      verses.forEach((verse, vi) => {
        const ref = refBook?.get(ci)?.get(vi);
        const encodingErrs = checkEncodingErrors(verse);
        const truncated = isTruncated(verse);
        const issues = [];

        if (encodingErrs.length > 0) {
          issues.push(`🔤 Encoding: ${encodingErrs.join(', ')}`);
          stats.encoding++;
        }
        if (truncated) {
          issues.push(`✂️ Bị cắt ngắn: "${verse.trim()}"`);
          stats.truncated++;
        }
        if (ref && ref !== verse && !isTruncated(ref) && !truncated && encodingErrs.length === 0) {
          issues.push(`⚠️ Khác reference:\n  - Current: ${verse.trim()}\n  - Reference: ${ref.trim()}`);
          stats.content++;
        }

        if (issues.length > 0) {
          stats.total++;
          bookIssues.push(`### ${formatRef(bookId, ci, vi)}\n${issues.map(i => `- ${i}`).join('\n')}`);
        }
      });
    });

    if (bookIssues.length > 0) {
      lines.push(`## ${BOOK_NAMES[bookId] || bookId}`);
      lines.push(...bookIssues, '');
    }
  }

  lines.unshift(
    '',
    `## Tổng kết`,
    `- 🔤 Lỗi encoding: **${stats.encoding}**`,
    `- ✂️ Câu bị cắt: **${stats.truncated}**`,
    `- ⚠️ Khác nội dung: **${stats.content}**`,
    `- 📊 Tổng: **${stats.total}** câu`,
    '',
    '---',
    '',
  );

  const reportPath = resolve(__dirname, 'bible-report.md');
  writeFileSync(reportPath, lines.join('\n'), 'utf-8');
  console.log(`✅ Đã tạo báo cáo: ${reportPath}`);
  console.log(`   Encoding: ${stats.encoding} | Cắt ngắn: ${stats.truncated} | Nội dung: ${stats.content} | Tổng: ${stats.total}`);
}

function cmdFix() {
  console.log('Tự động sửa lỗi encoding trong bible.json...\n');
  const raw = readFileSync(CURRENT_FILE, 'utf-8');
  const bible = JSON.parse(raw);
  let fixCount = 0;

  for (const book of bible) {
    book.chapters.forEach((verses, ci) => {
      verses.forEach((verse, vi) => {
        const fixed = autoFixEncoding(verse);
        if (fixed !== verse) {
          book.chapters[ci][vi] = fixed;
          fixCount++;
          console.log(`  ✏️  ${formatRef(book.id, ci, vi)}: "${verse.trim().slice(0, 60)}..."`);
        }
      });
    });
  }

  if (fixCount > 0) {
    const backupPath = CURRENT_FILE.replace('.json', '.backup.json');
    writeFileSync(backupPath, raw, 'utf-8');
    console.log(`\n💾 Đã backup: ${backupPath}`);

    writeFileSync(CURRENT_FILE, JSON.stringify(bible, null, 2), 'utf-8');
    console.log(`✅ Đã sửa ${fixCount} câu trong ${CURRENT_FILE}`);
  } else {
    console.log('✅ Không tìm thấy lỗi encoding cần sửa!');
  }
}

// ── MAIN ────────────────────────────────────────────────────────────────────

const cmd = process.argv[2] || 'diff';
if (cmd === 'diff') cmdDiff();
else if (cmd === 'report') cmdReport();
else if (cmd === 'fix') cmdFix();
else {
  console.log('Usage: node bible-compare.mjs [diff|report|fix]');
  console.log('  diff   - So sánh và hiển thị các câu khác nhau');
  console.log('  report - Tạo báo cáo chi tiết dạng Markdown');
  console.log('  fix    - Tự động sửa lỗi encoding (tạo backup trước)');
}
