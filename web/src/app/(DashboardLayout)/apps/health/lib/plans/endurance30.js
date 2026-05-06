// Generates progressive 30-day plan: reps scale each week
function week(startDay, repsHitDat, repsGapBung, repsBurpee, durationNhayDay) {
  const REST_DAYS = [4, 7]; // rest on day 4 and 7 of each week
  const days = [];
  for (let d = 1; d <= 7; d++) {
    const dayIndex = startDay + d - 1;
    if (REST_DAYS.includes(d)) {
      days.push({ dayIndex, title: 'Nghỉ ngơi', rest: true });
      continue;
    }
    const TEMPLATES = [
      { title: 'Ngực & Bụng',  exercises: [{ name: 'Hít đất', sets: 4, reps: repsHitDat, restSeconds: 60 }, { name: 'Gập bụng', sets: 4, reps: repsGapBung, restSeconds: 45 }] },
      { title: 'Cardio mạnh',  exercises: [{ name: 'Nhảy dây', sets: 5, durationSeconds: durationNhayDay, restSeconds: 45 }, { name: 'Burpee', sets: 3, reps: repsBurpee, restSeconds: 90 }] },
      { title: 'Toàn thân',    exercises: [{ name: 'Hít đất', sets: 3, reps: repsHitDat, restSeconds: 60 }, { name: 'Burpee', sets: 4, reps: repsBurpee, restSeconds: 90 }, { name: 'Gập bụng', sets: 3, reps: repsGapBung, restSeconds: 45 }] },
      { title: 'Sức bền',      exercises: [{ name: 'Nhảy dây', sets: 6, durationSeconds: durationNhayDay, restSeconds: 45 }, { name: 'Gập bụng', sets: 5, reps: repsGapBung, restSeconds: 45 }, { name: 'Hít đất', sets: 3, reps: repsHitDat, restSeconds: 60 }] },
      { title: 'Sức mạnh',     exercises: [{ name: 'Hít đất', sets: 5, reps: repsHitDat, restSeconds: 60 }, { name: 'Burpee', sets: 4, reps: repsBurpee, restSeconds: 90 }, { name: 'Squat', sets: 4, reps: 15, restSeconds: 60 }] },
    ];
    const template = TEMPLATES[(d - 1) % TEMPLATES.length];
    days.push({ dayIndex, title: template.title, exercises: template.exercises });
  }
  return days;
}

const w1 = week(1,  8,  12, 5,  45);
const w2 = week(8,  10, 15, 8,  60);
const w3 = week(15, 13, 18, 10, 75);
const w4 = week(22, 15, 20, 12, 90);

const finalDays = [
  {
    dayIndex: 29,
    title: 'Deload',
    exercises: [
      { name: 'Hít đất',  sets: 3, reps: 10, restSeconds: 60 },
      { name: 'Gập bụng', sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Nhảy dây', sets: 3, durationSeconds: 60, restSeconds: 45 },
    ],
  },
  {
    dayIndex: 30,
    title: 'Ngày hoàn thành 🏆',
    exercises: [
      { name: 'Hít đất',  sets: 4, reps: 20, restSeconds: 60 },
      { name: 'Gập bụng', sets: 4, reps: 25, restSeconds: 45 },
      { name: 'Burpee',   sets: 4, reps: 15, restSeconds: 90 },
      { name: 'Nhảy dây', sets: 5, durationSeconds: 90, restSeconds: 45 },
    ],
  },
];

export const ENDURANCE_30 = {
  id: 'endurance-30',
  name: 'Sức Bền 30 Ngày',
  durationDays: 30,
  difficulty: 'Khó',
  color: '#FF5722',
  description: 'Chương trình 4 tuần tăng dần cường độ — reps tăng mỗi tuần, đốt mỡ và xây cơ toàn thân.',
  estimatedMinutesPerDay: 35,
  days: [...w1, ...w2, ...w3, ...w4, ...finalDays],
};
