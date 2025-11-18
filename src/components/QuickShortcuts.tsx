/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import styles from '@/styles/shortcuts.module.css';
import clsx from 'clsx';
import { computeDatePreset } from '@/lib/date';

export type Shortcut = { key:string; title:string; type:'date'|'time'; start?:string; end?:string };

export default function QuickShortcuts({
  type,
  value,
  onApply
}:{
  type:'date'|'time';
  value: string | null;
  onApply: (payload: any)=>void;
}){
  const presets: Shortcut[] = type==='date' ? [
    { key:'d+7', title:'내일부터 7일', type:'date' },
    { key:'d+14', title:'내일부터 14일', type:'date' },
    { key:'nextSun', title:'다음주 일요일까지', type:'date' },
    { key:'wkndThisMonth', title:'이번 달 주말', type:'date' }
  ] : [
    { key:'all', title:'하루종일', type:'time', start:'00:00', end:'24:00' },
    { key:'9to18', title:'9~18시', type:'time', start:'09:00', end:'18:00' },
    { key:'after12', title:'12~24시', type:'time', start:'12:00', end:'24:00' },
    { key:'after18', title:'18~24시', type:'time', start:'18:00', end:'24:00' },
  ];

  return (
    <div className={styles.wrap}>
      {presets.map(p => {
        const active = value === p.key;
        return (
          <button key={p.key}
            className={clsx(styles.item, active && styles.active)}
            onClick={() => {
              if(type==='date') onApply({ key:p.key, range: computeDatePreset(p.key) });
              else onApply({ key:p.key, start:p.start, end:p.end });
            }}
          >{p.title}</button>
        );
      })}
    </div>
  );
}
