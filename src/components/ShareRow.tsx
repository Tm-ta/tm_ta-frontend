/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Button } from '@/components/ButtonComponent';
import { captureElementToBlob } from '@/lib/capture';
import { shareUrl } from '@/lib/share';
import { useRouter } from 'next/navigation';

type Props = { groupId: string };

export default function ShareRow({ groupId }: Props) {
  const router = useRouter();
  return (
    <div className="bottomRow">
      <Button
        size="sm"
        shape="square"
        title="공"
        onClick={() => {
          if (typeof window !== 'undefined')
            shareUrl('모임 현황', '현재 URL을 공유하세요', window.location.href);
        }}
      />
      <Button
        size="sm"
        shape="square"
        title="다"
        onClick={async () => {
          const blob = await captureElementToBlob('#capture-area');
          if (!blob) {
            alert('캡처 실패');
            return;
          }
          const file = new File([blob], 'capture.png', { type: 'image/png' });
          if ((navigator as any).share) {
            try {
              await (navigator as any).share({ files: [file], title: '현황 캡처' });
            } catch {}
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'capture.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
      />
      <div style={{ width: '232px' }}>
        <Button
          size="md"
          shape="square"
          title="+ 내 일정 추가하기"
          accent="pink"
          onClick={() => router.push(`/${groupId}/add`)}
        />
      </div>
    </div>
  );
}
