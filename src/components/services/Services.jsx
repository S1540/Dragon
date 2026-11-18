"use client";
import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BrowserPreview from './BrowserPreview';
import { services } from './data';
import s from './styles';

gsap.registerPlugin(ScrollTrigger);
// 100 alternating half-waves form 50 full curves across the progress track.
const progressPath = 'M 0 12 ' + Array.from({ length: 100 }, (_, i) =>
  'Q ' + (i * 10 + 5) + ' ' + (12 + (i % 2 === 0 ? -6 : 6)) + ' ' + ((i + 1) * 10) + ' 12'
).join(' ');
export default function Services({ onExplore }) {
  const root = useRef(null);
  const pin = useRef(null);
  const trigger = useRef(null);
  const progress = useRef(null);
  const progressFill = useRef(null);
  const progressHead = useRef(null);
  const progressId = useId();
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)', () => {
      root.current.dataset.pinned = 'true';
      setPinned(true);
      const st = ScrollTrigger.create({
        id: 'dragon-services', trigger: pin.current, start: 'top top',
        end: () => `+=${services.length * 100}`, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          const index = Math.min(5, Math.floor(self.progress * 6));
          setActive(previous => previous === index ? previous : index);
          progress.current?.style.setProperty('--progress', self.progress);
          const x = self.progress * 1000;
          const segment = Math.min(99, Math.floor(x / 10));
          const t = (x - segment * 10) / 10;
          const y = 12 + (segment % 2 === 0 ? -12 : 12) * t * (1 - t);
          progressFill.current?.setAttribute('width', String(x));
          progressHead.current?.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        },
      });
      trigger.current = st;
      const refreshFrame = requestAnimationFrame(() => st.refresh());
      return () => { cancelAnimationFrame(refreshFrame); trigger.current = null; if (root.current) root.current.dataset.pinned = 'false'; setPinned(false); };
    });
    return () => mm.revert();
  }, []);
  function navigate(index) {
    if (trigger.current) window.scrollTo({ top: trigger.current.start + (index + .12) / 6 * (trigger.current.end - trigger.current.start), behavior: 'smooth' });
    else root.current.querySelector(`#service-${services[index].slug}`)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  return <section ref={root} id="services" className={s.services} aria-labelledby="services-title" data-pinned={pinned} data-active-service={active + 1}>
    <div className={s.intro}>
      
      <div className={s.introGrid}><h2 id="services-title">Digital services.<br /><em>Built around your business.</em></h2></div>
      
    </div>
    <div ref={pin} className={s.showcase}>
      <div className={s.chapterBar}><span>OUR EXPERTISE</span><button onClick={() => setPlaying(!playing)} aria-pressed={!playing}>{playing ? 'Ⅱ Pause previews' : '▷ Play previews'}</button></div>
      <div className={s.chapters}>
        {services.map((service, index) => <article key={service.slug} id={`service-${service.slug}`} className={s.chapter} data-active={index === active} inert={pinned && index !== active} aria-hidden={pinned && index !== active ? true : undefined}>
          <div className={s.copy}>
            <div className={s.number}><strong>{String(index + 1).padStart(2, '0')}</strong><span>/ 06</span></div>
            <h3>{service.title}</h3><p className={s.description}>{service.description}</p>
            <ul>{service.capabilities.map(item => <li key={item}>{item}</li>)}</ul>
            <div className="dm-service-contactRow"><div className="dm-service-price"><span>{service.price ? "Starting from" : "Built to your requirements"}</span><strong>{service.price || "Custom quote"}{service.usd && <small>≈ {service.usd} USD</small>}</strong></div><button className={s.explore} onClick={() => onExplore(service)}>Connect Team <span aria-hidden="true">↗</span></button></div><p className="dm-service-priceNote">Estimates only. Final pricing may increase or decrease after discussing your requirements. USD amounts are approximate.</p>
          </div>
          <div className={s.visual}><BrowserPreview service={service} enabled={playing && (!pinned || active === index)} /></div>
        </article>)}
      </div>
      <div className={s.chapterNav} ref={progress}>
        <svg className="dm-service-waveProgress" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true">
          <defs><clipPath id={progressId}><rect ref={progressFill} width="0" height="24" /></clipPath></defs>
          <path className="dm-service-waveTrack" d={progressPath} />
          <path className="dm-service-waveFill" d={progressPath} clipPath={'url(#' + progressId + ')'} />
          <g ref={progressHead} transform="translate(0 12)" className="dm-service-waveHead"><ellipse rx="6" ry="4" /><circle cx="2" cy="-1.4" r=".8" /><circle cx="2" cy="1.4" r=".8" /></g>
        </svg>
        <nav aria-label="Service chapters">{services.map((service, index) => <button key={service.slug} onClick={() => navigate(index)} aria-current={pinned && active === index ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{service.label}</button>)}</nav>
      </div>
    </div>s
  </section>;
}

