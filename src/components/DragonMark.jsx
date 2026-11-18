"use client";
import { useEffect, useId, useRef } from 'react';
import './DragonMark.css';

// The original artwork is the silhouette: no approximation or replacement dragon.
export default function DragonMark() {
  const root = useRef(null);
  const id = useId();
  useEffect(() => {
    const element = root.current;
    let visible = true;
    const sync = () => { element.dataset.active = String(visible && !document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return <span ref={root} className="dragon-mark" data-active="true" aria-hidden="true">
    <svg viewBox="155 55 455 385" fill="none" focusable="false">
      <defs>
        <clipPath id={`${id}-crop`}><rect x="165" y="65" width="440" height="365" /></clipPath>
        <mask id={`${id}-art`} maskUnits="userSpaceOnUse" x="165" y="65" width="440" height="365" style={{ maskType: 'alpha' }}><image href="/textures/dragonlogo.png" width="769" height="720" /></mask>
        <linearGradient id={`${id}-aura`} x1="200" y1="90" x2="565" y2="405" gradientUnits="userSpaceOnUse"><stop stopColor="#DCE7EF" /><stop offset=".42" stopColor="#16D9E8" /><stop offset=".76" stopColor="#087EAC" /><stop offset="1" stopColor="#A378FF" /></linearGradient>
        <linearGradient id={`${id}-shine`}><stop stopColor="#fff" stopOpacity="0" /><stop offset=".46" stopColor="#DCE7EF" stopOpacity=".05" /><stop offset=".5" stopColor="#efffff" stopOpacity=".75" /><stop offset=".56" stopColor="#16D9E8" stopOpacity=".15" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${id}-eye`}><stop stopColor="#fff" /><stop offset=".3" stopColor="#91faff" /><stop offset="1" stopColor="#16D9E8" stopOpacity="0" /></radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <g className="dragon-mark-float">
        <path className="dragon-mark-aura" d="M199 86H416C520 86 590 160 592 266C600 356 548 418 452 421H214" stroke={`url(#${id}-aura)`} strokeWidth="12" filter={`url(#${id}-glow)`} />
        <g clipPath={`url(#${id}-crop)`}>
          <image href="/textures/dragonlogo.png" width="769" height="720" />
          <g mask={`url(#${id}-art)`}><rect className="dragon-mark-shimmer" x="-350" y="65" width="260" height="365" fill={`url(#${id}-shine)`} /></g>
        </g>
        <path className="dragon-mark-trace" d="M199 86H416C520 86 590 160 592 266C600 356 548 418 452 421H214" stroke={`url(#${id}-aura)`} strokeWidth="2.5" strokeLinecap="round" pathLength="100" />
        <ellipse className="dragon-mark-eye" cx="466" cy="217" rx="12" ry="5" transform="rotate(33 466 217)" fill={`url(#${id}-eye)`} />
        <g className="dragon-mark-sparks" fill="#85f3ff"><circle cx="569" cy="178" r="2" /><circle cx="580" cy="328" r="1.7" /><circle cx="264" cy="405" r="1.8" /></g>
      </g>
    </svg>
  </span>;
}
