export const DUMBBELL_14 = {
  id: 'dumbbell-14',
  name: 'Tạ 14 Ngày',
  durationDays: 14,
  difficulty: 'Trung bình',
  color: '#FF5722',
  description: 'Push / Pull / Legs với tạ tay. 10 ngày tập + 4 ngày nghỉ. Tăng dần số rep mỗi tuần.',
  estimatedMinutesPerDay: 30,
  days: [
    {
      dayIndex: 1, title: 'Ngực & Tay Sau',
      exercises: [
        { name: 'Hít đất',             sets: 3, reps: 12, restSeconds: 60 },
        { name: 'DB Chest Press',       sets: 3, reps: 10, restSeconds: 60 },
        { name: 'DB Tricep Extension',  sets: 3, reps: 12, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 2, title: 'Lưng & Tay Trước',
      exercises: [
        { name: 'DB Row',          sets: 3, reps: 10, restSeconds: 60 },
        { name: 'DB Bicep Curl',   sets: 3, reps: 12, restSeconds: 45 },
        { name: 'DB Hammer Curl',  sets: 3, reps: 12, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 3, title: 'Chân & Vai',
      exercises: [
        { name: 'Goblet Squat',       sets: 3, reps: 12, restSeconds: 60 },
        { name: 'DB Shoulder Press',  sets: 3, reps: 10, restSeconds: 60 },
        { name: 'DB Lunge',           sets: 3, reps: 10, restSeconds: 60 },
      ],
    },
    { dayIndex: 4, title: 'Nghỉ ngơi', rest: true },
    {
      dayIndex: 5, title: 'Cardio & Core',
      exercises: [
        { name: 'Jumping Jack', sets: 3, reps: 30,  restSeconds: 30 },
        { name: 'Nhảy dây',     sets: 3, durationSeconds: 45, restSeconds: 45 },
        { name: 'Plank',        sets: 3, durationSeconds: 30, restSeconds: 30 },
      ],
    },
    {
      dayIndex: 6, title: 'Ngực & Core',
      exercises: [
        { name: 'Hít đất',       sets: 4, reps: 12, restSeconds: 60 },
        { name: 'DB Chest Press', sets: 3, reps: 12, restSeconds: 60 },
        { name: 'Leg Raise',      sets: 3, reps: 12, restSeconds: 45 },
        { name: 'Side Plank',     sets: 3, durationSeconds: 25, restSeconds: 30 },
      ],
    },
    {
      dayIndex: 7, title: 'Lưng & Core',
      exercises: [
        { name: 'DB Row',          sets: 4, reps: 12, restSeconds: 60 },
        { name: 'DB Bicep Curl',   sets: 3, reps: 14, restSeconds: 45 },
        { name: 'Mountain Climber', sets: 3, reps: 20, restSeconds: 45 },
      ],
    },
    { dayIndex: 8, title: 'Nghỉ ngơi', rest: true },
    {
      dayIndex: 9, title: 'Chân Nặng',
      exercises: [
        { name: 'Goblet Squat',          sets: 4, reps: 14, restSeconds: 60 },
        { name: 'DB Lunge',              sets: 3, reps: 12, restSeconds: 60 },
        { name: 'DB Romanian Deadlift',  sets: 3, reps: 10, restSeconds: 60 },
      ],
    },
    {
      dayIndex: 10, title: 'Vai & Đẩy',
      exercises: [
        { name: 'DB Shoulder Press',  sets: 4, reps: 10, restSeconds: 60 },
        { name: 'DB Lateral Raise',   sets: 3, reps: 15, restSeconds: 45 },
        { name: 'Hít đất',            sets: 4, reps: 15, restSeconds: 60 },
      ],
    },
    { dayIndex: 11, title: 'Nghỉ ngơi', rest: true },
    {
      dayIndex: 12, title: 'Kéo Nặng',
      exercises: [
        { name: 'DB Row',          sets: 4, reps: 14, restSeconds: 60 },
        { name: 'DB Bicep Curl',   sets: 4, reps: 14, restSeconds: 45 },
        { name: 'Gập bụng',        sets: 3, reps: 25, restSeconds: 30 },
      ],
    },
    {
      dayIndex: 13, title: 'Core & Cardio',
      exercises: [
        { name: 'Burpee',          sets: 3, reps: 10, restSeconds: 90 },
        { name: 'Plank',           sets: 4, durationSeconds: 45, restSeconds: 45 },
        { name: 'Mountain Climber', sets: 3, reps: 24, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 14, title: 'Full Body Kết Thúc',
      exercises: [
        { name: 'Goblet Squat',      sets: 3, reps: 15, restSeconds: 60 },
        { name: 'DB Row',            sets: 3, reps: 14, restSeconds: 60 },
        { name: 'DB Shoulder Press', sets: 3, reps: 12, restSeconds: 60 },
        { name: 'Hít đất',           sets: 3, reps: 15, restSeconds: 60 },
        { name: 'Plank',             sets: 2, durationSeconds: 45, restSeconds: 45 },
      ],
    },
  ],
};
