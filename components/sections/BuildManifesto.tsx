'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { FALLBACK_CONTENT } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// ─── Floating Ace parts ──────────────────────────────────────────────────────
// parts 1–4 hover on both sides of the section: arm + gear left, boot + brick
// right, each with its own drift cadence and a slow scroll parallax.
const SIDE_PARTS = [
  { src: '/images/ace-parts_1.png', side: 'left', top: '12%', width: 'clamp(120px, 16vw, 260px)', drift: 14, duration: 5.2, rotate: -8, parallax: -40 },
  { src: '/images/ace-parts_3.png', side: 'left', top: '58%', width: 'clamp(80px, 10vw, 170px)', drift: 10, duration: 4.1, rotate: 12, parallax: -90 },
  { src: '/images/ace-parts_2.png', side: 'right', top: '18%', width: 'clamp(110px, 14vw, 230px)', drift: 12, duration: 4.7, rotate: 6, parallax: -70 },
  { src: '/images/ace-parts_4.png', side: 'right', top: '62%', width: 'clamp(90px, 11vw, 180px)', drift: 16, duration: 5.8, rotate: -10, parallax: -30 },
] as const;

// ─── Word rotation (left-aligned lines) ─────────────────────────────────────
const WORD_INTERVAL_MS = 2200;

function RotatingWord({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % words.length), WORD_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    // Hard swap on a key change — flash cut, not a fade. The red keeps the
    // changing word reading as the marker-accented part of the line.
    <span key={idx} className="text-[#D33C24]">
      {words[idx]}
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
    // Fixed-slot inline stack sized by the widest style so the line never
    // reflows while the word cuts between universes.
    <span className="relative inline-grid align-baseline" style={{ whiteSpace: 'nowrap' }}>
      <span aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1', ...BUILD_STYLES[0] }}>
        {word}
      </span>
      {/* No AnimatePresence, no transition — a keyed hard swap is the cut. */}
      <span key={idx} style={{ gridArea: '1 / 1', ...BUILD_STYLES[idx] }}>
        {word}
      </span>
    </span>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────
export const BuildManifesto = ({
  adjectives = FALLBACK_CONTENT.manifesto.adjectives,
  steadyLine = FALLBACK_CONTENT.manifesto.steadyLine,
  purposes = FALLBACK_CONTENT.manifesto.purposes,
}: {
  adjectives?: string[];
  steadyLine?: string;
  purposes?: string[];
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      data-nav-theme="light"
      className="relative w-full overflow-hidden py-[120px] lg:py-[180px]"
      style={{
        backgroundColor: '#FFFFFF',
        backgroundImage:
          'linear-gradient(rgba(7,31,107,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(7,31,107,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hovering Ace parts on both sides */}
      {SIDE_PARTS.map(part => (
        <FloatingPart key={part.src} part={part} progress={scrollYProgress} reduceMotion={!!reduceMotion} />
      ))}

      {/* Left-aligned manifesto lines */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-[24px] sm:px-[48px] lg:px-[80px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="flex flex-col gap-[18px] text-left font-display text-[clamp(26px,4.6vw,56px)] font-[350] leading-[1.12] tracking-[-0.015em] text-[#0C143F]"
        >
          <p className="m-0">
            Build like <RotatingWord words={adjectives} />
          </p>
          <p className="m-0">{steadyLine}</p>
          <p className="m-0">
            Build cause <RotatingWord words={purposes} />
          </p>
        </motion.div>

        {/* Center: the big one */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
          className="mt-[100px] text-center lg:mt-[160px]"
        >
          <h2 className="m-0 font-display text-[clamp(40px,8.5vw,110px)] font-[700] leading-[1.02] tracking-[-0.02em] text-[#0C143F]">
            <FlashCutBuild word="Build" /> with ASES
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

function FloatingPart({
  part,
  progress,
  reduceMotion,
}: {
  part: (typeof SIDE_PARTS)[number];
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  reduceMotion: boolean;
}) {
  // Slow upward parallax as the section scrolls through the viewport.
  const y = useTransform(progress, [0, 1], [0, part.parallax]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute z-0"
      style={{
        top: part.top,
        width: part.width,
        y: reduceMotion ? 0 : y,
        // Parts bleed slightly off-screen on mobile so text keeps the room.
        ...(part.side === 'left'
          ? { left: 'clamp(-48px, -2vw, 0px)' }
          : { right: 'clamp(-48px, -2vw, 0px)' }),
      }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -part.drift, 0], rotate: [part.rotate, part.rotate + 3, part.rotate] }}
        transition={{ duration: part.duration, ease: 'easeInOut', repeat: Infinity }}
        style={{ rotate: part.rotate }}
      >
        <Image
          src={part.src}
          alt=""
          width={600}
          height={600}
          sizes="260px"
          style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 18px 36px rgba(12,20,63,0.18))' }}
        />
      </motion.div>
    </motion.div>
  );
}
