function normBookName(s) {
  return s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

const BOOK_NAME_TO_ID_RAW = {
  // Cựu Ước
  'Sáng': 'gn', 'Sáng-thế-ký': 'gn', 'Sáng Thế Ký': 'gn',
  'Xuất Ê-díp-tô': 'ex', 'Xuất': 'ex', 'Xuất Ê-díp-tô Ký': 'ex',
  'Lê-vi': 'lv', 'Lê-vi Ký': 'lv',
  'Dân-số': 'nm', 'Dân Số Ký': 'nm',
  'Phục-truyền': 'dt', 'Phục Truyền Luật Lệ Ký': 'dt',
  'Giô-suê': 'js',
  'Các Quan Xét': 'jud',
  'Ru-tơ': 'rt',
  '1Sa-mu-ên': '1sm', '1 Sa-mu-ên': '1sm',
  '2Sa-mu-ên': '2sm', '2 Sa-mu-ên': '2sm',
  '1Các Vua': '1kgs', '1 Các Vua': '1kgs',
  '2Các Vua': '2kgs', '2 Các Vua': '2kgs',
  '1Sử-ký': '1ch', '1 Sử Ký': '1ch',
  '2Sử-ký': '2ch', '2 Sử Ký': '2ch',
  'Ê-xơ-ra': 'ezr',
  'Nê-hê-mi': 'ne',
  'Ê-xơ-tê': 'et',
  'Gióp': 'job',
  'Thi-thiên': 'ps', 'Thi-thiên 119': 'ps', 'Thi-thiên 120-121': 'ps',
  'Châm-ngôn': 'prv',
  'Truyền-đạo': 'ec',
  'Nhã-ca': 'so',
  'Ca-thương': 'lm',
  'Ê-sai': 'is',
  'Giê-rê-mi': 'jr',
  'Ê-xê-chi-ên': 'ez',
  'Đa-ni-ên': 'dn',
  'Ô-sê': 'ho',
  'Giô-ên': 'jl',
  'A-mốt': 'am',
  'Áp-đia': 'ob',
  'Giô-na': 'jn',
  'Mi-chê': 'mi',
  'Na-hum': 'na',
  'Ha-ba-cúc': 'hk',
  'Sô-phô-ni': 'zp',
  'A-ghê': 'hg',
  'Xa-cha-ri': 'zc',
  'Ma-la-chi': 'ml',
  // Tân Ước
  'Ma-thi-ơ': 'mt',
  'Mác': 'mk',
  'Lu-ca': 'lk',
  'Giăng': 'jo',
  'Công-vụ': 'act', 'Công Vụ Các Sứ Đồ': 'act',
  'Rô-ma': 'rm',
  '1Cô-rinh-tô': '1co', '1 Cô-rinh-tô': '1co',
  '2Cô-rinh-tô': '2co', '2 Cô-rinh-tô': '2co',
  'Ga-la-ti': 'gl',
  'Ê-phê-sô': 'eph',
  'Phi-líp': 'ph',
  'Cô-lô-se': 'cl',
  '1Tê-sa-lô-ni-ca': '1ts', '1 Tê-sa-lô-ni-ca': '1ts',
  '2Tê-sa-lô-ni-ca': '2ts', '2 Tê-sa-lô-ni-ca': '2ts',
  '1Ti-mô-thê': '1tm', '1 Ti-mô-thê': '1tm',
  '2Ti-mô-thê': '2tm', '2 Ti-mô-thê': '2tm',
  'Tít': 'tt',
  'Phi-lê-môn': 'phm',
  'Hê-bơ-rơ': 'hb',
  'Gia-cơ': 'jm',
  '1Phi-e-rơ': '1pe', '1 Phi-e-rơ': '1pe',
  '2Phi-e-rơ': '2pe', '2 Phi-e-rơ': '2pe',
  '1Giăng': '1jo', '1 Giăng': '1jo',
  '2Giăng': '2jo', '2 Giăng': '2jo',
  '3Giăng': '3jo', '3 Giăng': '3jo',
  'Giu-đe': 'jd',
  'Khải-huyền': 're',
};

export const BOOK_NAME_TO_ID = Object.fromEntries(
  Object.entries(BOOK_NAME_TO_ID_RAW).map(([k, v]) => [normBookName(k), v])
);

export const BOOK_ID_TO_NAME = {
  gn: 'Sáng-thế-ký', ex: 'Xuất Ê-díp-tô', lv: 'Lê-vi', nm: 'Dân-số', dt: 'Phục-truyền',
  js: 'Giô-suê', jud: 'Các Quan Xét', rt: 'Ru-tơ',
  '1sm': '1Sa-mu-ên', '2sm': '2Sa-mu-ên',
  '1kgs': '1Các Vua', '2kgs': '2Các Vua',
  '1ch': '1Sử-ký', '2ch': '2Sử-ký',
  ezr: 'Ê-xơ-ra', ne: 'Nê-hê-mi', et: 'Ê-xơ-tê',
  job: 'Gióp', ps: 'Thi-thiên', prv: 'Châm-ngôn', ec: 'Truyền-đạo', so: 'Nhã-ca',
  is: 'Ê-sai', jr: 'Giê-rê-mi', lm: 'Ca-thương', ez: 'Ê-xê-chi-ên', dn: 'Đa-ni-ên',
  ho: 'Ô-sê', jl: 'Giô-ên', am: 'A-mốt', ob: 'Áp-đia', jn: 'Giô-na',
  mi: 'Mi-chê', na: 'Na-hum', hk: 'Ha-ba-cúc', zp: 'Sô-phô-ni', hg: 'A-ghê',
  zc: 'Xa-cha-ri', ml: 'Ma-la-chi',
  mt: 'Ma-thi-ơ', mk: 'Mác', lk: 'Lu-ca', jo: 'Giăng', act: 'Công-vụ',
  rm: 'Rô-ma', '1co': '1Cô-rinh-tô', '2co': '2Cô-rinh-tô', gl: 'Ga-la-ti',
  eph: 'Ê-phê-sô', ph: 'Phi-líp', cl: 'Cô-lô-se',
  '1ts': '1Tê-sa-lô-ni-ca', '2ts': '2Tê-sa-lô-ni-ca',
  '1tm': '1Ti-mô-thê', '2tm': '2Ti-mô-thê', tt: 'Tít', phm: 'Phi-lê-môn',
  hb: 'Hê-bơ-rơ', jm: 'Gia-cơ', '1pe': '1Phi-e-rơ', '2pe': '2Phi-e-rơ',
  '1jo': '1Giăng', '2jo': '2Giăng', '3jo': '3Giăng', jd: 'Giu-đe', re: 'Khải-huyền',
};

/**
 * Parse passage string like "Rô-ma 1-2" → { bookId, bookName, chFrom, chTo }
 * Handles: "Sáng 1-3", "Ru-tơ", "2Tê-sa-lô-ni-ca", "Thi-thiên 119", "Châm-ngôn 1"
 */
export function parsePassage(passageStr) {
  if (!passageStr) return null;
  const str = passageStr.trim();

  // Try to match "BookName chapters" e.g. "Rô-ma 1-2" or "Châm-ngôn 1"
  const match = str.match(/^(.+?)\s+([\d]+)(?:[-–]([\d]+))?$/);
  if (match) {
    const bookName = match[1].trim();
    const chFrom = parseInt(match[2], 10);
    const chTo = match[3] ? parseInt(match[3], 10) : chFrom;
    const bookId = BOOK_NAME_TO_ID[normBookName(bookName)];
    return bookId ? { bookId, bookName, chFrom, chTo } : null;
  }

  // No chapter — whole book (e.g. "Ru-tơ", "Giô-ên", "Áp-đia", "Giu-đe")
  const bookId = BOOK_NAME_TO_ID[normBookName(str)];
  if (bookId) return { bookId, bookName: str, chFrom: 1, chTo: 999 };

  return null;
}

/**
 * Build URL for bible reader page
 */
export function bibleUrl(passageStr) {
  const p = parsePassage(passageStr);
  if (!p) return null;
  return `/apps/bible?book=${p.bookId}&from=${p.chFrom}&to=${p.chTo}`;
}
