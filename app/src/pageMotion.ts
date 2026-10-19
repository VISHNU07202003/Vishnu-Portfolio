import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Normal document flow: each composition follows the reader, without extra pins.
export function usePageMotion() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 900px)' }, ({ conditions }) => {
        if (!conditions?.motion) return;
        const desktop = conditions.desktop;
        const distance = desktop ? 72 : 24;
        root.querySelectorAll<HTMLElement>('.work-item').forEach((item, index) => {
          const art = item.querySelector<HTMLElement>('.work-art')!;
          const diagram = art.querySelector<HTMLElement>('.concept-art')!;
          gsap.fromTo(art, { y: distance, rotationX: desktop ? 7 : 0, rotationY: desktop ? (index % 2 ? -5 : 5) : 0, scale: .95 }, {
            y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: 'none',
            scrollTrigger: { id: `work-enter-${index}`, trigger: item, start: 'top bottom', end: 'top 32%', scrub: true, invalidateOnRefresh: true },
          });
          gsap.fromTo(diagram, { y: desktop ? 28 : 10, scale: 1.08, rotation: index % 2 ? -2 : 2 }, {
            y: desktop ? -28 : -10, scale: 1, rotation: 0, ease: 'none',
            scrollTrigger: { id: `work-depth-${index}`, trigger: art, start: 'top bottom', end: 'bottom top', scrub: true },
          });
          gsap.fromTo(item.querySelector('.work-reveal-line'), { scaleX: 0 }, {
            scaleX: 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 85%', end: 'top 25%', scrub: true },
          });
        });
        root.querySelectorAll<HTMLElement>('.credential-list article').forEach((row, index) => {
          const card = row.querySelector<HTMLElement>('.credential-card')!;
          const timeline = gsap.timeline({ scrollTrigger: { id: `credential-${index}`, trigger: row, start: 'top 95%', end: 'top 30%', scrub: true, invalidateOnRefresh: true } });
          timeline.fromTo(card, { x: desktop ? -65 : -12, y: distance, rotation: desktop ? -9 : -3, rotationY: desktop ? -18 : 0, scale: .9 }, { x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0);
          timeline.fromTo(card.querySelector('.credential-symbol'), { y: 18, rotation: -12, scale: .8 }, { y: 0, rotation: 0, scale: 1, duration: .8 }, .15);
          timeline.fromTo(row.querySelector('.credential-details'), { y: desktop ? 28 : 12 }, { y: 0, duration: .8, ease: 'none' }, .1);
          timeline.fromTo(card.querySelector('.credential-glint'), { xPercent: -160 }, { xPercent: 160, duration: 1, ease: 'none' }, 0);
        });
        root.querySelectorAll<HTMLElement>('.github-heading, .github-stats, .github-latest, .about-grid h2, .about-body, .education-list, .skills-list, .principles, .contact-section h2, .contact-actions').forEach((element, index) => {
          gsap.fromTo(element, { y: desktop ? (index % 2 ? 34 : 54) : 18 }, {
            y: 0, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'top 60%', scrub: true },
          });
        });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, []);
  return ref;
}
