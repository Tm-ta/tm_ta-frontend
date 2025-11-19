/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Group = {
  id: string;
  selectedDates: string[]; // yyyy-MM-dd
  start: string;           // HH:MM
  end: string;             // HH:MM
  participants: string[];
  schedules: Record<string, { name:string; slots: string[] }>; // slot: 'dateKey|half'
};

export type FilterState = {
  participants: string[] | 'all',
  minPeople: number,
  days: ('월'|'화'|'수'|'목'|'금'|'토'|'일')[] | 'all',
  minDurationMin: number,
  maxDurationMin: number;
  maxPeople : number;
};

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
};

// 기본 필터 생성기
function makeFilterDefaults(participantsLen: number, overrides: Partial<FilterState> = {}): FilterState {
  return {
    participants: 'all',
    minPeople: 1,
    days: 'all',
    minDurationMin: 30,
    maxDurationMin: 300,
    maxPeople : Math.max(1, participantsLen),
    ...overrides,
  };
}

// 파생 필드 보정기(참여자 수가 변했을 때만 필요한 최소 수정)
function deriveFilterOnParticipantsChange(prev: FilterState, allNames: string[]): FilterState {
  const newMax = Math.max(1, allNames.length);

  // 사용자가 직접 고른 참가자 목록이 있으면 실제 존재하는 이름만 유지
  const fixedParticipants =
    prev.participants === 'all'
      ? 'all'
      : prev.participants.filter(n => allNames.includes(n));

  return {
    ...prev,
    participants: fixedParticipants,
    maxPeople : newMax,
    // minPeople이 상한을 넘지 않게 클램프
    minPeople: Math.min(prev.minPeople ?? 1, newMax),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      groups: {},
      currentGroupId: null,
      filters: {},

      createGroup: (dates, start, end) => {
        const id = uuidv4();
        const g: Group = { id, selectedDates: dates, start, end, participants: [], schedules: {} };

        set(s => {
          // 1) 그룹 생성
          const nextGroups = { ...s.groups, [id]: g };

          // 2) 해당 groupId 필터가 없을 때만 기본값 세팅(이전에 persist된 값이면 보존)
          const hasFilter = !!s.filters[id];
          const nextFilters = hasFilter
            ? s.filters
            : { ...s.filters, [id]: makeFilterDefaults(0) };

          return { groups: nextGroups, currentGroupId: id, filters: nextFilters };
        });

        return id;
      },

      addSchedule: (groupId, name, slots) => {
        set(s => {
          const g = s.groups[groupId];
          if (!g) return s as any;

          // 참여자 / 스케줄 반영
          const participants = Array.from(new Set([...g.participants, name]));
          const schedules = { ...g.schedules, [name]: { name, slots } };
          const nextGroups = {
            ...s.groups,
            [groupId]: { ...g, participants, schedules },
          };

          // 필터 업데이트 정책:
          // - 필터가 없으면 기본 세팅
          // - 필터가 있으면 파생 필드만 보정(maxPeopleSelected, minPeople, participants 배열 정합성)
          const prevFilter = s.filters[groupId];
          const nextFilter = prevFilter
            ? deriveFilterOnParticipantsChange(prevFilter, participants)
            : makeFilterDefaults(participants.length);

          const nextFilters = { ...s.filters, [groupId]: nextFilter };

          return { ...s, groups: nextGroups, filters: nextFilters };
        });
      },

      setFilter: (groupId, fs) =>
        set(s => ({ filters: { ...s.filters, [groupId]: fs } })),

      resetFilter: (groupId, overrides = {}) => {
        const { groups, filters } = get();
        const g = groups[groupId];
        const participantsLen = g ? g.participants.length : 0;
        const base = makeFilterDefaults(participantsLen, overrides);
        set({ filters: { ...filters, [groupId]: base } });
      },

      clearFilter: (groupId) => {
        const { filters } = get();
        const { [groupId]: _, ...rest } = filters;
        set({ filters: rest });
      },

      getFilter: (groupId) => {
        const { filters, groups } = get();
        const existing = filters[groupId];
        if (existing) return existing;

        const g = groups[groupId];
        const participantsLen = g ? g.participants.length : 0;
        const def = makeFilterDefaults(participantsLen);

        // 스토어에도 즉시 캐싱
        set({ filters: { ...filters, [groupId]: def } });
        return def;
      },
    }),
    {
      name: 'schedule-vote',
      // (옵션) 마이그레이션 훅: 과거 저장분에 maxPeopleSelected 없으면 보정
      version: 2,
      migrate: (state: any, _version) => {
        if (!state?.state) return state;
        const groups: Record<string, Group> = state.state.groups ?? {};
        const filters: Record<string, FilterState> = state.state.filters ?? {};

        const fixed: Record<string, FilterState> = { ...filters };
        for (const [gid, f] of Object.entries(filters)) {
          if (f.maxPeople == null) {
            const len = groups[gid]?.participants?.length ?? 0;
            fixed[gid] = makeFilterDefaults(len, f); // 기존 값을 덮어쓰되 누락 필드는 채움
          }
        }
        state.state.filters = fixed;
        return state;
      },
    }
  )
);

// (옵션) 닉네임 프리셋
export const NICKNAMES = [
  '핑크돌핀','별똥별','캔디러쉬','밤하늘','달토끼','초코칩','바람결','라임소다','파도소리','햇살조각',
  '구름냥','레몬밤','눈사람','딸기라떼','소나기','우주비행','반짝임','꿀토스트','모래시계','여름밤',
  '바닐라빈','초승달','유성우','달무리','물수제비','별헤는밤','무지개맛','코코포니','달팽이','안개꽃',
  '해무리','솔방울','블루문','라일락','북극성','붉은별','청춘기록','새벽빛','오로라','별가루',
  '민트티','밤양갱','산들바람','까미유','자두사탕','봄소리','코코아','얼그레이','밀키웨이','유자청'
];