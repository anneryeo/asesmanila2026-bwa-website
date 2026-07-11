'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';
import type { ShipTicket } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

const STATUS_META: Record<ShipTicket['status'], { label: string; color: string; solid: boolean }> = {
  pledged: { label: 'Pledged', color: '#D33C24', solid: false },
  shipped: { label: 'Shipped', color: '#112F7F', solid: true },
  'carried-over': { label: 'Carried over', color: '#B98A00', solid: false },
};

// ─── One ticket stub ────────────────────────────────────────────────────────
// Boarding-pass look: main body + perforated stub holding the status stamp.
const TicketCard = ({ ticket, index }: { ticket: ShipTicket; index: number }) => {
  const status = STATUS_META[ticket.status];
  const tilt = index % 3 === 0 ? -1.2 : index % 3 === 1 ? 0.8 : 1.5;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt * 0.4 }}
      viewport={{ once: true }}
      whileHover={{ rotate: -tilt * 0.5, y: -6, scale: 1.01 }}
      transition={{ duration: 0.35, ease: easeOut, delay: (index % 3) * 0.05 }}
      className="flex overflow-hidden bg-white shadow-[0_14px_36px_rgba(7,31,107,0.14)]"
      style={{ border: '1px solid rgba(7,31,107,0.16)' }}
    >
      {/* Main body */}
      <div className="min-w-0 flex-1 px-[22px] py-[18px]">
        <div className="flex items-center justify-between gap-3">
          <span className="font-subhead text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(12,20,63,0.5)]">
            Ship ticket · {ticket.episode}
          </span>
          <span className="font-subhead text-[10px] font-semibold text-[rgba(12,20,63,0.45)]">
            {ticket.date}
          </span>
        </div>

        {/* Pledges are Cocogoose, so digits inside must fall back to
            Montserrat. Emphasis enforces the numeral brand rule. */}
        <p className="mb-0 mt-3 font-display text-[clamp(15px,1.8vw,18px)] font-[350] leading-[1.45] text-[#0C143F]">
          “<Emphasis text={ticket.pledge} />”
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="font-subhead text-[12px] font-bold text-[#112F7F]">{ticket.name}</span>
          {ticket.project && (
            <>
              <span aria-hidden="true" className="text-[rgba(12,20,63,0.3)]">·</span>
              <span className="font-subhead text-[12px] font-medium text-[rgba(12,20,63,0.6)]">{ticket.project}</span>
            </>
          )}
        </div>
      </div>

      {/* Perforated stub with the status stamp */}
      <div
        className="flex w-[112px] shrink-0 flex-col items-center justify-center gap-2 px-2"
        style={{
          borderLeft: '2px dashed rgba(7,31,107,0.25)',
          background: 'rgba(7,31,107,0.03)',
        }}
      >
        <span
          className="rotate-[-8deg] px-[10px] py-[5px] text-center font-display text-[11px] font-[700] uppercase tracking-[0.08em]"
          style={{
            color: status.solid ? '#ffffff' : status.color,
            background: status.solid ? status.color : 'transparent',
            border: `2px solid ${status.color}`,
          }}
        >
          {status.label}
        </span>
        {ticket.status === 'shipped' && (
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
            <path d="M2 8.5l3.5 3.5 8-8" fill="none" stroke="#112F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </motion.article>
  );
};

// ─── The wall ───────────────────────────────────────────────────────────────
export const ShipTicketWall = ({ tickets }: { tickets: ShipTicket[] }) => {
  const [episodeFilter, setEpisodeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ShipTicket['status']>('All');

  const episodes = useMemo(
    () => ['All', ...Array.from(new Set(tickets.map(t => t.episode).filter(Boolean)))],
    [tickets],
  );

  const filtered = tickets.filter(
    t =>
      (episodeFilter === 'All' || t.episode === episodeFilter) &&
      (statusFilter === 'All' || t.status === statusFilter),
  );

  const shippedCount = tickets.filter(t => t.status === 'shipped').length;

  return (
    <div className="bwa-surface min-h-[100svh] px-[24px] pb-[96px] pt-[128px] sm:px-[40px] lg:px-[80px]">
      <div className="mx-auto w-full max-w-[1040px]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-subhead text-[13px] font-normal uppercase tracking-[0.18em] text-navy-700 opacity-70">
                The wall
              </p>
              <h1 className="m-0 font-display text-[clamp(28px,5vw,52px)] font-[350] leading-[1.05] tracking-[-0.02em] text-[#0C143F]">
                Ship tickets
              </h1>
              <p className="mb-0 mt-5 max-w-[58ch] font-body text-[clamp(14px,1.6vw,16px)] leading-[1.7] text-[rgba(12,20,63,0.75)]">
                Public pledges posted at Build with ASES episodes. Say what you&apos;ll ship,
                come back next episode, and stamp it done, or carry it over and try again.
                No shame either way; the wall just remembers.
              </p>
            </div>
            <Image
              src="/images/ace-parts_1.png"
              alt=""
              aria-hidden="true"
              width={893}
              height={582}
              className="hidden w-[180px] shrink-0 md:block"
              style={{ height: 'auto', transform: 'rotate(8deg)', filter: 'drop-shadow(0 14px 28px rgba(12,20,63,0.18))' }}
            />
          </div>

          {/* Count line — numerals in Montserrat per brand rule */}
          <p className="mt-6 font-subhead text-[13px] font-semibold text-[rgba(12,20,63,0.55)]">
            {shippedCount} of {tickets.length} tickets stamped shipped so far.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-subhead text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(12,20,63,0.5)]">
              Episode
            </span>
            {episodes.map(ep => (
              <FilterPill key={ep} label={ep} active={episodeFilter === ep} onClick={() => setEpisodeFilter(ep)} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-subhead text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(12,20,63,0.5)]">
              Status
            </span>
            {(['All', 'pledged', 'shipped', 'carried-over'] as const).map(s => (
              <FilterPill
                key={s}
                label={s === 'All' ? 'All' : STATUS_META[s].label}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="mt-10 grid grid-cols-1 items-start gap-[22px] md:grid-cols-2">
          {filtered.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 font-body text-[14px] text-[rgba(12,20,63,0.6)]">
            No tickets in that combo yet. The wall has room.
          </p>
        )}

        {/* Post-your-own CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mt-[72px] flex flex-col items-center gap-4 border border-dashed border-[rgba(211,60,36,0.5)] bg-[rgba(211,60,36,0.03)] px-6 py-10 text-center"
        >
          <p className="m-0 font-display text-[clamp(17px,2.4vw,24px)] font-[350] leading-[1.4] text-[#0C143F]">
            Got something you keep saying you&apos;ll finish?
          </p>
          <p className="m-0 max-w-[48ch] font-body text-[14px] leading-[1.65] text-[rgba(12,20,63,0.7)]">
            Post a ship ticket with your application. Presenting or watching, doesn&apos;t matter.
            The wall holds you to it, gently.
          </p>
          <Link
            href="/application"
            className="button-float-hover inline-flex items-center gap-3 rounded-none bg-[#D33C24] px-[26px] py-[14px] font-display text-[clamp(13px,1.6vw,16px)] font-[350] tracking-[0.03em] text-white no-underline transition-colors hover:bg-[#BF351E]"
          >
            <span>Post yours at the next episode</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="block h-[1em] w-[1em] shrink-0">
              <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

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
