/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import styles from '@/styles/filter.module.css';
import TabBar from './TabBar';
import { useEffect, useRef, useState } from 'react';
import RangeSlider from './RangeSlider';

export type FilterState = {
  participants: string[] | 'all';
  minPeople: number;
  days: ('월'|'화'|'수'|'목'|'금'|'토'|'일')[] | 'all';
  minDurationMin: number;
  maxDurationMin: number;
  maxPeople: number;
};

export default function FilterModal({
  open,
  onClose,
  allParticipants,
  maxPeople,
  state,
  onApply,
  onReset,
  initialTab = 'ppl',
}:{
  open:boolean;
  onClose:()=>void;
  allParticipants:string[];
  maxPeople:number;
  state:FilterState;
  onApply:(s:FilterState)=>void;
  onReset:()=>void;
  initialTab?: 'ppl'|'cnt'|'dur';
}){
  const [tab, setTab] = useState<'ppl'|'cnt'|'dur'>(initialTab);
  const [draft, setDraft] = useState<FilterState>(state);
  const modalRef = useRef<HTMLDivElement|null>(null);

  // --- 범위 상태: 참여자/시간(듀얼 핸들) ---
  const maxCap = Math.max(1, maxPeople || 1);

  const [peopleRange, setPeopleRange] = useState<[number, number]>([
    Math.max(1, state.minPeople),
    Math.min(maxCap, state.maxPeople ?? maxCap),
  ]);
  // console.log(state.maxPeopleSelected)
  const [durRange, setDurRange] = useState<[number, number]>([
    Math.max(30, state.minDurationMin || 30),
    Math.min(300, state.maxDurationMin ?? 300),
  ]);

  useEffect(()=>{
    setDraft(state);
    setTab(initialTab);

    // peopleRange 동기화(클램프)
    const loP = Math.max(1, state.minPeople || 1);
    const hiP = Math.min(maxCap, state.maxPeople ?? maxCap);
    const loP2 = Math.min(loP, hiP);
    const hiP2 = Math.max(loP, hiP);
    setPeopleRange([loP2, hiP2]);
    
    // durRange 동기화(클램프)
    const loM = Math.max(30, state.minDurationMin || 30);
    setDurRange([
      Math.max(30, state.minDurationMin || 30),
      Math.min(300, state.maxDurationMin ?? 300), // ★ 상한 반영
    ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, open, initialTab, maxCap]);

  if(!open) return null;


  // 체크 토글
  function toggleName(n:string){
    if(draft.participants==='all') setDraft({...draft, participants:[n]});
    else {
      const set = new Set(draft.participants);
      if(set.has(n)) set.delete(n); else set.add(n);
      setDraft({...draft, participants: Array.from(set)});
    }
  }

  const everyoneChecked = draft.participants === 'all';
  const checked = (n:string)=>
    draft.participants!=='all' && (draft.participants as string[]).includes(n);

  const len = allParticipants.length;
  const oneOnly = len <= 1;

  // 보정 함수(좌핸들 ≤ 우핸들, 범위 한계 준수)
  const clampPeople = (min:number, max:number):[number,number] => {
    const lo = Math.max(1, Math.min(min, max));
    const hi = Math.max(lo, Math.min(max, maxCap));
    return [lo, hi];
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.sheet} ${styles.sheetFilter}`}
        ref={modalRef}
        onClick={e=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.headerTitle}> 필터 </span>
            <button className={styles.closeX} aria-label="닫기" onClick={onClose}>×</button>
          </div>

          <div className={styles.tabSec}>
            <TabBar
              type='modal'
              tabs={[
                {key:'ppl', label:'참여자'},
                {key:'cnt', label:'참여자 수'},
                {key:'dur', label:'필요시간'},
              ]}
              active={tab}
              onChange={(k)=>setTab(k as any)}
            />
          </div>
          <div className={styles.range}>
            {/* 참여자 */}
            {tab==='ppl' && (
              <div className={styles.pplWrap}>
                <div style={{}}>참여자</div>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    className={styles.circleCheck}
                    checked={everyoneChecked}
                    onChange={()=>{
                      setDraft({...draft, participants: everyoneChecked ? [] : 'all'});
                    }}
                  />
                  <span>모두 선택</span>
                </label>

                <div className={styles.checkGrid}>
                  {allParticipants.map(n => (
                    <label key={n} className={styles.checkRow}>
                      <input
                        type="checkbox"
                        className={styles.circleCheck}
                        checked={checked(n)}
                        onChange={()=> toggleName(n)}
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 참여자 수 (듀얼 슬라이더) */}
            {tab==='cnt' && (
              <div className={styles.rangeSection}>
                <div style={{}}>참여자 수</div>
                <RangeSlider
                  min={1}
                  max={maxCap}
                  step={1}
                  unit="people"
                  value={peopleRange}
                  onChange={(next)=>{
                    // lo ≤ hi 보정
                    const lo = Math.max(1, Math.min(next[0], next[1]));
                    const hi = Math.max(lo, Math.min(next[1], maxCap));
                    setPeopleRange([lo, hi]);
                  }}
                  disabled={allParticipants.length <= 1}
                  gradient={allParticipants.length >= 2}
                  /* 1명일 때 : 비활성 + 꽉 채움, 0명일 때 : 비활성 + 회색 */
                  fillWhenDisabled={allParticipants.length === 1}
                  formatLabel={(v)=>`${v}명`}
                />
                {/* <div className={styles.rangeNote}>
                  {len===0 ? '참여자가 없습니다.'
                    : len===1 ? '참여자가 1명입니다.'
                    : '슬라이더로 최소/최대 인원을 조절하세요.'}
                </div> */}
              </div>
            )}

            {/* 필요시간 (듀얼 슬라이더) */}
            {tab==='dur' && (
              <div className={styles.rangeSection}>
                <div style={{}}>필요시간</div>
                <RangeSlider
                  min={30}
                  max={300}
                  step={30}
                  unit="minutes"
                  value={durRange}
                  onChange={(next)=>{
                    const lo = Math.max(30, Math.min(next[0], next[1]));
                    const hi = Math.max(lo, Math.min(next[1], 300)); 
                    setDurRange([lo, hi]);
                  }}
                  formatLabel={(min)=>{
                    const h = Math.floor(min/60), m = min%60;
                    if (h>0 && m>0) return `${h}시간 ${m}분`;
                    if (h>0) return `${h}시간`;
                    return `${m}분`;
                  }}
                />
                <div className={styles.rangeNote}>
                  {/* 최소 30분, 최대 5시간(30분 단위) */}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.reset} onClick={onReset}>필터 초기화</button>
          <button
            className={styles.apply}
            onClick={()=>{
              const [minP, maxP] = peopleRange;
              const [minDur, maxDur] = durRange;
              onApply({
                ...draft,
                minPeople: minP,
                maxPeople: maxP,   // 상한을 보존
                minDurationMin: minDur,
                maxDurationMin: maxDur,
              });
              onClose();
            }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
