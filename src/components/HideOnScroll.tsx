'use client';
import React from 'react';
import { useScrollIdle } from '@/lib/useScrollIdle';
import styles from '@/styles/hideOnScroll.module.css';

export default function HideOnScrollBar({
  children,
  position = 'bottom',     // 'top' | 'bottom'
  idleMs = 200,
}: {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  idleMs?: number;
}) {
  const { isScrolling } = useScrollIdle(idleMs);

  return (
    <div
      className={[
        styles.bar,
        position === 'top' ? styles.top : styles.bottom,
        isScrolling ? styles.hidden : styles.shown,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
