'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';
import { FALLBACK_CONTENT } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// ─── Slot-machine word ──────────────────────────────────────────────────────
// The ending of each manifesto line spins like a slot reel: hold on a word,
// then rip through the list with hard cuts until it lands on the next one.
// Same flash-cut mechanic as the "Build" wordmark, but the WORD changes while
// the style stays put.
const SLOT_HOLD_MS_MIN = 2100;
const SLOT_HOLD_MS_MAX = 3200;
const SLOT_STEP_MS = 75;

function SlotWord({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const schedule = () => {
      const hold = SLOT_HOLD_MS_MIN + Math.random() * (SLOT_HOLD_MS_MAX - SLOT_HOLD_MS_MIN);
      timer.current = setTimeout(() => {
        if (reduceMotion) {
          // Reduced motion: clean single swap, no reel spin.
          setIdx(i => (i + 1) % words.length);
          schedule();
          return;
        }
        // Spin one full lap plus one so the reel visibly rolls through
        // every word and lands on the NEXT one.
        let steps = words.length + 1;
        const spin = () => {
          setIdx(i => (i + 1) % words.length);
          steps -= 1;
          if (steps > 0) {
            timer.current = setTimeout(spin, SLOT_STEP_MS);
          } else {
            schedule();
          }
        };
        spin();
      }, hold);
    };
    schedule();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [words.length, reduceMotion]);

  return (
    // Fixed-slot inline stack: every word is stacked invisibly in the same
    // grid cell so the box sizes to the widest ACTUAL rendered word (numerals
    // get bumped to a bigger Montserrat span via Emphasis, so char-length is
    // not a reliable proxy for width). The line never reflows while the reel
    // spins. Keyed hard swap = the cut.
    <span className="relative inline-grid text-left align-baseline" style={{ whiteSpace: 'nowrap' }}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1' }}>
          <Emphasis text={word} />
        </span>
      ))}
      <span key={idx} className="text-[#D33C24]" style={{ gridArea: '1 / 1' }}>
        <Emphasis text={words[idx]} />
      </span>
    </span>
  );
}

// ─── EEAAO flash-cut "Build" ────────────────────────────────────────────────
// The word "Build" jumps between wildly different typographic universes with
// hard cuts: hold, then a burst of rapid swaps landing on the next style.
const BUILD_STYLES: React.CSSProperties[] = [
  { fontFamily: 'var(--font-cocogoose)', fontWeight: 900, color: '#D33C24' },
  { fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontStyle: 'italic', color: '#112F7F' },
  { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontStyle: 'italic', color: '#C99700' },
  { fontFamily: 'var(--font-mono), monospace', fontWeight: 700, color: '#0B1F4B', letterSpacing: '0.04em' },
  { fontFamily: 'var(--font-cocogoose)', fontWeight: 900, color: 'transparent', WebkitTextStroke: '3px #D33C24' },
  { fontFamily: 'var(--font-montserrat)', fontWeight: 900, textTransform: 'uppercase', color: '#3B6FD4' },
  { fontFamily: '"Comic Sans MS", "Comic Sans", cursive', fontWeight: 700, color: '#0C143F' },
  { fontFamily: 'var(--font-cocogoose)', fontWeight: 100, fontStyle: 'italic', color: '#0C143F' },
] as const;

const BUILD_HOLD_MS = 1300;
const BUILD_BURST_STEP_MS = 80;
const BUILD_BURST_CUTS = 4;

function FlashCutBuild({ word }: { word: string }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const schedule = () => {
      timer.current = setTimeout(() => {
        if (reduceMotion) {
          setIdx(i => (i + 1) % BUILD_STYLES.length);
          schedule();
          return;
        }
        let cuts = 0;
        const cut = () => {
          setIdx(i => (i + 1 + Math.floor(Math.random() * 2)) % BUILD_STYLES.length);
          cuts += 1;
          if (cuts < BUILD_BURST_CUTS) {
            timer.current = setTimeout(cut, BUILD_BURST_STEP_MS);
          } else {
            schedule();
          }
        };
        cut();
      }, BUILD_HOLD_MS + Math.random() * 700);
    };
    schedule();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [reduceMotion]);

  return (
    // Fixed-slot inline stack: every style is stacked invisibly in the same
    // grid cell so the box sizes to the widest ACTUAL rendered style (the
    // styles swap fonts entirely — serif, mono with letter-spacing, Comic
    // Sans — so no single style is reliably the widest). The line never
    // reflows while the word cuts between universes.
    <span className="relative inline-grid align-baseline" style={{ whiteSpace: 'nowrap' }}>
      {BUILD_STYLES.map((style, i) => (
        <span key={i} aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1', ...style }}>
          {word}
        </span>
      ))}
      {/* No AnimatePresence, no transition. A keyed hard swap is the cut. */}
      <span key={idx} style={{ gridArea: '1 / 1', ...BUILD_STYLES[idx] }}>
        {word}
      </span>
    </span>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────
// The floating Ace parts live in FloatingParts.tsx now, overlaid across the
// hero AND this section from page.tsx so they read as one continuous field.
export const BuildManifesto = ({
  adjectives = FALLBACK_CONTENT.manifesto.adjectives,
  actions = FALLBACK_CONTENT.manifesto.actions,
  purposes = FALLBACK_CONTENT.manifesto.purposes,
}: {
  adjectives?: string[];
  actions?: string[];
  purposes?: string[];
}) => {
  return (
    <section
      id="manifesto"
      data-nav-theme="light"
      className="bwa-surface relative w-full py-[120px] lg:py-[200px]"
    >
      <div aria-hidden="true" className="absolute left-0 top-[9%] hidden h-[34px] w-[clamp(120px,24vw,320px)] rotate-[2deg] bg-[#D33C24] opacity-90 sm:block" />
      <div aria-hidden="true" className="absolute right-[4%] top-[18%] hidden rotate-[6deg] border-2 border-[#0C143F] bg-[#FFE07A] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#0C143F] shadow-[5px_5px_0_#112F7F] sm:block">RULE 01<br />SHIP BEFORE READY</div>
      {/* Left-aligned manifesto lines. Each line holds ONE line: the slot
          holds the longest word's width so nothing ever wraps mid-spin. */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-[24px] sm:px-[48px] lg:px-[80px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="flex -rotate-[0.7deg] flex-col gap-[22px] border-l-[6px] border-[#D33C24] bg-white/75 px-[18px] py-[24px] text-left font-display text-[clamp(16px,4vw,52px)] font-[350] leading-[1.14] tracking-[-0.015em] text-[#0C143F] shadow-[10px_10px_0_rgba(185,197,232,0.55)] sm:gap-[28px] sm:px-[32px]"
        >
          <p className="m-0 whitespace-nowrap">
            Build like <SlotWord words={adjectives} />
          </p>
          <p className="m-0 whitespace-nowrap">
            Build even if you&apos;re <SlotWord words={actions} />
          </p>
          <p className="m-0 whitespace-nowrap">
            Build cause <SlotWord words={purposes} />
          </p>
        </motion.div>

        {/* Center: the big one */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
          className="mt-[140px] rotate-[0.8deg] text-center sm:mt-[180px] lg:mt-[240px]"
        >
          <h2 className="m-0 font-display text-[clamp(40px,8.5vw,110px)] font-[700] leading-[1.02] tracking-[-0.02em] text-[#0C143F]">
            <FlashCutBuild word="Build" /> with ASES
          </h2>
        </motion.div>
      </div>
    </section>
  );
};
