import { useCallback, useEffect, useState } from 'react';
import content from './publicContent';
import portrait from './assets/portrait.jpg';
import Visual from './Visual';
import HeroIntro from './HeroIntro';
import { shouldShowIntro, useHeroMotion } from './heroMotion';
import Experience from './Experience';
import Manu from './Manu';
import ContactSection from './Contact';
import Certifications from './Certifications';
import { usePageMotion } from './pageMotion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GithubActivity from './GithubActivity';

const Arrow=()=> <span aria-hidden="true">↗</span>;
function Header({onIntro}:{onIntro:()=>void}) {
  const [menu,setMenu]=useState(false);
  return <header className="site-header frame"><a className="wordmark" href="/" aria-label="Vishnu Sai Padyala home">VISHNU<span> SAI PADYALA</span><span className="wordmark-dot">.</span></a><button className="menu-toggle" aria-expanded={menu} aria-controls="main-nav" onClick={()=>setMenu(!menu)}>{menu?'Close −':'Menu +'}</button><nav id="main-nav" className={menu?'is-open':''} aria-label="Main navigation">{['Work','Experience','About'].map(x=><a key={x} href={`/#${x.toLowerCase()}`} onClick={()=>setMenu(false)}>{x}</a>)}<a href="/#contact" className="nav-contact" onClick={()=>setMenu(false)}>Let’s talk <Arrow/></a><button className="intro-link" onClick={()=>{setMenu(false);onIntro();}}>View intro</button></nav></header>;
}
function Hero(){return <section className="hero" aria-labelledby="hero-name"><div className="hero-blackhole" aria-hidden="true"><div/><i/></div><div className="portrait-stage frame"><span className="split-word left" aria-hidden="true">DEVE</span><div className="portrait-wrap"><img src={portrait} width="900" height="1600" alt="Vishnu Sai Padyala, wearing a black jacket" fetchPriority="high"/></div><span className="split-word right" aria-hidden="true">LOPER</span></div><div className="hero-identity"><h1 id="hero-name">Vishnu Sai Padyala<span className="accent-dot">.</span></h1><p>{content.profile.headline}</p></div><a href="#experience" className="hero-chevron" aria-label="Scroll to Experience"><svg width="30" height="18" viewBox="0 0 30 18" fill="none" aria-hidden="true"><path d="m3 4 12 11L27 4" stroke="currentColor" strokeWidth="1.5"/></svg></a></section>}
function Work(){const projects=content.projects.filter(project=>project.featured);return <section id="work" className="work-section frame section-space"><div className="section-heading"><span className="eyebrow">02 / SELECTED WORK</span><span className="section-aside">Ideas, made tangible.</span></div><h2>A few things<br/>worth a closer look<span className="accent-dot">.</span></h2><div className="work-grid" data-count={projects.length}>{projects.map((p,i)=><a href={`/work/${p.id}`} className={`work-item work-item-${i}`} key={p.id}><div className="work-art"><Visual kind={p.kind} compact/><span className="gallery-art-caption">Conceptual illustration</span><span className="work-open" aria-hidden="true">↗</span></div><span className="work-reveal-line" aria-hidden="true"/><div className="work-caption"><div><span className="eyebrow">{p.classification}</span><h3>{p.name}</h3></div><span className="work-number">0{i+1}</span></div><p>{p.heading}</p><span className="work-explore">Explore project ↗</span></a>)}</div></section>}
function About(){return <section id="about" className="about-section frame section-space"><span className="eyebrow">03 / THE PERSON BEHIND THE WORK</span><div className="about-grid"><h2>Curiosity,<br/>with intention<span className="accent-dot">.</span></h2><div className="about-body"><p className="about-lead">{content.profile.introduction}</p><p>{content.profile.bio}</p><a href="#contact" className="text-link">Start a conversation <Arrow/></a></div></div><div className="strengths" aria-label="Areas of focus">{content.profile.strengths.map(strength=><span key={strength}>{strength}</span>)}</div><div id="education" className="education-list"><h3>Education</h3>{content.profile.education.map(item=><div key={item.institution}><h4>{item.institution}</h4><p>{item.degree}</p><span>{item.dates}</span></div>)}</div><div id="skills" className="skills-list"><h3>Selected skills</h3><dl>{content.profile.skills.map(skill=><div key={skill.area}><dt>{skill.area}</dt><dd>{skill.items}</dd></div>)}</dl></div><div className="principles"><span>01 <strong>Look closer.</strong></span><span>02 <strong>Think clearly.</strong></span><span>03 <strong>Make it matter.</strong></span></div></section>}
function CaseStudy(){const id=location.pathname.split('/').filter(Boolean)[1]||'';const p=content.projects.find(project=>project.id===id);return <main id="main" tabIndex={-1} className="case-page frame"><a className="text-link" href={p&&!p.featured?"/#experience":"/#work"}>{p&&!p.featured?"← Experience":"← Selected work"}</a>{p?<><div className="case-header"><span className="eyebrow">{p.category} / {p.id==='plant-cropper'?'PROJECT OVERVIEW':'CASE STUDY'}</span><h1>{p.name}<span className="accent-dot">.</span></h1><p>{p.heading}</p><span className="case-classification">{p.classification}</span><p className="case-summary">{p.summary}</p></div><div className="case-cover"><Visual kind={p.kind}/></div><div className="case-content"><aside><span className="eyebrow">IN THIS STORY</span>{p.sections.map((section,i)=><a key={section.title} href={`#part-${i}`}>{String(i+1).padStart(2,'0')} / {section.title}</a>)}<a href="#case-links">{String(p.sections.length+1).padStart(2,'0')} / Explore further</a></aside><div>{p.sections.map((section,i)=><section id={`part-${i}`} key={section.title}><span className="eyebrow">{String(i+1).padStart(2,'0')}</span><h2>{section.title}</h2><p>{section.body}</p></section>)}<section id="case-links"><span className="eyebrow">{String(p.sections.length+1).padStart(2,'0')}</span><h2>Explore further</h2>{p.links.map(link=><a key={link.href} href={link.href} className="text-link">{link.label} <Arrow/></a>)}</section></div></div><a href="/#work" className="text-link">Explore more work <Arrow/></a></>:<div className="case-header"><span className="eyebrow">NOT FOUND</span><h1>A page<br/>still unwritten.</h1><p>This case study is not available.</p><a href="/">Return home ↗</a></div>}</main>}
export default function App() {
 const [intro,setIntro]=useState(shouldShowIntro);
 const [revealing,setRevealing]=useState(false);
 const { ref: heroRef, reduced, paused, toggle }=useHeroMotion();
 const pageRef=usePageMotion();
 const home=location.pathname==='/';
 const closeIntro=useCallback(()=>{setIntro(false);setRevealing(false);},[]);
 const revealHero=useCallback(()=>setRevealing(true),[]);
 useEffect(()=>{
  const project=content.projects.find(item=>location.pathname===`/work/${item.id}`);
  document.title=home?'Vishnu Sai Padyala — Engineering & Imagination':`${project?.name||'Page not found'} — Vishnu Sai Padyala`;
  // Resolve deep links after pin measurements, without a CSS smooth-scroll race.
  const frame=requestAnimationFrame(()=>{
   if(location.hash&&!(['#experience','#android-experience'].includes(location.hash)&&document.querySelector('.has-cinematic-stage'))){
    ScrollTrigger.refresh();
    document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});
    ScrollTrigger.update();
   }
  });
  return ()=>cancelAnimationFrame(frame);
 },[home]);
 return <><a className="skip-link" href="#main">Skip to content</a>
 <Header onIntro={()=>setIntro(true)}/>
 {home?<main ref={pageRef} id="main" tabIndex={-1}>
  <div className="story-sequence"><div className="story-stage"><div ref={heroRef} className={`hero-motion${revealing?' hero-revealing':''}`} data-motion="paused">
   <Hero/>
   <button className="motion-toggle" onClick={toggle} aria-pressed={paused} disabled={reduced}>
    {reduced?'Reduced motion':paused?'Resume motion':'Pause motion'}
   </button>
  </div><Experience/></div></div><Work/><GithubActivity/><About/><Certifications/><ContactSection/>
 </main>:<CaseStudy/>}
 <footer className="site-footer frame"><a href="/">VISHNU SAI PADYALA<span className="accent-dot">.</span></a><span>ENGINEERING × IMAGINATION</span><a href="#main">Back to top ↑</a></footer>
 <Manu/>{intro&&<HeroIntro onClose={closeIntro} onReveal={revealHero}/>}</>;
}





