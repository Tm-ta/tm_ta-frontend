'use client';
import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/filter.module.css';

type Unit = 'people' | 'minutes';

export default function RangeSlider({
  min,
  max,
  step = 1,
  unit,
  value,
  onChange,
  disabled = false,
  gradient = true,
  formatLabel,
  /** 비활성일 때도 트랙을 꽉 채워서 보여줄지(참여자 1명일 때) */
  fillWhenDisabled = false,
}:{
  min: number;
  max: number;
  step?: number;
  unit: Unit;
  value: [number, number];                 // [lo, hi]
  onChange: (v:[number, number]) => void;
  disabled?: boolean;
  gradient?: boolean;
  formatLabel?: (v:number)=>string;
  fillWhenDisabled?: boolean;
}) {
  const [lo, setLo] = useState(value[0]);
  const [hi, setHi] = useState(value[1]);

  useEffect(()=>{ 
    // min/max 변화까지 고려해서 항상 클램프
    const nextLo = Math.max(min, Math.min(max, value[0]));
    const nextHi = Math.max(nextLo, Math.min(max, value[1]));
    setLo(nextLo);
    setHi(nextHi);
  }, [value, min, max]);

  const clamp = (n:number)=> Math.max(min, Math.min(max, n));
  const snap  = (n:number)=> Math.round(n/step)*step;

  const setLoSafe = (v:number)=> {
    const nv = clamp(snap(v));
    const capped = Math.min(nv, hi);
    setLo(capped);
    onChange([capped, hi]);
  };
  const setHiSafe = (v:number)=> {
    const nv = clamp(snap(v));
    const capped = Math.max(nv, lo);
    setHi(capped);
    onChange([lo, capped]);
  };

  const fmt = (v:number)=>{
    if (formatLabel) return formatLabel(v);
    if (unit==='people') return `${v}명`;
    const h = Math.floor(v/60), m = v%60;
    if (h>0 && m>0) return `${h}시간 ${m}분`;
    if (h>0) return `${h}시간`;
    return `${m}분`;
  };

  const trackStyle = useMemo(()=>{
    if (disabled) {
      // 0명: 회색(기본 bg만), 1명: 꽉 채움
      if (fillWhenDisabled) {
        return { background: 'var(--range-fill, #FBB337)' };
      } else {
        return { background: 'var(--range-bg, #eee)' };
      }
    }
    const p1 = ((lo - min) / (max - min)) * 100;
    const p2 = ((hi - min) / (max - min)) * 100;

    // 그라디언트(필요시 커스텀 가능)
    const fill = gradient
      ? 'var(--range-fill, #FBB337)'
      : 'var(--range-fill, #FBB337)';

    const bg = `linear-gradient(90deg,
      var(--range-bg, #eee) 0% ${p1}%,
      ${fill} ${p1}% ${p2}%,
      var(--range-bg, #eee) ${p2}% 100%)`;
    return { background: bg };
  }, [disabled, fillWhenDisabled, lo, hi, min, max, gradient]);

  console.log("min", min, lo, value);

  return (
    <div className={styles.rangeWrap + (disabled ? ' '+styles.rangeDisabled : '')}>
      <div className={styles.rangeTitle}>{fmt(lo)} - {fmt(hi)}</div>
      {/* 트랙 + 핸들 */}
      <div className={styles.rangeTrack} style={trackStyle}>
        {/* lo */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          disabled={disabled}
          onChange={(e)=> setLoSafe(Number(e.target.value))}
          className={`${styles.rangeInput} ${styles.rangeInputLo} ${disabled ? styles.thumbHidden : ''}`}
          aria-label="min"
        />
        {/* hi */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          disabled={disabled}
          onChange={(e)=> setHiSafe(Number(e.target.value))}
          className={`${styles.rangeInput} ${styles.rangeInputHi} ${disabled ? styles.thumbHidden : ''}`}
          aria-label="max"
        />
      </div>

      {/* 현재 값 표기: 아래, 좌/우 배치 */}
      {max <= 1 ?
        <div className={styles.rangeFooter}>
          <div className={styles.rangeNote}>
            참여자 수가 {max}명이므로 조정할 수 없습니다.
          </div>
        </div>
        :
        <div className={styles.rangeFooter}>
          <span className={styles.rangeNow}>{fmt(lo)}</span>
          <span className={styles.rangeDash}></span>
          <span className={styles.rangeNow}>{fmt(hi)}</span>
        </div>
      }
    </div>
  );
}
