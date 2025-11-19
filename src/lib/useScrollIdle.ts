import { useEffect, useRef, useState } from 'react';

export function useScrollIdle(idleMs = 200) {
  const [isScrolling, setIsScrolling] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!isScrolling) setIsScrolling(true);
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => setIsScrolling(false), idleMs);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isScrolling, idleMs]);

  return { isScrolling };
}
