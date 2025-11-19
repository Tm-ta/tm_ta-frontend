'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/sendReview.module.css';
import InputComponent from '@/components/InputComponent';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (text: string) => void; // 필요 없으면 안 넘겨도 됨
  title?: string;                    // 기본값: '의견 보내기'
  maxLength?: number;                // 기본 300
  initialText?: string;              // 수정/재오픈 시 초기값 주고 싶으면 사용
};

export default function SendReviewModal({
  open,
  onClose,
  onSubmit,
  title = '의견 보내기',
  maxLength = 300,
  initialText = ''
}: Props) {
  const [text, setText] = useState<string>(initialText);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) setText(initialText || '');
  }, [open, initialText]);

  if (!open) return null;

  const hasError = text.length === 0 || text.length > maxLength;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={sheetRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button
            className={styles.closeX}
            aria-label="닫기"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <InputComponent
            kind="textarea"
            placeholder="틈타에게 보낼 의견을 적어주세요!"
            maxLength={maxLength}
            value={text}
            onChange={setText}
            // 에러 문구는 컴포넌트 내부 computedError가 처리
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.cancel} type="button" onClick={onClose}>
            취소
          </button>
          <button
            className={styles.submit}
            type="button"
            onClick={() => {
              if (!hasError && onSubmit) onSubmit(text.trim());
              if (!hasError) onClose();
            }}
            disabled={hasError}
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}
