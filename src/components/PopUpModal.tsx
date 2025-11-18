'use client';
import styles from './popup-modal.module.css';

type ModalType = 'oneBtn' | 'twoBtn';

export type PopUpModalProps = {
  open: boolean;
  type: ModalType;
  title: string;
  description?: string;
  confirmText?: string;      // oneBtn, twoBtn 공통: 기본 '확인'
  cancelText?: string;       // twoBtn 전용: 기본 '닫기'
  proceedText?: string;      // twoBtn 전용: 기본 '진행하기'
  onClose?: () => void;
  onConfirm?: () => void;    // oneBtn: 확인, twoBtn: 진행하기/확인 공통
};

export default function PopUpModal({
  open, type, title, description,
  confirmText = '확인',
  cancelText = '닫기',
  proceedText = '진행하기',
  onClose, onConfirm
}: PopUpModalProps){
  if(!open) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose}/>
      <div role="dialog" aria-modal="true" className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <h3 className={styles.title}>{title}</h3>
            {description ? (
              <p className={styles.desc}>{description}</p>
            ) : null}
          </div>

          {type === 'oneBtn' ? (
            <div className={styles.footerRight}>
              <button className={styles.btnGhost} onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          ) : (
            <div className={styles.footerRow}>
              <button className={styles.btnOutline} onClick={onClose}>
                {cancelText}
              </button>
              <button className={styles.btnPrimary} onClick={onConfirm}>
                {proceedText}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
