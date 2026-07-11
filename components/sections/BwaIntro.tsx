'use client';

// ════════════════════════════════════════════════════════════════════════════
// BwaIntro — "hero split" page transition
// ────────────────────────────────────────────────────────────────────────────
// When a visitor taps "Build with ASES" in the hero, that click stores a
// one-shot flag (sessionStorage 'bwa:fromHero'). On arrival here we replay the
// hero as a full-screen layer, then slice it down the middle so the two halves
// slide apart — the gate, but it's the hero itself — revealing the BWA content
// underneath. Direct visits / refreshes / search traffic skip it entirely so
// the page is instant and SEO content is never hidden behind an animation.
// ════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { animate } from 'framer-motion';

const FADEIN_S = 0.5;         // hero replica fades up from the navy on arrival
const HOLD_MS = 380;          // beat where the hero sits before it splits
const OPEN_DURATION_S = 1.0;  // how long the two halves take to slide apart
const FADE_MS = 340;          // final overlay fade

/** Peek the one-shot "came from hero" flag without consuming it. Consumption
 *  happens once in an effect so a refresh can't replay the intro. Returns the
 *  initial `active` value so the navy overlay paints on the very first client
 *  frame — no flash of the BWA page underneath. */
function decideInitialActive(): boolean | null {
  if (typeof window === 'undefined') return null; // SSR: stay out of the way
  try {
    if (sessionStorage.getItem('bwa:fromHero') !== '1') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  } catch {
    // Storage can throw when a browser restricts it (Brave shields, private
    // mode, disabled cookies). Never let that crash render — just skip the intro.
    return false;
  }
}

const HERO_BG: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(163,205,254,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(163,205,254,0.12) 1px, transparent 1px), radial-gradient(ellipse at 50% 30%, #0D3B8B 0%, #071F6B 40%, #030E3D 70%)',
  backgroundSize: '48px 48px, 48px 48px, 100% 100%',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One full-screen copy of the hero. Both halves render this identically; the
 *  parent clips each to one side so together they reproduce the whole hero.
 *  Layout mirrors the real Hero component — desktop: logo+text left, Ace right;
 *  mobile: Ace top, logo+text below. */
function HeroReplica() {
  return (
    <div className="absolute inset-0" style={HERO_BG}>
      {/* blueprint wash, same as the real hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/images/blueprint-ace.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
        }}
      />

      {/* ── Mobile layout (< 640px): stacked, Ace on top ── */}
      <div className="sm:hidden absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
        <Image
          src="/images/ace-fly.svg"
          alt=""
          width={1000}
          height={1000}
          draggable={false}
          unoptimized
          className="h-[clamp(180px,38vh,300px)] w-auto rotate-[15deg]"
        />
        <Image
          src="/images/ases-logotext-white.png"
          alt="ASES Manila"
          width={1541}
          height={512}
          draggable={false}
          className="h-[clamp(44px,7vw,80px)] w-auto max-w-[280px]"
        />
        <p className="font-[family-name:var(--font-cocogoose)] font-light text-[17px] text-white max-w-[260px] leading-[1.55] text-left">
          Meet students that make you want to be better.
        </p>
      </div>

      {/* ── Desktop layout (≥ 640px): logo+text left, Ace right ── */}
      <div className="hidden sm:flex absolute inset-0 flex-row items-center">
        {/* Left: logo + tagline */}
        <div className="flex-1 min-w-0 pl-[clamp(60px,14vw,600px)] pr-[clamp(8px,10vw,120px)] pt-[clamp(64px,10vh,120px)] pb-[clamp(64px,10vh,120px)]">
          <div className="flex flex-col items-start gap-[clamp(14px,2.2vh,28px)]">
            <Image
              src="/images/ases-logotext-white.png"
              alt="ASES Manila"
              width={1541}
              height={512}
              draggable={false}
              className="h-[clamp(44px,9vw,160px)] w-auto max-w-[clamp(180px,38vw,520px)]"
            />
            <p className="font-[family-name:var(--font-cocogoose)] font-light text-[clamp(14px,1.1vw,22px)] text-white max-w-[700px] leading-[1.55]">
              Meet students that make you want to be better.
            </p>
          </div>
        </div>

        {/* Right: Ace mascot */}
        <div className="shrink-0 flex items-center justify-center pr-[clamp(50px,10vw,200px)] pt-[clamp(48px,6vh,80px)] pb-[clamp(48px,6vh,80px)]">
          <Image
            src="/images/ace-fly.svg"
            alt=""
            width={1000}
            height={1000}
            draggable={false}
            unoptimized
            className="h-[clamp(200px,min(40vw,80vh),740px)] w-auto rotate-[15deg]"
          />
        </div>
      </div>
    </div>
  );
}

export function BwaIntro() {
  // Decided on the first client render so the navy paints immediately (no flash
  // of the page underneath). null = undecided (SSR), true = playing, false = gone.
  const [active, setActive] = useState<boolean | null>(decideInitialActive);
  const wrapRef = useRef<HTMLDivElement>(null);
  const replicaRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  // Consume the one-shot flag exactly once (StrictMode invokes effects twice in
  // dev; the ref survives the simulated remount so we don't double-process).
  const consumedRef = useRef(false);

  // In case the initial decision happened during SSR (null), re-decide on mount.
  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    const decision = decideInitialActive();
    try { sessionStorage.removeItem('bwa:fromHero'); } catch { /* storage restricted */ }
    setActive(prev => (prev === null ? decision : prev));
  }, []);

  useEffect(() => {
    if (active !== true) return;
    let cancelled = false;

    (async () => {
      // ── Phase 1: the intro fades up out of the navy ──────────────────
      if (replicaRef.current) {
        await animate(replicaRef.current, { opacity: [0, 1] }, { duration: FADEIN_S, ease: 'easeOut' });
      }
      if (cancelled) return;

      // ── Phase 2: hold, then the hero splits apart ────────────────────
      await delay(HOLD_MS);
      if (cancelled || !leftRef.current || !rightRef.current) return;

      await Promise.all([
        animate(leftRef.current, { x: '-100%' }, { duration: OPEN_DURATION_S, ease: [0.76, 0, 0.24, 1] }),
        animate(rightRef.current, { x: '100%' }, { duration: OPEN_DURATION_S, ease: [0.76, 0, 0.24, 1] }),
      ]);
      if (cancelled) return;

      // ── Phase 3: soft fade of the overlay to reveal the BWA page ─────
      if (wrapRef.current) {
        wrapRef.current.style.transition = `opacity ${FADE_MS}ms ease-out`;
        wrapRef.current.style.opacity = '0';
      }
      await delay(FADE_MS);
      if (!cancelled) setActive(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  if (active !== true) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9998] select-none overflow-hidden pointer-events-none bg-[#08163d]"
    >
      {/* replica fades up from the navy as one piece, then the halves split */}
      <div ref={replicaRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {/* left half — keeps the left 50% of the hero */}
        <div ref={leftRef} className="absolute inset-0 [clip-path:inset(0_50%_0_0)]">
          <HeroReplica />
        </div>
        {/* right half — keeps the right 50% of the hero */}
        <div ref={rightRef} className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
          <HeroReplica />
        </div>
      </div>
    </div>
  );
}
