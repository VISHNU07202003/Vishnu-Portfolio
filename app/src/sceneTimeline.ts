import { gsap } from 'gsap';

export const EXPERIENCE_START = .28;
export const experienceProgress = (scene: number) => Math.max(0, Math.min(1, (scene - EXPERIENCE_START) / (1 - EXPERIENCE_START)));

export function chapterState(progress: number, count: number) {
  const position = Math.max(0, Math.min(1, progress)) * (count - 1);
  const segment = Math.min(count - 2, Math.floor(position));
  const local = position - segment;
  return { segment, local, active: segment + Number(local >= .5) };
}

export const chapterProgress = (index: number, count: number) => (index === count - 1 ? index - 1 + .94 : index + .08) / (count - 1);

// One scene, one pin: the handoff precedes the existing independent-layer timeline.
export function buildSceneTimeline(hero: HTMLElement, experience: HTMLElement, layers: gsap.core.Timeline) {
  const timeline = gsap.timeline({ paused: true });
  timeline.to({}, { duration: 1 }, 0);
  timeline.fromTo(hero.querySelector('.hero-chevron'), { opacity: 1 }, { opacity: 0, duration: .06, ease: 'none' }, .01);
  timeline.fromTo(hero.querySelector('.portrait-wrap'), { x: 0, y: 0, yPercent: 0, scale: 1, opacity: 1 }, { y: -65, scale: .96, opacity: 0, duration: .17, ease: 'power2.inOut' }, .035);
  timeline.fromTo(hero.querySelector('.split-word.left'), { x: 0, y: 0, opacity: 1 }, { x: -75, y: -25, opacity: 0, duration: .16, ease: 'power2.inOut' }, .035);
  timeline.fromTo(hero.querySelector('.split-word.right'), { x: 0, y: 0, opacity: 1 }, { x: 75, y: -25, opacity: 0, duration: .16, ease: 'power2.inOut' }, .035);
  timeline.fromTo(hero.querySelector('.hero-identity'), { y: 0, opacity: 1 }, { y: -24, opacity: 0, duration: .13, ease: 'power2.inOut' }, .06);
  timeline.fromTo(hero.querySelector('.hero-blackhole'), { scale: 1, rotation: -24, opacity: .45 }, { scale: 1.08, rotation: -18, opacity: .12, duration: .23, ease: 'none' }, 0);
  timeline.fromTo(hero, { opacity: 1 }, { opacity: 0, duration: .10, ease: 'none' }, .15);
  timeline.fromTo(experience.querySelector('.section-heading'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .12 }, .12);
  timeline.fromTo(experience.querySelector('.experience-copy-stack'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .13 }, .13);
  timeline.fromTo(experience.querySelector('.experience-scene-stack'), { y: 55, scale: .97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .15, ease: 'power2.out' }, .10);
  timeline.fromTo(experience.querySelector('.experience-stage-footer'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .08 }, .19);
  timeline.fromTo(experience.querySelector('.experience-progress'), { opacity: 0 }, { opacity: 1, duration: .06 }, .21);
  timeline.add(layers.duration(1 - EXPERIENCE_START).play(), EXPERIENCE_START);
  return timeline;
}
