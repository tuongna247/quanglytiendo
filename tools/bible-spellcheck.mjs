#!/usr/bin/env node
/**
 * Bible spell-check using LanguageTool public API (free, no install)
 * Chỉ báo lỗi thực sự — bỏ qua từ cổ hợp lệ của bản Kinh Thánh 1934
 *
 * Usage:
 *   node bible-spellcheck.mjs            → check toàn bộ (chậm ~30 phút)
 *   node bible-spellcheck.mjs gn         → check 1 sách
 *   node bible-spellcheck.mjs gn ps mt   → check nhiều sách
 *   node bible-spellcheck.mjs --resume   → tiếp tục từ điểm dừng
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIBLE_FILE   = resolve(__dirname, '../web/public/bible.json');
const REPORT_FILE  = resolve(__dirname, 'spellcheck-report.json');
const PROGRESS_FILE = resolve(__dirname, 'spellcheck-progress.json');

const LT_API = 'https://api.languagetool.org/v2/check';
const LANG   = 'vi';

// Từ cổ / từ đặc thù Kinh Thánh 1934 — bỏ qua lỗi chứa các từ này
const ARCHAIC_WHITELIST = [
  'bèn', 'nầy', 'chớ', 'hãy', 'vả', 'ấy', 'nầy', 'kia', 'vậy',
  'đặng', 'thì', 'chúa', 'đức', 'giê-hô-va', 'jêsus', 'christ',
  'si-ôn', 'hê-bơ-rơ', 'y-sơ-ra-ên', 'giu-đa', 'giê-ru-sa-lem',
  'thầy tế lễ', 'hội chúng', 'con trai', 'phán rằng', 'nói rằng',
  'đến đời đời', 'đời đời', 'nguyện', 'đấng', 'hỡi', 'thật',
  'a-men', 'ha-lê-lu-gia', 'giô-suê', 'môi-se', 'đa-vít',
];

// Rule IDs của LanguageTool cần bỏ qua (false positive cho văn cổ)
const SKIP_RULE_IDS = new Set([
  'WHITESPACE_RULE',
  'PUNCTUATION_PARAGRAPH_END',
  'COMMA_PARENTHESIS_WHITESPACE',
  'UNLIKELY_OPENING_PUNCTUATION',
  'DOUBLE_PUNCTUATION',
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function isWhitelisted(message, context) {
  const lower = (message + context).toLowerCase();
  return ARCHAIC_WHITELIST.some(w => lower.includes(w));
}

async function checkText(text) {
  const body = new URLSearchParams({
    text,
    language: LANG,
    disabledRules: [...SKIP_RULE_IDS].join(','),
  });

  const res = await fetch(LT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

function buildIndex(bible) {
  const map = new Map();
  bible.forEach((book, bi) => {
    book.chapters.forEach((verses, ci) => {
      verses.forEach((verse, vi) => {
        map.set(`${book.id}:${ci}:${vi}`, { bi, ci, vi, text: verse });
      });
    });
  });
  return map;
}

function formatRef(bookId, ci, vi) {
  return `${bookId.toUpperCase()} ${ci + 1}:${vi + 1}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const args = process.argv.slice(2);
  const resume = args.includes('--resume');
  const bookFilter = args.filter(a => !a.startsWith('--'));

  const bible = JSON.parse(readFileSync(BIBLE_FILE, 'utf-8'));

  // Load progress nếu resume
  let done = new Set();
  if (resume && existsSync(PROGRESS_FILE)) {
    done = new Set(JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8')));
    console.log(`♻️  Tiếp tục — đã xong ${done.size} câu trước đó`);
  }

  // Load report cũ nếu resume
  let results = [];
  if (resume && existsSync(REPORT_FILE)) {
    results = JSON.parse(readFileSync(REPORT_FILE, 'utf-8'));
  }

  // Lọc sách cần check
  const books = bookFilter.length > 0
    ? bible.filter(b => bookFilter.includes(b.id))
    : bible;

  if (books.length === 0) {
    console.error('❌ Không tìm thấy sách:', bookFilter.join(', '));
    process.exit(1);
  }

  const totalVerses = books.reduce((s, b) => s + b.chapters.flat().length, 0);
  console.log(`📖 Kiểm tra ${totalVerses} câu trong ${books.length} sách...`);
  console.log(`⏱️  Ước tính: ~${Math.ceil(totalVerses / 20)} giây (rate limit 20 req/min)\n`);

  let checked = 0;
  let errors  = 0;
  let reqCount = 0;

  for (const book of books) {
    for (let ci = 0; ci < book.chapters.length; ci++) {
      for (let vi = 0; vi < book.chapters[ci].length; vi++) {
        const key  = `${book.id}:${ci}:${vi}`;
        const text = book.chapters[ci][vi].trim();

        if (done.has(key) || !text || text.length < 4) {
          checked++;
          continue;
        }

        // Rate limit: 20 req/min → đợi 3s giữa các request
        if (reqCount > 0 && reqCount % 20 === 0) {
          process.stdout.write('\n⏳ Đợi 60s (rate limit)...\n');
          await sleep(61000);
        }

        try {
          const data = await checkText(text);
          reqCount++;
          checked++;

          const matches = (data.matches || []).filter(m => {
            if (SKIP_RULE_IDS.has(m.rule?.id)) return false;
            if (isWhitelisted(m.message, m.context?.text || '')) return false;
            // Chỉ lấy lỗi có độ tin cậy cao
            if ((m.rule?.issueType || '') === 'style') return false;
            return true;
          });

          if (matches.length > 0) {
            errors++;
            const item = {
              ref: formatRef(book.id, ci, vi),
              bookId: book.id,
              chapter: ci + 1,
              verse: vi + 1,
              text,
              issues: matches.map(m => ({
                type: m.rule?.issueType || 'unknown',
                ruleId: m.rule?.id,
                message: m.message,
                offset: m.offset,
                length: m.length,
                context: m.context?.text,
                suggestions: (m.replacements || []).slice(0, 3).map(r => r.value),
              })),
            };
            results.push(item);

            // Highlight lỗi trong text
            let highlighted = text;
            const sorted = [...matches].sort((a, b) => b.offset - a.offset);
            for (const m of sorted) {
              const bad = text.slice(m.offset, m.offset + m.length);
              highlighted = highlighted.slice(0, m.offset) + `[${bad}]` + highlighted.slice(m.offset + m.length);
            }

            console.log(`\n❗ ${formatRef(book.id, ci, vi)}`);
            console.log(`   ${highlighted}`);
            matches.forEach(m => {
              const sugg = (m.replacements || []).slice(0, 2).map(r => r.value).join(', ');
              console.log(`   → ${m.message}${sugg ? ` (gợi ý: ${sugg})` : ''}`);
            });
          }

          // Progress indicator
          if (checked % 100 === 0) {
            process.stdout.write(`\r✓ ${checked}/${totalVerses} câu | ❗ ${errors} lỗi`);
          }

          done.add(key);
        } catch (err) {
          console.error(`\n⚠️  Lỗi API tại ${formatRef(book.id, ci, vi)}: ${err.message}`);
          // Lưu progress và retry sau
          writeFileSync(PROGRESS_FILE, JSON.stringify([...done]), 'utf-8');
          writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2), 'utf-8');
          await sleep(5000);
        }

        await sleep(3100); // 3.1s giữa requests → ~19 req/min
      }
    }
  }

  // Lưu kết quả
  writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  writeFileSync(PROGRESS_FILE, JSON.stringify([...done]), 'utf-8');

  // Tạo báo cáo Markdown
  const mdLines = [
    '# Báo cáo Spell-check Bible (LanguageTool)',
    `**Ngày:** ${new Date().toLocaleDateString('vi-VN')}`,
    `**Tổng câu kiểm tra:** ${checked}`,
    `**Câu có lỗi:** ${results.length}`,
    '',
    '---',
    '',
  ];

  for (const item of results) {
    mdLines.push(`## ${item.ref}`);
    mdLines.push(`> ${item.text}`);
    mdLines.push('');
    for (const issue of item.issues) {
      const sugg = issue.suggestions.length > 0 ? ` → \`${issue.suggestions.join('` / `')}\`` : '';
      mdLines.push(`- **[${issue.ruleId}]** ${issue.message}${sugg}`);
    }
    mdLines.push('');
  }

  const mdPath = resolve(__dirname, 'spellcheck-report.md');
  writeFileSync(mdPath, mdLines.join('\n'), 'utf-8');

  console.log(`\n\n✅ Xong! ${checked} câu | ❗ ${results.length} câu có lỗi`);
  console.log(`📄 Báo cáo: ${mdPath}`);
  console.log(`📋 JSON:    ${REPORT_FILE}`);
}

run().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
