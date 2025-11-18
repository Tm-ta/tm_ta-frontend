/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Group = {
  id: string;
  selectedDates: string[]; // yyyy-MM-dd
  start: string; // HH:MM
  end: string;   // HH:MM
  participants: string[];
  schedules: Record<string, { name:string; slots: string[] }>; // slot: 'dateKey|half'
};

export type FilterState = {
  participants: string[] | 'all',
  minPeople: number,
  days: ('월'|'화'|'수'|'목'|'금'|'토'|'일')[] | 'all',
  minDurationMin: number,
  maxDurationMin: number; 
  maxPeopleSelected?: number,
}

export type AppState = {
  groups: Record<string, Group>;
  currentGroupId: string | null;
  createGroup: (dates:string[], start:string, end:string)=> string;
  addSchedule: (groupId:string, name:string, slots:string[])=> void;

  filters: Record<string, FilterState>;
  setFilter: (groupId:string, s:FilterState)=> void;

  resetFilter: (groupId:string, overrides?: Partial<FilterState>) => void;
  clearFilter: (groupId:string) => void;
  getFilter: (groupId:string) => FilterState;
}

export const useAppStore = create<AppState>()(persist((set,get)=>({
  groups: {},
  currentGroupId: null,
  filters: {},

  createGroup: (dates, start, end) => {
    const id = uuidv4();
    const g: Group = { id, selectedDates: dates, start, end, participants: [], schedules: {} };
    set(s => ({ groups: { ...s.groups, [id]: g }, currentGroupId: id }));
    return id;
  },

  addSchedule: (groupId, name, slots) => {
    set(s => {
      const g = s.groups[groupId];
      if(!g) return s as any;
      const participants = Array.from(new Set([...g.participants, name]));
      const schedules = { ...g.schedules, [name]: { name, slots } };
      return { ...s, groups: { ...s.groups, [groupId]: { ...g, participants, schedules } } };
    });
  },

  setFilter: (groupId, fs) => 
    set(s => ({ filters: { ...s.filters, [groupId]: fs } })),

  resetFilter: (groupId, overrides={}) => {
    const { groups, filters } = get();
    const g = groups[groupId];
    const participantsLen = g ? g.participants.length : 0;

    const base: FilterState = {
      participants: 'all',
      minPeople: 1,
      days: 'all',
      minDurationMin: 30,
      // 우측 핸들 상한(참여자 수 기반)
      maxDurationMin: 300,
      maxPeopleSelected: Math.max(1, participantsLen),
      ...overrides, // 필요 시 덮어쓰기
    };

    set({ filters: { ...filters, [groupId]: base } });
  },

  clearFilter: (groupId) => {
    const { filters } = get();
    const { [groupId]: _, ...rest } = filters;
    set({ filters: rest });
  },

  getFilter: (groupId) => {
    const { filters, groups } = get();
    if (filters[groupId]) return filters[groupId];

    // 기본값 조립 (그룹 참여자 수 고려)
    const g = groups[groupId];
    const participantsLen = g ? g.participants.length : 0;
    const def: FilterState = {
      participants: 'all',
      minPeople: 1,
      days: 'all',
      minDurationMin: 30,
      maxDurationMin: 300,
      maxPeopleSelected: Math.max(1, participantsLen),
    };

    // 스토어에도 즉시 캐싱
    set({ filters: { ...filters, [groupId]: def } });
    return def;
  },
}), { name: 'schedule-vote' }));

export const NICKNAMES = [
  '핑크돌핀','별똥별','캔디러쉬','밤하늘','달토끼','초코칩','바람결','라임소다','파도소리','햇살조각',
  '구름냥','레몬밤','눈사람','딸기라떼','소나기','우주비행','반짝임','꿀토스트','모래시계','여름밤',
  '바닐라빈','초승달','유성우','달무리','물수제비','별헤는밤','무지개맛','코코포니','달팽이','안개꽃',
  '해무리','솔방울','블루문','라일락','북극성','붉은별','청춘기록','새벽빛','오로라','별가루',
  '민트티','밤양갱','산들바람','까미유','자두사탕','봄소리','코코아','얼그레이','밀키웨이','유자청'
];
