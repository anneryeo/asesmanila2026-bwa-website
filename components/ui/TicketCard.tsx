'use client';

import { motion } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';
import type { ShipTicket } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

export const STATUS_META: Record<ShipTicket['status'], { label: string; color: string; solid: boolean }> = {
  pledged: { label: 'Pledged', color: '#D33C24', solid: false },
  shipped: { label: 'Shipped', color: '#112F7F', solid: true },
  'carried-over': { label: 'Carried over', color: '#B98A00', solid: false },
};

// Boarding-pass look: main body + perforated stub holding the status stamp.
// Shared between the /shiptickets wall and the home page's top-5 preview.
export const TicketCard = ({ ticket, index }: { ticket: ShipTicket; index: number }) => {
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
