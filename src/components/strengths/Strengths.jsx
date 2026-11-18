"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { strengths } from './data';
import './Strengths.css';

const INTERVAL = 5000;
const count = strengths.length;

export default function Strengths() {
  const root = useRef(null);
  const buttons = useRef([]);
  const progress = useRef(null);
  const elapsed = useRef(0);
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const running = visible && !hidden && !hovered && !focused && !touching && !paused && !reduced;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduced(media.matches);
    const syncVisibility = () => setHidden(document.hidden);
    const syncExternalPause = (event) => setPaused(Boolean(event.detail?.paused));
    syncMotion();
    syncVisibility();
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(root.current);
    media.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    window.addEventListener('dragon:preview-toggle', syncExternalPause);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
      window.removeEventListener('dragon:preview-toggle', syncExternalPause);
    };
  }, []);

  // A single clock drives both the selected item's progress and the next slide.
  // Pausing preserves elapsed time; a direct selection starts a fresh five seconds.
  useEffect(() => {
    if (!running) return;
    let frame;
    let last = performance.now();
    function tick(now) {
      elapsed.current += now - last;
      last = now;
      progress.current?.style.setProperty('--strength-progress', String(Math.min(1, elapsed.current / INTERVAL)));
      if (elapsed.current >= INTERVAL) {
        elapsed.current = 0;
        setActive(value => (value + 1) % count);
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, active, cycle]);

  function select(index) {
    elapsed.current = 0;
    progress.current?.style.setProperty('--strength-progress', '0');
    setActive(index);
    setCycle(value => value + 1);
  }

  function navigate(event, index) {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % count;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + count) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    buttons.current[next]?.focus({ preventScroll: true });
  }

  function hoverEarth(event) {
    if (event.pointerType !== 'mouse') return;
    const bounds = root.current.querySelector('.dm-strengths-backdrop').getBoundingClientRect();
    const overContent = event.target.closest('.dm-strengths-choice, .dm-strengths-controls, .dm-strengths-heading, .dm-strengths-story');
    setHovered(!overContent && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom);
  }

  return <section ref={root} id="strengths" className="dm-strengths" aria-labelledby="strengths-title" data-active={active} data-running={running}
    onPointerEnter={hoverEarth} onPointerMove={hoverEarth}
    onPointerLeave={() => { setHovered(false); setTouching(false); }}
    onPointerDown={event => { if (event.pointerType !== 'mouse') setTouching(true); }}
    onPointerUp={() => setTouching(false)} onPointerCancel={() => setTouching(false)}
    onFocusCapture={event => { if (event.target.matches(':focus-visible')) setFocused(true); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="dm-strengths-backdrop" aria-hidden="true"><Image src="/textures/strengths-earth-full.png" alt="" fill sizes="(max-width: 760px) 100vw, (max-width: 1440px) 42vw, 650px" /></div>
    <div className="dm-strengths-inner">
    <header className="dm-strengths-heading"><h2 id="strengths-title">The thinking behind<br /><span>what we build.</span></h2></header>
    <div className="dm-strengths-composition">
      <div className="dm-strengths-navigation">
        <nav aria-label="Our agency strengths" className="dm-strengths-list">
          {strengths.map((item, index) => <button key={item.title} ref={element => { buttons.current[index] = element; }} type="button"
            className="dm-strengths-choice" style={{ '--slot': (index - active + count) % count }}
            aria-pressed={active === index} aria-controls={`strength-panel-${index}`} onClick={() => select(index)} onKeyDown={event => navigate(event, index)}>
            <span className="dm-strengths-number">0{index + 1}</span><span>{item.title}</span><span className="dm-strengths-arrow" aria-hidden="true">↗</span>
            {active === index && <span key={`${active}-${cycle}`} ref={progress} className="dm-strengths-progress" aria-hidden="true" />}
          </button>)}
        </nav>
        <div className="dm-strengths-controls"><span>0{active + 1} <span>/ 05</span></span><span className="dm-strengths-hint">Auto-advancing</span></div>
      </div>
      <div className="dm-strengths-story">
        {strengths.map((item, index) => <article key={item.title} id={`strength-panel-${index}`} className="dm-strengths-panel" data-active={active === index} aria-hidden={active !== index} inert={active !== index} aria-labelledby={`strength-headline-${index}`}>
          <div className="dm-strengths-copy"><span className="dm-strengths-kicker">DRAGON MEDIA / APPROACH 0{index + 1}</span><h3 id={`strength-headline-${index}`}>{item.headline}</h3><p>{item.description}</p><p className="dm-strengths-detail">{item.detail}</p></div>
        </article>)}
      </div>
    </div>
    </div>
  </section>;
}
