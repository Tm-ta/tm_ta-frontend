'use client';

import { useMemo, useState } from 'react';
import styles from '@/styles/input.module.css';
import clsx from 'clsx';

type InputKind = 'input' | 'textarea';

export type InputComponentProps = {
  kind: InputKind;
  placeholder?: string;
  maxLength: number;            // 카운터·검증용 상한. input은 초과 입력 허용(표시/검증만)
  value: string;
  onChange: (next: string) => void;
  error?: string | null;        // 외부 제어 에러 메시지(옵션) — 우선 적용
};

export default function InputComponent({
  kind, placeholder, maxLength, value, onChange, error
}: InputComponentProps){
  const [focused, setFocused] = useState(false);

  // 내부 기본 검증(외부 error가 있으면 무시됨)
  const computedError = useMemo(()=>{
    // if (value.length === 0) return '의견을 입력해주세요!';
    if (value.length > maxLength) return `${maxLength}글자 이하의 의견만 보낼 수 있어요`;
    return null;
  }, [value, maxLength]);

  const effectiveError = error ?? computedError;
  const showError = !!effectiveError;
  const counter = `(${value.length}/${maxLength})`;

  if(kind === 'input'){
    return (
      <div className={styles.inputWrap}>
        <div
          className={clsx(
            styles.box,
            showError ? styles.error : styles.normal,
            focused && styles.focus
          )}
        >
          <input
            className={clsx(styles.input, showError && styles.inputErrorCaret)}
            placeholder={value.length === 0 ? '' : (placeholder ?? '닉네임을 입력해주세요')}
            value={value}
            // maxLength 제거: 초과 입력 허용
            onChange={(e)=> onChange(e.target.value)}
            onFocus={()=> setFocused(true)}
            onBlur={()=> setFocused(false)}
          />
          <div className={styles.counterInside}>{counter}</div>
        </div>
        {showError ? <div className={styles.errMsg}>{effectiveError}</div> : null}
      </div>
    );
  }

  // textarea: 텍스트 에어리어는 실제 입력 상한 유지(요구사항 대상 아님)
  return (
    <div className={styles.textareaWrap}>
      <div
        className={clsx(
          // styles.box,
          styles.textareaBox,
          showError ? styles.error : styles.normal,
          focused && styles.focus
        )}
      >
        <textarea
          className={clsx(styles.textarea, showError && styles.error)}
          placeholder={placeholder ?? '틈타에게 보낼 의견을 적어주세요!'}
          value={value}
          // maxLength={maxLength}
          onChange={(e)=> onChange(e.target.value)}
          onFocus={()=> setFocused(true)}
          onBlur={()=> setFocused(false)}
        />
      </div>

      {showError ? <div className={styles.errMsg}>{effectiveError}</div> : null}
      <div className={styles.counterOutside}>{counter}</div>
    </div>
  );
}
