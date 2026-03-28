#!/usr/bin/env node
/**
 * Fix từng chuỗi bị lỗi encoding trong file JSON - confirm từng cái
 * Usage: node fix_vietnamese.cjs <file.json>
 */

const fs = require('fs');
const readline = require('readline');

// ── Cấu hình detect lỗi (giống check_vietnamese.cjs) ─────────────────────────
const VALID_VIET_1EXX = new Set(
  'ẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ'
);
const BAD_CP_RANGES = [
  [0x0080, 0x009F],
  [0x00A1, 0x00B4],
  [0x00B6, 0x00BF],
];

function hasBadChar(str) {
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (BAD_CP_RANGES.some(([a, b]) => cp >= a && cp <= b)) return true;
    if (cp >= 0x1E00 && cp <= 0x1EFF && !VALID_VIET_1EXX.has(ch)) return true;
  }
  return false;
}

// Highlight ký tự sai trong chuỗi (bao quanh bằng >>> <<<)
function highlight(str) {
  let out = '';
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    const bad =
      BAD_CP_RANGES.some(([a, b]) => cp >= a && cp <= b) ||
      (cp >= 0x1E00 && cp <= 0x1EFF && !VALID_VIET_1EXX.has(ch));
    out += bad ? `\x1b[41m\x1b[97m${ch}\x1b[0m` : ch;
  }
  return out;
}

// ── Duyệt JSON lấy tất cả string lỗi ─────────────────────────────────────────
function collectBadStrings(obj, path = '', results = []) {
  if (typeof obj === 'string') {
    if (hasBadChar(obj)) results.push({ path, value: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectBadStrings(item, `${path}[${i}]`, results));
  } else if (typeof obj !== null && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj))
      collectBadStrings(v, path ? `${path}.${k}` : k, results);
  }
  return results;
}

// Ghi giá trị mới vào đúng path trong object
function setByPath(obj, path, value) {
  const parts = [];
  for (const m of path.matchAll(/\.?([^.\[]+)|\[(\d+)\]/g)) {
    parts.push(m[2] !== undefined ? parseInt(m[2]) : m[1]);
  }
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const filePath = process.argv[2];
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('Usage: node fix_vietnamese.cjs <file.json>');
    process.exit(1);
  }

  let raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const data = JSON.parse(raw);
  const items = collectBadStrings(data);

  if (items.length === 0) {
    console.log('Không tìm thấy chuỗi lỗi nào.');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(res => rl.question(q, res));

  console.log(`\nTìm thấy \x1b[33m${items.length}\x1b[0m chuỗi lỗi. Bắt đầu fix từng cái...\n`);
  console.log('Hướng dẫn:');
  console.log('  - Nhập text đúng rồi Enter để fix');
  console.log('  - Nhấn Enter (bỏ trống) để bỏ qua');
  console.log('  - Gõ q rồi Enter để thoát\n');

  let fixed = 0;
  let skipped = 0;

  for (let i = 0; i < items.length; i++) {
    const { path, value } = items[i];
    const preview = value.length > 120 ? value.slice(0, 117) + '...' : value;

    console.log(`\n\x1b[36m[${ i + 1}/${ items.length}]\x1b[0m \x1b[90m${path}\x1b[0m`);
    console.log(`Gốc   : ${highlight(preview)}`);

    const ans = await ask(`Sửa  : `);

    if (ans.trim().toLowerCase() === 'q') {
      console.log('\nThoát.');
      break;
    }

    if (ans.trim() === '') {
      console.log('\x1b[33m  → Bỏ qua\x1b[0m');
      skipped++;
    } else {
      setByPath(data, path, ans.trim());
      console.log('\x1b[32m  → Đã ghi nhận\x1b[0m');
      fixed++;
    }
  }

  rl.close();

  if (fixed > 0) {
    // Backup file gốc
    const backupPath = filePath + '.bak';
    fs.copyFileSync(filePath, backupPath);
    console.log(`\nBackup: ${backupPath}`);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\x1b[32mĐã lưu ${fixed} sửa đổi vào ${filePath}\x1b[0m`);
  } else {
    console.log('\nKhông có thay đổi nào được lưu.');
  }

  console.log(`\nTóm tắt: ${fixed} đã fix, ${skipped} bỏ qua / ${items.length} tổng\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
