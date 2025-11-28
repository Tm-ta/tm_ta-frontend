import {
  addDays, eachDayOfInterval, endOfMonth, format, isBefore, isSaturday, isSunday,
  startOfDay, startOfMonth, startOfWeek
} from 'date-fns';

const key = (d: Date) => format(d, 'yyyy-MM-dd');

export function computeDatePreset(preset: string): string[] {
  const today0 = startOfDay(new Date());

  if (preset === 'd+7' || preset === 'd+14') {
    const days = preset === 'd+7' ? 7 : 14;
    const from = addDays(today0, 1);        // 내일부터
    const to = addDays(from, days - 1);     // 총 days일
    return eachDayOfInterval({ start: from, end: to }).map(key);
  }

  if (preset === 'wkndThisMonth') {
    const m0 = startOfMonth(today0);
    const m1 = endOfMonth(today0);
    return eachDayOfInterval({ start: m0, end: m1 })
      .filter(d => (isSaturday(d) || isSunday(d)) && !isBefore(startOfDay(d), today0)) // 지난 날짜 제외
      .map(key);
  }

  if (preset === 'nextSun') {
    // "다음주 일요일": 주 시작을 월요일로 해석
    const mondayThisWeek = startOfWeek(today0, { weekStartsOn: 1 });
    const targetSunday = addDays(mondayThisWeek, 13);
    const from = addDays(today0, 1); // 내일부터 ~ 타겟 일요일까지
    return eachDayOfInterval({ start: from, end: targetSunday }).map(key);
  }

  // 기본(안전)
  return [];
}