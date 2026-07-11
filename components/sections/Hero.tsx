'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FALLBACK_CONTENT } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// Every so often the headline turns personal: "students" -> "you",
// "they're" -> "you're", then reverts. A brief "wait, that's you" beat
// before snapping back to the general pitch.
const PERSONALIZE_INTERVAL_MS = 8000;
const PERSONALIZE_DURATION_MS_MIN = 3000;
const PERSONALIZE_DURATION_MS_MAX = 4000;

/** True for a few seconds every ~8s, false the rest of the time. */
function usePersonalizeCycle(): boolean {
  const [active, setActive] = useState(false);
  const onTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const cycle = () => {
      onTimer.current = setTimeout(() => {
        setActive(true);
        const duration = PERSONALIZE_DURATION_MS_MIN + Math.random() * (PERSONALIZE_DURATION_MS_MAX - PERSONALIZE_DURATION_MS_MIN);
        offTimer.current = setTimeout(() => {
          setActive(false);
          cycle();
        }, duration);
      }, PERSONALIZE_INTERVAL_MS);
    };
    cycle();
    return () => {
      if (onTimer.current) clearTimeout(onTimer.current);
      if (offTimer.current) clearTimeout(offTimer.current);
    };
  }, []);

  return active;
}

/**
 * A word that swaps to an alternate for a beat, then reverts. Reserves a
 * fixed-width slot sized to the longer of the two variants so the swap
 * never reflows the surrounding headline, and uses a hard keyed swap (no
 * crossfade library) so exactly one text node is ever in the DOM — same
 * technique as the manifesto's SlotWord, which avoids AnimatePresence
 * leaving a stale opacity:0 node behind mid-cycle.
 */
function SwapWord({
  base,
  swapped,
  active,
  className,
  style,
}: {
  base: string;
  swapped: string;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const longest = base.length >= swapped.length ? base : swapped;
  return (
    <span className="relative inline-grid align-baseline" style={{ whiteSpace: 'nowrap' }}>
      <span aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1', ...style }}>
        {longest}
      </span>
      <span key={active ? 'swapped' : 'base'} className={className} style={{ gridArea: '1 / 1', ...style }}>
        {active ? swapped : base}
      </span>
    </span>
  );
}

/** Renders a plain heading segment, swapping "they're" -> "you're" mid-flow when active. */
function PronounSegment({ text, active }: { text: string; active: boolean }) {
  const match = text.match(/they're/i);
  if (!match || match.index === undefined) return <>{text}</>;
  const before = text.slice(0, match.index);
  const word = match[0];
  const after = text.slice(match.index + word.length);
  return (
    <>
      {before}
      <SwapWord base={word} swapped="you're" active={active} />
      {after}
    </>
  );
}

// The two head frames Ace glitches between — calm and grinning.
const FACE_FRAMES = ['/images/ace-parts_5.png', '/images/ace-parts_6.png'] as const;

// Glitch rhythm: hold one face, then a rapid burst of flash cuts (no fades),
// landing on the other face. Bursts are irregular on purpose.
const HOLD_MS_MIN = 1600;
const HOLD_MS_MAX = 3200;
const BURST_CUTS_MIN = 3;
const BURST_CUTS_MAX = 6;
const BURST_STEP_MS = 70;

/**
 * Ace's face flash-cutting between two frames with a broken-signal jitter:
 * hard swaps (never crossfades), plus a clip-sliced RGB-split flicker during
 * each burst so the swap reads as a glitch rather than a blink.
 */
function GlitchFace() {
  const [frame, setFrame] = useState(0);
  const [bursting, setBursting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const schedule = () => {
      const hold = HOLD_MS_MIN + Math.random() * (HOLD_MS_MAX - HOLD_MS_MIN);
      timer.current = setTimeout(() => {
        if (media.matches) {
          // Reduced motion: single clean swap, no flicker burst.
          setFrame(f => (f + 1) % FACE_FRAMES.length);
          schedule();
          return;
        }
        const cuts = BURST_CUTS_MIN + Math.floor(Math.random() * (BURST_CUTS_MAX - BURST_CUTS_MIN + 1));
        setBursting(true);
        let i = 0;
        const cut = () => {
          setFrame(f => (f + 1) % FACE_FRAMES.length);
          i += 1;
          if (i < cuts) {
            timer.current = setTimeout(cut, BURST_STEP_MS + Math.random() * 50);
          } else {
            setBursting(false);
            schedule();
          }
        };
        cut();
      }, hold);
    };

    schedule();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={bursting ? 'bwa-glitch-burst' : undefined}
      style={{ position: 'relative', width: 'clamp(140px, 22vw, 220px)', aspectRatio: '1 / 1' }}
    >
      {FACE_FRAMES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="220px"
          priority={i === 0}
          style={{
            objectFit: 'contain',
            // Hard cut: visibility swap, no opacity transition anywhere.
            visibility: frame === i ? 'visible' : 'hidden',
          }}
        />
      ))}
      {/* Sliced ghost copies only exist mid-burst — the RGB-split flicker. */}
      {bursting && (
        <>
          <Image
            src={FACE_FRAMES[(frame + 1) % FACE_FRAMES.length]}
            alt=""
            fill
            sizes="220px"
            style={{
              objectFit: 'contain',
              clipPath: 'polygon(0 12%, 100% 12%, 100% 34%, 0 34%)',
              transform: 'translateX(-6px)',
              filter: 'drop-shadow(2px 0 0 rgba(211,60,36,0.85))',
            }}
          />
          <Image
            src={FACE_FRAMES[frame]}
            alt=""
            fill
            sizes="220px"
            style={{
              objectFit: 'contain',
              clipPath: 'polygon(0 58%, 100% 58%, 100% 74%, 0 74%)',
              transform: 'translateX(7px)',
              filter: 'drop-shadow(-2px 0 0 rgba(57,78,189,0.85))',
            }}
          />
        </>
      )}
    </div>
  );
}

