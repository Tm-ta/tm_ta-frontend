// components/WarningPopUpModal.tsx
'use client';
import { useEffect } from 'react';
import styles from '@/styles/warning-modal.module.css';
import error from 'public/error.png';

type WarningType = 'big' | 'small';

export type WarningPopUpModalProps = {
  open: boolean;
  type: WarningType;
  message: string;
  onClose?: () => void;
  autoCloseMs?: number;
  iconAlt?: string;
};

export default function WarningPopUpModal({
  open, type, message, onClose, autoCloseMs, iconAlt = 'warning'
}: WarningPopUpModalProps){
  useEffect(()=>{
    if(!open || !autoCloseMs) return;
    const t = setTimeout(()=> onClose?.(), autoCloseMs);
    return ()=> clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  if(!open) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      {type === 'big' ? (
        <div role="dialog" aria-modal="true" className={styles.big}>
          <div className={styles.bigInner}>
            <img className={styles.bigIcon} src={'/icons/error.png'} alt={iconAlt} />
            <p className={styles.bigText}>
              {message.split('\n').map((line, i)=>(
                <span key={i}>
                  {line}{i < message.split('\n').length-1 ? <br/> : null}
                </span>
              ))}
            </p>
          </div>
        </div>
      ) : (
        <div role="status" className={styles.small}>
          <div className={styles.smallInner}>
            {/* <img className={styles.smallIcon} src={iconSrc} alt={iconAlt} /> */}
            
            <p className={styles.smallText}>{message}</p>
          </div>
        </div>
      )}
    </>
  );
}
