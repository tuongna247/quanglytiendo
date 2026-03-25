#!/usr/bin/env node
/**
 * Tool kiểm tra chuỗi tiếng Việt trong file JSON
 * Usage: node check_vietnamese.cjs <file.json> [options]
 * Options:
 *   --key <key>      Chỉ kiểm tra key cụ thể (vd: --key "text")
 *   --show-all       Hiển thị tất cả các chuỗi có tiếng Việt
 *   --count-only     Chỉ hiển thị số lượng
 *   --no-viet        Tìm các chuỗi KHÔNG có tiếng Việt (dùng để phát hiện text chưa dịch)
 *   --bad-chars      Tìm chuỗi chứa ký tự sai (không đúng chuẩn Unicode tiếng Việt)
 */

const fs = require('fs');
const path = require('path');

// Regex nhận diện ký tự tiếng Việt (có dấu)
// Bao gồm cả Đ (U+0110 - tiếng Việt) và Ð (U+00D0 - Latin ETH, dùng trong một số bản Kinh Thánh)
const VIET_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐÐ]/;

// Danh sách ký tự sai - trông giống tiếng Việt nhưng sai Unicode
// Mỗi entry: { char, codepoint, name, suggest }
const BAD_CHARS = [
  // Chữ Đ - Ð (U+00D0 Latin ETH) được chấp nhận trong Kinh Thánh tiếng Việt, không báo lỗi
  // Cyrillic lookalikes
  { char: 'а', code: 0x0430, name: 'Cyrillic Small Letter A',  suggest: 'a' },
  { char: 'е', code: 0x0435, name: 'Cyrillic Small Letter IE', suggest: 'e' },
  { char: 'о', code: 0x043E, name: 'Cyrillic Small Letter O',  suggest: 'o' },
  { char: 'р', code: 0x0440, name: 'Cyrillic Small Letter ER', suggest: 'r' },
  { char: 'с', code: 0x0441, name: 'Cyrillic Small Letter ES', suggest: 'c' },
  { char: 'у', code: 0x0443, name: 'Cyrillic Small Letter U',  suggest: 'u' },
  // Dấu nháy / quote sai
  { char: '\u2018', code: 0x2018, name: 'Left Single Quotation Mark',   suggest: "'" },
  { char: '\u2019', code: 0x2019, name: 'Right Single Quotation Mark',  suggest: "'" },
  { char: '\u201C', code: 0x201C, name: 'Left Double Quotation Mark',   suggest: '"' },
  { char: '\u201D', code: 0x201D, name: 'Right Double Quotation Mark',  suggest: '"' },
  // Khoảng trắng đặc biệt
  { char: '\u00A0', code: 0x00A0, name: 'Non-Breaking Space',           suggest: 'space' },
  { char: '\u200B', code: 0x200B, name: 'Zero Width Space',             suggest: '(xóa)' },
  { char: '\u200C', code: 0x200C, name: 'Zero Width Non-Joiner',        suggest: '(xóa)' },
  { char: '\u200D', code: 0x200D, name: 'Zero Width Joiner',            suggest: '(xóa)' },
  { char: '\uFEFF', code: 0xFEFF, name: 'BOM / Zero Width No-Break',    suggest: '(xóa)' },
  // Dấu gạch ngang sai
  { char: '\u2013', code: 0x2013, name: 'En Dash',    suggest: '-' },
  { char: '\u2014', code: 0x2014, name: 'Em Dash',    suggest: '--' },
].filter(b => b.suggest !== null); // Bỏ qua các ký tự đúng

// Tập hợp các codepoint sai để tra nhanh
const BAD_CHAR_MAP = new Map(BAD_CHARS.map(b => [b.char, b]));

function findBadChars(str) {
  const found = [];
  // 1. Kiểm tra từng ký tự trong danh sách sai
  for (const [ch, info] of BAD_CHAR_MAP) {
    if (str.includes(ch)) {
      found.push({ ...info, count: [...str].filter(c => c === ch).length });
    }
  }
  // 2. Kiểm tra NFD (ký tự có dấu dạng tổ hợp rời thay vì NFC)
  const nfc = str.normalize('NFC');
  if (str !== nfc) {
    found.push({
      char: '(dấu tổ hợp)',
      code: null,
      name: 'Ký tự dạng NFD thay vì NFC',
      suggest: 'Dùng normalize NFC',
      count: [...str].length - [...nfc].length,
    });
  }
  return found;
}

function walkJsonBadChars(obj, jsonPath = '', results = []) {
  if (typeof obj === 'string') {
    const bad = findBadChars(obj);
    if (bad.length > 0) {
      results.push({ path: jsonPath, value: obj, issues: bad });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => walkJsonBadChars(item, `${jsonPath}[${i}]`, results));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      walkJsonBadChars(value, jsonPath ? `${jsonPath}.${key}` : key, results);
    }
  }
  return results;
}

function hasVietnamese(str) {
  return VIET_REGEX.test(str);
}

function walkJson(obj, path = '', results = [], targetKey = null, findNoViet = false) {
  if (typeof obj === 'string') {
    const isViet = hasVietnamese(obj);
    const shouldInclude = findNoViet ? !isViet : isViet;
    if (shouldInclude && obj.trim().length > 0) {
      results.push({ path, value: obj });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => walkJson(item, `${path}[${i}]`, results, targetKey, findNoViet));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (targetKey === null || key === targetKey) {
        walkJson(value, newPath, results, targetKey, findNoViet);
      } else {
        walkJson(value, newPath, results, targetKey, findNoViet);
      }
    }
  }
  return results;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node check_vietnamese.cjs <file.json> [options]

