'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_META, TicketCard } from '@/components/ui/TicketCard';
import { Emphasis } from '@/components/ui/Emphasis';
import type { ShipTicket } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// ─── Stamp panel: come back and mark your ticket ────────────────────────────
interface OpenTicket {
  id: string;
  pledge: string;
  project?: string;
  episode: string;
  status: 'pledged' | 'carried-over';
  carriedCount: number;
}

const StampPanel = () => {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'idle' | 'looking' | 'found' | 'none' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [openTickets, setOpenTickets] = useState<OpenTicket[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [stamped, setStamped] = useState<Record<string, 'shipped' | 'carried-over'>>({});

  // The stamp is tagged with the current episode; sessions come from the same
  // endpoint the application form uses. First active session = the one now.
  useEffect(() => {
    fetch('/api/bwa-sessions')
      .then(res => res.json())
      .then((data: { sessions?: { id: string; label: string }[] }) => {
        setCurrentEpisode(data.sessions?.[0]?.label ?? '');
      })
      .catch(() => {});
  }, []);

  const lookUp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setPhase('error');
      setMessage('Enter the email you posted your ticket with.');
      return;
    }
    setPhase('looking');
    setMessage('');
    try {
      const res = await fetch('/api/ship-ticket/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string; tickets?: OpenTicket[] };
      if (!data.success) {
        setPhase('error');
        setMessage(data.message ?? 'Something went wrong. Please try again.');
        return;
      }
      if (!data.tickets?.length) {
        setPhase('none');
        return;
      }
      setOpenTickets(data.tickets);
      setStamped({});
      setPhase('found');
    } catch {
      setPhase('error');
      setMessage('Could not reach the wall. Please try again.');
    }
  };

  const stamp = async (ticketId: string, action: 'shipped' | 'carried-over') => {
    setBusyId(ticketId);
    setMessage('');
    try {
      const res = await fetch('/api/ship-ticket/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), ticketId, action, episode: currentEpisode }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setStamped(prev => ({ ...prev, [ticketId]: action }));
      } else {
        setMessage(data.message ?? 'Could not stamp that ticket. Please try again.');
      }
    } catch {
      setMessage('Could not reach the wall. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="mt-[72px] border-2 border-[#112F7F] bg-white px-5 py-8 shadow-[10px_10px_0_rgba(17,47,127,0.16)] sm:px-8"
    >
      <p className="m-0 inline-block rotate-[-1deg] border-2 border-[#112F7F] bg-[#FFE07A] px-3 py-2 font-subhead text-[11px] font-bold uppercase tracking-[0.16em] text-[#0C143F] shadow-[4px_4px_0_#D33C24]">
        Back with receipts?
      </p>
      <h2 className="mb-0 mt-2 font-display text-[clamp(18px,2.6vw,26px)] font-[350] leading-[1.3] text-[#0C143F]">
        Stamp your ticket
      </h2>
      <p className="mb-0 mt-3 max-w-[56ch] font-body text-[14px] leading-[1.65] text-[rgba(12,20,63,0.7)]">
        Enter the email you posted with and mark your pledge shipped — or carry it
        over to {currentEpisode || 'the next episode'} and take another swing. Shipping at
        episode five what you pledged at episode one still counts. The wall keeps the whole story.
      </p>

      {/* Email lookup */}
      <div className="mt-5 flex max-w-[480px] flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') lookUp(); }}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-none border border-[rgba(12,20,63,0.3)] bg-white px-4 py-[11px] font-body text-[14px] text-[#0C143F] outline-none focus:border-[#112F7F]"
        />
        <button
          type="button"
          onClick={lookUp}
          disabled={phase === 'looking'}
          className="cursor-pointer rounded-none bg-[#112F7F] px-6 py-[11px] font-display text-[14px] font-[350] tracking-[0.03em] text-white transition-colors hover:bg-[#0C2461] disabled:cursor-wait disabled:opacity-60"
        >
          {phase === 'looking' ? 'Checking…' : 'Find my tickets'}
        </button>
      </div>

      {phase === 'none' && (
        <p className="mb-0 mt-4 font-body text-[13px] leading-[1.6] text-[rgba(12,20,63,0.65)]">
          No open tickets under that email — either they&apos;re all stamped shipped already
          (nice), or the pledge went up under a different address.
        </p>
      )}
      {phase === 'error' && message && (
        <p className="mb-0 mt-4 font-body text-[13px] text-[#D33C24]">{message}</p>
      )}

      {/* Open tickets */}
      {phase === 'found' && (
        <div className="mt-6 flex flex-col gap-3">
          {openTickets.map(t => {
            const done = stamped[t.id];
            return (
              <div
                key={t.id}
                className="flex flex-col gap-3 border-2 border-[#112F7F]/45 bg-[#F6F7FC] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="m-0 font-display text-[14px] font-[350] leading-[1.5] text-[#0C143F]">
                    “<Emphasis text={t.pledge} />”
                  </p>
                  <p className="mb-0 mt-1 font-subhead text-[11px] font-semibold text-[rgba(12,20,63,0.5)]">
                    Pledged at {t.episode}
                    {t.carriedCount > 0 && ` · carried over ${t.carriedCount}×`}
                    {t.project && ` · ${t.project}`}
                  </p>
                </div>
                {done ? (
                  <span
                    className="shrink-0 self-start px-3 py-[6px] font-display text-[11px] font-[700] uppercase tracking-[0.08em] sm:self-center"
                    style={{
                      color: done === 'shipped' ? '#ffffff' : '#B98A00',
                      background: done === 'shipped' ? '#112F7F' : 'transparent',
                      border: `2px solid ${done === 'shipped' ? '#112F7F' : '#B98A00'}`,
                    }}
                  >
                    {done === 'shipped' ? 'Shipped ✓' : 'Carried over'}
                  </span>
                ) : (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => stamp(t.id, 'shipped')}
                      className="cursor-pointer rounded-none bg-[#112F7F] px-4 py-[8px] font-display text-[12px] font-[350] text-white transition-colors hover:bg-[#0C2461] disabled:cursor-wait disabled:opacity-60"
                    >
                      Shipped it
                    </button>
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => stamp(t.id, 'carried-over')}
                      className="cursor-pointer rounded-none border border-[#B98A00] bg-transparent px-4 py-[8px] font-display text-[12px] font-[350] text-[#B98A00] transition-colors hover:bg-[rgba(185,138,0,0.08)] disabled:cursor-wait disabled:opacity-60"
                    >
                      Carry it over
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {message && <p className="mb-0 mt-1 font-body text-[13px] text-[#D33C24]">{message}</p>}
          {Object.keys(stamped).length > 0 && (
            <p className="mb-0 mt-1 font-body text-[13px] text-[rgba(12,20,63,0.65)]">
              Stamped. The wall refreshes within a minute.
            </p>
          )}
        </div>
      )}
    </motion.section>
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
          <div>
            <p className="mb-5 inline-block rotate-[-1.5deg] border-2 border-[#112F7F] bg-[#FFE07A] px-4 py-2 font-subhead text-[11px] font-bold uppercase tracking-[0.18em] text-[#0C143F] shadow-[5px_5px_0_#D33C24]">
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

          {/* Count line — numerals in Montserrat per brand rule */}
          <p className="mt-7 inline-block border-2 border-[#112F7F] bg-white px-4 py-3 font-subhead text-[13px] font-semibold text-[#0C143F] shadow-[5px_5px_0_rgba(17,47,127,0.16)]">
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

        {/* Stamp-your-ticket panel for returning builders */}
        <StampPanel />

        {/* Post-your-own CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mt-[72px] flex flex-col items-center gap-4 border-2 border-dashed border-[#D33C24] bg-[#FFF7D6] px-6 py-10 text-center shadow-[10px_10px_0_rgba(211,60,36,0.14)]"
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
    className="cursor-pointer rounded-none border-2 px-[14px] py-[7px] font-subhead text-[12px] font-semibold tracking-[0.02em] transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5"
    style={{
      borderColor: active ? '#D33C24' : '#112F7F',
      background: active ? '#D33C24' : 'transparent',
      color: active ? '#ffffff' : 'rgba(12,20,63,0.75)',
      boxShadow: active ? '4px 4px 0 rgba(17,47,127,0.18)' : 'none',
    }}
  >
    {label}
  </button>
);
