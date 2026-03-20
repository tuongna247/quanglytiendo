/**
 * convert_bible.js
 * Converts super_bible_NIV.csv → bible_NIV.json
 * Output format matches web/public/bible.json:
 *   [ { "id": "gn", "chapters": [ [v1, v2, ...], [...] ] }, ... ]
 *
 * Usage: node convert_bible.js
 */

const fs = require('fs');
const path = require('path');

// Book IDs in canonical order (matches existing bible.json)
const BOOK_IDS = [
  'gn','ex','lv','nm','dt','js','jud','rt',
  '1sm','2sm','1kgs','2kgs','1ch','2ch','ezr','ne',
  'et','job','ps','prv','ec','so','is','jr',
  'lm','ez','dn','ho','jl','am','ob','jn',
  'mi','na','hk','zp','hg','zc','ml',
  'mt','mk','lk','jo','act','rm',
  '1co','2co','gl','eph','ph','cl',
  '1ts','2ts','1tm','2tm','tt','phm','hb',
  'jm','1pe','2pe','1jo','2jo','3jo','jd','re',
];

const INPUT  = path.join(__dirname, 'super_bible_NIV.csv');
const OUTPUT = path.join(__dirname, 'bible_NIV.json');

// ── Parse CSV (handles quoted fields with embedded commas/newlines) ───────────
function parseCSV(text) {
  const rows = [];
  let i = 0;
  // Skip BOM if present
  if (text.charCodeAt(0) === 0xFEFF) i = 1;

  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      if (text[i] === '"') {
        // Quoted field
        let field = '';
        i++; // skip opening "
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
          else if (text[i] === '"') { i++; break; }
          else { field += text[i++]; }
        }
        row.push(field);
        if (text[i] === ',') i++;
        else break; // \n or end
      } else {
        // Unquoted field
        let start = i;
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') i++;
        row.push(text.slice(start, i));
        if (text[i] === ',') i++;
        else break;
      }
    }
    // Skip \r\n
    if (text[i] === '\r') i++;
    if (text[i] === '\n') i++;

    if (row.length >= 6) rows.push(row);
  }
  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('Reading CSV...');
const raw = fs.readFileSync(INPUT, 'utf-8');
const rows = parseCSV(raw);

// First row = header: testament,book,title,chapter,verse,text,version,language
const header = rows[0].map(h => h.toLowerCase().trim());
const iBook    = header.indexOf('book');
const iChapter = header.indexOf('chapter');
const iVerse   = header.indexOf('verse');
const iText    = header.indexOf('text');

if ([iBook, iChapter, iVerse, iText].includes(-1)) {
  console.error('Could not find required columns. Header:', header);
  process.exit(1);
}

console.log(`Parsed ${rows.length - 1} verses. Converting...`);

// Build structure: bookMap[bookNum][chapterNum][verseNum] = text
const bookMap = {};
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const bookNum    = parseInt(row[iBook]);
  const chapterNum = parseInt(row[iChapter]);
  const verseNum   = parseInt(row[iVerse]);
  const text       = row[iText].trim();

  if (!bookMap[bookNum]) bookMap[bookNum] = {};
  if (!bookMap[bookNum][chapterNum]) bookMap[bookNum][chapterNum] = {};
  bookMap[bookNum][chapterNum][verseNum] = text;
}

// Convert to output format
const output = [];
for (let bookNum = 1; bookNum <= 66; bookNum++) {
  const id = BOOK_IDS[bookNum - 1];
  const chaptersObj = bookMap[bookNum];
  if (!chaptersObj) { console.warn(`  Warning: book ${bookNum} (${id}) missing`); continue; }

  const chapNums = Object.keys(chaptersObj).map(Number).sort((a, b) => a - b);
  const chapters = chapNums.map(ch => {
    const versesObj = chaptersObj[ch];
    const verseNums = Object.keys(versesObj).map(Number).sort((a, b) => a - b);
    return verseNums.map(v => versesObj[v]);
  });

  output.push({ id, chapters });
}

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

// Stats
const totalVerses = output.reduce((s, b) => s + b.chapters.reduce((s2, c) => s2 + c.length, 0), 0);
console.log(`Done! ${output.length} books, ${totalVerses} verses`);
console.log(`Output: ${OUTPUT}`);
