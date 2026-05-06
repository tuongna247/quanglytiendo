export const CORE_7 = {
  id: 'core-7',
  name: 'Core 7 Ngày',
  durationDays: 7,
  difficulty: 'Trung bình',
  color: '#9C27B0',
  description: 'Củng cố vùng lõi: bụng, lưng dưới, hông. Plank, Side Plank, Leg Raise và Mountain Climber.',
  estimatedMinutesPerDay: 20,
  days: [
    {
      dayIndex: 1,
      title: 'Core Cơ Bản',
      exercises: [
        { name: 'Plank',      sets: 3, durationSeconds: 30, restSeconds: 45 },
        { name: 'Gập bụng',   sets: 3, reps: 15, restSeconds: 30 },
        { name: 'Leg Raise',  sets: 3, reps: 10, restSeconds: 45 },
      ],
    },
    { dayIndex: 2, title: 'Nghỉ ngơi', rest: true },
    {
      dayIndex: 3,
      title: 'Side Plank & Bụng',
      exercises: [
        { name: 'Plank',      sets: 3, durationSeconds: 40, restSeconds: 45 },
        { name: 'Side Plank', sets: 3, durationSeconds: 20, restSeconds: 30 },
        { name: 'Gập bụng',   sets: 3, reps: 20, restSeconds: 30 },
      ],
    },
    {
      dayIndex: 4,
      title: 'Core Động',
      exercises: [
        { name: 'Mountain Climber', sets: 3, reps: 20, restSeconds: 45 },
        { name: 'Leg Raise',        sets: 3, reps: 12, restSeconds: 45 },
        { name: 'Gập bụng',         sets: 3, reps: 20, restSeconds: 30 },
      ],
    },
    { dayIndex: 5, title: 'Nghỉ ngơi', rest: true },
    {
      dayIndex: 6,
      title: 'Core Tổng Hợp',
      exercises: [
        { name: 'Plank',            sets: 4, durationSeconds: 45, restSeconds: 45 },
        { name: 'Side Plank',       sets: 3, durationSeconds: 30, restSeconds: 30 },
        { name: 'Mountain Climber', sets: 3, reps: 24, restSeconds: 45 },
        { name: 'Leg Raise',        sets: 3, reps: 12, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 7,
      title: 'Core Kết Tuần',
      exercises: [
        { name: 'Plank',      sets: 3, durationSeconds: 60, restSeconds: 60 },
        { name: 'Side Plank', sets: 3, durationSeconds: 35, restSeconds: 30 },
        { name: 'Leg Raise',  sets: 3, reps: 15, restSeconds: 45 },
        { name: 'Gập bụng',   sets: 3, reps: 25, restSeconds: 30 },
      ],
    },
  ],
};
