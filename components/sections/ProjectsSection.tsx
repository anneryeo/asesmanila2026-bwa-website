'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';
import { FALLBACK_CONTENT, type BwaProject } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// How many projects sit in the always-visible top row.
const TOP_COUNT = 5;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: easeOut, delay },
});

// ─── Project card ───────────────────────────────────────────────────────────
// Same hard-edged card as the parent site's marquee, but static: resting
// straight, "skirting" on hover — lift, slight tilt, deeper shadow.
const ProjectCard = ({ project, tilt }: { project: BwaProject; tilt: number }) => {
  const isExternal = project.url.startsWith('http');
  return (
    <motion.a
      href={project.url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={`${project.title} — check this out`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ rotate: tilt, y: -10, boxShadow: '0 28px 60px rgba(7,31,107,0.18)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.28, ease: easeOut }}
      className="group flex aspect-[3/4] w-full flex-col overflow-hidden rounded-none border border-[rgba(7,31,107,0.14)] bg-white no-underline shadow-[0_18px_48px_rgba(7,31,107,0.10)]"
    >
      {/* Preview image — 55% */}
      <div className="relative basis-[55%] overflow-hidden bg-[#EDF2FB]">
        <Image
          src={project.previewImage}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Episode batch tag pinned to the photo */}
        <span className="absolute left-3 top-3 bg-[#0C143F] px-[10px] py-[5px] font-subhead text-[10px] font-bold uppercase tracking-[0.1em] text-white">
          {project.batch}
        </span>
      </div>

      {/* Description — 45% */}
      <div className="flex basis-[45%] flex-col justify-between px-[20px] py-[16px]">
        <div>
          <p className="m-0 mb-1 font-subhead text-[10px] font-bold uppercase tracking-[0.12em] text-[rgba(12,20,63,0.5)]">
            {project.industry}
          </p>
          <h3 className="m-0 font-display text-[clamp(16px,2vw,19px)] font-black uppercase leading-[1.05] text-[#0B1F4B]">
            <Emphasis text={project.title} />
          </h3>
          <p className="mb-0 mt-2 line-clamp-3 font-display text-[clamp(12px,1.4vw,13.5px)] font-light leading-[1.5] text-[#0B1F4B]">
            <Emphasis text={project.description} />
          </p>
        </div>

        <div className="flex items-center gap-2 font-display text-[13px] font-[350] tracking-[0.02em] text-[#D33C24]">
          <span>Check this out</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-[1em] w-[1em] shrink-0 transition-transform duration-300 group-hover:translate-x-[4px]"
          >
            <path
              d="M2 8h11M9.5 3.5 14 8l-4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      </div>
    </motion.a>
  );
};

// ─── Filter pill ────────────────────────────────────────────────────────────
const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer rounded-none border px-[14px] py-[7px] font-subhead text-[12px] font-semibold tracking-[0.02em] transition-colors"
    style={{
      borderColor: active ? '#D33C24' : 'rgba(12,20,63,0.25)',
      background: active ? '#D33C24' : 'transparent',
      color: active ? '#ffffff' : 'rgba(12,20,63,0.75)',
    }}
  >
    {label}
  </button>
);

// ─── Section ────────────────────────────────────────────────────────────────
export const ProjectsSection = ({
  heading = FALLBACK_CONTENT.projects.heading,
  subheading = FALLBACK_CONTENT.projects.subheading,
  items = FALLBACK_CONTENT.projects.items,
}: {
  heading?: string;
  subheading?: string;
  items?: BwaProject[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');

  const top = items.slice(0, TOP_COUNT);

  const batches = useMemo(
    () => ['All', ...Array.from(new Set(items.map(p => p.batch)))],
    [items],
  );
  const industries = useMemo(
    () => ['All', ...Array.from(new Set(items.map(p => p.industry)))],
    [items],
  );

  const filtered = items.filter(
    p =>
      (batchFilter === 'All' || p.batch === batchFilter) &&
      (industryFilter === 'All' || p.industry === industryFilter),
  );

  return (
    <section
      id="projects"
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-white py-[72px] lg:py-[96px]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(128,128,128,0.08) 100%), linear-gradient(rgba(7,31,107,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(7,31,107,0.06) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        backgroundAttachment: 'scroll, fixed, fixed',
      }}
    >
      {/* Header — left aligned to the page gutter, like the parent site */}
      <div className="relative z-10 flex w-full flex-wrap items-end justify-between gap-6 px-[24px] sm:px-[40px] lg:px-[64px]">
        <motion.div {...fadeUp(0)}>
          <h2 className="m-0 font-display text-[clamp(24px,4vw,50px)] font-extralight leading-[1.06] tracking-[-0.02em] text-[#112F7F]">
            {heading}
          </h2>
          <p className="mb-0 mt-5 max-w-[64ch] font-display text-[clamp(12px,1.25vw,17px)] font-light leading-[1.55] text-[#112F7F]">
            <Emphasis text={subheading} boldWeight={700} />
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.15)} className="shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="button-float-hover inline-flex cursor-pointer items-center gap-3 rounded-none border-none bg-[#D33C24] px-[26px] py-[14px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-white transition-colors hover:bg-[#BF351E]"
          >
            <span>{expanded ? 'Show less' : 'See more projects'}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="block h-[1em] w-[1em] shrink-0 transition-transform duration-300"
              style={{ transform: expanded ? 'rotate(-90deg)' : 'rotate(90deg)' }}
            >
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Top 5 — always visible */}
      <div className="relative z-10 mt-[44px] grid grid-cols-1 gap-[20px] px-[24px] sm:grid-cols-2 sm:px-[40px] lg:grid-cols-5 lg:px-[64px]">
        {top.map((project, i) => (
          <ProjectCard key={project.title} project={project} tilt={i % 2 === 0 ? -1.6 : 1.4} />
        ))}
      </div>

      {/* See more — full catalogue with batch + industry filters */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="catalogue"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="relative z-10 overflow-hidden"
          >
            <div className="px-[24px] pt-[56px] sm:px-[40px] lg:px-[64px]">
              {/* Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-2 font-subhead text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(12,20,63,0.5)]">
                    Episode batch
                  </span>
                  {batches.map(b => (
                    <FilterPill key={b} label={b} active={batchFilter === b} onClick={() => setBatchFilter(b)} />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-2 font-subhead text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(12,20,63,0.5)]">
                    Industry
                  </span>
                  {industries.map(ind => (
                    <FilterPill key={ind} label={ind} active={industryFilter === ind} onClick={() => setIndustryFilter(ind)} />
                  ))}
                </div>
              </div>

              {/* Filtered grid */}
              <div className="mt-[32px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((project, i) => (
                  <ProjectCard key={`all-${project.title}`} project={project} tilt={i % 2 === 0 ? 1.4 : -1.6} />
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="mt-[32px] font-body text-[14px] text-[rgba(12,20,63,0.6)]">
                  Nothing in that combo yet — the slot is open. Maybe it&apos;s yours.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
