'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FALLBACK_CONTENT } from '@/content/bwaContent';
import { withMontserratNumbers } from '@/components/ui/Emphasis';

const easeOut = [0.22, 1, 0.36, 1] as const;

// Every so often the headline turns personal: "students" -> "you",
// "they're" -> "you're", then reverts. Each transition is a quick glitch
// burst (same mechanic as GlitchFace below), not a hard instant cut, so it
// reads as the headline briefly losing signal rather than snapping.
const PERSONALIZE_INTERVAL_MS = 8000;
const PERSONALIZE_DURATION_MS_MIN = 3000;
const PERSONALIZE_DURATION_MS_MAX = 4000;
const PERSONALIZE_BURST_CUTS_MIN = 3;
const PERSONALIZE_BURST_CUTS_MAX = 6;
const PERSONALIZE_BURST_STEP_MS = 70;

/**
 * Drives the headline personalization: `shown` is the word currently
 * displayed (false = base, true = swapped); `bursting` is true only during
 * the brief flicker between states. Every transition flickers rapidly
 * between base/swapped a few times before landing on the target — a hard
 * keyed swap each step (never a crossfade), so exactly one text node is
 * ever in the DOM, same guarantee as the manifesto's SlotWord.
 */
function usePersonalizeGlitch(): { shown: boolean; bursting: boolean } {
  const [shown, setShown] = useState(false);
  const [bursting, setBursting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const glitchTo = (target: boolean, onDone: () => void) => {
      if (media.matches) {
        // Reduced motion: single clean swap, no flicker burst.
        setShown(target);
        onDone();
        return;
      }
      setBursting(true);
      const cuts = PERSONALIZE_BURST_CUTS_MIN + Math.floor(Math.random() * (PERSONALIZE_BURST_CUTS_MAX - PERSONALIZE_BURST_CUTS_MIN + 1));
      let i = 0;
      const cut = () => {
        i += 1;
        // Every intermediate cut flickers; the final cut always lands on target.
        setShown(i >= cuts ? target : s => !s);
        if (i < cuts) {
          timer.current = setTimeout(cut, PERSONALIZE_BURST_STEP_MS + Math.random() * 40);
        } else {
          setBursting(false);
          onDone();
        }
      };
      cut();
    };

    const cycle = () => {
      timer.current = setTimeout(() => {
        glitchTo(true, () => {
          const duration = PERSONALIZE_DURATION_MS_MIN + Math.random() * (PERSONALIZE_DURATION_MS_MAX - PERSONALIZE_DURATION_MS_MIN);
          timer.current = setTimeout(() => glitchTo(false, cycle), duration);
        });
      }, PERSONALIZE_INTERVAL_MS);
    };

    cycle();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  return { shown, bursting };
}

/**
 * A word that swaps to an alternate for a beat, then reverts. Reserves a
 * fixed-width slot sized to the longer of the two variants so the swap
 * never reflows the surrounding headline. While `bursting`, it reuses the
 * same shake animation as GlitchFace and adds a red/blue chromatic
 * text-shadow so the flicker reads as a glitch, not a stutter.
 */
function SwapWord({
  base,
  swapped,
  shown,
  bursting,
  className,
  style,
}: {
  base: string;
  swapped: string;
  shown: boolean;
  bursting: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const longest = base.length >= swapped.length ? base : swapped;
  return (
    <span
      className={`relative inline-grid align-baseline${bursting ? ' bwa-glitch-burst' : ''}`}
      style={{ whiteSpace: 'nowrap' }}
    >
      <span aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1', ...style }}>
        {longest}
      </span>
      <span
        key={shown ? 'swapped' : 'base'}
        className={className}
        style={{
          gridArea: '1 / 1',
          ...style,
          textShadow: bursting ? '2px 0 0 rgba(211,60,36,0.55), -2px 0 0 rgba(57,78,189,0.55)' : undefined,
        }}
      >
        {shown ? swapped : base}
      </span>
    </span>
  );
}

/**
 * Renders a plain heading segment, swapping "they're" -> "you're" mid-flow
 * when shown. Numbers (this heading is CMS-editable) still render in
 * Montserrat per the brand rule — see components/ui/Emphasis.
 */
function PronounSegment({ text, shown, bursting }: { text: string; shown: boolean; bursting: boolean }) {
  const match = text.match(/they're/i);
  if (!match || match.index === undefined) return <>{withMontserratNumbers(text, 'ps')}</>;
  const before = text.slice(0, match.index);
  const word = match[0];
  const after = text.slice(match.index + word.length);
  return (
    <>
      {withMontserratNumbers(before, 'ps-before')}
      <SwapWord base={word} swapped="you're" shown={shown} bursting={bursting} />
      {withMontserratNumbers(after, 'ps-after')}
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
      style={{ position: 'relative', width: 'clamp(104px, 19vw, 220px)', aspectRatio: '1 / 1' }}
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
  const { shown: personalized, bursting: personalizing } = usePersonalizeGlitch();

  return (
    <section
      id="top"
      data-nav-theme="light"
      className="bwa-surface relative flex min-h-[100svh] w-full flex-col items-center justify-center px-[20px] pb-[72px] pt-[112px] text-center sm:px-[40px] sm:pb-[88px] sm:pt-[120px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="relative z-10 flex w-full max-w-[1120px] flex-col items-center"
      >
        <GlitchFace />

        <p className="mb-3 mt-5 font-subhead text-[10px] font-bold uppercase tracking-[0.14em] text-[#D33C24] sm:mb-4 sm:mt-8 sm:text-[12px] sm:tracking-[0.16em]">
          Build with ASES · ASES Manila
        </p>

        <h1 className="m-0 max-w-[16ch] break-words font-display text-[clamp(32px,10vw,88px)] font-[350] leading-[1.04] tracking-[-0.02em] text-[#0C143F] sm:leading-[1.02]">
          {/* *Starred* span renders bold AND red. "students"/"they're" briefly
              glitch into "you"/"you're" on a timer (usePersonalizeGlitch above). */}
          {heading.split('*').map((part, i) =>
            i % 2 === 1 ? (
              /^students$/i.test(part) ? (
                <SwapWord
                  key={i}
                  base={part}
                  swapped="you"
                  shown={personalized}
                  bursting={personalizing}
                  className="text-[#D33C24]"
                  style={{ fontWeight: 900 }}
                />
              ) : (
                <b key={i} className="text-[#D33C24]" style={{ fontWeight: 900 }}>
                  {withMontserratNumbers(part, `b${i}`)}
                </b>
              )
            ) : (
              <Fragment key={i}>
                <PronounSegment text={part} shown={personalized} bursting={personalizing} />
              </Fragment>
            )
          )}
        </h1>

        <p className="mt-5 max-w-[52ch] font-body text-[clamp(14px,1.7vw,17px)] font-normal leading-[1.6] text-[rgba(12,20,63,0.75)] sm:mt-6 sm:leading-[1.7]">
          {subheading}
        </p>

        <div className="mt-8 flex w-full max-w-[420px] flex-col items-stretch justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href="/application"
            className="button-float-hover inline-flex min-h-[52px] items-center justify-center gap-3 rounded-none bg-[#D33C24] px-[24px] py-[14px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-white no-underline transition-colors hover:bg-[#BF351E] sm:px-[28px] sm:py-[15px]"
          >
            <span>Apply to build</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0">
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </Link>
          <a
            href="#projects"
            className="button-float-hover inline-flex min-h-[52px] items-center justify-center gap-3 rounded-none border border-[rgba(12,20,63,0.3)] bg-white/70 px-[24px] py-[13px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-[#0C143F] no-underline transition-colors hover:border-[#0C143F] sm:px-[28px] sm:py-[14px]"
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
