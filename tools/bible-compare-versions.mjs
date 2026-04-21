#!/usr/bin/env node
/**
 * Compare two bible JSON files verse by verse.
 * Handles both old format (array of strings) and new format (mixed array with section headers).
 *
 * Usage:
 *   node tools/bible-compare-versions.mjs <file1> <file2> [--limit N] [--book gn]
 *
 * Example:
 *   node tools/bible-compare-versions.mjs backup/bible/bible_VI1934_original.json web/public/bible_VI1934.json
 *   node tools/bible-compare-versions.mjs backup/bible/bible_VI1934_original.json web/public/bible_VI1934.json --book gn
 */

import fs from 'fs';

const args = process.argv.slice(2);
const file1 = args[0];
const file2 = args[1];
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : 30;
const bookIdx = args.indexOf('--book');
const ONLY_BOOK = bookIdx !== -1 ? args[bookIdx + 1] : null;

if (!file1 || !file2) {
  console.error('Usage: node tools/bible-compare-versions.mjs <file1> <file2> [--limit N] [--book gn]');
  process.exit(1);
}

function loadBible(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const map = {};
  for (const book of data) {
    map[book.id] = book.chapters.map(ch =>
      Array.isArray(ch)
        ? ch.filter(item => typeof item === 'string')  // new mixed format
        : ch                                            // old plain array
    );
  }
  return map;
}

const b1 = loadBible(file1);
const b2 = loadBible(file2);

const books1 = new Set(Object.keys(b1));
const books2 = new Set(Object.keys(b2));

// Missing books
const onlyIn1 = [...books1].filter(b => !books2.has(b));
const onlyIn2 = [...books2].filter(b => !books1.has(b));
if (onlyIn1.length) console.log(`Only in file1: ${onlyIn1.join(', ')}`);
if (onlyIn2.length) console.log(`Only in file2: ${onlyIn2.join(', ')}`);

const allBooks = [...books1].filter(b => books2.has(b));
const toCompare = ONLY_BOOK ? allBooks.filter(b => b === ONLY_BOOK) : allBooks;

let totalDiffs = 0;
let shown = 0;

for (const bookId of toCompare) {
  const chs1 = b1[bookId];
  const chs2 = b2[bookId];

  if (chs1.length !== chs2.length) {
    console.log(`\n[${bookId}] Chapter count differs: ${chs1.length} vs ${chs2.length}`);
  }

  for (let ci = 0; ci < Math.max(chs1.length, chs2.length); ci++) {
    const ch1 = chs1[ci] || [];
    const ch2 = chs2[ci] || [];

    if (ch1.length !== ch2.length && shown < LIMIT) {
      console.log(`\n[${bookId} ch${ci + 1}] Verse count: ${ch1.length} vs ${ch2.length}`);
    }

    for (let vi = 0; vi < Math.max(ch1.length, ch2.length); vi++) {
      const v1 = ch1[vi] || '(missing)';
      const v2 = ch2[vi] || '(missing)';
      if (v1 !== v2) {
        totalDiffs++;
        if (shown < LIMIT) {
          console.log(`\n[${bookId} ${ci + 1}:${vi + 1}]`);
          console.log(`  A: ${v1}`);
          console.log(`  B: ${v2}`);
          shown++;
        }
      }
    }
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`Total differences: ${totalDiffs}`);
if (totalDiffs === 0) console.log('✓ Files are identical (verse text)');
else if (shown < totalDiffs) console.log(`(showing first ${shown} of ${totalDiffs} — use --limit N to see more)`);
