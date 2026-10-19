import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import content from './publicContent';
import Visual from './Visual';
import type { Story } from './types';
import { buildExperienceSequence } from './experienceTimeline';
import { buildSceneTimeline, chapterProgress, chapterState, experienceProgress, EXPERIENCE_START } from './sceneTimeline';

gsap.registerPlugin(ScrollTrigger);

function StoryCopy({ story, index }: { story: Story; index: number }) {
  return <div className="experience-copy">
    <div className="chapter-meta"><span>0{index + 1} / {story.organization}</span><span>{story.title}</span>{story.dates&&<span className="experience-dates">{story.dates}</span>}{story.classification&&<span>{story.classification}</span>}</div>
    <h3>{story.heading.split('\n').map(line => <span key={line}>{line}<br/></span>)}</h3>
    <p>{story.summary}</p>{story.tags.length>0&&<div className="tags flex flex-wrap gap-2">{story.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
    {story.caseStudy&&<a className="text-link" href={`/work/${story.caseStudy}`}>Explore the case study <span aria-hidden="true">↗</span></a>}
  </div>;
}
export default function Experience() {
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [reading, setReading] = useState(false);
  const stories = content.experiences;
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || stories.length < 2 || reading) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(min-width: 900px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
        const sequence = root.closest<HTMLElement>('.story-sequence')!;
        const stage = sequence.querySelector<HTMLElement>('.story-stage')!;
        const hero = sequence.querySelector<HTMLElement>('.hero-motion')!;
        const pin = root.querySelector<HTMLElement>('.experience-pin')!;
        const square = root.querySelector<HTMLElement>('.experience-scene-stack')!;
        const scenes = Array.from(square.querySelectorAll<HTMLElement>('.experience-scene'));
        const layers = scenes.map(scene => Array.from(scene.querySelectorAll<HTMLElement>('[data-layer]')));
        const copies = Array.from(root.querySelectorAll<HTMLElement>('.experience-animated-copy'));
        const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.experience-chapter-button'));
        root.classList.add('is-enhanced');
        sequence.classList.add('has-cinematic-stage');
        const rotations = layers.map(group => group.map(layer => Number(gsap.getProperty(layer, 'rotation'))));
        gsap.set(layers.flat(), { transformPerspective: 900, transformOrigin: '50% 50%' });
        const layerTimeline = buildExperienceSequence(layers, () => square.clientWidth, rotations);
        const timeline = buildSceneTimeline(hero, pin, layerTimeline);
        let currentProgress = 0;
        let stableProgress = 0;
        let measuredWidth = innerWidth;
        let measuredHeight = innerHeight;
        const syncText = () => {
          const p = experienceProgress(currentProgress);
          const inHero = currentProgress < .20;
          pin.inert = inHero;
          pin.setAttribute('aria-hidden', String(inHero));
          hero.inert = !inHero;
          hero.setAttribute('aria-hidden', String(!inHero));
          sequence.dataset.sceneProgress = currentProgress.toFixed(4);
          const focused = copies.findIndex(copy => copy.contains(document.activeElement));
          const { segment, local, active: chapter } = chapterState(p, stories.length);
          const active = focused >= 0 ? focused : chapter;
          const outgoingOpacity = Math.max(0, Math.min(1, (.48 - local) / .10));
          const incomingOpacity = Math.max(0, Math.min(1, (local - .50) / .10));
          copies.forEach((copy, index) => {
            copy.inert = index !== active;
            copy.setAttribute('aria-hidden', String(index !== active));
            // A focused outgoing link keeps its original label and destination visible until blur.
            copy.style.opacity = String(focused >= 0 ? Number(index === focused) : index === segment ? outgoingOpacity : index === segment + 1 ? incomingOpacity : 0);
            copy.style.translate = `0 ${focused >= 0 ? 0 : index === segment ? -12 * (1 - outgoingOpacity) : 12 * (1 - incomingOpacity)}px`;
          });
          buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)));
          root.dataset.chapter = String(active);
          root.dataset.progress = p.toFixed(4);
          root.dataset.segment = String(segment);
          root.dataset.phase = local < .16 ? 'composed' : local < .40 ? 'scatter' : local < .60 ? 'overlap' : local < .86 ? 'assembly' : 'settled';
          pin.style.setProperty('--experience-progress', String(p));
        };
        let resizeProgress: number | null = null;
        let refreshing = false;
        const trigger = ScrollTrigger.create({
          id: 'experience-transform', trigger: sequence, pin: stage, animation: timeline,
          start: 'top top', end: () => `+=${Math.max(2000, innerHeight * (3.1 + (stories.length - 2) * 1.9))}`,
          scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            currentProgress = self.progress; syncText();
            if (!refreshing && measuredWidth === innerWidth && measuredHeight === innerHeight) stableProgress = currentProgress;
          },
          onRefreshInit: self => {
            // Only a viewport resize should restore the previous scroll position.
            // An automatic refresh during route entry must not undo a deep link.
            resizeProgress = self.isActive && (measuredWidth !== innerWidth || measuredHeight !== innerHeight) ? stableProgress : null;
            refreshing = true;
          },
          onRefresh: self => {
            measuredWidth = innerWidth; measuredHeight = innerHeight;
            root.dataset.scrollStart = String(self.start); root.dataset.scrollEnd = String(self.end);
            if (resizeProgress !== null) {
              self.scroll(self.start + resizeProgress * (self.end - self.start));
              timeline.progress(resizeProgress); resizeProgress = null;
              ScrollTrigger.update();
            }
            // Refresh can render the animation with callbacks suppressed.
            currentProgress = self.progress; syncText();
            stableProgress = currentProgress;
            refreshing = false;
          },
        });
        triggerRef.current = trigger;
        const navigateExperience = (event: MouseEvent) => {
          const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
          if (!target || target.origin !== location.origin || target.pathname !== '/' || !['#experience', '#android-experience'].includes(target.hash) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          history.pushState(null, '', target.hash);
          const progress = target.hash === '#android-experience' ? EXPERIENCE_START + (1 - EXPERIENCE_START) * chapterProgress(2, stories.length) : EXPERIENCE_START;
          window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * progress, behavior: 'smooth' });
        };
        document.addEventListener('click', navigateExperience);
        const initialAnchor = ['#experience', '#android-experience'].includes(location.hash) ? requestAnimationFrame(() => {
          window.scrollTo({top:trigger.start + (trigger.end - trigger.start) * (location.hash === '#android-experience' ? EXPERIENCE_START + (1 - EXPERIENCE_START) * chapterProgress(2, stories.length) : EXPERIENCE_START),behavior:'instant'});
          ScrollTrigger.update();
        }) : null;
        syncText();
        root.addEventListener('focusin', syncText);
        const onFocusOut = () => queueMicrotask(syncText);
        root.addEventListener('focusout', onFocusOut);
        return () => {
          if (initialAnchor !== null) cancelAnimationFrame(initialAnchor);
          const wasInStage = stableProgress > 0 && stableProgress < 1;
          root.removeEventListener('focusin', syncText); root.removeEventListener('focusout', onFocusOut);
          root.classList.remove('is-enhanced');
          sequence.classList.remove('has-cinematic-stage');
          delete sequence.dataset.sceneProgress;
          document.removeEventListener('click', navigateExperience);
          hero.inert = false; hero.removeAttribute('aria-hidden');
          pin.inert = false; pin.removeAttribute('aria-hidden');
          triggerRef.current = null;
          copies.forEach(copy => { copy.inert = false; copy.removeAttribute('aria-hidden'); copy.style.removeProperty('opacity'); copy.style.removeProperty('translate'); });
          delete root.dataset.progress; delete root.dataset.phase;
          if (wasInStage) requestAnimationFrame(() => {
            if (root.isConnected && !root.classList.contains('is-enhanced')) root.scrollIntoView({ block: 'start', behavior: 'instant' });
          });
          // matchMedia/context reverts the pin spacer, inline transforms and timeline together.
        };
      });
      media.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
        const hero = root.closest('.story-sequence')?.querySelector('.hero-motion');
        if (!hero) return;
        gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 25%', scrub: true } })
          .to(hero.querySelector('.portrait-stage'), { y: -28, opacity: .35, ease: 'none' }, 0)
          .fromTo(root.querySelector('.experience-stage'), { y: 32, opacity: .35 }, { y: 0, opacity: 1, ease: 'none' }, 0);
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, [reading, stories]);

  function chooseChapter(index: number) {
    const trigger = triggerRef.current;
    if (trigger) {
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * (EXPERIENCE_START + (1 - EXPERIENCE_START) * chapterProgress(index, stories.length)), behavior: 'instant' });
      ScrollTrigger.update();
    }
  }
  function toggleReading() {
    setReading(value => !value);
    requestAnimationFrame(() => {
      const root = rootRef.current;
      root?.scrollIntoView({ block: 'start', behavior: 'instant' });
      root?.querySelector<HTMLButtonElement>(reading ? '.experience-reading-button' : '.experience-reading-control button')?.focus({ preventScroll: true });
    });
  }
  return <section ref={rootRef} id="experience" className="experience-section experience-transform" data-reading={reading}>
    <h2 className="sr-only">Experience</h2>
    {stories.length >= 2 ? <>
      <div className="experience-pin frame">
        <div className="section-heading"><span className="eyebrow">Experience</span></div>
        <div className="experience-fixed-grid">
          <div className="experience-copy-stack">{stories.map((story, index) => <div className="experience-animated-copy" key={story.id}><StoryCopy story={story} index={index}/></div>)}</div>
          <div className="experience-scene-stack" aria-hidden="true">{stories.map(story => <div className="experience-scene" key={story.id}><Visual kind={story.kind}/></div>)}<span className="stage-art-caption">Conceptual interface · not a product screenshot</span></div>
        </div>
        <div className="experience-stage-footer">
          <div className="experience-stage-controls" role="group" aria-label="Experience chapters">{stories.map((story, index) => <button className="experience-chapter-button" key={story.id} aria-pressed={index === 0} onClick={() => chooseChapter(index)}>{index === 0 ? 'UF IFAS' : index === 1 ? 'VIT-AP' : 'SmartInternz'}</button>)}</div>
          <button className="experience-reading-button" onClick={toggleReading}>Read without motion</button><a className="experience-skip" href="#work">Continue to Work ↓</a>
        </div>
        <div className="experience-progress" aria-hidden="true"><span/></div>
      </div>
      <div className="experience-reading frame">
        <div className="section-heading"><span className="eyebrow">01 / EXPERIENCE</span><span className="section-aside">Different contexts. The same curiosity.</span></div>
        {stories.map((story,index) => <article className="experience-stage" id={story.id === 'android-experience' ? story.id : undefined} key={story.id}><StoryCopy story={story} index={index}/><Visual kind={story.kind}/></article>)}
        <p className="review-caption">Independent perspectives. A continuing practice.</p>
      </div>
      <div className="experience-reading-control frame"><button onClick={toggleReading} aria-pressed={reading}>{reading?'Enable scroll presentation':'Read without motion'}</button></div>
    </> : <div className="frame section-space"><span className="eyebrow">01 / EXPERIENCE</span><p className="empty-note">The experience collection is being prepared.</p></div>}
  </section>;
}

