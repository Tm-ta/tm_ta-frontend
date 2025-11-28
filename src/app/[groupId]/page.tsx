/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import ParticipantsPopover from '@/components/ParticipantsPopover';
import TabBar from '@/components/TabBar';
import FilterModal, { type FilterState } from '@/components/FilterModal';
import SortModal, { type SortKey } from '@/components/SortModal';
import TimeTable from '@/components/TimeTableComponent';
import { useAppStore } from '@/lib/store';
import { useShareOnMount } from '@/hooks/useShareOnMount';
import FilterBar from '@/components/FilterBar';
import ShareRow from '@/components/ShareRow';
import EmptyState from '@/components/EmptyState';
import {
  KOREAN_DOW,
  normalizeDaysFilter,
  buildOverlapMap,
  computeActiveSlots,
} from '@/lib/overlap';
import SendReviewModal from '@/components/SendReviewModal';

export default function GroupPage() {
const { groupId } = useParams<{ groupId: string }>();
const group = useAppStore((s) => s.groups[groupId]);
// const setFilter = useAppStore((s) => s.setFilter);

// 2초 후 공유 호출
// useShareOnMount();

// 안전 기본값
const safeGroup = group ?? {
  selectedDates: [] as string[],
  start: '00:00',
  end: '24:00',
  participants: [] as string[],
  schedules: {} as Record<string, string[]>,
};

const filter = useAppStore(s => s.getFilter(groupId));
// console.log('cc', useAppStore(s => s.getFilter(groupId)))
const setFilter = useAppStore(s => s.setFilter);
// console.log('csc', useAppStore(s => s.setFilter))
// console.log('cc', useAppStore(s => s.setFilter))
// useAppStore((s) => s.filters[groupId]) ||
// ({
//   participants: 'all',
//   minPeople: 1,
//   days: 'all',
//   minDurationMin: 60,
// } as FilterState);

const [tab, setTab] = useState<'table' | 'list'>('table');

// 필터 모달
const [openFilter, setOpenFilter] = useState(false);
const [filterInitialTab, setFilterInitialTab] = useState<'ppl' | 'cnt' | 'dur'>('ppl');

// 정렬 모달(리스트 탭 전용)
const [openSort, setOpenSort] = useState(false);
const [sortKey, setSortKey] = useState<SortKey>('date'); // 'date' | 'people' | 'duration'

// 선택된 날짜/시간
const selectedDateKeys = safeGroup.selectedDates;
const dateObjs = useMemo(() => selectedDateKeys.map((k) => new Date(k)), [JSON.stringify(selectedDateKeys)]);
const dateKeys = useMemo(() => dateObjs.map((d) => d.toISOString().slice(0, 10)), [dateObjs]);

const startHour = parseInt(safeGroup.start.slice(0, 2), 10);
const endHour = parseInt(safeGroup.end.slice(0, 2), 10);

// 참여자
const allNames = safeGroup.participants;
const hasData = !!group && allNames.length > 0;
console.log(allNames, hasData);

const [openReview, setOpenReview] = useState(false);
const [lastFeedback, setLastFeedback] = useState<string>('');

// participants 필터
const selectedParticipants = useMemo(() => {
  if (filter.participants === 'all') return new Set(allNames);
  const arr = Array.isArray(filter.participants) ? filter.participants : [];
  return new Set(arr.filter((n) => allNames.includes(n)));
}, [allNames, filter.participants]);

// 스케줄 파싱
const schedulesByUser = useMemo(() => {
const out: Record<string, string[]> = {};
const raw: any = (group as any)?.schedules;
if (Array.isArray(raw)) {
  for (const row of raw) {
    if (!row) continue;
    const name = row.nickname || row.name;
    const slots = Array.isArray(row.slots) ? row.slots : [];
    if (name) out[name] = slots;
  }
} else if (raw && typeof raw === 'object') {
  for (const [name, slots] of Object.entries(raw)) {
    out[name] = Array.isArray(slots) ? (slots as string[]) : [];
  }
} else {
  for (const n of allNames) out[n] = [];
}
return out;
}, [group, allNames]);

// 겹침 + 요일 필터(요일은 현재 UI에서 편집X → 기존 로직 유지)
const overlapMap = useMemo(() => buildOverlapMap(schedulesByUser, selectedParticipants), [schedulesByUser, selectedParticipants]);
const allowedDays = normalizeDaysFilter(filter.days);

// 테이블 활성 슬롯 계산
const activeSlots = useMemo(
  () => computeActiveSlots({
    overlapMap,
    minPeople: Math.max(1, filter.minPeople || 1),
    // maxPeople: Math.min(max)
    allowedDays,
    dateKeys,
    startHour,
    endHour,
  }), [overlapMap, filter.minPeople, allowedDays, dateKeys, startHour, endHour] );

// 필터 초기화 (요청대로 모달 내부로 이동해 사용)
function handleResetFilter() {
  setFilter(groupId, {
    participants: 'all',
    minPeople: 1,
    days: filter.days, // 요일은 그대로 유지(편집 UI 없음)
    minDurationMin: 30,
    maxDurationMin: 500,
    maxPeople: allNames.length
  });
}
return (
  <div>
    <div className="stickyTop">
      <div className="spread" style={{ marginBottom: 8 }}>
        <span style={{ margin: 0, fontSize:'24px', fontWeight:'800' }}>약속 현황</span>
        <ParticipantsPopover names={allNames} onEdit={() => location.assign(`/${groupId}/add`)} />
      </div>
      <TabBar
        type='page'
        tabs={[
          { key: 'table', label: '테이블 보기' },
          { key: 'list', label: '리스트 보기' },
        ]}
        active={tab}
        onChange={(k) => setTab(k as 'table' | 'list')}
      />
      {allNames.length > 0 && (
        tab === 'table' ? (
          <div>
            <FilterBar
              mode="table"
              onOpenFilterTab={(t) => {
                setFilterInitialTab(t);
                setOpenFilter(true);
              }}
              onOpenSort={() => {}}
            />
          </div>
        ) : (
          <div>
            <FilterBar
              mode="list"
              onOpenFilterTab={(t) => {
                setFilterInitialTab(t);
                setOpenFilter(true);
              }}
              onOpenSort={() => setOpenSort(true)}
            />
          </div>
        )
      )}
    </div>
    <div className='body-area' id="capture-area">
      {(!group || !hasData) ? (
        <EmptyState text={!group ? '존재하지 않는 모임입니다.' : '아직 일정이 없어요'} />
      ) : (
        <div className="section">
          {tab === 'table' ? (
            <div>
              <TimeTable mode="view" dates={dateObjs} startHour={startHour} endHour={endHour} activeSlots={activeSlots} />
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gap: 12 }}>
                {/* 정렬 결과는 실제 데이터 연동 시 적용. 지금은 sortKey 표시만 */}
                <div className="caption" style={{ marginBottom: 8 }}>정렬 기준: {sortKey === 'date' ? '날짜 가까운 순' : sortKey === 'people' ? '참여자 많은 순' : '가능시간 긴 순'}</div>
                {dateObjs.map((d) => (
                  <div key={d.toISOString()} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                    <div style={{ fontWeight: 800 }}>
                      {d.getMonth() + 1}월 {String(d.getDate()).padStart(2, '0')}일({KOREAN_DOW[d.getDay()]})
                    </div>
                    <div className="caption">겹치는 시간 데이터는 추후 백엔드 연동 시 표기</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center'}} onClick={() => setOpenReview(true)}>
                틈타에게 의견 보내기
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    <div className='sticky-bottom'>
      <ShareRow groupId={groupId} />
    </div>

    {/* 필터 모달 */}
    <FilterModal
      open={openFilter}
      initialTab={filterInitialTab}
      onClose={() => setOpenFilter(false)}
      allParticipants={allNames}
      maxPeople={Math.max(1, allNames.length)}
      state={filter}
      onApply={(s) => setFilter(groupId, s)}
      onReset={handleResetFilter}
    />

    {/* 정렬 모달 (리스트 탭 전용) */}
    <SortModal
      open={openSort}
      onClose={() => setOpenSort(false)}
      value={sortKey}
      onApply={(v) => {
        setSortKey(v);
        setOpenSort(false);
      }}
    />

    {/* 리뷰 전송 (리스트 탭 전용) */}
    <SendReviewModal
      open={openReview}
      onClose={() => setOpenReview(false)}
      onSubmit={(txt) => {
        // 여기서 서버로 전송 or 저장
        setLastFeedback(txt);
        console.log('submitted:', txt);
      }}
    />
  </div>
  );
}