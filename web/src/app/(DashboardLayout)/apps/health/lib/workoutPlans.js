import { FOUNDATION_7 } from './plans/foundation7';
import { BUILDER_14 } from './plans/builder14';
import { ENDURANCE_30 } from './plans/endurance30';
import { CORE_7 } from './plans/core7';
import { DUMBBELL_14 } from './plans/dumbbell14';

export const WORKOUT_PLANS = [FOUNDATION_7, CORE_7, BUILDER_14, DUMBBELL_14, ENDURANCE_30];

export function getPlanById(id) {
  return WORKOUT_PLANS.find(p => p.id === id) ?? null;
}

export function toLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDayIndex(startDate) {
  const start = new Date(startDate + 'T00:00:00');
  const today = new Date(toLocalDateStr() + 'T00:00:00');
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff + 1; // 1-indexed
}
