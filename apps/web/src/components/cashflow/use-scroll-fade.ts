import { useRef, useState } from 'react';

export function useScrollFade() {
  const listRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const next = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setAtBottom((prev) => (next === prev ? prev : next));
  }

  return { listRef, atBottom, handleScroll };
}
