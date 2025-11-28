'use client';
import React from 'react';

export default function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign:'center', height:'100%', justifyContent:'center' }} className="center">
      { text == '아직 일정이 없어요' ?
        <div>
          <h3> 약속 생성 완료!</h3> 
          <div className="gray">가능한 시간을 먼저 등록하고<br/>{"친구들에게 공유해보세요!"}</div>
        </div>
        :

        <div className="gray">{text}</div>
      }
    </div>
  );
}
