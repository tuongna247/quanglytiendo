#!/usr/bin/env node
/**
 * Scrape Bible from kinhthanh.httlvn.org
 * Usage: node tools/bible-scrape-httlvn.mjs [VERSION]
 *   node tools/bible-scrape-httlvn.mjs VI1934
 *   node tools/bible-scrape-httlvn.mjs RVV11
 *
 * Output:
 *   scraped/[VERSION]/[bookId]/[ch].txt   — human-readable per chapter (for inspection)
 *   web/public/bible_[VERSION].json       — final JSON
 *
 * Chapter format: array of mixed items
 *   string            → verse text
 *   { s, ctx? }       → section header (s = title, ctx = optional context/outline note)
 */

import fs from 'fs';
import path from 'path';

const VERSION = process.argv[2] || 'VI1934';
const DELAY_MS = 250;

// [siteCode, appId, chapterCount]
const BOOKS = [
  ['sa',   'gn',   50], ['xu',   'ex',   40], ['le',   'lv',   27], ['dan',  'nm',   36],
  ['phu',  'dt',   34], ['gios', 'js',   24], ['cac',  'jud',  21], ['ru',   'rt',    4],
  ['1sa',  '1sm',  31], ['2sa',  '2sm',  24], ['1vua', '1kgs', 22], ['2vua', '2kgs', 25],
  ['1su',  '1ch',  29], ['2su',  '2ch',  36], ['exo',  'ezr',  10], ['ne',   'ne',   13],
  ['et',   'et',   10], ['giop', 'job',  42], ['thi',  'ps',  150], ['ch',   'prv',  31],
  ['tr',   'ec',   12], ['nha',  'so',    8], ['es',   'is',   66], ['gie',  'jr',   52],
  ['ca',   'lm',    5], ['exe',  'ez',   48], ['da',   'dn',   12], ['os',   'ho',   14],
  ['gio',  'jl',    3], ['am',   'am',    9], ['ap',   'ob',    1], ['gion', 'jn',    4],
  ['mi',   'mi',    7], ['na',   'na',    3], ['ha',   'hk',    3], ['so',   'zp',    3],
  ['ag',   'hg',    2], ['xa',   'zc',   14], ['ma',   'ml',    4],
  ['mat',  'mt',   28], ['mac',  'mk',   16], ['lu',   'lk',   24], ['gi',   'jo',   21],
  ['cong', 'act',  28], ['ro',   'rm',   16], ['1co',  '1co',  16], ['2co',  '2co',  13],
  ['ga',   'gl',    6], ['eph',  'eph',   6], ['phi',  'ph',    4], ['co',   'cl',    4],
  ['1te',  '1ts',   5], ['2te',  '2ts',   3], ['1ti',  '1tm',   6], ['2ti',  '2tm',   4],
  ['tit',  'tt',    3], ['phil', 'phm',   1], ['he',   'hb',   13], ['gia',  'jm',    5],
  ['1phi', '1pe',   5], ['2phi', '2pe',   3], ['1gi',  '1jo',   5], ['2gi',  '2jo',   1],
  ['3gi',  '3jo',   1], ['giu',  'jd',    1], ['kh',   're',   22],
];

