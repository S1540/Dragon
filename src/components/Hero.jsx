"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Services from "./services/Services";
import DragonMark from "./DragonMark";
import Strengths from "./strengths/Strengths";
import PreviewModeSweep from "./PreviewModeSweep";
const Earth = dynamic(() => import("./Earth"), { ssr: false });
const services = [
  [
    "01",
    "Web experiences",
    "Distinctive, fast websites built around your brand and your audience.",
  ],
  [
    "02",
    "E-commerce",
    "Intuitive shopping experiences, from product discovery to checkout.",
  ],
  [
    "03",
    "Mobile applications",
    "Purposeful mobile products for iOS and Android.",
  ],
  [
    "04",
    "Intelligent solutions",
    "Connected systems and automation that move your business forward.",
  ],
];
function Arrow() {
  return <span aria-hidden="true">&#8599;</span>;
}
export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewsPaused, setPreviewsPaused] = useState(false);
  const [previewSweep, setPreviewSweep] = useState(0);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [previewDragging, setPreviewDragging] = useState(false);
  const previewDrag = useRef(null);
  const suppressPreviewClick = useRef(false);
  const previewControl = useRef(null);
  useEffect(() => {
    const keepInView = () => setPreviewPosition(position => {
      if (!position) return position;
      const bounds = previewControl.current.getBoundingClientRect();
      return { x: position.x === 0 ? 0 : Math.max(0, window.innerWidth - bounds.width), y: Math.max(0, Math.min(position.y, window.innerHeight - bounds.height)) };
    });
    window.addEventListener('resize', keepInView);
    return () => window.removeEventListener('resize', keepInView);
  }, []);
  function startPreviewDrag(event) {
    if (event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    suppressPreviewClick.current = false;
    previewDrag.current = { x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function movePreviewDrag(event) {
    const drag = previewDrag.current;
    if (!drag) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!suppressPreviewClick.current && Math.hypot(dx, dy) < 6) return;
    suppressPreviewClick.current = true;
    setPreviewDragging(true);
    setPreviewPosition({ x: Math.max(0, Math.min(drag.left + dx, window.innerWidth - drag.width)), y: Math.max(0, Math.min(drag.top + dy, window.innerHeight - drag.height)) });
  }
  function endPreviewDrag(event) {
    if (previewDrag.current && suppressPreviewClick.current) {
      const width = previewDrag.current.width;
      setPreviewPosition(position => position && ({ ...position, x: position.x + width / 2 < window.innerWidth / 2 ? 0 : Math.max(0, window.innerWidth - width) }));
    }
    setPreviewDragging(false);
    previewDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  useEffect(() => {
    if (!previewSweep) return;
    const timer = setTimeout(() => setPreviewSweep(0), 1800);
    return () => clearTimeout(timer);
  }, [previewSweep]);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const header = useRef(null);
  const menuToggle = useRef(null);
  useEffect(() => {
    function dismiss(event) {
      if (event.type === "keydown" && event.key === "Escape") {
        setMenuOpen(false);
        menuToggle.current?.focus();
      } else if (
        event.type === "pointerdown" &&
        !header.current?.contains(event.target)
      )
        setMenuOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 701px)");
    function resize() {
      if (desktop.matches) setMenuOpen(false);
    }
    desktop.addEventListener("change", resize);
    if (menuOpen) {
      document.addEventListener("keydown", dismiss);
      document.addEventListener("pointerdown", dismiss);
    }
    return () => {
      desktop.removeEventListener("change", resize);
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [menuOpen]);
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  function togglePreviews() {
    if (suppressPreviewClick.current) {
      suppressPreviewClick.current = false;
      return;
    }
    const next = !previewsPaused;
    setPreviewsPaused(next);
    setPreviewSweep(value => value + 1);
    window.dispatchEvent(new CustomEvent("dragon:preview-toggle", { detail: { paused: next } }));
  }
  const [dialogType, setDialogType] = useState("services");
  const [brief, setBrief] = useState("");
  const [saved, setSaved] = useState(false);
  const dialog = useRef(null);
  const cursor = useRef(null);
  const ripple = useRef(null);
  const interaction = useRef({ pulse: 0 });
  function moveCursor(event) {
    if (event.pointerType !== "mouse" || !cursor.current) return;
    cursor.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    cursor.current.dataset.visible = "true";
    cursor.current.dataset.interactive = String(
      Boolean(event.target.closest("button, a, textarea")),
    );
  }
  function energize(event) {
    if (
      event.target.closest("button, a, dialog, textarea") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    interaction.current.pulse = performance.now();
    const circle = ripple.current;
    circle.style.left = `${event.clientX}px`;
    circle.style.top = `${event.clientY}px`;
    circle.getAnimations().forEach((animation) => animation.cancel());
    circle.animate(
      [
        { transform: "translate(-50%, -50%) scale(.1)", opacity: 0.7 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
      ],
      { duration: 1100, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  }
  function openDialog(type) {
    if (menuOpen) menuToggle.current?.focus();
    setMenuOpen(false);
    setDialogType(type);
    dialog.current.showModal();
  }
  function saveBrief(event) {
    event.preventDefault();
    const url = URL.createObjectURL(
      new Blob(["DRAGON MEDIA — PROJECT BRIEF\n\n" + brief], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "dragon-media-project-brief.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  }
  return (
    <main
      id="top"
      onPointerMove={moveCursor}
      onPointerLeave={() => {
        if (cursor.current) cursor.current.dataset.visible = "false";
      }}
    >
      <div ref={cursor} className="cursor-follower" aria-hidden="true">
        <span />
      </div>
      <div ref={ripple} className="click-ripple" aria-hidden="true" />
      <a className="skip-link" href="#hero-content">
        Skip to content
      </a>
      <header
        ref={header}
        className={`site-header flex items-center justify-between${headerScrolled ? " header-scrolled" : ""}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setMenuOpen(false);
        }}
      >
        <a
          href="#top"
          className="brand brand-artwork"
          aria-label="Dragon Media home"
        >
          <DragonMark />
          <span className="brand-wordmark">
            <Image
              src="/textures/dragonlogo.png"
              alt="Dragon Media"
              width={160}
              height={150}
              sizes="160px"
              priority
            />
          </span>
        </a>
        <nav aria-label="Main navigation" className="navigation">
          <a href="#hero-content">The experience</a>
        </nav>
        <button onClick={() => openDialog("project")} className="header-cta">
          Let’s talk <Arrow />
        </button>
        <button
          ref={menuToggle}
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Open"}</span>
          <span className="menu-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
        <div
          id="mobile-navigation"
          className="mobile-menu"
          data-open={menuOpen}
          inert={!menuOpen}
        >
          <nav aria-label="Mobile navigation">
            <a
              href="#hero-content"
              onClick={() => {
                setMenuOpen(false);
                menuToggle.current?.focus();
              }}
            >
              The experience <Arrow />
            </a>
            <button
              className="mobile-contact"
              onClick={() => openDialog("project")}
            >
              Let’s talk <Arrow />
            </button>
          </nav>
        </div>
      </header>
      <button ref={previewControl} className="preview-control" type="button" role="switch" onClick={togglePreviews} aria-checked={!previewsPaused} aria-label="Animated previews" title="Click to switch previews. Drag to reposition."
        onPointerDown={startPreviewDrag} onPointerMove={movePreviewDrag} onPointerUp={endPreviewDrag} onPointerCancel={endPreviewDrag}
        style={{ touchAction: 'none', userSelect: 'none', cursor: previewDragging ? 'grabbing' : 'grab', transition: previewDragging ? 'none' : 'left .24s ease, top .24s ease, opacity .2s', ...(previewPosition ? { left: previewPosition.x, top: previewPosition.y, right: 'auto', bottom: 'auto', transform: 'none', borderRadius: previewPosition.x === 0 ? '0 6px 6px 0' : '6px 0 0 6px', borderRight: '1px solid #dce7ef18' } : {}) }}>
        <span className="preview-control-dot" />
        <span>Animated previews</span>
        <strong aria-hidden="true">{previewsPaused ? "Off" : "On"}</strong>
      </button>
      {previewSweep > 0 && <PreviewModeSweep key={previewSweep} />}
      <section
        className="hero"
        onClick={energize}
        aria-label="Dragon Media digital technology studio"
      >
        <div className="hero-topline">
          <span>
            <i className="status-dot" /> INDEPENDENT MINDS. LIMITLESS
            POSSIBILITIES.
          </span>
          <span className="edition">DIGITAL BY DESIGN — HUMAN AT HEART</span>
        </div>
        <div className="stage">
          <div className="stage-halo" />
          <div
            className="screen-stars"
            style={{ animationPlayState: previewsPaused ? "paused" : "running" }}
          />
          <div className="earth-scene">
            <Earth paused={previewsPaused} interaction={interaction} />
          </div>
          <div id="hero-content" className="hero-copy">
            <p className="eyebrow">DRAGON MEDIA · DIGITAL TECHNOLOGY STUDIO</p>
            <h1>
              <span>We Build, Grow & Scale Your Business in</span>
              <span>
                the Digital <em>World.</em>
              </span>
            </h1>
            <p className="hero-description">
              From website and mobile app development to branding, SEO and
              performance marketing, Dragon Media brings everything your
              business needs to build a powerful digital presence and generate
              growth.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => openDialog("services")}
              >
                Explore Our Services <Arrow />
              </button>
              <button
                className="secondary-button"
                onClick={() => openDialog("project")}
              >
                Start a Project <Arrow />
              </button>
            </div>
          </div>
          <div className="globe-label">
            <span className="crosshair">+</span>
            <span>
              BUILT FOR A<br />
              <strong>CONNECTED WORLD.</strong>
            </span>
          </div>
          <div className="screen-bottom">
            <span>
              <i className="status-dot" /> CREATIVITY MEETS TECHNOLOGY
            </span>

          </div>
        </div>
        <div className="hero-footer">
          <p>
            Ambitious ideas.
            <br />
            <span>Extraordinary digital outcomes.</span>
          </p>
          <div className="capability-list">
            <span>STRATEGY</span>
            <i />
            <span>DESIGN</span>
            <i />
            <span>DEVELOPMENT</span>
          </div>
          <span className="footer-note">
            Everything Your Business Needs to Grow Digitally.{" "}
            <span>&#8599;</span>
          </span>
        </div>
      </section>
      <Services
        onExplore={(service) => {
          if (service) {
            setBrief(
              `I'm interested in ${service.title}.\n\nMy project idea: `,
            );
            setSaved(false);
          }
          openDialog("project");
        }}
      />
      <Strengths />
      <dialog
        ref={dialog}
        className="hero-dialog"
        aria-labelledby="dialog-title"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="dialog-inner">
          <button
            className="dialog-close"
            onClick={() => dialog.current.close()}
            aria-label="Close dialog"
          >
            &#10005;
          </button>
          <p className="eyebrow">
            DRAGON MEDIA ·{" "}
            {dialogType === "services" ? "OUR EXPERTISE" : "YOUR NEXT CHAPTER"}
          </p>
          <h2 id="dialog-title">
            {dialogType === "services"
              ? "Your ambition. Our expertise."
              : "Let’s give your idea wings."}
          </h2>
          {dialogType === "services" ? (
            <>
              <div className="dialog-services">
                {services.map(([number, title, description]) => (
                  <div key={number}>
                    <span>{number}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
              <button
                className="primary-button"
                onClick={() => setDialogType("project")}
              >
                Start a Project <Arrow />
              </button>
            </>
          ) : (
            <form onSubmit={saveBrief}>
              <p className="dialog-description">
                Outline your idea, your audience and what success looks like.
                Download your brief, ready to share with your Dragon Media
                contact.
              </p>
              <label htmlFor="project-brief">Your project brief</label>
              <textarea
                id="project-brief"
                required
                minLength={10}
                rows={5}
                value={brief}
                onChange={(event) => {
                  setBrief(event.target.value);
                  setSaved(false);
                }}
                placeholder="We’re looking to build…"
              />
              <button className="primary-button" type="submit">
                Download project brief <Arrow />
              </button>
              <p role="status" className="form-status">
                {saved
                  ? "Your brief is downloaded and ready to share."
                  : "Your brief stays on your device. Nothing is submitted."}
              </p>
            </form>
          )}
        </div>
      </dialog>
    </main>
  );
}
