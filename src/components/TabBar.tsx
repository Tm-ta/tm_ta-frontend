'use client';
import styles from '@/styles/tabbar.module.css';
import clsx from 'clsx';

export type Tab = { key:string; label:string };
export default function TabBar({ type, tabs, active, onChange }:{ type:string; tabs:Tab[]; active:string; onChange:(key:string)=>void }){
  return (
    <div className={type==='page' ? styles.wrap : styles.wrapModal} role="tablist">
      {tabs.map(t => (
        <button key={t.key} role="tab"
          className={type==='page' ? clsx(styles.tab, active===t.key && styles.active) : clsx(styles.tabModal, active===t.key && styles.active)}
          onClick={()=>onChange(t.key)}
        >{t.label}</button>
      ))}
    </div>
  );
}
