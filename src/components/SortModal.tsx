'use client';

import styles from '@/styles/filter.module.css';
import { useEffect, useState } from 'react';

export type SortKey = 'date' | 'people' | 'duration';

export default function SortModal({
  open,
  onClose,
  value,
  onApply,
}:{
  open:boolean;
  onClose:()=>void;
  value: SortKey;
  onApply:(v:SortKey)=>void;
}){
  const [v, setV] = useState<SortKey>(value);
  useEffect(()=>{ setV(value); }, [value, open]);

  // 닫힐 때 현재 선택값을 커밋
  const commitAndClose = (next?: SortKey) => {
    const finalV = next ?? v;
    onApply(finalV);
    onClose();
  };

  // ESC로 닫히는 경우도 커밋
  useEffect(()=>{
    if(!open) return;
    const onKey = (e: KeyboardEvent) => {
      if(e.key === 'Escape') commitAndClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, v]);

  if(!open) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={() => commitAndClose()}                         // 배경 클릭 시 커밋
    >
      <div
        className={`${styles.sheet} ${styles.sheetSort}`}
        onClick={(e)=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          정렬
          <button
            className={styles.closeX}
            aria-label="닫기"
            onClick={() => commitAndClose()}                   // X 클릭 시 커밋
          >×</button>
        </div>

        <div className={styles.radioCheck}>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="sort"
              checked={v==='date'}
              onChange={()=>setV('date')}
            />
            <span className={styles.radioText}>날짜 가까운 순</span>
          </label>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="sort"
              checked={v==='people'}
              onChange={()=>setV('people')}
            />
            <span className={styles.radioText}>참여자 많은 순</span>
          </label>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="sort"
              checked={v==='duration'}
              onChange={()=>setV('duration')}
            />
            <span className={styles.radioText}>가능시간 긴 순</span>
          </label>
        </div>
      </div>
    </div>
  );
}
