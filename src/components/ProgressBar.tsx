'use client';
import styles from '@/styles/progressbar.module.css';

export default function ProgressBar({ totalSteps, current }:{ totalSteps:number; current:number }){
  const pct = Math.min(100, Math.max(0, (current/totalSteps)*100));
  return (
    <div className={styles.wrap} aria-label={`progress ${current}/${totalSteps}`}>
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${pct}%` }}/>
      </div>
      {/* <div className={styles.meta}><span>{current}</span>/<span>{totalSteps}</span></div> */}
    </div>
  );
}
