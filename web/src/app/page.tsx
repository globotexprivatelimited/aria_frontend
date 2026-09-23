"use client";
import Image from "next/image";

import "./home.css";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, useScroll, useReducedMotion, type Variants } from "framer-motion";
import { gsap } from "gsap";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const ticker = ["Now onboarding hotels", "Built for hospitality", "One number, every guest", "Nothing for guests to install"];
const tickerLong = [...ticker, ...ticker, ...ticker];


const services = [
  { img: "housekeeping", name: "Housekeeping", text: "Fresh towels to 412", tag: "Rooms" },
  { img: "room-service", name: "In-room dining", text: "Breakfast in bed at 8", tag: "Dining" },
  { img: "dining", name: "Dining reservations", text: "A table for two tonight", tag: "Dining" },
  { img: "spa", name: "Spa & wellness", text: "A massage this evening", tag: "Wellness" },
  { img: "concierge", name: "Concierge", text: "Somewhere good nearby?", tag: "Concierge" },
  { img: "transfers", name: "Airport transfers", text: "A car at 6am, please", tag: "Travel" },
];

const features = [
  { k: "1:N", h: "Several requests, one reply", p: "\u201cTowels, a late checkout, and a table for two\u201d becomes three jobs, handled at once and answered in a single message." },
  { k: "\u20B9", h: "Bookings that lift revenue", p: "Dining and spa run through a pending, human-confirmed flow, with a tasteful upsell only when the moment is right." },
  { k: "!", h: "Reviews caught in time", p: "Unhappy feedback reaches your GM privately \u2014 before it ever reaches Google." },
  { k: "24", h: "Answers at any hour", p: "Guests get a warm, accurate reply at 3am \u2014 grounded only in what your hotel actually offers." },
  { k: "ID", h: "Safe by design", p: "Aria verifies the room, never charges the wrong one, and never shares one guest\u2019s details with another." },
  { k: "N", h: "Built for every property", p: "One system runs all your hotels, each fully isolated. Adding another is a number and a sheet, not a rebuild." },
];

const plusClip = (a: number) =>
  "polygon(" +
  (50 - a) + "% 0%, " + (50 + a) + "% 0%, " +
  (50 + a) + "% " + (50 - a) + "%, 100% " + (50 - a) + "%, " +
  "100% " + (50 + a) + "%, " + (50 + a) + "% " + (50 + a) + "%, " +
  (50 + a) + "% 100%, " + (50 - a) + "% 100%, " +
  (50 - a) + "% " + (50 + a) + "%, 0% " + (50 + a) + "%, " +
  "0% " + (50 - a) + "%, " + (50 - a) + "% " + (50 - a) + "%)";

