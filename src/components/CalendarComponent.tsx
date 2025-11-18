'use client';

import styles from '@/styles/calendar.module.css';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import React, { useEffect, useMemo, useRef, useState } from 'react';

function dateKey(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export default function Calendar({
  value,
  onChange,
  initialDate = new Date(),
}: {
  value: Date[];
  onChange: (dates: Date[]) => void;
  initialDate?: Date;
}) {
  const [cursor, setCursor] = useState<Date>(initialDate);

  // 달력 매트릭스 (일~토)
  const matrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 }); // 일요일 시작
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [cursor]);

  // 현재 렌더에서의 props 기반 선택 스냅샷(Set)
  const selectedSet = useMemo(() => {
    const set = new Set<number>();
    value.forEach((d) => set.add(dateKey(d)));
    return set;
  }, [value]);

  // 제스처 상태
  const dragging = useRef(false);
  const moved = useRef(false);
  const startCellKey = useRef<number | null>(null);

  // 드래그 중 누적용 working set (add-only)
  const workingSetRef = useRef<Set<number> | null>(null);

  const commit = (setToCommit: Set<number>) => {
    const out = Array.from(setToCommit).map((t) => new Date(t));
    onChange(out);
  };

  const toggleClick = (k: number) => {
    const next = new Set(selectedSet);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    commit(next);
  };

  // 드래그 중 추가(취소는 드래그로 하지 않음)
  const addDuringDrag = (k: number) => {
    if (!workingSetRef.current) return;
    if (!workingSetRef.current.has(k)) {
      workingSetRef.current.add(k);
      commit(workingSetRef.current);
    }
  };

  function keyFromEventTarget(t: EventTarget | null) {
    const el = (t as HTMLElement | null)?.closest?.('[data-key]');
    const keyAttr = el?.getAttribute?.('data-key');
    return keyAttr ? Number(keyAttr) : null;
  }

  function onPointerDownCell(k: number, e: React.PointerEvent) {
    e.preventDefault(); // 모바일 이중 클릭 방지
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    dragging.current = true;
    moved.current = false;
    startCellKey.current = k;

    // 현재 선택 스냅샷으로부터 working set 시작
    workingSetRef.current = new Set(selectedSet);
  }

  function onPointerMoveGrid(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;

    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const cur = keyFromEventTarget(hit);
    if (cur == null) return;

    if (!moved.current) {
      if (cur !== startCellKey.current) {
        moved.current = true;
        if (startCellKey.current != null) addDuringDrag(startCellKey.current);
        addDuringDrag(cur);
      }
    } else {
      addDuringDrag(cur);
    }
  }

  useEffect(() => {
    const onUp = () => {
      if (dragging.current) {
        if (!moved.current && startCellKey.current != null) {
          toggleClick(startCellKey.current);
        }
      }
      dragging.current = false;
      moved.current = false;
      startCellKey.current = null;
      workingSetRef.current = null;
    };

    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSet]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.nav} onClick={() => setCursor(addMonths(cursor, -1))}>
          <img src='/icons/left.png' style={{height:'12px', width:'6px'}}/>
        </button>
        <div className={styles.title}>
          {cursor.getFullYear()}년 {String(cursor.getMonth() + 1).padStart(2, '0')}월
        </div>
        <button className={styles.nav} onClick={() => setCursor(addMonths(cursor, 1))}>
          <img src='/icons/right.png' style={{height:'12px', width:'6px'}}/>
        </button>
      </div>

      <div className={styles.weekdays}>
        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div
        className={styles.grid}
        onPointerMove={onPointerMoveGrid}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
      >
        {matrix.map((day, i) => {
          const k = dateKey(day);
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedSet.has(k);

          return (
            <div
              key={i}
              className={`${styles.cell} ${!inMonth ? styles.otherMonth : ''} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
              data-key={k}
              data-inmonth={inMonth || undefined}
              data-selected={isSelected || undefined}
              data-today={isToday || undefined}
              onPointerDown={(e) => onPointerDownCell(k, e)}
            >
              <div className={styles.daynum}>{day.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
