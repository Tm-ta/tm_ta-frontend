'use client';
import React from 'react';

export default function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign:'center' }} className="center">
      { text == '아직 일정이 없어요' ?
        <div>
          <h3> 약속 생성 완료!</h3> 
          <div className="gray">{text}<br/>{"가능한 시간을 먼저 등록해주세요!"}</div>
        </div>
        :

        <div className="gray">{text}</div>
      }
    </div>
  );
}