export default function Home() {
  const reduce = useReducedMotion();
  const y = (v: number) => (reduce ? 0 : v);
  const { scrollYProgress: pageProgress } = useScroll();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [active, setActive] = useState(0);
  const previewImgRef = useRef<HTMLDivElement>(null);
  const previewMetaRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const el = previewImgRef.current;
    if (!el) return;
    el.style.backgroundImage = "url(/services/" + services[active].img + ".jpg)";
    if (reduce || firstRun.current) {
      firstRun.current = false;
      el.style.clipPath = "none";
      return;
    }
    const obj = { a: 6 };
    el.style.clipPath = plusClip(6);
    const tw = gsap.to(obj, {
      a: 50, duration: 0.66, ease: "power3.inOut",
      onUpdate: () => { el.style.clipPath = plusClip(obj.a); },
      onComplete: () => { el.style.clipPath = "none"; },
    });
    const meta = previewMetaRef.current;
    const mtw = meta ? gsap.fromTo(meta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.08 }) : null;
    return () => { tw.kill(); if (mtw) mtw.kill(); };
  }, [active, reduce]);

  const heroWrap: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } } };
  const heroItem: Variants = { hidden: { opacity: 0, y: y(24) }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } };
  const gridWrap: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } } };
  const gridItem: Variants = { hidden: { opacity: 0, y: y(24) }, show: { opacity: 1, y: 0, transition: { duration: 0.66, ease: EASE } } };

  const inView = { once: true };

  function Reveal({ children, className, d = 0 }: { children: ReactNode; className?: string; d?: number }) {
    return (
      <motion.div className={className} initial={{ opacity: 0, y: y(22) }} whileInView={{ opacity: 1, y: 0 }} viewport={inView} transition={{ duration: 0.7, ease: EASE, delay: d }}>
        {children}
      </motion.div>
    );
  }

  return (
    <main className="aria">
      <motion.div className="aria-progress" style={{ scaleX: pageProgress }} />

      <div className="aria-ticker" aria-hidden="true">
        <div className="aria-ticker-track">
          {[...tickerLong, ...tickerLong].map((t, i) => (<span className="aria-ticker-item" key={i}>{t}</span>))}
        </div>
      </div>

      <header className={`aria-header${scrolled ? " is-floating" : ""}${menuOpen ? " is-menu-open" : ""}`}>
        <div className="aria-wrap aria-nav">
          <nav className="aria-nav-left" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#contact">For hotels</a>
          </nav>
          <a href="#top" className="aria-logo" onClick={() => setMenuOpen(false)}>Aria</a>
          <div className="aria-nav-right">
            <a href="/register" className="aria-nav-signin">Register your hotel</a>
            <a href="#contact" className="aria-nav-signin">Sign in</a>
            <a href="#contact" className="aria-btn aria-btn-primary aria-nav-cta">Book a demo</a>
            <button type="button" className="aria-nav-toggle" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
        <nav className="aria-mobile-menu" aria-label="Mobile">
          <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>For hotels</a>
          <a href="/register" className="aria-mobile-signin" onClick={() => setMenuOpen(false)}>Register your hotel</a>
          <a href="#contact" className="aria-mobile-signin" onClick={() => setMenuOpen(false)}>Sign in</a>
          <a href="#contact" className="aria-btn aria-btn-primary" onClick={() => setMenuOpen(false)}>Book a demo</a>
        </nav>
      </header>

      <section className="aria-hero" id="top">
        <div className="aria-wrap">
          <div className="aria-hero-frame">
            <Image src="/hero.jpg" alt="" fill priority sizes="100vw" className="aria-hero-img" />
            <div className="aria-hero-scrim" aria-hidden="true" />
            <motion.div className="aria-hero-copy" variants={heroWrap} initial="hidden" animate="show">
              <motion.span className="aria-eyebrow" variants={heroItem}>AI concierge for hotels</motion.span>
              <motion.h1 className="aria-display" variants={heroItem}>Every guest,<br /><em>warmly answered.</em></motion.h1>
              <motion.p className="aria-hero-lede" variants={heroItem}>Aria answers your guests on WhatsApp, books dining and spa, and quietly lifts revenue &mdash; in your hotel&rsquo;s own voice, at any hour.</motion.p>
              <motion.div className="aria-cta-row" variants={heroItem}>
                <a href="#contact" className="aria-btn aria-btn-primary">Book a demo <span className="arw">&rarr;</span></a>
                <a href="#how" className="aria-btn aria-btn-outline-light">See how it works</a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="aria-waband">
        <div className="aria-waband-inner">
          <div className="aria-waband-copy">
            <span className="aria-waband-eyebrow">On WhatsApp</span>
            <h2 className="aria-display">Your guests, answered<br />in a single message.</h2>
            <p>No app to download, no logins, no hold music. Aria replies on the app they already use &mdash; instantly, warmly, and around the clock.</p>
            <ul className="aria-waband-list">
              <li><span className="tick">&#10003;</span> Books dining, spa &amp; requests in seconds</li>
              <li><span className="tick">&#10003;</span> Answers 24/7 in the guest&rsquo;s language</li>
              <li><span className="tick">&#10003;</span> Nothing for guests to install</li>
            </ul>
            <a href="https://wa.me/910000000000?text=Hi%20Aria" target="_blank" rel="noopener noreferrer" className="aria-wa-btn">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="aria-wa-ic"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.8.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4.9 1 1-4.8-.3-.4C5.4 18.1 5 16.6 5 15c0-6 4.9-10.9 11-10.9S27 9 27 15s-4.9 10.8-11 10.8zm6.1-8.1c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6-.1-.2-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.3z" fill="currentColor"/></svg>
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>
      <section className="aria-section aria-demo-section" id="demo">
        <div className="aria-wrap">
          <Reveal className="aria-demo-head">
            <span className="aria-eyebrow">A message is all it takes</span>
            <h2 className="aria-display">Your guest texts. Aria takes care of the rest.</h2>
            <p>No app, no login &mdash; just the number they already have. Aria reads the request, even several at once, replies instantly, and routes every job to the right team.</p>
          </Reveal>
          <motion.div className="aria-media-row" variants={gridWrap} initial="hidden" whileInView="show" viewport={inView}>
            <motion.figure className="aria-media-fig" variants={gridItem}>
              <div className="aria-media">
                <video src="/aria-demo.mp4" autoPlay muted loop playsInline preload="none" poster="/aria-chat.jpg" />
              </div>
              <figcaption>Aria, replying in real time</figcaption>
            </motion.figure>
            <motion.figure className="aria-media-fig" variants={gridItem}>
              <div className="aria-media">
                <Image src="/aria-chat.jpg" alt="A WhatsApp conversation between a guest and Aria" fill sizes="(max-width: 880px) 90vw, 45vw" style={{ objectFit: "cover" }} />
              </div>
              <figcaption>A real guest conversation</figcaption>
            </motion.figure>
          </motion.div>
        </div>
      </section>

      <section className="aria-section aria-services-section" id="services">
        <div className="aria-wrap">
          <Reveal className="aria-section-head">
            <span className="aria-eyebrow">One message away</span>
            <h2 className="aria-display">Everything your guests might ask for.</h2>
          </Reveal>
          <div className="aria-gal">
            <ul className="aria-gal-tiles">
              {services.map((s, i) => (
                <li
                  key={i}
                  className={"aria-gal-tile" + (i === active ? " is-active" : "")}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  tabIndex={0}
                >
                  <div className="aria-gal-tile-img" style={{ backgroundImage: "url(/services/" + s.img + ".jpg)" }} />
                  <span className="aria-gal-tile-name">{s.name}</span>
                  <span className="aria-gal-tile-quote">&ldquo;{s.text}&rdquo;</span>
                </li>
              ))}
            </ul>
            <div className="aria-gal-preview">
              <div className="aria-gal-preview-img" ref={previewImgRef} style={{ backgroundImage: "url(/services/" + services[0].img + ".jpg)" }} />
              <div className="aria-gal-preview-meta" ref={previewMetaRef}>
                <span className="aria-gal-tag">{services[active].tag}</span>
                <h3>{services[active].name}</h3>
                <span className="aria-gal-quote">&ldquo;{services[active].text}&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="aria-section aria-hiw-section" id="how">
        <div className="aria-wrap">
          <Reveal className="aria-section-head aria-hiw-head">
            <span className="aria-eyebrow">How it works</span>
            <h2 className="aria-display">From a message to your guest&rsquo;s door.</h2>
          </Reveal>
          <motion.div className="aria-hiw" variants={gridWrap} initial="hidden" whileInView="show" viewport={inView}>
            <div className="aria-hiw-line" aria-hidden="true" />
            {[1, 2, 3, 4].map((n) => (
              <motion.figure className="aria-hiw-card" key={n} variants={gridItem}>
                <span className="aria-hiw-node">{n}</span>
                <div className="aria-hiw-img">
                  <img src={"/steps/hiw-" + n + ".jpg"} alt={"How Aria works, step " + n} loading="lazy" decoding="async" />
                </div>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="aria-section" id="features">
        <div className="aria-wrap">
          <Reveal className="aria-section-head">
            <span className="aria-eyebrow">What Aria does</span>
            <h2 className="aria-display">A full front desk, working quietly in the background.</h2>
          </Reveal>
          <motion.div className="aria-features" variants={gridWrap} initial="hidden" whileInView="show" viewport={inView}>
            {features.map((f, i) => (
              <motion.article className="aria-card" key={i} variants={gridItem}>
                <div className="ic aria-mono">{f.k}</div>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="aria-section">
        <div className="aria-wrap">
          <Reveal>
            <div className="aria-proof">
              <div className="aria-stat"><div className="figure">0</div><div className="label">apps for guests to install &mdash; they message the number they already have</div></div>
              <div className="aria-stat"><div className="figure">8</div><div className="label">kinds of request understood, from housekeeping to spa to dining</div></div>
              <div className="aria-stat"><div className="figure">24/7</div><div className="label">answered in your guest&rsquo;s language, grounded in your hotel&rsquo;s real details</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="aria-cta" id="contact">
        <div className="aria-wrap">
          <Reveal>
            <span className="aria-eyebrow">For hoteliers</span>
            <h2 className="aria-display">Bring Aria to your hotel.</h2>
            <p>See it answer a real guest message in your hotel&rsquo;s voice. We&rsquo;ll set up a live demo on your own WhatsApp number.</p>
            <div className="aria-cta-row">
              <a href="#contact" className="aria-btn aria-btn-primary">Book a demo <span className="arw">&rarr;</span></a>
              <a href="#top" className="aria-btn aria-btn-ghost">Back to top</a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="aria-footer">
        <div className="aria-wrap">
          <div className="aria-nl">
            <div className="aria-nl-copy">
              <h3 className="aria-display">Stay ahead with Aria.</h3>
              <p>Join the hotels using Aria to answer every guest on WhatsApp &mdash; and turn small requests into revenue.</p>
              <div className="aria-nl-form">
                <input type="email" placeholder="Enter your email" aria-label="Email address" />
                <button type="button" className="aria-btn aria-btn-primary">Subscribe Now</button>
              </div>
            </div>
            <div className="aria-nl-art" aria-hidden="true">
              <div className="aria-nl-card back" />
              <div className="aria-nl-card front" style={{ backgroundImage: "url(/hero.jpg)" }} />
            </div>
          </div>

          <div className="aria-ft-cols">
            <div className="aria-ft-brand">
              <div className="aria-ft-logomark">
                <span className="aria-ft-badge">A</span>
                <span className="aria-ft-name">Aria</span>
              </div>
              <p>Empowering hotels with a warm, reliable concierge that lives in a message.</p>
              <div className="aria-ft-social">
                <a href="#contact" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg></a>
                <a href="#contact" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg></a>
                <a href="#contact" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg></a>
                <a href="#contact" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg></a>
              </div>
            </div>

            <div className="aria-ft-col">
              <p className="aria-ft-h">Product</p>
              <ul>
                <li><a href="#services">Services</a></li>
                <li><a href="#how">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#demo">Live demo</a></li>
                <li><a href="#contact">Pricing</a></li>
              </ul>
            </div>
            <div className="aria-ft-col">
              <p className="aria-ft-h">For hotels</p>
              <ul>
                <li><a href="#contact">Book a demo</a></li>
                <li><a href="#contact">Onboarding</a></li>
                <li><a href="#contact">Multi-property</a></li>
                <li><a href="#contact">Data &amp; privacy</a></li>
                <li><a href="#contact">Support</a></li>
              </ul>
            </div>
            <div className="aria-ft-col">
              <p className="aria-ft-h">Company</p>
              <ul>
                <li><a href="#contact">About Globotex</a></li>
                <li><a href="#contact">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#contact">Partners</a></li>
                <li><a href="#contact">Press</a></li>
              </ul>
            </div>
          </div>

          <div className="aria-ft-bottom">
            <p>&copy; 2026 Globotex Private Limited. All rights reserved.</p>
            <div className="aria-ft-legal">
              <a href="#contact">Terms</a>
              <a href="#contact">Privacy</a>
              <a href="#contact">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}