Options:
  --key <key>      Chỉ kiểm tra giá trị của key cụ thể
  --show-all       Hiển thị tất cả chuỗi tìm thấy (mặc định: 20 dòng đầu)
  --count-only     Chỉ hiển thị số lượng
  --no-viet        Tìm chuỗi KHÔNG có tiếng Việt
  --bad-chars      Tìm chuỗi chứa ký tự sai (không đúng chuẩn Unicode tiếng Việt)

Example:
  node check_vietnamese.cjs data.json
  node check_vietnamese.cjs data.json --key "name"
  node check_vietnamese.cjs data.json --no-viet --count-only
  node check_vietnamese.cjs data.json --bad-chars
  node check_vietnamese.cjs data.json --bad-chars --count-only
    `);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`Lỗi: Không tìm thấy file "${filePath}"`);
    process.exit(1);
  }

  let data;
  try {
    let raw = fs.readFileSync(filePath, 'utf-8');
    // Xóa BOM nếu có (UTF-8 BOM: \uFEFF)
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Lỗi parse JSON: ${err.message}`);
    // Trích xuất vị trí lỗi từ message (vd: "at position 1234")
    const posMatch = err.message.match(/at position (\d+)/);
    if (posMatch) {
      try {
        const raw2 = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
        const pos = parseInt(posMatch[1]);
        const lines = raw2.slice(0, pos).split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length + 1;
        const lineContent = raw2.split('\n')[lineNum - 1] || '';
        console.error(`  --> Dòng ${lineNum}, cột ${colNum}`);
        console.error(`  ${lineNum} | ${lineContent}`);
        console.error(`  ${' '.repeat(String(lineNum).length)} | ${' '.repeat(colNum - 1)}^`);
      } catch (_) {}
    }
    process.exit(1);
  }

  const targetKey = args.includes('--key') ? args[args.indexOf('--key') + 1] : null;
  const showAll = args.includes('--show-all');
  const countOnly = args.includes('--count-only');
  const findNoViet = args.includes('--no-viet');
  const findBadCharsMode = args.includes('--bad-chars');

  const fileSize = (fs.statSync(filePath).size / 1024).toFixed(1);
  console.log(`\n📄 File: ${path.resolve(filePath)} (${fileSize} KB)`);

  if (findBadCharsMode) {
    // --- Chế độ tìm ký tự sai ---
    console.log(`🔍 Chế độ: Tìm ký tự sai (không đúng chuẩn Unicode tiếng Việt)\n`);
    const results = walkJsonBadChars(data);

    // Tổng hợp thống kê theo loại ký tự sai
    const summary = new Map();
    results.forEach(({ issues }) => {
      issues.forEach(issue => {
        const key = issue.name;
        summary.set(key, (summary.get(key) || 0) + issue.count);
      });
    });

    console.log(`📊 Tổng số chuỗi có ký tự sai: ${results.length}`);
    if (summary.size > 0) {
      console.log(`\n📋 Thống kê theo loại:`);
      for (const [name, count] of summary) {
        const info = BAD_CHARS.find(b => b.name === name);
        const charDisplay = info && info.code ? `U+${info.code.toString(16).toUpperCase().padStart(4,'0')} "${info.char}"` : '';
        console.log(`   ${charDisplay.padEnd(20)} ${name.padEnd(35)} × ${count}  →  đề xuất: ${info?.suggest || '?'}`);
      }
    }

    if (!countOnly && results.length > 0) {
      console.log('');
      const display = showAll ? results : results.slice(0, 20);
      display.forEach(({ path: p, value, issues }) => {
        const preview = value.length > 100 ? value.slice(0, 97) + '...' : value;
        console.log(`  [${p}]`);
        console.log(`    "${preview}"`);
        issues.forEach(issue => {
          const charDisplay = issue.code ? `U+${issue.code.toString(16).toUpperCase().padStart(4,'0')} "${issue.char}"` : issue.char;
          console.log(`    ⚠ ${charDisplay} — ${issue.name}  →  ${issue.suggest}`);
        });
        console.log('');
      });
      if (!showAll && results.length > 20) {
        console.log(`  ... và ${results.length - 20} chuỗi khác. Dùng --show-all để xem tất cả.\n`);
      }
    }
  } else {
    // --- Chế độ tìm tiếng Việt / không tiếng Việt ---
    const results = walkJson(data, '', [], targetKey, findNoViet);
    const mode = findNoViet ? 'KHÔNG có tiếng Việt' : 'CÓ tiếng Việt';

    console.log(`🔍 Chế độ: Tìm chuỗi ${mode}`);
    if (targetKey) console.log(`🔑 Key filter: "${targetKey}"`);
    console.log(`📊 Tổng số chuỗi tìm thấy: ${results.length}\n`);

    if (!countOnly) {
      const display = showAll ? results : results.slice(0, 20);
      display.forEach(({ path: p, value }) => {
        const preview = value.length > 80 ? value.slice(0, 77) + '...' : value;
        console.log(`  [${p}]`);
        console.log(`    "${preview}"\n`);
      });
      if (!showAll && results.length > 20) {
        console.log(`  ... và ${results.length - 20} chuỗi khác. Dùng --show-all để xem tất cả.\n`);
      }
    }
  }
}

main();
