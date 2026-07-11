'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

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
    return () => mq.removeEventListener('change', update);
  }, []);

  // Parts cover the sheet only on desktop; hover (or keyboard focus) parts them.
  const parted = !desktop || hovered;
  const revealed = parted;

  return (
    <section
      id="apply"
      data-nav-theme="dark"
      className="relative w-full overflow-hidden px-[24px] py-[80px] sm:px-[48px] lg:py-[112px]"
      style={{
        // Parent site's navy CTA surface: light-blue grid on a deep radial navy.
        backgroundImage:
          'linear-gradient(rgba(163,205,254,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(163,205,254,0.12) 1px, transparent 1px), radial-gradient(ellipse at 50% 30%, #0D3B8B 0%, #071F6B 40%, #030E3D 70%)',
        backgroundSize: '48px 48px, 48px 48px, 100% 100%',
        backgroundAttachment: 'fixed, fixed, scroll',
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1152px]">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="m-0 text-center font-subhead text-[12px] font-bold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]"
        >
          Your seat in the room is one form away
        </motion.p>

        {/* ── The blueprint button, flanked/covered by loose parts ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
          className="relative mt-[40px] flex items-center justify-center"
        >
          {/* Left cover parts */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/2 z-20 w-[38%] max-w-[380px] lg:w-[34%]"
            initial={false}
            animate={{
              x: parted ? '-58%' : '-8%',
              y: '-50%',
              rotate: parted ? -10 : -4,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: easeOut }}
          >
            <Image
              src="/images/ace-group-parts_1.png"
              alt=""
              width={977}
              height={878}
              sizes="(max-width: 1024px) 40vw, 380px"
              style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}
            />
          </motion.div>

          {/* Right cover parts — mirrored copy */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 z-20 w-[38%] max-w-[380px] lg:w-[34%]"
            initial={false}
            animate={{
              x: parted ? '58%' : '8%',
              y: '-50%',
              rotate: parted ? 10 : 4,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: easeOut }}
          >
            <Image
              src="/images/ace-group-parts_1.png"
              alt=""
              width={977}
              height={878}
              sizes="(max-width: 1024px) 40vw, 380px"
              style={{ width: '100%', height: 'auto', transform: 'scaleX(-1)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}
            />
          </motion.div>

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
            <motion.div
              className="relative overflow-hidden"
              animate={{ scale: hovered && !reduceMotion ? 1.02 : 1 }}
              transition={{ duration: 0.3, ease: easeOut }}
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}
            >
              <Image
                src="/images/ace-group-parts_3.png"
                alt="ACE v1.0 blueprint sheet"
                width={1000}
                height={587}
                sizes="(max-width: 768px) 92vw, 720px"
                style={{ width: '100%', height: 'auto', display: 'block' }}
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
                  <span>Present or watch — pick your track</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0 transition-transform duration-300 group-hover:translate-x-[4px]">
                    <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </span>
              </div>
            </motion.div>
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
          <p className="m-0 font-display text-[clamp(16px,2.4vw,24px)] font-light leading-[1.4] text-[rgba(255,255,255,0.9)]">
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
