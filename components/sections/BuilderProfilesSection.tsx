'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { BwaProject, ShipTicket } from '@/content/bwaContent';
import { buildBuilderProfiles, type BuilderProgress } from '@/lib/builders';

const easeOut = [0.22, 1, 0.36, 1] as const;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();

export function BuilderCard({ profile, index = 0 }: { profile: BuilderProgress; index?: number }) {
  const latest = profile.tickets[0];
  return (
    <Link href={`/builders/${profile.slug}`} className="group block h-full no-underline">
      <motion.article
        initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -7 }}
        transition={{ duration: 0.4, ease: easeOut, delay: (index % 5) * 0.04 }}
        className="flex h-full flex-col border-2 border-white/35 bg-[#173C99] p-[22px] shadow-[10px_10px_0_rgba(4,13,52,0.55)] transition-colors group-hover:border-[#F46951] group-hover:bg-[#1D49B6] sm:p-[24px]"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden border-2 border-white/55 bg-[#0C143F] font-display text-[20px] font-[700] text-white">
            {profile.photo ? <Image src={profile.photo} alt={`${profile.name}, Build with ASES builder`} fill sizes="68px" className="object-cover" /> : <span aria-hidden="true">{initials(profile.name)}</span>}
          </div>
          <div className="min-w-0">
            <h3 className="m-0 font-display text-[22px] font-[700] leading-[1.1] text-white">{profile.name}</h3>
            <p className="mb-0 mt-1 font-subhead text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">{[profile.role, profile.school].filter(Boolean).join(' · ') || 'Builder'}</p>
          </div>
        </div>
        {profile.bio && <p className="mb-0 mt-5 line-clamp-3 font-body text-[13px] leading-[1.65] text-white/85">{profile.bio}</p>}
        <div className="mt-6 grid grid-cols-3 gap-2 border-y border-white/25 py-4 text-center">
          <div><strong className="block font-subhead text-[21px] text-white">{profile.projectNames.length}</strong><span className="font-subhead text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">Projects</span></div>
          <div><strong className="block font-subhead text-[21px] text-white">{profile.shippedCount}</strong><span className="font-subhead text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">Shipped</span></div>
          <div><strong className="block font-subhead text-[21px] text-white">{profile.activeCount}</strong><span className="font-subhead text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">In motion</span></div>
        </div>
        {profile.tickets.length > 0 && <div className="mt-5"><div className="flex justify-between font-subhead text-[10px] font-bold uppercase tracking-[0.1em] text-white/75"><span>Progress</span><span>{profile.completion}%</span></div><div className="mt-2 h-[8px] bg-[#0C143F]/70"><div className="h-full bg-[#F46951]" style={{ width: `${profile.completion}%` }} /></div></div>}
        {latest && <div className="mt-auto pt-6"><p className="m-0 font-subhead text-[9px] font-bold uppercase tracking-[0.14em] text-[#FF9A86]">Latest ticket · {latest.episode}</p><p className="mb-0 mt-2 line-clamp-2 font-body text-[12px] leading-[1.55] text-white/85">“{latest.pledge}”</p></div>}
        <span className="mt-5 inline-flex items-center gap-2 font-subhead text-[11px] font-bold uppercase tracking-[0.12em] text-white">Open profile <span className="transition-transform group-hover:translate-x-1">→</span></span>
      </motion.article>
    </Link>
  );
}

export function BuilderProfilesSection({ heading, projects, tickets }: { heading: string; projects: BwaProject[]; tickets: ShipTicket[] }) {
  const profiles = buildBuilderProfiles(projects, tickets).slice(0, 5);
  if (!profiles.length) return null;
  return (
    <section id="builders" data-nav-theme="dark" className="relative w-full overflow-hidden bg-[#112F7F] px-[24px] py-[80px] text-white sm:px-[40px] lg:px-[64px] lg:py-[112px]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
      <div className="relative z-10 mx-auto max-w-[1312px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[820px]"><p className="m-0 font-subhead text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF9A86]">Builder continuity</p><h2 className="mb-0 mt-3 font-display text-[clamp(30px,5vw,58px)] font-[350] leading-[1.08] tracking-[-0.02em] text-white">{heading}</h2></div>
          <Link href="/builders" className="button-float-hover inline-flex items-center gap-3 bg-[#D33C24] px-[24px] py-[14px] font-display text-[15px] font-[350] text-white no-underline hover:bg-[#BF351E]">See more builders <span>→</span></Link>
        </div>
        <p className="mb-0 mt-5 max-w-[64ch] font-body text-[14px] leading-[1.7] text-white/80 sm:text-[16px]">The pitch is one night. These profiles connect every project, promise, carry-over, and shipped result that came after.</p>
        <div className="mt-[48px] grid grid-cols-1 gap-[22px] md:grid-cols-2 xl:grid-cols-5">{profiles.map((profile, index) => <BuilderCard key={profile.slug} profile={profile} index={index} />)}</div>
      </div>
    </section>
  );
}
