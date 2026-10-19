import content from './publicContent';

export default function Certifications() {
  if(!content.certifications.length)return null;
  return <section id="certifications" className="certifications frame section-space"><span className="eyebrow">Continued learning</span><h2>Certifications<span className="accent-dot">.</span></h2><div className="credential-list">{content.certifications.map((item,index)=><article key={item.name}>
    <div className={`credential-card credential-card-${index}`} aria-hidden="true">
      <div className="credential-glint"/>
      <div className="credential-card-top"><span>{index===0?'AWS':index===1?'Google':'Microsoft'}</span><span>0{index+1} / LEARNING</span></div>
      <svg className="credential-symbol" viewBox="0 0 120 100" fill="none">
        {index===0?<><path d="m60 8 38 22v43L60 95 22 73V30L60 8Z M22 30l38 22 38-22M60 52v43"/><path d="m60 27 21 12v24L60 75 39 63V39l21-12Z" opacity=".4"/></>:index===1?<><circle cx="60" cy="50" r="36"/><circle cx="60" cy="50" r="23" opacity=".45"/><path d="M8 50h104M60 0v100" opacity=".25"/><circle cx="60" cy="14" r="5" fill="currentColor"/><circle cx="96" cy="50" r="5" fill="currentColor"/><circle cx="60" cy="86" r="5" fill="currentColor"/><circle cx="24" cy="50" r="5" fill="currentColor"/></>:<><path d="M22 14h32v32H22zM66 14h32v32H66zM22 58h32v32H22zM66 58h32v32H66z"/><path d="m12 95 96-90" opacity=".2"/></>}
      </svg>
      <div className="credential-card-bottom"><span>{index===0?'AI Practitioner':index===1?'UX Foundations':'Azure Administrator'}</span><span>—</span></div>
    </div>
    <div className="credential-details"><span className="eyebrow">{index===1?'Course / 02':`Certification / 0${index+1}`}</span><h3>{item.name}</h3><p>{item.issuer}</p><p>{item.dates}</p><span className={`credential-status${item.status==='Expired'?' is-expired':''}`}>{item.status}</span></div>
  </article>)}</div></section>;
}

