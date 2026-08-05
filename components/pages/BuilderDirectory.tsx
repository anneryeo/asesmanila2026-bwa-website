'use client';

import { BuilderCard } from '@/components/sections/BuilderProfilesSection';
import type { BuilderProgress } from '@/lib/builders';

export function BuilderDirectory({ builders }: { builders: BuilderProgress[] }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#112F7F] px-[24px] pb-[96px] pt-[132px] text-white sm:px-[40px] lg:px-[64px]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '48px 48px' }} data-nav-theme="dark">
      <div className="mx-auto max-w-[1312px]">
        <p className="m-0 font-subhead text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF9A86]">The builder ledger</p>
        <h1 className="mb-0 mt-3 max-w-[14ch] font-display text-[clamp(42px,8vw,92px)] font-[700] leading-[0.98] tracking-[-0.03em] text-white">People who kept building.</h1>
        <p className="mb-0 mt-6 max-w-[64ch] font-body text-[15px] leading-[1.75] text-white/80 sm:text-[17px]">Open a profile to see every linked project and the complete ship-ticket trail—not just the clean ending.</p>
        <div className="mt-[56px] grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-3">{builders.map((builder, index) => <BuilderCard key={builder.slug} profile={builder} index={index} />)}</div>
      </div>
    </section>
  );
}
