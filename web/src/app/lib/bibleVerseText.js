'use client';
import { BIBLE_BOOKS } from './bibleData';

let bibleCache = null;

async function loadBible() {
  if (bibleCache) return bibleCache;
  const res = await fetch('/bible.json');
  const data = await res.json();
  const map = {};
  data.forEach(book => { map[book.id] = book.chapters; });
  bibleCache = map;
  return bibleCache;
}

/**
 * Parse any ref format:
 *   "Giăng 3:16"           → same chapter, single verse
 *   "Giăng 3:16-18"        → same chapter, verse range
 *   "Sáng Thế Ký 1:1-3:10" → cross-chapter range
 */
function parseRef(ref) {
  const bookEntry = (name) => BIBLE_BOOKS.find(b => b.name === name);

  // Cross-chapter: "Book chFrom:vFrom-chTo:vTo"
  const cross = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (cross) {
    const b = bookEntry(cross[1]);
    if (!b) return null;
    return { bookId: b.id, chFrom: parseInt(cross[2]), vFrom: parseInt(cross[3]), chTo: parseInt(cross[4]), vTo: parseInt(cross[5]) };
  }
  // Same chapter range or single: "Book ch:vFrom[-vTo]"
  const same = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (same) {
    const b = bookEntry(same[1]);
    if (!b) return null;
    const ch = parseInt(same[2]), vFrom = parseInt(same[3]), vTo = same[4] ? parseInt(same[4]) : vFrom;
    return { bookId: b.id, chFrom: ch, vFrom, chTo: ch, vTo };
  }
  return null;
}

const cache = new Map();
const MAX_TOOLTIP_LINES = 12;

export async function fetchBibleVerseText(ref) {
  if (cache.has(ref)) return cache.get(ref);
  const parsed = parseRef(ref);
  if (!parsed) { cache.set(ref, null); return null; }
  try {
    const bible = await loadBible();
    const bookChapters = bible[parsed.bookId];
    if (!bookChapters) { cache.set(ref, null); return null; }

    const lines = [];
    let truncated = false;

    for (let ch = parsed.chFrom; ch <= parsed.chTo; ch++) {
      const raw = bookChapters[ch - 1];
      if (!raw) continue;
      const verses = raw.filter(v => typeof v === 'string');
      const vStart = ch === parsed.chFrom ? parsed.vFrom : 1;
      const vEnd   = ch === parsed.chTo   ? parsed.vTo   : verses.length;
      if (parsed.chFrom !== parsed.chTo) {
        lines.push(`— Đoạn ${ch} —`);
      }
      for (let v = vStart; v <= vEnd; v++) {
        if (verses[v - 1]) {
          if (lines.length >= MAX_TOOLTIP_LINES) { truncated = true; break; }
          lines.push(`${v}. ${verses[v - 1]}`);
        }
      }
      if (truncated) break;
    }

    if (truncated) lines.push('...');
    const text = lines.join('\n') || null;
    cache.set(ref, text);
    return text;
  } catch {
    cache.set(ref, null);
    return null;
  }
}
