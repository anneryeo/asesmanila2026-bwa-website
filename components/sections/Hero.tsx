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

/** Illustrated Ace, matching the character treatment used on the main site. */
function HeroAce() {
  return (
    <motion.div aria-hidden="true" className="relative w-[clamp(138px,20vw,230px)]" initial={{ rotate: -2, y: 8 }} animate={{ rotate: [-2, 1, -2], y: [8, 0, 8] }} transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}>
      <div className="absolute -left-[38%] top-[12%] rotate-[-8deg] border-2 border-[#0C143F] bg-[#FFE07A] px-3 py-2 font-subhead text-[9px] font-black uppercase tracking-[0.14em] text-[#0C143F] shadow-[4px_4px_0_#D33C24] sm:text-[10px]">Built, not polished</div>
      <div className="absolute -right-[34%] top-[4%] rotate-[7deg] border border-[#0C143F] bg-white px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#0C143F] shadow-[3px_3px_0_#112F7F]">BWA / MNL<br />Field unit 001</div>
      <Image src="/images/ace-stand.webp" alt="" width={1000} height={1000} sizes="230px" priority className="relative z-10 block h-auto w-full drop-shadow-[8px_10px_0_rgba(17,47,127,0.18)]" />
      <span className="absolute bottom-[4%] left-1/2 z-20 h-[18px] w-[72%] -translate-x-1/2 rotate-[-3deg] bg-[rgba(211,60,36,0.82)] opacity-85" />
    </motion.div>
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
      <div aria-hidden="true" className="pointer-events-none absolute left-[5%] top-[22%] hidden rotate-[-7deg] border-2 border-[#112F7F] bg-white px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#112F7F] shadow-[6px_6px_0_#B9C5E8] md:block">SHOW THE UGLY V1<br />→ GET THE USEFUL NOTE</div>
      <div aria-hidden="true" className="pointer-events-none absolute right-[5%] top-[28%] hidden rotate-[9deg] rounded-full border-[3px] border-[#D33C24] px-4 py-5 font-subhead text-[10px] font-black uppercase tracking-[0.1em] text-[#D33C24] md:block">No pitch<br />theatre</div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="relative z-10 flex w-full max-w-[1120px] flex-col items-center"
      >
        <HeroAce />

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
            className="button-float-hover inline-flex min-h-[52px] rotate-[-1deg] items-center justify-center gap-3 rounded-none border-2 border-[#0C143F] bg-[#D33C24] px-[24px] py-[14px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-white no-underline shadow-[5px_5px_0_#0C143F] transition-colors hover:bg-[#BF351E] sm:px-[28px] sm:py-[15px]"
          >
            <span>Apply to build</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0">
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </Link>
          <a
            href="#projects"
            className="button-float-hover inline-flex min-h-[52px] rotate-[1deg] items-center justify-center gap-3 rounded-none border-2 border-[#0C143F] bg-white px-[24px] py-[13px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-[#0C143F] no-underline shadow-[5px_5px_0_#B9C5E8] transition-colors sm:px-[28px] sm:py-[14px]"
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
