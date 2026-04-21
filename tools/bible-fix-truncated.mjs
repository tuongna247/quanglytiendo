#!/usr/bin/env node
/**
 * Fixes truncated verses in bible.json using correct text from httlvn.org (VI1934)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIBLE_FILE = resolve(__dirname, '../web/public/bible.json');

// bookId → chapter (1-based) → verse (1-based) → correct text
const FIXES = [
  {
    ref: 'Các Quan Xét 20:9', bookId: 'jud', chapter: 20, verse: 9,
    correct: 'Bây giờ, nầy là điều chúng ta phải xử cho Ghi-bê-a: Chúng ta sẽ đi lên đánh thành đó theo thứ tự của thăm nhứt định.',
  },
  {
    ref: 'Sáng Thế Ký 50:25', bookId: 'gn', chapter: 50, verse: 25,
    correct: 'Giô-sép biểu các con trai của Y-sơ-ra-ên thề mà rằng: Quả thật, Đức Chúa Trời sẽ đến viếng các anh em; xin anh em hãy dời hài cốt tôi khỏi xứ nầy.',
  },
  {
    ref: '2 Các Vua 5:7', bookId: '2kgs', chapter: 5, verse: 7,
    correct: 'Khi vua Y-sơ-ra-ên đọc thơ rồi, liền xé quần áo mình, và nói rằng: Ông ấy sai người đến cùng ta để ta chữa khỏi bệnh phung cho họ, ta há phải là Đức Chúa Trời, có quyền làm sống làm chết sao? Khá nên biết và xem thấy rằng người tìm dịp để nghịch cùng ta.',
  },
  {
    ref: '2 Các Vua 15:20', bookId: '2kgs', chapter: 15, verse: 20,
    correct: 'Mê-na-hem thâu lấy tiền bạc ấy nơi dân Y-sơ-ra-ên, tức nơi những người có tài sản nhiều, cứ mỗi người năm mươi siếc-lơ bạc, đặng nộp cho vua A-si-ri.',
  },
  {
    ref: '2 Sử Ký 33:14', bookId: '2ch', chapter: 33, verse: 14,
    correct: 'Sau việc ấy, người xây vách ngoài thành Đa-vít, về phía tây Ghi-hôn trong trũng, đến lối vào cửa cá, và chung quanh Ô-phên, xây nó rất cao; rồi người đặt những quan tướng trong các thành bền vững xứ Giu-đa.',
  },
  {
    ref: 'E-xơ-ra 8:36', bookId: 'ezr', chapter: 8, verse: 36,
    correct: 'Chúng giao chiếu chỉ của vua cho các quan trấn, và cho các quan cai của vua ở phía bên nầy sông; họ bèn giúp đỡ dân sự và việc đền thờ của Đức Chúa Trời.',
  },
  {
    ref: 'Nê-hê-mi 10:21', bookId: 'ne', chapter: 10, verse: 21,
    correct: 'Mê-sê-xa-bê-ên, Xa-đốc, Gia-đua,',
  },
  {
    ref: 'Thi Thiên 92:4', bookId: 'ps', chapter: 92, verse: 4,
    correct: 'Vì, hỡi Đức Giê-hô-va, Ngài đã làm cho tôi vui vẻ bởi công việc Ngài; Tôi sẽ mừng rỡ về các việc tay Ngài làm.',
  },
  {
    ref: 'Truyền Đạo 8:13', bookId: 'ec', chapter: 8, verse: 13,
    correct: 'Nhưng kẻ ác sẽ chẳng được phước; cũng sẽ không được sống lâu, vì đời nó giống như bóng qua; ấy tại nó không kính sợ trước mặt Đức Chúa Trời.',
  },
  {
    ref: 'Ê-sai 65:18', bookId: 'is', chapter: 65, verse: 18,
    correct: 'Thà các ngươi hãy mừng rỡ và vui vẻ đời đời trong sự ta dựng nên. Thật, ta dựng nên Giê-ru-sa-lem cho sự vui, và dân nó cho sự mừng rỡ.',
  },
  {
    ref: 'Đa-ni-ên 3:19', bookId: 'dn', chapter: 3, verse: 19,
    correct: 'Bấy giờ, vua Nê-bu-cát-nết-sa cả giận, biến sắc mặt nghịch cùng Sa-đơ-rắc, Mê-sác và A-bết-Nê-gô; và cất tiếng truyền đốt lò lửa nóng gấp bảy lần hơn lúc bình thường đã đốt.',
  },
  {
    ref: 'A-mốt 5:1', bookId: 'am', chapter: 5, verse: 1,
    correct: 'Hỡi nhà Y-sơ-ra-ên, hãy nghe lời nầy, là bài ca thương mà ta sẽ làm về các ngươi!',
  },
  {
    ref: 'A-mốt 5:2', bookId: 'am', chapter: 5, verse: 2,
    correct: 'Gái đồng trinh của Y-sơ-ra-ên đã ngã xuống, sẽ không dậy nữa; nó đã bị ném bỏ trên đất nó, mà không ai đỡ dậy.',
  },
  {
    ref: 'Ma-thi-ơ 24:5', bookId: 'mt', chapter: 24, verse: 5,
    correct: 'Vì nhiều người sẽ mạo danh ta đến mà nói rằng: Ta là Đấng Christ; và sẽ dỗ dành nhiều người.',
  },
  {
    ref: 'Hê-bơ-rơ 10:32', bookId: 'hb', chapter: 10, verse: 32,
    correct: 'Hãy nhớ lại những lúc ban đầu đó, anh em đã được soi sáng rồi, bèn chịu cơn chiến trận lớn về những sự đau đớn:',
  },
  {
    ref: '2 Phi-e-rơ 2:22', bookId: '2pe', chapter: 2, verse: 22,
    correct: 'Đã xảy đến cho chúng nó như lời tục ngữ rằng: Chó liếm lại đồ nó đã mửa, heo đã rửa sạch rồi, lại lăn lóc trong vũng bùn.',
  },
  {
    ref: 'Khải Huyền 9:7', bookId: 're', chapter: 9, verse: 7,
    correct: 'Những châu chấu đó giống như những ngựa sắm sẵn để đem ra chiến trận: Trên đầu nó có như mão triều thiên tợ hồ bằng vàng, và mặt nó như mặt người ta;',
  },
];

const raw = readFileSync(BIBLE_FILE, 'utf-8');
const bible = JSON.parse(raw);

// Build index: bookId → array index in bible
const bookIndex = new Map();
bible.forEach((book, i) => bookIndex.set(book.id, i));

let fixCount = 0;
let notFound = 0;

for (const fix of FIXES) {
  const bi = bookIndex.get(fix.bookId);
  if (bi === undefined) {
    console.log(`❌ Không tìm thấy sách: ${fix.bookId} (${fix.ref})`);
    notFound++;
    continue;
  }

  const book = bible[bi];
  const ci = fix.chapter - 1;
  const vi = fix.verse - 1;

  if (!book.chapters[ci]) {
    console.log(`❌ Không tìm thấy chương ${fix.chapter} trong ${fix.ref}`);
    notFound++;
    continue;
  }
  if (book.chapters[ci][vi] === undefined) {
    console.log(`❌ Không tìm thấy câu ${fix.verse} trong ${fix.ref}`);
    notFound++;
    continue;
  }

  const old = book.chapters[ci][vi];
  if (old === fix.correct) {
    console.log(`✅ ${fix.ref}: đã đúng rồi`);
    continue;
  }

  console.log(`✏️  ${fix.ref}:`);
  console.log(`   CŨ: "${old}"`);
  console.log(`   MỚI: "${fix.correct}"`);

  bible[bi].chapters[ci][vi] = fix.correct;
  fixCount++;
}

if (fixCount > 0) {
  const backupPath = BIBLE_FILE.replace('.json', '.truncated-backup.json');
  writeFileSync(backupPath, raw, 'utf-8');
  console.log(`\n💾 Backup: ${backupPath}`);
  writeFileSync(BIBLE_FILE, JSON.stringify(bible, null, 2), 'utf-8');
  console.log(`✅ Đã sửa ${fixCount} câu bị cắt ngắn`);
} else {
  console.log('\n✅ Không có gì cần sửa!');
}
if (notFound > 0) console.log(`⚠️  ${notFound} câu không tìm thấy vị trí`);
