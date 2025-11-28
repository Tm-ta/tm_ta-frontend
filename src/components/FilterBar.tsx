'use client';
import React from 'react';

type Props = {
  mode: 'table' | 'list';
  onOpenFilterTab: (tab: 'ppl' | 'cnt' | 'dur') => void;
  onOpenSort: () => void; // list 전용
};

export default function FilterBar({ mode, onOpenFilterTab, onOpenSort }: Props) {
  return (
    <div className="filter" style={{ gap: "12px" }}>
      <div className="row" style={{ gap: 8 }}>
        {mode === 'list' && (
          <button
            onClick={onOpenSort}
            style={{
              border: '1px solid var(--gray-200)',
              background: '#fff',
              borderRadius: '7px',
              height:'32px',
              width: 'fit-content',
              padding: '0 12px',
              fontSize: "14px"
            }}
          >
            정렬 ∨
          </button>
        )}
        <button
          onClick={() => onOpenFilterTab('ppl')}
          style={{ border: '1px solid var(--gray-200)', background: '#fff', borderRadius: '7px', padding: '0 12px', height:'32px', width: 'fit-content', fontSize: "14px" }}
        >
          참여자 ∨
        </button>
        <button
          onClick={() => onOpenFilterTab('cnt')}
          style={{ border: '1px solid var(--gray-200)', background: '#fff', borderRadius: '7px', padding: '0 12px', height:'32px', width: 'fit-content',fontSize: "14px" }}
        >
          참여자 수 ∨
        </button>
        <button
          onClick={() => onOpenFilterTab('dur')}
          style={{ border: '1px solid var(--gray-200)', background: '#fff', borderRadius: '7px',padding: '0 12px', height:'32px', width: 'fit-content',fontSize: "14px" }}
        >
          필요시간 ∨
        </button>
      </div>
    </div>
  );
}