export const Hero = ({
  heading = FALLBACK_CONTENT.hero.heading,
  subheading = FALLBACK_CONTENT.hero.subheading,
}: {
  heading?: string;
  subheading?: string;
}) => {
  const personalized = usePersonalizeCycle();

  return (
    <section
      id="top"
      data-nav-theme="light"
      className="bwa-surface relative flex min-h-[100svh] w-full flex-col items-center justify-center px-[24px] pb-[64px] pt-[96px] text-center sm:px-[40px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="relative z-10 flex flex-col items-center"
      >
        <GlitchFace />

        <p className="mb-4 mt-8 font-subhead text-[12px] font-bold uppercase tracking-[0.16em] text-[#D33C24]">
          Build with ASES · ASES Manila
        </p>

        <h1 className="m-0 max-w-[16ch] font-display text-[clamp(38px,7.5vw,88px)] font-[350] leading-[1.02] tracking-[-0.02em] text-[#0C143F]">
          {/* *Starred* span renders bold AND red. "students"/"they're" briefly
              swap to "you"/"you're" on a timer (usePersonalizeCycle above). */}
          {heading.split('*').map((part, i) =>
            i % 2 === 1 ? (
              /^students$/i.test(part) ? (
                <SwapWord
                  key={i}
                  base={part}
                  swapped="you"
                  active={personalized}
                  className="text-[#D33C24]"
                  style={{ fontWeight: 900 }}
                />
              ) : (
                <b key={i} className="text-[#D33C24]" style={{ fontWeight: 900 }}>{part}</b>
              )
            ) : (
              <Fragment key={i}>
                <PronounSegment text={part} active={personalized} />
              </Fragment>
            )
          )}
        </h1>

        <p className="mt-6 max-w-[52ch] font-body text-[clamp(14px,1.7vw,17px)] font-normal leading-[1.7] text-[rgba(12,20,63,0.75)]">
          {subheading}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/application"
            className="button-float-hover inline-flex items-center gap-3 rounded-none bg-[#D33C24] px-[28px] py-[15px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-white no-underline transition-colors hover:bg-[#BF351E]"
          >
            <span>Apply to build</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0">
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </Link>
          <a
            href="#projects"
            className="button-float-hover inline-flex items-center gap-3 rounded-none border border-[rgba(12,20,63,0.3)] px-[28px] py-[14px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-[#0C143F] no-underline transition-colors hover:border-[#0C143F]"
          >
            See what got built
          </a>
        </div>
      </motion.div>

      <style>{`
        @keyframes bwa-glitch-shake {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(4px, -2px); }
          60% { transform: translate(-2px, -3px); }
          80% { transform: translate(3px, 1px); }
          100% { transform: translate(0, 0); }
        }
        .bwa-glitch-burst {
          animation: bwa-glitch-shake 0.12s steps(2, end) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bwa-glitch-burst { animation: none; }
        }
      `}</style>
    </section>
  );
};
