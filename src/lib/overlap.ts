/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Slot } from '@/components/TimeTableComponent';
import type { FilterState } from '@/components/FilterModal';

export const KOREAN_DOW = ['일','월','화','수','목','금','토'] as const;

export function parseSlotKey(k: string): Slot | null {
  const [dateKey, halfStr] = k.split('|');
  const halfHour = Number(halfStr);
  if (!dateKey || Number.isNaN(halfHour)) return null;
  return { dateKey, halfHour };
}

export function normalizeDaysFilter(days: FilterState['days']): 'all' | Set<number> {
  if (days === 'all') return 'all';
  const set = new Set<number>();
  const arr = Array.isArray(days) ? days : [];
  for (const d of arr) {
    const idx = KOREAN_DOW.indexOf(d as any);
    if (idx >= 0) set.add(idx);
  }
  return set.size ? set : 'all';
}

export function buildOverlapMap(
  schedulesByUser: Record<string, string[]>,
  selectedParticipants: Set<string>
): Map<string, number> {
  const map = new Map<string, number>();
  for (const [name, slotKeys] of Object.entries(schedulesByUser)) {
    if (!selectedParticipants.has(name)) continue;
    for (const key of slotKeys || []) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function computeActiveSlots(params: {
  overlapMap: Map<string, number>;
  minPeople: number;
  // maxPeople: number;
  allowedDays: 'all' | Set<number>;
  dateKeys: string[];
  startHour: number; // inclusive
  endHour: number;   // exclusive
}) {
  const { overlapMap, minPeople, allowedDays, dateKeys, startHour, endHour } = params;
  const actives: Slot[] = [];
  const dateSet = new Set(dateKeys);
  const halfMin = startHour * 2;
  const halfMax = endHour * 2;

  for (const [key, cnt] of overlapMap.entries()) {
    if (cnt < minPeople) continue;
    const parsed = parseSlotKey(key);
    if (!parsed) continue;
    const { dateKey, halfHour } = parsed;

    if (!dateSet.has(dateKey)) continue;
    if (halfHour < halfMin || halfHour >= halfMax) continue;

    if (allowedDays !== 'all') {
      const dow = new Date(dateKey).getDay();
      if (!allowedDays.has(dow)) continue;
    }
    actives.push({ dateKey, halfHour });
  }
  return actives;
}
