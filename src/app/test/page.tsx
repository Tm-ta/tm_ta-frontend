'use client';
import { useState } from 'react';
import { Button } from '@/components/ButtonComponent';
import HideOnScrollBar from '@/components/HideOnScroll';

export default function Page(){

  return (
    <div>
        <HideOnScrollBar position="bottom" idleMs={180}>
        <div className="inner">바닥 고정 바 • 스크롤 멈추면 나타남</div>
        </HideOnScrollBar>

    </div>
  );
}
