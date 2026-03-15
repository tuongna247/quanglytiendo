// Lịch đọc Kinh Thánh 1 năm — 52 tuần
// Mỗi tuần: Chúa Nhật (Thư tín), Thứ Hai (Luật pháp), Thứ Ba (Lịch sử),
//            Thứ Tư (Thi vịnh), Thứ Năm (Thế văn), Thứ Sáu (Tiên tri), Thứ Bảy (Phúc âm/Lịch sử NT)

export const BIBLE_READING_PLAN = [
  { week: 1,  startDate: '2025-12-28', sun: 'Rô-ma 1-2',           mon: 'Sáng 1-3',            tue: 'Giô-suê 1-5',        wed: 'Thi-thiên 1-2',      thu: 'Gióp 1-2',         fri: 'Ê-sai 1-6',           sat: 'Ma-thi-ơ 1-2' },
  { week: 2,  startDate: '2026-01-04', sun: 'Rô-ma 3-4',           mon: 'Sáng 4-7',            tue: 'Giô-suê 6-10',       wed: 'Thi-thiên 3-5',      thu: 'Gióp 3-4',         fri: 'Ê-sai 7-11',          sat: 'Ma-thi-ơ 3-4' },
  { week: 3,  startDate: '2026-01-11', sun: 'Rô-ma 5-6',           mon: 'Sáng 8-11',           tue: 'Giô-suê 11-15',      wed: 'Thi-thiên 6-8',      thu: 'Gióp 5-6',         fri: 'Ê-sai 12-17',         sat: 'Ma-thi-ơ 5-7' },
  { week: 4,  startDate: '2026-01-18', sun: 'Rô-ma 7-8',           mon: 'Sáng 12-15',          tue: 'Giô-suê 16-20',      wed: 'Thi-thiên 9-11',     thu: 'Gióp 7-8',         fri: 'Ê-sai 18-22',         sat: 'Ma-thi-ơ 8-10' },
  { week: 5,  startDate: '2026-01-25', sun: 'Rô-ma 9-10',          mon: 'Sáng 16-19',          tue: 'Giô-suê 21-24',      wed: 'Thi-thiên 12-14',    thu: 'Gióp 9-10',        fri: 'Ê-sai 23-28',         sat: 'Ma-thi-ơ 11-13' },
  { week: 6,  startDate: '2026-02-01', sun: 'Rô-ma 11-12',         mon: 'Sáng 20-23',          tue: 'Các Quan Xét 1-6',   wed: 'Thi-thiên 15-17',    thu: 'Gióp 11-12',       fri: 'Ê-sai 29-33',         sat: 'Ma-thi-ơ 14-16' },
  { week: 7,  startDate: '2026-02-08', sun: 'Rô-ma 13-14',         mon: 'Sáng 24-27',          tue: 'Các Quan Xét 7-11',  wed: 'Thi-thiên 18-20',    thu: 'Gióp 13-14',       fri: 'Ê-sai 34-39',         sat: 'Ma-thi-ơ 17-19' },
  { week: 8,  startDate: '2026-02-15', sun: 'Rô-ma 15-16',         mon: 'Sáng 28-31',          tue: 'Các Quan Xét 12-16', wed: 'Thi-thiên 21-23',    thu: 'Gióp 15-16',       fri: 'Ê-sai 40-44',         sat: 'Ma-thi-ơ 20-22' },
  { week: 9,  startDate: '2026-02-22', sun: '1Cô-rinh-tô 1-2',     mon: 'Sáng 32-35',          tue: 'Các Quan Xét 17-21', wed: 'Thi-thiên 24-26',    thu: 'Gióp 17-18',       fri: 'Ê-sai 45-50',         sat: 'Ma-thi-ơ 23-25' },
  { week: 10, startDate: '2026-03-01', sun: '1Cô-rinh-tô 3-4',     mon: 'Sáng 36-39',          tue: 'Ru-tơ',              wed: 'Thi-thiên 27-29',    thu: 'Gióp 19-20',       fri: 'Ê-sai 51-55',         sat: 'Ma-thi-ơ 26-28' },
  { week: 11, startDate: '2026-03-08', sun: '1Cô-rinh-tô 5-6',     mon: 'Sáng 40-43',          tue: '1Sa-mu-ên 1-5',      wed: 'Thi-thiên 30-32',    thu: 'Gióp 21-22',       fri: 'Ê-sai 56-61',         sat: 'Mác 1-2' },
  { week: 12, startDate: '2026-03-15', sun: '1Cô-rinh-tô 7-8',     mon: 'Sáng 44-47',          tue: '1Sa-mu-ên 6-10',     wed: 'Thi-thiên 33-35',    thu: 'Gióp 23-24',       fri: 'Ê-sai 62-66',         sat: 'Mác 3-4' },
  { week: 13, startDate: '2026-03-22', sun: '1Cô-rinh-tô 9-10',    mon: 'Sáng 48-50',          tue: '1Sa-mu-ên 11-15',    wed: 'Thi-thiên 36-38',    thu: 'Gióp 25-26',       fri: 'Giê-rê-mi 1-6',       sat: 'Mác 5-6' },
  { week: 14, startDate: '2026-03-29', sun: '1Cô-rinh-tô 11-12',   mon: 'Xuất Ê-díp-tô 1-4',  tue: '1Sa-mu-ên 16-20',    wed: 'Thi-thiên 39-41',    thu: 'Gióp 27-28',       fri: 'Giê-rê-mi 7-11',      sat: 'Mác 7-8' },
  { week: 15, startDate: '2026-04-05', sun: '1Cô-rinh-tô 13-14',   mon: 'Xuất Ê-díp-tô 5-8',  tue: '1Sa-mu-ên 21-25',    wed: 'Thi-thiên 42-44',    thu: 'Gióp 29-30',       fri: 'Giê-rê-mi 12-16',     sat: 'Mác 9-10' },
  { week: 16, startDate: '2026-04-12', sun: '1Cô-rinh-tô 15-16',   mon: 'Xuất Ê-díp-tô 9-12', tue: '1Sa-mu-ên 26-31',    wed: 'Thi-thiên 45-47',    thu: 'Gióp 31-32',       fri: 'Giê-rê-mi 17-21',     sat: 'Mác 11-12' },
  { week: 17, startDate: '2026-04-19', sun: '2Cô-rinh-tô 1-3',     mon: 'Xuất Ê-díp-tô 13-16',tue: '2Sa-mu-ên 1-4',      wed: 'Thi-thiên 48-50',    thu: 'Gióp 33-34',       fri: 'Giê-rê-mi 22-26',     sat: 'Mác 13-14' },
  { week: 18, startDate: '2026-04-26', sun: '2Cô-rinh-tô 4-5',     mon: 'Xuất Ê-díp-tô 17-20',tue: '2Sa-mu-ên 5-9',      wed: 'Thi-thiên 51-53',    thu: 'Gióp 35-36',       fri: 'Giê-rê-mi 27-31',     sat: 'Mác 15-16' },
  { week: 19, startDate: '2026-05-03', sun: '2Cô-rinh-tô 6-8',     mon: 'Xuất Ê-díp-tô 21-24',tue: '2Sa-mu-ên 10-14',    wed: 'Thi-thiên 54-56',    thu: 'Gióp 37-38',       fri: 'Giê-rê-mi 32-36',     sat: 'Lu-ca 1-2' },
  { week: 20, startDate: '2026-05-10', sun: '2Cô-rinh-tô 9-10',    mon: 'Xuất Ê-díp-tô 25-28',tue: '2Sa-mu-ên 15-19',    wed: 'Thi-thiên 57-59',    thu: 'Gióp 39-40',       fri: 'Giê-rê-mi 37-41',     sat: 'Lu-ca 3-4' },
  { week: 21, startDate: '2026-05-17', sun: '2Cô-rinh-tô 11-13',   mon: 'Xuất 29-32',          tue: '2Sa-mu-ên 20-24',    wed: 'Thi-thiên 60-62',    thu: 'Gióp 41-42',       fri: 'Giê-rê-mi 42-46',     sat: 'Lu-ca 5-6' },
  { week: 22, startDate: '2026-05-24', sun: 'Ga-la-ti 1-3',        mon: 'Xuất 33-36',          tue: '1Các Vua 1-4',       wed: 'Thi-thiên 63-65',    thu: 'Châm-ngôn 1',      fri: 'Giê-rê-mi 47-52',     sat: 'Lu-ca 7-8' },
  { week: 23, startDate: '2026-05-31', sun: 'Ga-la-ti 4-6',        mon: 'Xuất 37-40',          tue: '1Các Vua 5-9',       wed: 'Thi-thiên 66-68',    thu: 'Châm-ngôn 2-3',    fri: 'Ca-thương',            sat: 'Lu-ca 9-10' },
  { week: 24, startDate: '2026-06-07', sun: 'Ê-phê-sô 1-3',        mon: 'Lê-vi 1-3',           tue: '1Các Vua 10-13',     wed: 'Thi-thiên 69-71',    thu: 'Châm-ngôn 4',      fri: 'Ê-xê-chi-ên 1-6',     sat: 'Lu-ca 11-12' },
  { week: 25, startDate: '2026-06-14', sun: 'Ê-phê-sô 4-6',        mon: 'Lê-vi 4-6',           tue: '1Các Vua 14-18',     wed: 'Thi-thiên 72-74',    thu: 'Châm-ngôn 5-6',    fri: 'Ê-xê-chi-ên 7-12',    sat: 'Lu-ca 13-14' },
  { week: 26, startDate: '2026-06-21', sun: 'Phi-líp 1-2',         mon: 'Lê-vi 7-9',           tue: '1Các Vua 19-22',     wed: 'Thi-thiên 75-77',    thu: 'Châm-ngôn 7',      fri: 'Ê-xê-chi-ên 13-18',   sat: 'Lu-ca 15-16' },
  { week: 27, startDate: '2026-06-28', sun: 'Phi-líp 3-4',         mon: 'Lê-vi 10-12',         tue: '2Các Vua 1-5',       wed: 'Thi-thiên 78-80',    thu: 'Châm-ngôn 8-9',    fri: 'Ê-xê-chi-ên 19-24',   sat: 'Lu-ca 17-18' },
  { week: 28, startDate: '2026-07-05', sun: 'Cô-lô-se 1-2',        mon: 'Lê-vi 13-15',         tue: '2Các Vua 6-10',      wed: 'Thi-thiên 81-83',    thu: 'Châm-ngôn 10',     fri: 'Ê-xê-chi-ên 25-30',   sat: 'Lu-ca 19-20' },
  { week: 29, startDate: '2026-07-12', sun: 'Cô-lô-se 3-4',        mon: 'Lê-vi 16-18',         tue: '2Các Vua 11-15',     wed: 'Thi-thiên 84-86',    thu: 'Châm-ngôn 11-12',  fri: 'Ê-xê-chi-ên 31-36',   sat: 'Lu-ca 21-22' },
  { week: 30, startDate: '2026-07-19', sun: '1Tê-sa-lô-ni-ca 1-3', mon: 'Lê-vi 19-21',         tue: '2Các Vua 16-20',     wed: 'Thi-thiên 87-89',    thu: 'Châm-ngôn 13',     fri: 'Ê-xê-chi-ên 37-42',   sat: 'Lu-ca 23-24' },
  { week: 31, startDate: '2026-07-26', sun: '1Tê-sa-lô-ni-ca 4-5', mon: 'Lê-vi 22-24',         tue: '2Các Vua 21-25',     wed: 'Thi-thiên 90-92',    thu: 'Châm-ngôn 14-15',  fri: 'Ê-xê-chi-ên 43-48',   sat: 'Giăng 1-2' },
  { week: 32, startDate: '2026-08-02', sun: '2Tê-sa-lô-ni-ca',     mon: 'Lê-vi 25-27',         tue: '1Sử-ký 1-4',         wed: 'Thi-thiên 93-95',    thu: 'Châm-ngôn 16',     fri: 'Đa-ni-ên 1-6',        sat: 'Giăng 3-4' },
  { week: 33, startDate: '2026-08-09', sun: '1Ti-mô-thê 1-3',      mon: 'Dân-số 1-4',          tue: '1Sử-ký 5-9',         wed: 'Thi-thiên 96-98',    thu: 'Châm-ngôn 17-18',  fri: 'Đa-ni-ên 7-12',       sat: 'Giăng 5-6' },
  { week: 34, startDate: '2026-08-16', sun: '1Ti-mô-thê 4-6',      mon: 'Dân-số 5-8',          tue: '1Sử-ký 10-14',       wed: 'Thi-thiên 99-101',   thu: 'Châm-ngôn 19',     fri: 'Ô-sê 1-7',            sat: 'Giăng 7-9' },
  { week: 35, startDate: '2026-08-23', sun: '2Ti-mô-thê 1-2',      mon: 'Dân-số 9-12',         tue: '1Sử-ký 15-19',       wed: 'Thi-thiên 102-104',  thu: 'Châm-ngôn 20-21',  fri: 'Ô-sê 8-14',           sat: 'Giăng 10-12' },
  { week: 36, startDate: '2026-08-30', sun: '2Ti-mô-thê 3-4',      mon: 'Dân-số 13-16',        tue: '1Sử-ký 20-24',       wed: 'Thi-thiên 105-107',  thu: 'Châm-ngôn 22',     fri: 'Giô-ên',              sat: 'Giăng 13-15' },
  { week: 37, startDate: '2026-09-06', sun: 'Tít',                  mon: 'Dân-số 17-20',        tue: '1Sử-ký 25-29',       wed: 'Thi-thiên 108-110',  thu: 'Châm-ngôn 23-24',  fri: 'A-mốt 1-4',           sat: 'Giăng 16-18' },
  { week: 38, startDate: '2026-09-13', sun: 'Phi-lê-môn',          mon: 'Dân-số 21-24',        tue: '2Sử-ký 1-5',         wed: 'Thi-thiên 111-113',  thu: 'Châm-ngôn 25',     fri: 'A-mốt 5-9',           sat: 'Giăng 19-21' },
  { week: 39, startDate: '2026-09-20', sun: 'Hê-bơ-rơ 1-4',       mon: 'Dân-số 25-28',        tue: '2Sử-ký 6-10',        wed: 'Thi-thiên 114-116',  thu: 'Châm-ngôn 26-27',  fri: 'Áp-đia',              sat: 'Công-vụ 1-2' },
  { week: 40, startDate: '2026-09-27', sun: 'Hê-bơ-rơ 5-7',       mon: 'Dân-số 29-32',        tue: '2Sử-ký 11-15',       wed: 'Thi-thiên 117-118',  thu: 'Châm-ngôn 28',     fri: 'Giô-na',              sat: 'Công-vụ 3-4' },
  { week: 41, startDate: '2026-10-04', sun: 'Hê-bơ-rơ 8-10',      mon: 'Dân-số 33-36',        tue: '2Sử-ký 16-20',       wed: 'Thi-thiên 119',      thu: 'Châm-ngôn 29-30',  fri: 'Mi-chê',              sat: 'Công-vụ 5-6' },
  { week: 42, startDate: '2026-10-11', sun: 'Hê-bơ-rơ 11-13',     mon: 'Phục-truyền 1-3',     tue: '2Sử-ký 21-24',       wed: 'Thi-thiên 120-121',  thu: 'Châm-ngôn 31',     fri: 'Na-hum',              sat: 'Công-vụ 7-8' },
  { week: 43, startDate: '2026-10-18', sun: 'Gia-cơ 1-3',          mon: 'Phục-truyền 4-6',     tue: '2Sử-ký 25-28',       wed: 'Thi-thiên 122-124',  thu: 'Truyền-đạo 1-2',   fri: 'Ha-ba-cúc',           sat: 'Công-vụ 9-10' },
  { week: 44, startDate: '2026-10-25', sun: 'Gia-cơ 4-5',          mon: 'Phục-truyền 7-9',     tue: '2Sử-ký 29-32',       wed: 'Thi-thiên 125-127',  thu: 'Truyền-đạo 3-4',   fri: 'Sô-phô-ni',           sat: 'Công-vụ 11-12' },
  { week: 45, startDate: '2026-11-01', sun: '1Phi-e-rơ 1-3',       mon: 'Phục-truyền 10-12',   tue: '2Sử-ký 33-36',       wed: 'Thi-thiên 128-130',  thu: 'Truyền-đạo 5-6',   fri: 'Sô-phô-ni',           sat: 'Công-vụ 13-14' },
  { week: 46, startDate: '2026-11-08', sun: '1Phi-e-rơ 4-5',       mon: 'Phục-truyền 13-15',   tue: 'Ê-xơ-ra 1-5',        wed: 'Thi-thiên 131-133',  thu: 'Truyền-đạo 7-8',   fri: 'Xa-cha-ri 1-7',       sat: 'Công-vụ 15-16' },
  { week: 47, startDate: '2026-11-15', sun: '2Phi-e-rơ',           mon: 'Phục-truyền 16-19',   tue: 'Ê-xơ-ra 6-10',       wed: 'Thi-thiên 134-136',  thu: 'Truyền-đạo 9-10',  fri: 'Xa-cha-ri 8-14',      sat: 'Công-vụ 17-18' },
  { week: 48, startDate: '2026-11-22', sun: '1Giăng 1-3',          mon: 'Phục-truyền 20-22',   tue: 'Nê-hê-mi 1-4',       wed: 'Thi-thiên 137-139',  thu: 'Truyền-đạo 11-12', fri: 'Ma-la-chi',           sat: 'Công-vụ 19-20' },
  { week: 49, startDate: '2026-11-29', sun: '1Giăng 4-5',          mon: 'Phục-truyền 23-25',   tue: 'Nê-hê-mi 5-9',       wed: 'Thi-thiên 140-142',  thu: 'Nhã-ca 1-2',       fri: 'Khải-huyền 1-6',      sat: 'Công-vụ 21-22' },
  { week: 50, startDate: '2026-12-06', sun: '2Giăng',              mon: 'Phục-truyền 26-28',   tue: 'Nê-hê-mi 10-13',     wed: 'Thi-thiên 143-145',  thu: 'Nhã-ca 3-4',       fri: 'Khải-huyền 7-11',     sat: 'Công-vụ 23-24' },
  { week: 51, startDate: '2026-12-13', sun: '3Giăng',              mon: 'Phục-truyền 29-31',   tue: 'Ê-xơ-tê 1-5',        wed: 'Thi-thiên 146-148',  thu: 'Nhã-ca 5-6',       fri: 'Khải-huyền 12-17',    sat: 'Công-vụ 25-26' },
  { week: 52, startDate: '2026-12-20', sun: 'Giu-đe',              mon: 'Phục-truyền 32-34',   tue: 'Ê-xơ-tê 6-10',       wed: 'Thi-thiên 149-150',  thu: 'Nhã-ca 7-8',       fri: 'Khải-huyền 18-22',    sat: 'Công-vụ 27-28' },
];

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = {
  sun: 'Chúa Nhật — Thư tín',
  mon: 'Thứ Hai — Luật pháp',
  tue: 'Thứ Ba — Lịch sử',
  wed: 'Thứ Tư — Thi vịnh',
  thu: 'Thứ Năm — Thế văn',
  fri: 'Thứ Sáu — Tiên tri',
  sat: 'Thứ Bảy — Phúc âm',
};

/**
 * Get today's reading based on the current date
 */
export function getTodayReading() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const dayKey = DAYS[dayOfWeek];

  // Find the week whose startDate <= today < startDate + 7
  const week = BIBLE_READING_PLAN.find(w => {
    const start = new Date(w.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return today >= start && today < end;
  });

  if (!week) return null;

  return {
    week: week.week,
    startDate: week.startDate,
    dayKey,
    dayLabel: DAY_LABELS[dayKey],
    passage: week[dayKey],
    allReadings: DAYS.map(d => ({ key: d, label: DAY_LABELS[d], passage: week[d] })),
  };
}

/**
 * Get reading for a specific date string (yyyy-MM-dd)
 */
export function getReadingForDate(dateStr) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const dayKey = DAYS[dayOfWeek];

  const week = BIBLE_READING_PLAN.find(w => {
    const start = new Date(w.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return date >= start && date < end;
  });

  if (!week) return null;
  return {
    week: week.week,
    startDate: week.startDate,
    dayKey,
    dayLabel: DAY_LABELS[dayKey],
    passage: week[dayKey],
    allReadings: DAYS.map(d => ({ key: d, label: DAY_LABELS[d], passage: week[d] })),
  };
}

export { DAY_LABELS, DAYS };
