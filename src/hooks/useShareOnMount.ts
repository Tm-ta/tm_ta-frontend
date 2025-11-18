import { useEffect } from 'react';
import { shareUrl } from '@/lib/share';

export function useShareOnMount(title = '모임 현황', text = '현재 URL을 공유하세요') {
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== 'undefined') shareUrl(title, text, window.location.href);
    }, 1200);
    return () => clearTimeout(t);
  }, [title, text]);
}
