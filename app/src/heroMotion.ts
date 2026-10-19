import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const reducedQuery = '(prefers-reduced-motion: reduce)';
export function useReducedMotion() {
  return useSyncExternalStore(callback => {
    const media = matchMedia(reducedQuery);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  }, () => matchMedia(reducedQuery).matches, () => true);
}
export function shouldShowIntro() {
  if (matchMedia(reducedQuery).matches) return false;
  if (new URLSearchParams(location.search).has('intro')) return true;
  if (location.pathname !== '/' || location.hash) return false;
  try { return sessionStorage.getItem('portfolio:intro-seen') !== '1'; }
  catch { return false; } // Storage unavailable: fail open to the portfolio.
}
export function useHeroMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let visible = false;
    let pointerX = 0, pointerY = 0;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reset = () => {
      el.style.setProperty('--depth-x', '0px');
      el.style.setProperty('--depth-y', '0px');
      el.style.setProperty('--type-y', '0px');
    };
    const render = () => {
      frame = 0;
      const running = visible && !document.hidden && !reduced && !paused;
      el.dataset.motion = running ? 'running' : 'paused';
      if (!running) { reset(); return; }
      const travel = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / el.offsetHeight));
      const mobile = innerWidth <= 700;
      el.style.setProperty('--depth-x', `${pointerX * 5}px`);
      el.style.setProperty('--depth-y', `${pointerY * 4 + travel * (mobile ? 4 : 10)}px`);
      el.style.setProperty('--type-y', `${-pointerY * 2 - travel * (mobile ? 2 : 5)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === 'touch' || reduced || paused) return;
      const box = el.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
      schedule();
    };
    const leave = () => { pointerX = 0; pointerY = 0; schedule(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(el);
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    schedule();
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame); reset();
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [paused, reduced]);
  return { ref, reduced, paused, toggle: () => setPaused(value => !value) };
}
