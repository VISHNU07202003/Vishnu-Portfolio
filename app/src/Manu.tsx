import { useEffect, useRef, useState, type FormEvent } from 'react';
import ManuCharacter from './ManuCharacter';
import { approvedManuAsset } from './manuAsset';
import { answerManu, greeting, suggestions } from './manuFaq';
import chatPortrait from './assets/manu-chat-portrait.png';

export default function Manu() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(greeting);
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const questionInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) { el.showModal(); closeButton.current?.focus(); }
    else if (!open && el?.open) { el.close(); launcher.current?.focus({ preventScroll: true }); }
  }, [open]);
  function ask(q: string) { setQuestion(q.trim().slice(0, 300)); setAnswer(answerManu(q)); setInput(''); }
  function submit(e: FormEvent) { e.preventDefault(); if (input.trim()) { ask(input); questionInput.current?.focus(); } }
  function close() { setOpen(false); }
  return <>
    <button ref={launcher} className="manu-launcher" onClick={() => setOpen(true)} aria-label="Open Manu portfolio guide" aria-haspopup="dialog" aria-controls="manu-dialog" aria-expanded={open}>
      <ManuCharacter asset={approvedManuAsset} paused/><span>Ask Manu <span aria-hidden="true">✦</span></span>
    </button>
    <dialog ref={dialog} id="manu-dialog" className="manu-dialog" aria-labelledby="manu-title" aria-describedby="manu-description" onCancel={e => { e.preventDefault(); close(); }} onClose={() => { setOpen(false); launcher.current?.focus({ preventScroll: true }); }} onClick={e => { if (e.target === e.currentTarget) { const r=e.currentTarget.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) close(); } }} onKeyDown={e => {
      if(e.key !== 'Tab') return;
      const nodes=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input'));
      const first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
    }}>
      <div className="manu-heading"><h2 id="manu-title" className="sr-only">Manu portfolio guide</h2><div className="manu-chat-portrait" aria-hidden="true"><img src={chatPortrait} width="306" height="439" alt="" loading="lazy" decoding="async" onError={event=>{event.currentTarget.style.visibility='hidden';}}/></div><button ref={closeButton} onClick={close} aria-label="Close Manu">×</button></div>
      <p id="manu-description" className="sr-only">A local guide with curated answers about the portfolio.</p>
      <div className="manu-response" role="status" aria-live="polite" aria-atomic="true">
        {question && <p className="manu-question-echo">You asked: {question}</p>}
        <h3>{answer.title}</h3><p>{answer.body}</p>
      </div>
      <div className="manu-links"><a href={answer.link.href} onClick={close}>{answer.link.label} <span aria-hidden="true">↗</span></a></div>
      <div className="manu-suggestions"><span className="eyebrow">A FEW PLACES TO START</span><div className="faq-chips">{suggestions.map(q => <button key={q} onClick={() => ask(q)}>{q}<span aria-hidden="true">↗</span></button>)}</div></div>
      <form onSubmit={submit}><label htmlFor="manu-question">Ask about the portfolio</label><div className="question-row"><input ref={questionInput} id="manu-question" value={input} onChange={e => setInput(e.target.value)} maxLength={300} placeholder="Where should I start?" autoComplete="off"/><button type="submit" disabled={!input.trim()} aria-label="Send question">↑</button></div></form>
      <p className="manu-privacy">Local FAQ · no external AI · no saved chat history</p>
    </dialog>
  </>;
}


