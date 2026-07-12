'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const SOCIAL_ICONS = [
  {
    label: 'Facebook',
    url: 'https://www.facebook.com/asesmnl',
    path: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/asesmanila/',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/asesmanila/posts/?feedView=all',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    viewBox: '0 0 24 24',
  },
] as const;

export function Footer() {
  return (
    <footer
      data-nav-theme="light"
      className="bwa-surface relative overflow-hidden px-[24px] pb-[0px] pt-[48px] sm:px-[48px] lg:px-[80px]"
    >
      <div className="mx-auto w-full max-w-[1152px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Mobile layout ── */}
          <div className="flex flex-col items-center gap-[32px] pb-0 text-center lg:hidden">
            {/* Logo + tagline */}
            <div className="flex flex-col items-center gap-[12px]">
              <Image
                src="/images/ases-logotext-blue.png"
                alt="ASES Manila"
                width={1541}
                height={512}
                className="h-[60px] w-auto max-w-[320px]"
              />
              <p className="font-display font-extralight text-[16px] leading-[1.6] text-[#0C143F] max-w-[240px] whitespace-pre-line">
                {`Anyone can build.\nStart before you're ready`}
              </p>
            </div>

            {/* Social icons */}
            <div className="flex flex-col items-center gap-[12px]">
              <span className="font-subhead text-[20px] font-[350] uppercase tracking-[0.14em] text-[#0C143F]">
                Connect
              </span>
              <div className="flex gap-[20px]">
                {SOCIAL_ICONS.map(({ label, url, path, viewBox }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{ opacity: 1, transition: 'opacity 0.2s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.65'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
                  >
                    <svg viewBox={viewBox} width={36} height={36} fill="#112F7F" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Mascot — mobile, sits at the bottom flush */}
            <div aria-hidden="true" className="leading-[0]">
              <Image
                src="/images/ace-broken1.webp"
                alt=""
                width={1000}
                height={1000}
                className="block h-[160px] w-auto -scale-x-100"
              />
            </div>
          </div>

          {/* ── Desktop layout: items aligned to bottom ── */}
          <div className="hidden lg:flex flex-row items-end justify-between">
            {/* Left — logo + tagline */}
            <div className="flex flex-col items-start gap-[16px] pb-[48px]">
              <Image
                src="/images/ases-logotext-blue.png"
                alt="ASES Manila"
                width={1541}
                height={512}
                className="h-[60px] w-auto max-w-[400px]"
              />
              <p className="font-display font-extralight text-[16px] leading-[1.6] text-[#0C143F] max-w-[260px] whitespace-pre-line">
                {`Anyone can build.\nStart before you're ready`}
              </p>
            </div>

            {/* Center — Connect + social icons */}
            <div className="flex flex-col items-start gap-[16px] pb-[48px]">
              <span className="font-subhead text-[22px] font-[350] uppercase tracking-[0.14em] text-[#0C143F]">
                Connect
              </span>
              <div className="flex gap-[20px]">
                {SOCIAL_ICONS.map(({ label, url, path, viewBox }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{ opacity: 1, transition: 'opacity 0.2s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.65'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
                  >
                    <svg viewBox={viewBox} width={36} height={36} fill="#112F7F" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Right — Ace mascot, bottom of image touches the footer edge */}
            <div aria-hidden="true" className="leading-[0]">
              <Image
                src="/images/ace-broken1.webp"
                alt=""
                width={1000}
                height={1000}
                className="block h-[clamp(160px,18vw,260px)] w-auto -scale-x-100"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
