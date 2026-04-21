#!/usr/bin/env node
/**
 * Convert USX 3.0 files → bible.json format
 * Usage: node tools/bible-convert-usx.mjs <usx-dir> <output.json>
 * Example: node tools/bible-convert-usx.mjs bible_vietnamese/release/USX_1 web/public/bible_VIE1925.json
 */

import fs from 'fs';
import path from 'path';

// USX book code → app book ID mapping
const USX_TO_ID = {
  GEN:'gn', EXO:'ex', LEV:'lv', NUM:'nm', DEU:'dt',
  JOS:'js', JDG:'jud', RUT:'rt',
  '1SA':'1sm', '2SA':'2sm',
  '1KI':'1kgs', '2KI':'2kgs',
  '1CH':'1ch', '2CH':'2ch',
  EZR:'ezr', NEH:'ne', EST:'et',
  JOB:'job', PSA:'ps', PRO:'prv', ECC:'ec', SNG:'so',
  ISA:'is', JER:'jr', LAM:'lm', EZK:'ez', DAN:'dn',
  HOS:'ho', JOL:'jl', AMO:'am', OBA:'ob', JON:'jn',
  MIC:'mi', NAM:'na', HAB:'hk', ZEP:'zp', HAG:'hg',
  ZEC:'zc', MAL:'ml',
  MAT:'mt', MRK:'mk', LUK:'lk', JHN:'jo',
  ACT:'act', ROM:'rm',
  '1CO':'1co', '2CO':'2co',
  GAL:'gl', EPH:'eph', PHP:'ph', COL:'cl',
  '1TH':'1ts', '2TH':'2ts',
  '1TI':'1tm', '2TI':'2tm',
  TIT:'tt', PHM:'phm', HEB:'hb', JAS:'jm',
  '1PE':'1pe', '2PE':'2pe',
  '1JN':'1jo', '2JN':'2jo', '3JN':'3jo',
  JUD:'jd', REV:'re',
};

// Canonical book order (same as app)
const BOOK_ORDER = [
  'gn','ex','lv','nm','dt','js','jud','rt','1sm','2sm','1kgs','2kgs',
  '1ch','2ch','ezr','ne','et','job','ps','prv','ec','so',
  'is','jr','lm','ez','dn','ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml',
  'mt','mk','lk','jo','act','rm','1co','2co','gl','eph','ph','cl',
  '1ts','2ts','1tm','2tm','tt','phm','hb','jm','1pe','2pe','1jo','2jo','3jo','jd','re',
];

function stripTags(xml) {
  return xml.replace(/<[^>]+>/g, '').trim();
}

function parseUSX(content) {
  // Extract book code
  const bookMatch = content.match(/<book code="([A-Z0-9]+)"/);
  if (!bookMatch) return null;
  const usxCode = bookMatch[1];
  const bookId = USX_TO_ID[usxCode];
  if (!bookId) {
    console.warn(`  Unknown USX code: ${usxCode}`);
    return null;
  }

  // Build chapters array: chapters[chIdx] = array of verse strings
  const chapters = [];
  let currentChapter = -1;

  // Match verse blocks: <verse ... sid="BOOK CH:V" />...text...<verse eid="BOOK CH:V" />
  // We need to capture text between sid and eid markers
  const versePattern = /<verse[^>]+sid="[A-Z0-9]+ (\d+):(\d+)"[^/]*\/>([\s\S]*?)<verse[^>]+eid="[A-Z0-9]+ \1:\2"[^/]*\/>/g;

  let match;
  while ((match = versePattern.exec(content)) !== null) {
    const chNum = parseInt(match[1], 10);
    // const vNum = parseInt(match[2], 10); // verse number (unused — array index is enough)
    const rawText = match[3];
    const verseText = stripTags(rawText).replace(/\s+/g, ' ').trim();

    if (chNum !== currentChapter) {
      currentChapter = chNum;
      // Ensure chapters array is large enough
      while (chapters.length < chNum) chapters.push([]);
    }

    chapters[chNum - 1].push(verseText);
  }

  return { id: bookId, chapters };
}

function main() {
  const [,, usxDir, outputFile] = process.argv;
  if (!usxDir || !outputFile) {
    console.error('Usage: node tools/bible-convert-usx.mjs <usx-dir> <output.json>');
    process.exit(1);
  }

  const absDir = path.resolve(usxDir);
  const absOut = path.resolve(outputFile);

  if (!fs.existsSync(absDir)) {
    console.error(`Directory not found: ${absDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(absDir).filter(f => f.endsWith('.usx'));
  console.log(`Found ${files.length} USX files in ${absDir}`);

  const bookMap = {};
  for (const file of files) {
    const content = fs.readFileSync(path.join(absDir, file), 'utf-8');
    const result = parseUSX(content);
    if (!result) { console.warn(`  Skipped: ${file}`); continue; }
    bookMap[result.id] = result.chapters;
    console.log(`  ${file} → ${result.id} (${result.chapters.length} chapters, ${result.chapters.reduce((s,c)=>s+c.length,0)} verses)`);
  }

  // Output in canonical order
  const output = BOOK_ORDER
    .filter(id => bookMap[id])
    .map(id => ({ id, chapters: bookMap[id] }));

  fs.writeFileSync(absOut, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nWrote ${output.length} books to ${absOut}`);

  // Quick sanity check
  const totalVerses = output.reduce((s, b) => s + b.chapters.reduce((s2, c) => s2 + c.length, 0), 0);
  console.log(`Total verses: ${totalVerses} (expected ~31102)`);
}

main();
