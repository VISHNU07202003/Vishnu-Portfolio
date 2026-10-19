import content from './publicContent';

export default function Contact() {
  return <section id="contact" className="contact-section frame section-space">
    <span className="eyebrow">Get in touch</span>
    <h2>Let’s talk<span className="accent-dot">.</span></h2>
    <div className="contact-grid"><div className="contact-actions">{content.contact.map(link=><a key={link.href} href={link.href} className="text-link" rel={link.href.startsWith('https:')?'me noreferrer':undefined}>{link.label}<span aria-hidden="true">↗</span></a>)}</div>
    </div>
  </section>;
}
