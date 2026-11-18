"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function PreviewModeSweep() {
  const line = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = line.current.animate([
      { transform: 'translateX(-40px)', opacity: 0 },
      { opacity: .95, offset: .08 },
      { opacity: .95, offset: .9 },
      { transform: `translateX(${window.innerWidth + 40}px)`, opacity: 0 },
    ], { duration: 1200, easing: 'cubic-bezier(.25,.5,.5,1)', fill: 'forwards' });
    return () => animation.cancel();
  }, []);

  return createPortal(<div ref={line} className="preview-mode-sweep" aria-hidden="true" style={{
    position: 'fixed', zIndex: 10000, top: 0, left: 0, bottom: 0,
    width: window.innerWidth > 760 ? 2.1 : 3, pointerEvents: 'none', opacity: 0, animation: 'none',
    background: '#adfaff', boxShadow: '0 0 16px 5px #16d9e8aa, -18px 0 48px 12px #16d9e83d',
  }} />, document.body);
}
