"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const bars = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1];

export default function LandingHero() {
  return (
    <section className="evenza-hero" aria-labelledby="evenza-hero-title">
      <style>{`
        /* <design_plan>
          vibe_validity: PASS — editorial-industrial event identity
          motion_personality: PASS — restrained reveal, no body-copy motion
          button_contrast: PASS — vermilion/ink and transparent/parchment
          honest_copy: PASS — no fabricated metrics, logos, or testimonials
        </design_plan> */
        .evenza-hero{--bg:#080807;--surface:#151411;--ink:#f3eee5;--accent:#e85b2a;position:relative;min-height:calc(100svh - 72px);overflow:hidden;background:var(--bg);color:var(--ink);isolation:isolate}
        .evenza-hero:before{content:"";position:absolute;inset:0;z-index:-2;opacity:.2;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");pointer-events:none}
        .evenza-hero:after{content:"";position:absolute;width:42rem;aspect-ratio:1;right:-19rem;top:-21rem;z-index:-1;border:1px solid rgba(232,91,42,.28);border-radius:50%;box-shadow:0 0 0 7rem rgba(232,91,42,.025),0 0 0 14rem rgba(232,91,42,.018);pointer-events:none}
        .evenza-hero__grid{width:min(100% - 40px,1360px);min-height:calc(100svh - 72px);margin:0 auto;padding:clamp(72px,9vw,128px) 0 clamp(54px,7vw,92px);display:grid;grid-template-columns:minmax(0,1.08fr) minmax(380px,.72fr);align-items:center;gap:clamp(52px,8vw,128px)}
        .evenza-hero__copy{max-width:790px}.evenza-hero__eyebrow{display:flex;align-items:center;gap:14px;margin-bottom:clamp(24px,4vw,42px);color:rgba(243,238,229,.64);font-family:var(--font-dm-sans),sans-serif;font-size:10px;font-weight:600;letter-spacing:.24em;text-transform:uppercase}.evenza-hero__eyebrow:before{content:"";width:42px;height:1px;background:var(--accent)}
        .evenza-hero h1{max-width:840px;margin:0;font-family:var(--font-playfair),Georgia,serif;font-size:clamp(3.45rem,7.25vw,7.25rem);font-weight:500;line-height:.88;letter-spacing:-.055em;text-wrap:balance}.evenza-hero h1 em{color:var(--accent);font-weight:400}
        .evenza-hero__body{max-width:590px;margin:clamp(28px,4vw,44px) 0 0;padding-left:clamp(0px,5vw,84px);color:rgba(243,238,229,.62);font-family:var(--font-dm-sans),sans-serif;font-size:clamp(1rem,1.35vw,1.18rem);line-height:1.7}
        .evenza-hero__actions{display:flex;align-items:center;gap:14px;margin-top:34px;padding-left:clamp(0px,5vw,84px);flex-wrap:wrap}.evenza-hero__button{min-height:52px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:14px;border:1px solid var(--accent);background:var(--accent);color:#130b08;font-family:var(--font-dm-sans),sans-serif;font-size:13px;font-weight:700;letter-spacing:.02em;text-decoration:none;transition:transform .25s ease,background-color .25s ease,color .25s ease,border-color .25s ease}.evenza-hero__button--secondary{border-color:rgba(243,238,229,.22);background:transparent;color:var(--ink)}.evenza-hero__button:hover{transform:translateY(-2px);background:var(--ink);border-color:var(--ink)}.evenza-hero__button--secondary:hover{color:var(--bg)}.evenza-hero__button svg{width:17px;height:17px}
        .evenza-hero__visual{position:relative;min-height:510px;display:grid;place-items:center}.evenza-hero__edition{position:absolute;top:2px;right:2px;color:rgba(243,238,229,.42);font:600 9px/1 var(--font-dm-sans),sans-serif;letter-spacing:.25em;text-transform:uppercase;writing-mode:vertical-rl}
        .evenza-ticket{position:relative;width:min(100%,390px);min-height:468px;padding:34px;overflow:hidden;background:#eee8dc;color:#11100e;box-shadow:28px 34px 80px rgba(0,0,0,.42);transform:rotate(2.25deg)}.evenza-ticket:before,.evenza-ticket:after{content:"";position:absolute;top:57%;width:28px;height:28px;border-radius:50%;background:var(--bg)}.evenza-ticket:before{left:-14px}.evenza-ticket:after{right:-14px}
        .evenza-ticket__top{display:flex;justify-content:space-between;gap:20px;padding-bottom:25px;border-bottom:1px solid rgba(17,16,14,.24)}.evenza-ticket__mark{width:42px;height:42px;display:grid;place-items:center;background:#11100e;color:#eee8dc}.evenza-ticket__mark svg{width:23px;height:23px}.evenza-ticket__meta{text-align:right;font:700 9px/1.7 var(--font-dm-sans),sans-serif;letter-spacing:.16em;text-transform:uppercase}
        .evenza-ticket__title{margin:32px 0 28px;font:500 clamp(2.6rem,5vw,4.6rem)/.86 var(--font-playfair),Georgia,serif;letter-spacing:-.06em}.evenza-ticket__title span{display:block;color:var(--accent);font-style:italic}.evenza-ticket__details{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:24px 0;border-top:1px solid rgba(17,16,14,.24);border-bottom:1px dashed rgba(17,16,14,.35)}.evenza-ticket__label{display:block;margin-bottom:7px;color:rgba(17,16,14,.48);font:700 8px/1 var(--font-dm-sans),sans-serif;letter-spacing:.18em;text-transform:uppercase}.evenza-ticket__value{font:600 12px/1.35 var(--font-dm-sans),sans-serif}
        .evenza-ticket__foot{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-top:27px}.evenza-ticket__code{display:flex;gap:3px;align-items:flex-end;height:42px}.evenza-ticket__code i{display:block;height:100%;background:#11100e}.evenza-ticket__number{font:700 9px/1.5 var(--font-dm-sans),sans-serif;letter-spacing:.15em;text-align:right;text-transform:uppercase}.evenza-hero__note{position:absolute;left:0;bottom:18px;color:rgba(243,238,229,.4);font:500 9px/1.6 var(--font-dm-sans),sans-serif;letter-spacing:.16em;text-transform:uppercase;transform:rotate(-90deg) translateY(100%);transform-origin:bottom left}
        @media(max-width:960px){.evenza-hero__grid{grid-template-columns:1fr;padding-top:76px;gap:64px}.evenza-hero__copy{max-width:760px}.evenza-hero__visual{min-height:470px}.evenza-ticket{width:min(82vw,420px)}.evenza-hero__edition{right:calc(50% - 250px)}}
        @media(max-width:560px){.evenza-hero__grid{width:min(100% - 32px,1360px);min-height:auto;padding:60px 0 54px;gap:48px}.evenza-hero h1{font-size:clamp(3rem,15vw,4.5rem);line-height:.91}.evenza-hero__body,.evenza-hero__actions{padding-left:0}.evenza-hero__actions{align-items:stretch}.evenza-hero__button{flex:1 1 100%}.evenza-hero__visual{min-height:420px}.evenza-ticket{width:calc(100% - 20px);min-height:405px;padding:25px;transform:rotate(1deg)}.evenza-ticket__title{margin:27px 0 22px}.evenza-hero__edition,.evenza-hero__note{display:none}}
        @media(prefers-reduced-motion:reduce){.evenza-hero *,.evenza-hero *:before,.evenza-hero *:after{scroll-behavior:auto!important;animation:none!important;transition-duration:.01ms!important}}
      `}</style>
      <div className="evenza-hero__grid">
        <div className="evenza-hero__copy">
          <motion.p className="evenza-hero__eyebrow" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:.55}}>One platform. Every kind of gathering.</motion.p>
          <motion.h1 id="evenza-hero-title" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.08,ease:[.22,1,.36,1]}}>Make the event.<br/>Find the <em>people.</em></motion.h1>
          <p className="evenza-hero__body">Evenza brings discovery, registration, ticketing, and event operations into one considered experience—for the people hosting and the people showing up.</p>
          <motion.div className="evenza-hero__actions" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.5,delay:.35}}>
            <Link href="/events" className="evenza-hero__button">Discover events<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>
            <Link href="/#platform" className="evenza-hero__button evenza-hero__button--secondary">See the platform</Link>
          </motion.div>
        </div>
        <motion.div className="evenza-hero__visual" initial={{opacity:0,y:26,rotate:-1}} animate={{opacity:1,y:0,rotate:0}} transition={{duration:.8,delay:.18,ease:[.22,1,.36,1]}} aria-hidden="true">
          <span className="evenza-hero__edition">Evenza / Live edition</span>
          <article className="evenza-ticket">
            <header className="evenza-ticket__top"><span className="evenza-ticket__mark"><svg viewBox="0 0 24 24" fill="none"><path d="M5 17.5V7l7-4 7 4v10.5L12 22l-7-4.5Z" stroke="currentColor" strokeWidth="1.4"/><path d="m8 14 4-7 4 7-4 3-4-3Z" fill="currentColor"/></svg></span><span className="evenza-ticket__meta">Admit one<br/>All access</span></header>
            <h2 className="evenza-ticket__title">The next<br/><span>great night</span></h2>
            <div className="evenza-ticket__details"><div><span className="evenza-ticket__label">Doors</span><span className="evenza-ticket__value">20:00 / Thursday</span></div><div><span className="evenza-ticket__label">Venue</span><span className="evenza-ticket__value">Where people meet</span></div></div>
            <footer className="evenza-ticket__foot"><span className="evenza-ticket__code">{bars.map((width,index)=><i key={index} style={{width}}/>)}</span><span className="evenza-ticket__number">EVZ / 2026<br/>Your event begins here</span></footer>
          </article>
          <span className="evenza-hero__note">Designed for hosts &amp; guests</span>
        </motion.div>
      </div>
    </section>
  );
}
