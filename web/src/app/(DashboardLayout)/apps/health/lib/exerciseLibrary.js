const darebees = q =>
  `https://www.youtube.com/results?search_query=darebees+${encodeURIComponent(q)}`;

export const EXERCISE_DETAILS = {
  'Hít đất': {
    type: 'reps',
    muscleGroup: 'Ngực',
    videoUrl: darebees('push up'),
    tips: [
      'Tay rộng bằng vai, lòng bàn tay thẳng dưới vai.',
      'Siết bụng, giữ thân người thẳng từ đầu đến gót.',
      'Hạ ngực gần chạm sàn, hít vào khi xuống.',
      'Thở ra khi đẩy lên, khuỷu tay xuôi 45°.',
      'Người mới: tập gối chạm sàn để dễ hơn.',
    ],
  },
  'Gập bụng': {
    type: 'reps',
    muscleGroup: 'Bụng',
    videoUrl: darebees('sit ups'),
    tips: [
      'Nằm ngửa, gối gập 90°, bàn chân áp sàn.',
      'Đặt tay sau tai — không kéo cổ.',
      'Cuộn người lên dùng cơ bụng, khuỷu chạm gối.',
      'Hạ chậm có kiểm soát, lưng dưới luôn chạm sàn.',
      'Thở ra khi cuộn lên, hít vào khi hạ xuống.',
    ],
  },
  'Nhảy dây': {
    type: 'duration',
    muscleGroup: 'Toàn thân',
    videoUrl: darebees('jump rope'),
    tips: [
      'Khuỷu tay sát thân, chỉ xoay cổ tay.',
      'Bật bằng đầu mũi chân, gối hơi chùng.',
      'Bật cao chỉ vừa đủ qua dây (~2cm).',
      'Giữ nhịp đều; nếu vướng dây, đếm lại từ đầu.',
      'Người mới: 30s nhảy, 30s nghỉ × 5 hiệp.',
    ],
  },
  'Burpee': {
    type: 'reps',
    muscleGroup: 'Toàn thân',
    videoUrl: darebees('burpees'),
    tips: [
      'Đứng thẳng → ngồi xổm, hai tay chống sàn.',
      'Bật chân ra sau vào tư thế plank.',
      'Hít đất 1 cái (bản nâng cao).',
      'Bật chân về sát tay, đứng dậy + nhảy bật.',
      'Siết bụng suốt động tác để bảo vệ lưng.',
    ],
  },
  'Squat': {
    type: 'reps',
    muscleGroup: 'Chân',
    videoUrl: darebees('squats'),
    tips: [
      'Chân rộng bằng vai, ngón chân hơi xoay ngoài.',
      'Ngồi xuống như ngồi ghế, lưng thẳng ngực ưỡn.',
      'Đầu gối không vượt ngón chân quá nhiều.',
      'Đẩy qua gót chân khi đứng lên.',
    ],
  },
  'Plank': {
    type: 'duration',
    muscleGroup: 'Bụng',
    videoUrl: darebees('plank'),
    tips: [
      'Giữ thẳng từ đầu đến gót như tấm ván.',
      'Siết chặt cơ bụng và cơ mông.',
      'Không để hông trồi lên hay hạ xuống.',
      'Thở đều, không nín thở.',
    ],
  },
  'Lunge': {
    type: 'reps',
    muscleGroup: 'Chân',
    videoUrl: darebees('lunges'),
    tips: [
      'Bước dài vừa đủ, đầu gối sau gần chạm sàn.',
      'Lưng thẳng, ngực ưỡn ra trước.',
      'Đầu gối trước không vượt ngón chân.',
      'Đẩy qua gót chân trước khi đứng lên.',
    ],
  },
  'Mountain Climber': {
    type: 'reps',
    muscleGroup: 'Toàn thân',
    videoUrl: darebees('mountain climbers'),
    tips: [
      'Giữ hông không nhấp nhô — giống tư thế plank.',
      'Kéo gối về ngực nhanh và mạnh.',
      'Thở đều trong suốt bài.',
      'Bắt đầu chậm để giữ form, sau tăng tốc.',
    ],
  },
};

export const EXERCISE_LIBRARY = {
  'Ngực': ['Hít đất', 'Bench Press', 'Incline Press', 'Dumbbell Fly', 'Cable Crossover', 'Dips'],
  'Lưng': ['Pull-up', 'Chin-up', 'Deadlift', 'Barbell Row', 'Cable Row', 'Lat Pulldown'],
  'Vai': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Arnold Press'],
  'Tay trước': ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl'],
  'Tay sau': ['Tricep Pushdown', 'Skull Crusher', 'Overhead Extension', 'Close-Grip Press'],
  'Chân': ['Squat', 'Deadlift', 'Leg Press', 'Lunge', 'Leg Curl', 'Leg Extension', 'Calf Raise'],
  'Bụng': ['Plank', 'Gập bụng', 'Leg Raise', 'Russian Twist', 'Mountain Climber'],
  'Toàn thân': ['Burpee', 'Nhảy dây', 'HIIT', 'Circuit training'],
};

export const ALL_EXERCISES = Object.entries(EXERCISE_LIBRARY).flatMap(
  ([group, names]) => names.map(name => ({ name, group }))
);
