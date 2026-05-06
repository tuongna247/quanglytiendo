export const FOUNDATION_7 = {
  id: 'foundation-7',
  name: 'Nền Tảng 7 Ngày',
  durationDays: 7,
  difficulty: 'Người mới',
  color: '#4CAF50',
  description: 'Làm quen 4 bài tập cơ bản với khối lượng nhẹ. Phù hợp hoàn toàn cho người mới bắt đầu.',
  estimatedMinutesPerDay: 15,
  days: [
    {
      dayIndex: 1,
      title: 'Khởi động',
      exercises: [
        { name: 'Hít đất',  sets: 3, reps: 8,  restSeconds: 60 },
        { name: 'Gập bụng', sets: 3, reps: 12, restSeconds: 45 },
        { name: 'Nhảy dây', sets: 3, durationSeconds: 30, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 2,
      title: 'Nghỉ ngơi',
      rest: true,
    },
    {
      dayIndex: 3,
      title: 'Thêm Burpee',
      exercises: [
        { name: 'Hít đất',  sets: 3, reps: 10, restSeconds: 60 },
        { name: 'Gập bụng', sets: 3, reps: 15, restSeconds: 45 },
        { name: 'Burpee',   sets: 2, reps: 5,  restSeconds: 90 },
      ],
    },
    {
      dayIndex: 4,
      title: 'Nghỉ ngơi',
      rest: true,
    },
    {
      dayIndex: 5,
      title: 'Tăng nhảy dây',
      exercises: [
        { name: 'Hít đất',  sets: 3, reps: 10, restSeconds: 60 },
        { name: 'Gập bụng', sets: 3, reps: 15, restSeconds: 45 },
        { name: 'Nhảy dây', sets: 4, durationSeconds: 45, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 6,
      title: 'Cardio mạnh',
      exercises: [
        { name: 'Nhảy dây', sets: 4, durationSeconds: 45, restSeconds: 45 },
        { name: 'Burpee',   sets: 3, reps: 6,  restSeconds: 90 },
        { name: 'Gập bụng', sets: 3, reps: 15, restSeconds: 45 },
      ],
    },
    {
      dayIndex: 7,
      title: 'Tổng kết tuần',
      exercises: [
        { name: 'Hít đất',  sets: 3, reps: 12, restSeconds: 60 },
        { name: 'Gập bụng', sets: 3, reps: 20, restSeconds: 45 },
        { name: 'Burpee',   sets: 3, reps: 8,  restSeconds: 90 },
        { name: 'Nhảy dây', sets: 3, durationSeconds: 30, restSeconds: 45 },
      ],
    },
  ],
};
