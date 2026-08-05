'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

/** A responsive, image-led application CTA with accessible live copy. */
export const CtaSection = () => {
  return (
    <section
      id="apply"
      data-nav-theme="light"
      className="bwa-surface relative w-full overflow-hidden py-[80px] lg:py-[112px]"
    >
      <div className="relative z-10 w-full">

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="m-0 px-[24px] text-center font-display text-[clamp(24px,4.5vw,44px)] font-[350] leading-[1.15] tracking-[-0.01em] text-[#0C143F] sm:px-[48px]"
        >
          Your seat in the room is one form away
        </motion.h2>

        {/* Clear, responsive campaign image with live HTML copy for accessibility and SEO. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
          className="relative mt-[32px] flex w-full items-center justify-center sm:mt-[40px]"
        >
          <Link
            href="/application"
            className="group relative z-10 block min-h-[360px] w-full overflow-hidden border-y-2 border-[#0C143F] bg-[#0C143F] shadow-[0_24px_70px_rgba(12,20,63,0.22)] outline-offset-4 sm:min-h-[460px] lg:min-h-[540px]"
          >
            <Image
              src="/images/build-with-ases-cta-v2.png"
              alt="Filipino student builders collaborating on prototypes at a Build with ASES workshop"
              fill
              sizes="100vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,14,61,0.34),rgba(3,14,61,0.62)_34%,rgba(3,14,61,0.72)_50%,rgba(3,14,61,0.62)_66%,rgba(3,14,61,0.34))]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center sm:px-12">
              <span className="font-subhead text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 sm:text-[12px]">
                Applications are open
              </span>
              <span
                className="max-w-[15ch] font-display text-[clamp(30px,6vw,58px)] font-[700] leading-[1.04] tracking-[-0.02em] text-white"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.55)' }}
              >
                Apply to build with ASES
              </span>
              <span className="inline-flex min-h-[48px] items-center gap-2 bg-[#D33C24] px-5 py-3 font-subhead text-[clamp(11px,1.4vw,13px)] font-bold uppercase tracking-[0.14em] text-white transition-colors group-hover:bg-[#BF351E]">
                <span>Present or watch. Pick your track</span>
                <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0 transition-transform duration-300 group-hover:translate-x-[4px]">
                  <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </span>
            </div>
          </Link>
        </motion.div>

        {/* ── Small membership CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.2 }}
          className="mt-[64px] flex flex-col items-center gap-4 px-[24px] text-center sm:px-[48px]"
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
