'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

// ─── Ordered-dither overlay for the blueprint button ───────────────────────
// Classic 4x4 Bayer matrix, rendered as hard-edged 4px navy squares (not
// soft dots) so it reads as a technical print-screen/pixel texture rather
// than a photo. Multiply-blended over the button image: it breaks up the
// source render's smooth gradients (masking its low-res softness) while
// adding the harsh-edge, schematic grain that matches the blueprint theme.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

const ditherCellOpacity = (v: number) => (0.12 + (v / 15) * 0.55).toFixed(2);

const DITHER_TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${BAYER_4X4.map((row, y) =>
  row.map((v, x) => `<rect x="${x * 4}" y="${y * 4}" width="4" height="4" fill="#0C143F" fill-opacity="${ditherCellOpacity(v)}"/>`).join(''),
).join('')}</svg>`;

const DITHER_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(DITHER_TILE_SVG)}")`;

/**
 * The apply CTA: the ACE v1.0 blueprint sheet (ace-group-parts_3) is the
 * button. On desktop it arrives covered by piles of loose Ace parts
 * (ace-group-parts_1, mirrored on the right); hovering slides the parts
 * apart, tints the sheet red, and reveals "Apply to build with ASES".
 * On mobile the parts are pushed to the screen edges from the start and the
 * label is always visible.
 */
export const CtaSection = () => {
  const [hovered, setHovered] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    // Some environments (emulated viewports, older WebKit) don't reliably
    // fire matchMedia change events — resize is the belt to that braces.
    window.addEventListener('resize', update, { passive: true });
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Parts cover the sheet only on desktop; hover (or keyboard focus) parts them.
  const parted = !desktop || hovered;
  const revealed = parted;

  return (
    <section
      id="apply"
      data-nav-theme="light"
      className="bwa-surface relative w-full overflow-hidden px-[24px] py-[80px] sm:px-[48px] lg:py-[112px]"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1152px]">

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="m-0 text-center font-display text-[clamp(24px,4.5vw,44px)] font-[350] leading-[1.15] tracking-[-0.01em] text-[#0C143F]"
        >
          Your seat in the room is one form away
        </motion.h2>

        {/* ── The blueprint button, flanked/covered by loose parts ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
          className="relative mt-[40px] flex items-center justify-center"
        >
          {/* Left cover parts — plain CSS transition (framer's animate prop
              stalls on these after hydration; inline style updates don't). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/2 z-20 w-[38%] max-w-[380px] lg:w-[34%]"
            style={{
              transform: `translate(${parted ? '-58%' : '-8%'}, -50%) rotate(${parted ? -10 : -4}deg)`,
              transition: reduceMotion ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <Image
              src="/images/ace-group-parts_1.png"
              alt=""
              width={977}
              height={878}
              sizes="(max-width: 1024px) 40vw, 380px"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>

          {/* Right cover parts — mirrored copy */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 z-20 w-[38%] max-w-[380px] lg:w-[34%]"
            style={{
              transform: `translate(${parted ? '58%' : '8%'}, -50%) rotate(${parted ? 10 : 4}deg)`,
              transition: reduceMotion ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <Image
              src="/images/ace-group-parts_1.png"
              alt=""
              width={977}
              height={878}
              sizes="(max-width: 1024px) 40vw, 380px"
              style={{ width: '100%', height: 'auto', transform: 'scaleX(-1)' }}
            />
          </div>

          {/* The button itself */}
          <Link
            href="/application"
            aria-label="Apply to build with ASES"
            className="group relative z-10 block w-full max-w-[720px] outline-offset-4"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
          >
            <div
              className="relative overflow-hidden"
              style={{
                transform: hovered && !reduceMotion ? 'scale(1.02)' : 'scale(1)',
                transition: reduceMotion ? 'none' : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <Image
                src="/images/ace-group-parts_3.png"
                alt="ACE v1.0 blueprint sheet"
                width={1000}
                height={587}
                sizes="(max-width: 768px) 92vw, 720px"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />

              {/* Ordered-dither texture, always on — masks the source
                  render's softness and reads as a printed schematic screen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: DITHER_BACKGROUND,
                  backgroundSize: '16px 16px',
                  backgroundRepeat: 'repeat',
                  mixBlendMode: 'multiply',
                  imageRendering: 'pixelated',
                }}
              />

              {/* Red tint sweeps in on hover */}
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(211,60,36,0.82) 0%, rgba(154,41,23,0.88) 100%)',
                  mixBlendMode: 'hard-light',
                  opacity: hovered ? 1 : 0,
                }}
              />

              {/* Label — always on for mobile, revealed on hover for web */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center transition-opacity duration-300"
                style={{
                  opacity: revealed ? 1 : 0,
                  background: hovered ? 'transparent' : 'rgba(3,14,61,0.45)',
                }}
              >
                <span
                  className="font-display text-[clamp(20px,4.5vw,44px)] font-[700] leading-[1.05] tracking-[-0.01em] text-white"
                  style={{ textShadow: '0 4px 24px rgba(0,0,0,0.55)' }}
                >
                  Apply to build with ASES
                </span>
                <span className="inline-flex items-center gap-2 font-subhead text-[clamp(10px,1.4vw,13px)] font-bold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.85)]">
                  <span>Present or watch. Pick your track</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0 transition-transform duration-300 group-hover:translate-x-[4px]">
                    <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── Small membership CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.2 }}
          className="mt-[64px] flex flex-col items-center gap-4 text-center"
        >
          <p className="m-0 font-display text-[clamp(16px,2.4vw,24px)] font-light leading-[1.4] text-[#0C143F]">
            Liked the room?
          </p>
          <a
            href="https://www.asesmanila.com/membership"
            target="_blank"
            rel="noopener noreferrer"
            className="button-float-hover inline-flex items-center gap-3 rounded-none bg-[#D33C24] px-[26px] py-[14px] font-display text-[clamp(13px,1.6vw,16px)] font-[350] tracking-[0.03em] text-white no-underline transition-colors hover:bg-[#BF351E]"
          >
            <span>Now imagine if you joined ASES</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0">
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
