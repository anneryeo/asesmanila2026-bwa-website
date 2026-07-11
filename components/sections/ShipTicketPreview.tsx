'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';
import { TicketCard } from '@/components/ui/TicketCard';
import { FALLBACK_CONTENT, type ShipTicket } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// How many tickets sit in the always-visible preview row.
const TOP_COUNT = 5;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: easeOut, delay },
});

// ─── Section ────────────────────────────────────────────────────────────────
// Same header/grid layout as ProjectsSection, but "See more tickets" is a
// plain link to the full /shiptickets wall rather than an in-page expand.
export const ShipTicketPreview = ({
  heading = FALLBACK_CONTENT.ticketsHeading,
  tickets = FALLBACK_CONTENT.shipTickets,
}: {
  heading?: string;
  tickets?: ShipTicket[];
}) => {
  const top = tickets.slice(0, TOP_COUNT);
  if (top.length === 0) return null;

  return (
    <section
      id="tickets"
      data-nav-theme="light"
      className="bwa-surface relative w-full overflow-hidden py-[72px] lg:py-[96px]"
    >
      {/* Header — left aligned to the page gutter, like the projects section */}
      <div className="relative z-10 flex w-full flex-wrap items-end justify-between gap-6 px-[24px] sm:px-[40px] lg:px-[64px]">
        <motion.div {...fadeUp(0)} className="min-w-0">
          <h2 className="m-0 font-display text-[clamp(16px,2vw,26px)] font-light leading-[1.3] tracking-[-0.01em] text-[#112F7F] lg:whitespace-nowrap">
            <Emphasis text={heading} boldWeight={700} />
          </h2>
        </motion.div>

        <motion.div {...fadeUp(0.15)} className="shrink-0">
          <Link
            href="/shiptickets"
            className="button-float-hover inline-flex items-center gap-3 rounded-none bg-[#D33C24] px-[26px] py-[14px] font-display text-[clamp(14px,1.6vw,17px)] font-[350] tracking-[0.03em] text-white no-underline transition-colors hover:bg-[#BF351E]"
          >
            <span>See more tickets</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0">
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Top 5 — always visible */}
      <div className="relative z-10 mt-[44px] grid grid-cols-1 gap-[20px] px-[24px] sm:grid-cols-2 sm:px-[40px] lg:px-[64px]">
        {top.map((ticket, i) => (
          <TicketCard key={ticket.id} ticket={ticket} index={i} />
        ))}
      </div>
    </section>
  );
};
