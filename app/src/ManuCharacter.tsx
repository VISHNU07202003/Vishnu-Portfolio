import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './heroMotion';
import type { ApprovedManuAsset } from './manuAsset';
export default function ManuCharacter({ asset, paused = false, placement = 'launcher' }: { asset: ApprovedManuAsset | null; paused?: boolean; placement?: 'launcher' | 'dialog' }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !asset || !loaded || failed) return;
    let visible = false;
    let frame = 0;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reset = () => el.style.setProperty('--manu-lean', '0deg');
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      // Keep decorative artwork out of the way of nearby links and controls.
      const blocked = placement === 'launcher' && Array.from(document.querySelectorAll('main a, main button, footer a')).some(node => {
        const r = node.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top;
      });
      el.dataset.obstructed = String(blocked);
      const running = visible && !blocked && !document.hidden && !reduced && !paused;
      el.dataset.motion = running ? 'running' : 'paused';
      if (!running) reset();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const pointer = (e: PointerEvent) => {
      if (!fine.matches || el.dataset.motion !== 'running') return;
      // Flat image: rotate only in its plane, never simulate a face turn.
      el.style.setProperty('--manu-lean', `${Math.max(-1, Math.min(1, e.clientX / innerWidth * 2 - 1)) * 2}deg`);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(el);
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('pointerleave', reset);
    update();
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', schedule);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', pointer); document.removeEventListener('pointerleave', reset);
    };
  }, [asset, loaded, failed, reduced, paused, placement]);
  if (!asset || failed) return null;
  return <span ref={ref} className="manu-character" data-motion="paused" data-loaded={loaded} aria-hidden="true"><span className="manu-orientation"><img src={asset.src} width={asset.width} height={asset.height} alt="" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/></span></span>;
}

