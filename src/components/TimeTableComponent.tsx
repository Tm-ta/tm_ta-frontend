/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import styles from '@/styles/timetable.module.css';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';

export type Mode = 'view' | 'add' | 'edit';
export type Slot = { dateKey: string; halfHour: number };

export type TimeTableProps = {
  mode: Mode;
  dates: Date[];
  startHour: number;
  endHour: number;
  activeSlots?: Slot[];
  onAddSlot?: (slot: Slot) => void;
  onRemoveSlot?: (slot: Slot) => void;
};

const ROWS_PER_HOUR = 2;

const K = {
  value: 'data-value',
  date: 'data-date',
  half: 'data-half',
};

function slotKey(dateKey: string, half: number) {
  return `${dateKey}|${half}`;
}
function halfHourToLabel(half: number) {
  const h = Math.floor(half / 2);
  const m = half % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
}

export default function TimeTable({
  mode,
  dates,
  startHour,
  endHour,
  activeSlots = [],
  onAddSlot,
  onRemoveSlot,
}: TimeTableProps) {
  const isInteractive = mode !== 'view';

  const hourCount = Math.max(0, endHour - startHour);
  const totalHalfRows = hourCount * ROWS_PER_HOUR;
  const hours = useMemo(
    () => Array.from({ length: hourCount }, (_, i) => startHour + i),
    [startHour, endHour, hourCount]
  );
  const dateKeys = useMemo(() => dates.map((d) => format(d, 'yyyy-MM-dd')), [dates]);

  // 활성 세트
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    activeSlots.forEach((s) => set.add(slotKey(s.dateKey, s.halfHour)));
    return set;
  }, [activeSlots]);

  // ====== 스크롤 단일 소스(grid) & 헤더/좌측 transform 동기화 ======
  const gridRef = useRef<HTMLDivElement | null>(null);
  const headInnerRef = useRef<HTMLDivElement | null>(null); // 가로 이동 대상
  const leftInnerRef = useRef<HTMLDivElement | null>(null); // 세로 이동 대상

  // requestAnimationFrame으로 부드럽게
  const rafRef = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });

  const onGridScroll = () => {
    const grid = gridRef.current;
    if (!grid) return;

    const x = grid.scrollLeft;
    const y = grid.scrollTop;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      last.current = { x, y };
      if (headInnerRef.current) {
        headInnerRef.current.style.transform = `translateX(${-x}px)`; // 좌우만
      }
      if (leftInnerRef.current) {
        leftInnerRef.current.style.transform = `translateY(${-y}px)`; // 상하만
      }
    });
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // 초기 동기화
    onGridScroll();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ===== 드래그/클릭 제스처 =====
  const dragging = useRef(false);
  const moved = useRef(false);
  const dragMode = useRef<'add' | 'remove' | null>(null);
  const dragSeen = useRef<Set<string>>(new Set());
  const startKeyRef = useRef<string | null>(null);
  const startDateRef = useRef<string | null>(null);
  const startHalfRef = useRef<number | null>(null);
  const [draggingCss, setDraggingCss] = useState(false);

  function parseCell(el: Element | null) {
    if (!el) return null;
    const cell = (el as HTMLElement).closest?.(`.${styles.cell}`) as HTMLElement | null;
    if (!cell) return null;
    const key = cell.getAttribute(K.value);
    const dk = cell.getAttribute(K.date);
    const halfStr = cell.getAttribute(K.half);
    if (!key || !dk || halfStr == null) return null;
    return { key, dateKey: dk, half: Number(halfStr) };
  }

  function onGridPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isInteractive) return;
    e.preventDefault();
    const p = parseCell(e.target as Element);
    if (!p) return;

    dragging.current = true;
    moved.current = false;
    startKeyRef.current = p.key;
    startDateRef.current = p.dateKey;
    startHalfRef.current = p.half;
    dragMode.current = activeSet.has(p.key) ? 'remove' : 'add';
    dragSeen.current.clear();
    setDraggingCss(true);
  }

  function onGridPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isInteractive || !dragging.current) return;
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const p = parseCell(hit);
    if (!p) return;

    if (!moved.current) {
      if (p.key !== startKeyRef.current) {
        moved.current = true;
        if (startKeyRef.current && startDateRef.current != null && startHalfRef.current != null) {
          const firstSlot: Slot = { dateKey: startDateRef.current, halfHour: startHalfRef.current };
          dragSeen.current.add(startKeyRef.current);
          if (dragMode.current === 'add') onAddSlot?.(firstSlot);
          else onRemoveSlot?.(firstSlot);
        }
      } else {
        return;
      }
    }

    if (dragSeen.current.has(p.key)) return;
    dragSeen.current.add(p.key);
    const slot: Slot = { dateKey: p.dateKey, halfHour: p.half };
    if (dragMode.current === 'add') onAddSlot?.(slot);
    else onRemoveSlot?.(slot);
  }

  useEffect(() => {
    function up() {
      if (!isInteractive || !dragging.current) return;

      if (!moved.current && startKeyRef.current && startDateRef.current != null && startHalfRef.current != null) {
        const slot: Slot = { dateKey: startDateRef.current, halfHour: startHalfRef.current };
        if (dragMode.current === 'add') onAddSlot?.(slot);
        else onRemoveSlot?.(slot);
      }

      dragging.current = false;
      moved.current = false;
      dragMode.current = null;
      dragSeen.current.clear();
      startKeyRef.current = null;
      startDateRef.current = null;
      startHalfRef.current = null;
      setDraggingCss(false);
    }

    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [isInteractive]);

  // ===== 렌더 =====
  return (
    <div className={styles.wrap} style={{ ['--cols' as any]: dates.length }}>
      {/* 상단 헤더(좌우 이동만, transform으로 동기화) */}
      <div className={styles.headRail}>
        <div className={styles.headRow}>
          <div className={styles.corner} />
          <div className={styles.headViewport}>
            <div className={styles.headInner} ref={headInnerRef} style={{ ['--cols' as any]: dates.length }}>
              {dateKeys.map((dk, i) => (
                <div key={dk} className={styles.colHead}>
                  <div className={styles.dow}>
                    {['일', '월', '화', '수', '목', '금', '토'][new Date(dates[i]).getDay()]}
                  </div>
                  <div className={styles.date}>{format(dates[i], 'MM/dd')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 본문: 좌측(세로만 이동) + 그리드(양방향 스크롤) */}
      <div className={styles.body}>
        {/* 좌측 시간: transform으로 세로만 이동 */}
        <div className={styles.leftRail}>
          <div className={styles.leftViewport}>
            <div className={styles.leftInner} ref={leftInnerRef}>
              {hours.map((h) => (
                <div key={h} className={styles.hourLabel}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 그리드(단일 스크롤 소스) */}
        <div
          className={clsx(styles.grid, draggingCss && styles.dragging)}
          ref={gridRef}
          onScroll={onGridScroll}
          onPointerDown={onGridPointerDown}
          onPointerMove={onGridPointerMove}
        >
          <div className={styles.gridInner} style={{ ['--cols' as any]: dates.length }}>
            {Array.from({ length: totalHalfRows }, (_, r) => {
              const rowIndex = r + 1; // 1부터
              const half = startHour * 2 + r;

              return (
                <div key={half} className={styles.halfRow}>
                  {dateKeys.map((dk, c) => {
                    const colIndex = c + 1; // 1부터
                    const key = slotKey(dk, half);
                    const active = activeSet.has(key);

                    // 행/열 인덱스 기반 보더 두께 클래스
                    const rowClass = rowIndex % 2 === 0 ? styles.rEven : styles.rOdd;
                    const colClass = colIndex % 2 === 0 ? styles.cEven : styles.cOdd;

                    return (
                      <div
                        key={key}
                        className={clsx(
                          styles.cell,
                          active && styles.active,
                          isInteractive && styles.clickable,
                          rowClass,
                          colClass
                        )}
                        data-value={key}
                        data-date={dk}
                        data-half={half}
                        data-time={halfHourToLabel(half)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
