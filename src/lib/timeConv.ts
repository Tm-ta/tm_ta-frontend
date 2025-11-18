// “분 단위” ↔ “시간/슬롯” 변환 유틸
// 'HH:MM:SS' -> halfIndex(0~47)
export function timeToHalf(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  return hh * 2 + (mm >= 30 ? 1 : 0);
}
// halfIndex -> 'HH:MM:00'
export function halfToTime(h: number) {
  const hh = Math.floor(h / 2);
  const mm = h % 2 === 0 ? '00' : '30';
  return `${String(hh).padStart(2,'0')}:${mm}:00`;
}

// 분->연속시간(시간 단위) 변환(백 파라미터용)
export function minToHoursCeil(min: number) {
  return Math.max(1, Math.ceil(min / 60));
}
export function minToHoursFloor(min: number) {
  return Math.max(1, Math.floor(min / 60));
}
