import { useEffect, useRef } from 'react';
import { useReducedMotion } from './heroMotion';
import { approvedManuAsset } from './manuAsset';

type Props = { onClose: () => void; onReveal: () => void };
export default function HeroIntro({ onClose, onReveal }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const update = () => { if(ref.current)ref.current.dataset.documentHidden=String(document.hidden); };
    document.addEventListener('visibilitychange',update); update();
    return()=>document.removeEventListener('visibilitychange',update);
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (reduced) { onClose(); return; }
    try { sessionStorage.setItem('portfolio:intro-seen', '1'); } catch { /* Portfolio stays usable. */ }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    const reveal = window.setTimeout(onReveal, 4200);
    const finish = window.setTimeout(onClose, 5000);
    return () => {
      clearTimeout(reveal); clearTimeout(finish);
      dialog.close(); document.body.style.overflow = overflow;
      // Restore a replay trigger; first arrival goes to the semantic main content.
      if (previous && previous !== document.body && previous.isConnected && previous.getClientRects().length) previous.focus({ preventScroll: true });
      else document.getElementById('main')?.focus({ preventScroll: true });
    };
  }, [onClose, onReveal, reduced]);
  return <dialog ref={ref} aria-label="Portfolio introduction" className="intro-dialog cinematic-intro"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
    <button className="intro-skip" onClick={onClose}>Skip intro ↗</button>
    <div className="intro-manu-flight" aria-hidden="true"><span/><img src={approvedManuAsset.src} width={approvedManuAsset.width} height={approvedManuAsset.height} alt="" decoding="async" onError={event=>{event.currentTarget.style.visibility='hidden';}}/></div>
    <div className="intro-inner"><span className="eyebrow">A MOMENT BEFORE WE BEGIN</span>
      <h2>Hi, I’m Vishnu<span className="accent-dot">.</span></h2>
      <p>Software Engineer in<br/>AI &amp; Product Development</p>
      <button className="text-link" onClick={onClose}>Enter the portfolio <span>→</span></button>
    </div>
    <span className="intro-footer">ENGINEERING × IMAGINATION</span>
    <span className="intro-progress" aria-hidden="true"/>
  </dialog>;
}

