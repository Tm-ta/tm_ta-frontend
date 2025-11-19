/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import styles from '@/styles/wheel.module.css';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const HOURS = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const ITEM_H = 48; // 한 줄 높이(px)

/** 한 컬럼(시작/종료) 스크롤/선택 관리 훅 */
function useWheel(defaultIndex: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(defaultIndex); // 패딩 포함 중앙 인덱스(1..25)

  /** 스크롤 시 현재 중앙 줄 인덱스 계산 */
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    // 중앙 라인은 컨테이너 상단에서 ITEM_H 만큼 내려간 위치
    const centered = Math.round((el.scrollTop + ITEM_H) / ITEM_H);
    if (centered !== index) setIndex(centered);
  };

  /** i번째(패딩 보정된) 아이템을 중앙으로 스크롤 */
  const scrollToIndex = (i: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    // 중앙 정렬 = (i - 1) * ITEM_H
    el.scrollTo({ top: (i - 1) * ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
  };

  // 초기 위치 중앙 정렬
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = (defaultIndex - 1) * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, index, setIndex, onScroll, scrollToIndex };
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const valueToPaddedIndex = (v: string) => Math.max(0, HOURS.indexOf(v)) + 1; // "HH:00" -> 1..25

export default function HourRangeWheel({
  start = '00:00',
  end = '24:00',
  onChange,
}: {
  start?: string;
  end?: string;
  onChange: (s: string, e: string) => void;
}) {
  // 각 컬럼 휠
  const sWheel = useWheel(valueToPaddedIndex(start));
  const eWheel = useWheel(valueToPaddedIndex(end));

  // 패딩 포함 중앙 인덱스(1..25로 클램프)
  const siRaw = clamp(sWheel.index, 1, 25);
  const eiRaw = clamp(eWheel.index, 1, 25);

  // 실데이터 인덱스(0..24)로 변환
  const sIdxRaw = siRaw - 1;
  let eIdxRaw = eiRaw - 1;

  // 규칙: end <= start → end = start + 1 (최대 24:00)
  if (eIdxRaw <= sIdxRaw) eIdxRaw = Math.min(24, sIdxRaw + 1);

  // 선택 문자열
  const sv = HOURS[sIdxRaw];
  const ev = HOURS[eIdxRaw];

  // 선택이 바뀌면 부모에 통지
  useEffect(() => {
    onChange(sv, ev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sv, ev]);

  // 외부 props 변경 시, 휠 위치(중앙)를 해당 값으로 동기화
  useEffect(() => {
    sWheel.scrollToIndex(valueToPaddedIndex(start), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);
  useEffect(() => {
    eWheel.scrollToIndex(valueToPaddedIndex(end), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  return (
    <div className={styles.wrap}>
      {/* 시작 휠 (활성줄 접미사: '부터') */}
      <WheelColumn
        wheelRef={sWheel.ref}
        index={sWheel.index}
        setIndex={sWheel.setIndex}
        onScroll={sWheel.onScroll}
        scrollToIndex={sWheel.scrollToIndex}
        activeSuffix="부터"
      />

      {/* 종료 휠 (활성줄 접미사: '까지') */}
      <WheelColumn
        wheelRef={eWheel.ref}
        index={eWheel.index}
        setIndex={eWheel.setIndex}
        onScroll={eWheel.onScroll}
        scrollToIndex={eWheel.scrollToIndex}
        activeSuffix="까지"
      />
    </div>
  );
}

function WheelColumn({
  wheelRef,
  index,
  setIndex,
  onScroll,
  scrollToIndex,
  activeSuffix,
}: {
  wheelRef: React.RefObject<HTMLDivElement>;
  index: number; // 패딩 포함 중앙 인덱스
  setIndex: (i: number) => void;
  onScroll: () => void;
  scrollToIndex: (i: number) => void;
  activeSuffix: string; // 중앙 줄(활성)에 붙일 접미사
}) {
  return (
    <div className={styles.colWrap}>
      <div
        className={styles.col}
        ref={wheelRef}
        onScroll={onScroll}
        style={{ ['--item-h' as any]: `${ITEM_H}px` }}
      >
        {/* 위쪽 패딩(빈 줄 1) */}
        <div className={styles.blank} />
        {HOURS.map((h, i) => {
          const paddedIndex = i + 1; // 상단 패딩 보정
          const isActive = paddedIndex === index; // 중앙에 걸린 줄
          return (
            <div
              key={h}
              className={clsx(styles.item, isActive && styles.active)}
              onClick={() => {
                setIndex(paddedIndex);
                scrollToIndex(paddedIndex);
              }}
            >
              {isActive ? (
                <>
                  <span>{h}</span>
                  <span className={styles.activeSuffix}>{activeSuffix}</span>
                </>
              ) : (
                h
              )}
            </div>
          );
        })}

        {/* 아래쪽 패딩(빈 줄 1) */}
        <div className={styles.blank} />
      </div>
      <div className={styles.centerBox}/>
    </div>
  );
}
