'use client';
import styles from '@/styles/button.module.css';
import clsx from 'clsx';
import React from 'react';

type Size = 'sm' | 'md' | 'lg';
type type = 'orange' | 'white' | 'icons';
export type Shape = 'square' | 'rounded';

export function Button({
  size = 'md',
  shape = 'square',
  type = 'orange',
  title,
  onClick,
  disabled
}:{
  size?: Size; shape?: Shape; title: string; onClick?: () => void; disabled?: boolean; type?: 'orange'|'white'|'icons';
}){
  // 타이틀에 따른 아이콘 매핑
  const iconSrc =
    title === '공' ? '/icons/share.png'
    : title === '다' ? '/icons/download.png'
    : null;

  const ariaLabel =
    title === '공' ? '공유'
    : title === '다' ? '다운로드'
    : title;

  return (
    <button
      className={clsx(
        styles.btn,
        styles[size],
        styles[shape],
        styles[type],
        disabled && styles.disabled
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      { type === 'icons' ?
        (<img
          src='/icons/plus.png'
          alt={ariaLabel}
          className={styles.frontIcon}
          width={20}
          height={20}
          draggable={false}
        />) :
        ( <></>)

      }
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={ariaLabel}
          className={styles.icon}
          width={20}
          height={20}
          draggable={false}
        />
      ) : (
        title
      )}
      
    </button>
  );
}
