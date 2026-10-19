import { useId } from 'react';
import type { VisualKind } from './types';

function Cells() {
  const gradientId=useId();
  return <svg viewBox="0 0 300 230" role="img" aria-label="Abstract microscopy composition, not research data"><defs><radialGradient id={gradientId}><stop stopColor="#a7cfd0" stopOpacity=".48"/><stop offset="1" stopColor="#668f9a" stopOpacity=".04"/></radialGradient></defs>{[[48,61,23],[123,58,32],[216,67,25],[78,148,33],[173,151,28],[256,164,19],[145,211,16]].map(([x,y,r],i)=><g key={i}><circle cx={x} cy={y} r={r} fill={`url(#${gradientId})`} stroke="#a7ced0" strokeOpacity=".45"/><circle cx={x+3} cy={y-2} r={r*.35} fill="#b2dbd9" opacity=".32"/><path d={`M ${x-r-7} ${y-r/2} v -10 h 10 M ${x+r+7} ${y+r/2} v 10 h -10`} fill="none" stroke="#a7ced0" strokeOpacity=".35"/></g>)}</svg>;
}
export default function Visual({kind, compact=false}:{kind:VisualKind;compact?:boolean}) {
  const lab=kind==='lab', event=kind==='events';
  if (kind === 'android') return <div className={`layered-visual android-visual ${compact?'compact':''}`} role="img" aria-label="Five-layer conceptual Snack Squad Android interface, not a product screenshot">
    <div className="visual-orbit"/>
    <div className="visual-layer android-phone" data-layer="shell"><div className="android-speaker"/><span className="android-brand">SNACK / SQUAD</span><span className="android-phone-line">Browse. Choose.<br/>Make it yours.</span><div className="android-nav" aria-hidden="true"><i/><i/><i/></div></div>
    <div className="visual-layer android-catalog" data-layer="primary"><span className="mini-label">CATALOG</span><div className="android-dish" aria-hidden="true"><span/></div><strong>Something good.</strong><span className="android-ui-caption">Browse the menu ↗</span></div>
    <div className="visual-layer android-cart" data-layer="inspector"><span className="mini-label">YOUR CART</span><div className="android-order-line"/><div className="android-order-line short"/><span className="android-ui-caption">Review your order →</span></div>
    <div className="visual-layer android-order" data-layer="results"><span className="mini-label">ORDER FLOW</span><span>Choose → Cart → Place</span></div>
    <div className="visual-layer android-account" data-layer="context"><span className="android-user-icon" aria-hidden="true">◎</span><span className="mini-label">SIGN IN</span></div>
    <span className="visual-note">CONCEPTUAL INTERFACE</span>
  </div>;
  if(kind==='plant')return <div className="concept-art plant" aria-label="Explanatory diagram: isolate plant content, then inspect berry regions; not laboratory data"><div className="diagram-label">ISOLATE / INSPECT</div><svg viewBox="0 0 600 400" fill="none" aria-hidden="true"><rect x="80" y="70" width="210" height="260" rx="8" stroke="#7f9d8c" strokeOpacity=".5"/><path d="M114 292V244c0-88 37-130 114-139-2 85-44 133-114 139m0 0 93-103" stroke="#bdd0ba" strokeWidth="2"/><path d="M70 100V60h40m150 0h40v40M70 300v40h40m150 0h40v-40" stroke="#bfd1c3"/><path d="M325 200h65m-14-10 14 10-14 10" stroke="#bdd0ba"/><circle cx="458" cy="178" r="35" fill="#7895b51a" stroke="#b0c3d5"/><circle cx="493" cy="229" r="28" fill="#7895b51a" stroke="#b0c3d5"/><circle cx="432" cy="244" r="22" stroke="#7b9a8a"/><path d="M408 116v-18h18m83 0h18v18m0 156v18h-18m-83 0h-18v-18" stroke="#7f9d8c"/></svg><span className="diagram-caption">Explanatory diagram</span></div>;
  if (!lab&&!event) return <div className={`concept-art ${kind}`} aria-label="Original conceptual diagram">
    <div className="diagram-label">{kind==='map'?'SPATIAL CONNECTIONS':'A CONNECTED SYSTEM'}</div>
    <svg viewBox="0 0 600 400" aria-hidden="true">
      {kind==='map'?<><g fill="none" stroke="#738b89" strokeWidth="1" opacity=".35">{Array.from({length:10},(_,i)=><path key={i} d={`M ${-70+i*80} 0 L ${30+i*70} 180 L ${-50+i*90} 400 M 0 ${i*55} Q 280 ${i*40-90} 600 ${i*49+40}`}/>)}</g><path d="M90 280 L190 215 L285 235 L360 132 L490 110" fill="none" stroke="#c6d6c8" strokeWidth="2"/>{[[90,280],[190,215],[285,235],[360,132],[490,110]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="17" fill="#bfd9cb" opacity=".08"/><circle cx={x} cy={y} r="4" fill="#c6d6c8"/></g>)}</>:<><g stroke="#8f9caf" strokeOpacity=".4">{[[110,95],[480,85],[105,310],[490,310],[300,355]].map(([x,y],i)=><path key={i} d={`M300 190 L${x} ${y}`}/>)}</g><circle cx="300" cy="190" r="60" fill="#161c29" stroke="#a5b6d4"/><circle cx="300" cy="190" r="42" fill="none" stroke="#7087a7" strokeDasharray="2 5"/>{[[110,95],[480,85],[105,310],[490,310],[300,355]].map(([x,y],i)=><g key={i}><rect x={x-32} y={y-24} width="64" height="48" rx="7" fill="#151b28" stroke="#677992"/><path d={`M${x-14} ${y}h28 M${x-14} ${y+7}h17`} stroke="#97a6bc"/></g>)}<path d="M280 190h40 M300 170v40" stroke="#cad9ee" strokeWidth="2"/></>}
    </svg><span className="diagram-caption">Conceptual diagram</span>
  </div>;
  return <div className={`layered-visual ${event?'event-visual':'lab-visual'} ${compact?'compact':''}`} role="img" aria-label={lab?'Five-layer conceptual microscopy interface, not a product screenshot':'Five-layer conceptual campus event interface, not a product screenshot'}>
    <div className="visual-orbit"/>
    <div className="visual-layer layer-shell" data-layer="shell"><div className="window-bar"><span>•••</span><span>{lab?'CELL / VIEW':'CAMPUS / SPACE'}</span><span>↗</span></div><div className="shell-sidebar"><i/><i/><i/><i/></div></div>
    <div className="visual-layer layer-primary" data-layer="primary">{lab?<Cells/>:<><div className="event-poster"><span>TOGETHER,<br/>SOMETHING<br/><em>MORE.</em></span><div className="poster-orbit"/></div><div className="event-caption">A space for campus life <span>↗</span></div></>}</div>
    <div className="visual-layer layer-inspector" data-layer="inspector"><span className="mini-label">{lab?'REVIEW':'EVENT REQUEST'}</span><div className="tool-symbol">{lab?'⌖':'↗'}</div><div className="ui-rule"/><div className="ui-rule short"/><span className="mini-foot">{lab?'A human perspective':'A shared experience'}</span></div>
    <div className="visual-layer layer-results" data-layer="results"><span className="mini-label">{lab?'OBSERVE. REFINE.':'EVENT LIST'}</span>{event&&<span className="event-list-lines" aria-hidden="true"><i/><i/><i/></span>}<span>→</span></div>
    <div className="visual-layer layer-context" data-layer="context">{lab?<><span className="context-symbol">◎</span><span>IN FOCUS</span></>:<div className="event-calendar"><span>CALENDAR</span><div className="calendar-grid" aria-hidden="true">{Array.from({length:15},(_,i)=><i key={i}/>)}</div></div>}</div>
    <span className="visual-note">CONCEPTUAL INTERFACE</span>
  </div>;
}
