'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/nickname.module.css';
import { Button } from './ButtonComponent';
import InputComponent from './InputComponent';

type NameModalProps = {
  open: boolean;
  defaultName?: string;
  onSubmit: (name: string) => void;
  onClose?: () => void;
  maxLen?: number;      // 기본 8로 사용 (요구사항)
};

const DUMMY_DUP = '중복닉';

export default function NickNameModal({
  open,
  defaultName = '',
  onSubmit,
  onClose,
  maxLen = 8,
}: NameModalProps) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 상태 판정
  // 1) 빈값, 2) 정상(1..maxLen, 비중복), 3) 길이 초과, 4) 중복
  const status = useMemo<1|2|3|4>(() => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return 1;
    if (trimmed === DUMMY_DUP) return 4;
    if (trimmed.length > maxLen) return 3;
    return 2;
  }, [name, maxLen]);

  const errorMsg = useMemo(() => {
    switch (status) {
      case 1: return '닉네임을 입력해주세요';
      case 3: return `닉네임은 ${maxLen}글자 이하로만 가능해요`;
      case 4: return '다른 이용자가 사용하고 있는 닉네임이에요';
      default: return null;
    }
  }, [status, maxLen]);

  const valid = status === 2;

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    // 다음 프레임에 포커스(+전체선택)
    const t = setTimeout(() => {
      // ref는 InputComponent 내부 input을 직접 참조하지 않으니,
      // 모달 열릴 때 자동 포커스가 필요하면 autofocus를 InputComponent 쪽에
      // 추가 prop으로 확장하거나 여기서는 생략
    }, 0);
    return () => clearTimeout(t);
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.panel} onClick={(e)=>e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>내 이름은 이렇게 표시돼요</h2>
          <p className={styles.sub}>이름은 자유롭게 수정할 수 있어요!</p>
          {/* 수정 가능할 경우 활성화 */}
          {/* <button className={styles.close} onClick={onClose} aria-label="close">✕</button> */}
        </header>

        <div className={styles.body}>
          <div className={styles.inputWrap}>
            <InputComponent
              kind="input"
              maxLength={maxLen}          // 카운터/검증 기준(입력 초과 허용)
              value={name}
              onChange={setName}
              placeholder="닉네임을 입력해주세요"
              error={errorMsg}            // 상태에 따라 문구/디자인 제어
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            size='lg'
            shape='square'
            title='다음'
            accent='pink'
            disabled={!valid}
            onClick={() => valid && onSubmit(name.trim())}
          />
        </div>
      </div>
    </div>
  );
}