const BASE_URL = 'https://kinhthanh.httlvn.org/doc-kinh-thanh';
const OUT_DIR  = path.resolve(`scraped/${VERSION}`);
const JSON_OUT = path.resolve(`web/public/bible_${VERSION}.json`);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function stripTags(html) {
  return html
    .replace(/<a[^>]*>[\s\S]*?<\/a>/g, '') // remove cross-ref anchors
    .replace(/<sup[^>]*>\d+<\/sup>/g, '')   // remove verse number superscripts
    .replace(/<[^>]+>/g, '')               // remove all tags
    .replace(/&emsp;/g, '').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

function extractTitleParts(titleDiv) {
  const h2 = (titleDiv.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1];
  const p  = (titleDiv.match(/<p[^>]*>([\s\S]*?)<\/p>/)   || [])[1];
  const h3 = (titleDiv.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1];

  const s   = h3 ? stripTags(h3) : (h2 ? stripTags(h2) : null);
  const ctx = h2 && h3
    ? stripTags(h2) + (p ? ' ' + stripTags(p) : '')
    : (p ? stripTags(p) : null);

  return s ? (ctx ? { s, ctx } : { s }) : null;
}

/**
 * Parse chapter HTML → ordered array of section headers and verse strings.
 * Section header: { s: "Title", ctx?: "Context note" }
 * Verse: string
 */
function parseChapter(html, siteCode, chNum) {
  const chunkStart = html.indexOf(`<div id="${siteCode}_${chNum}">`);
  if (chunkStart === -1) return [];

  // Grab enough HTML to cover the full chapter (up to next chapter div or end of bible-read)
  const chunkEnd = (() => {
    const nextCh = html.indexOf(`<div id="${siteCode}_${chNum + 1}">`, chunkStart);
    const bibleEnd = html.indexOf('</div>', html.indexOf('class="bible-read"'));
    return nextCh !== -1 ? nextCh : html.length;
  })();

  const chunk = html.slice(chunkStart, chunkEnd);
  const items = [];

  // Tokenize: find all .title divs and .verse spans in document order
  const tokenRe = /(<div class="title">[\s\S]*?<\/div>)|(<span class="verse [^"]*"[\s\S]*?<\/span>)/g;
  let m;
  while ((m = tokenRe.exec(chunk)) !== null) {
    if (m[1]) {
      // Section header
      const hdr = extractTitleParts(m[1]);
      if (hdr) items.push(hdr);
    } else if (m[2]) {
      // Verse
      const text = stripTags(m[2]);
      if (text) items.push(text);
    }
  }
  return items;
}

function itemsToTxt(items) {
  const lines = [];
  let vNum = 0;
  for (const item of items) {
    if (typeof item === 'string') {
      vNum++;
      lines.push(`${vNum}\t${item}`);
    } else {
      const ctx = item.ctx ? ` (${item.ctx})` : '';
      lines.push(`\n=== ${item.s}${ctx} ===`);
    }
  }
  return lines.join('\n');
}

async function fetchChapter(siteCode, chNum, retries = 3) {
  const url = `${BASE_URL}/${siteCode}/${chNum}?v=${VERSION}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bible-Research/1.0)' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const totalChapters = BOOKS.reduce((s, [,, c]) => s + c, 0);
  console.log(`Scraping ${VERSION} — ${BOOKS.length} books, ${totalChapters} chapters`);
  console.log(`Output dir : ${OUT_DIR}`);
  console.log(`Output JSON: ${JSON_OUT}\n`);

  const result = [];
  let done = 0;

  for (const [siteCode, appId, chapCount] of BOOKS) {
    const bookDir = path.join(OUT_DIR, appId);
    fs.mkdirSync(bookDir, { recursive: true });

    const bookChapters = [];

    for (let ch = 1; ch <= chapCount; ch++) {
      const cacheTxt  = path.join(bookDir, `${ch}.txt`);
      const cacheJson = path.join(bookDir, `${ch}.json`);
      let items;

      if (fs.existsSync(cacheJson)) {
        items = JSON.parse(fs.readFileSync(cacheJson, 'utf-8'));
      } else {
        try {
          const html = await fetchChapter(siteCode, ch);
          items = parseChapter(html, siteCode, ch);
          fs.writeFileSync(cacheJson, JSON.stringify(items), 'utf-8');
          fs.writeFileSync(cacheTxt,  itemsToTxt(items),    'utf-8');
          await sleep(DELAY_MS);
        } catch (err) {
          console.error(`\n  ERROR ${appId} ch${ch}: ${err.message}`);
          items = [];
        }
      }

      bookChapters.push(items);
      done++;

      if (ch === 1 || ch === chapCount || done % 100 === 0) {
        const pct = ((done / totalChapters) * 100).toFixed(1);
        process.stdout.write(`\r[${pct}%] ${appId} ${ch}/${chapCount} (${done}/${totalChapters})   `);
      }
    }

    const totalVerses = bookChapters.reduce((s, c) => s + c.filter(i => typeof i === 'string').length, 0);
    console.log(`\n  ✓ ${appId}: ${chapCount} ch, ${totalVerses} verses`);
    result.push({ id: appId, chapters: bookChapters });
  }

  fs.writeFileSync(JSON_OUT, JSON.stringify(result, null, 2), 'utf-8');
  const total = result.reduce((s, b) => s + b.chapters.reduce((s2, c) => s2 + c.filter(i => typeof i === 'string').length, 0), 0);
  console.log(`\nDone! ${total} verses → ${JSON_OUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
