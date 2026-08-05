'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { BwaBuilder, BwaProject, ShipTicket } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

type BuilderProgress = BwaBuilder & {
  projects: BwaProject[];
  tickets: ShipTicket[];
};

const normalizeKey = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function buildProfiles(projects: BwaProject[], tickets: ShipTicket[]): BuilderProgress[] {
  const profiles = new Map<string, BuilderProgress>();
  const projectBuilders = new Map<string, string[]>();

  projects.forEach(project => {
    const keys: string[] = [];
    project.builders.forEach(builder => {
      const key = builder.slug || normalizeKey(builder.name);
      keys.push(key);
      const existing = profiles.get(key);
      if (existing) {
        if (!existing.projects.some(item => item.title === project.title)) existing.projects.push(project);
        profiles.set(key, { ...existing, ...builder, projects: existing.projects, tickets: existing.tickets });
      } else {
        profiles.set(key, { ...builder, slug: key, projects: [project], tickets: [] });
      }
    });
    projectBuilders.set(normalizeKey(project.title), keys);
  });

  tickets.forEach(ticket => {
    const explicitKey = ticket.builderSlug || normalizeKey(ticket.name);
    const linkedProjectKeys = ticket.project ? projectBuilders.get(normalizeKey(ticket.project)) ?? [] : [];
    const key = profiles.has(explicitKey)
      ? explicitKey
      : linkedProjectKeys.length === 1
        ? linkedProjectKeys[0]
        : explicitKey;
    const existing = profiles.get(key);
    if (existing) {
      existing.tickets.push(ticket);
    } else {
      profiles.set(key, {
        name: ticket.name,
        slug: key,
        role: 'Builder',
        projects: ticket.project
          ? projects.filter(project => normalizeKey(project.title) === normalizeKey(ticket.project!))
          : [],
        tickets: [ticket],
      });
    }
  });

  return [...profiles.values()].sort((a, b) => {
    const activity = (profile: BuilderProgress) => profile.tickets.length * 10 + profile.projects.length;
    return activity(b) - activity(a) || a.name.localeCompare(b.name);
  });
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();

export function BuilderProfilesSection({
  heading,
  projects,
  tickets,
}: {
  heading: string;
  projects: BwaProject[];
  tickets: ShipTicket[];
}) {
  const profiles = buildProfiles(projects, tickets);

  if (profiles.length === 0) return null;

  return (
    <section
      id="builders"
      data-nav-theme="dark"
      className="bg-blueprint relative w-full overflow-hidden bg-[#0C143F] px-[24px] py-[80px] text-white sm:px-[40px] lg:px-[64px] lg:py-[112px]"
    >
      <div className="relative z-10 mx-auto max-w-[1312px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="max-w-[820px]"
        >
          <p className="m-0 font-subhead text-[11px] font-bold uppercase tracking-[0.18em] text-[#F46951]">
            Builder continuity
          </p>
          <h2 className="mb-0 mt-3 font-display text-[clamp(30px,5vw,58px)] font-[350] leading-[1.08] tracking-[-0.02em] text-white">
            {heading}
          </h2>
          <p className="mb-0 mt-5 max-w-[64ch] font-body text-[14px] leading-[1.7] text-white/65 sm:text-[16px]">
            Each profile connects the person, the projects they brought into the room, and every promise they made after. The pitch is one night; the build keeps moving.
          </p>
        </motion.div>

        <div className="mt-[48px] grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile, index) => {
            const shipped = profile.tickets.filter(ticket => ticket.status === 'shipped').length;
            const active = profile.tickets.filter(ticket => ticket.status !== 'shipped').length;
            const completion = profile.tickets.length ? Math.round((shipped / profile.tickets.length) * 100) : 0;
            const latest = profile.tickets[0];
            const card = (
              <motion.article
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: easeOut, delay: (index % 3) * 0.06 }}
                className="flex h-full flex-col border border-white/15 bg-[rgba(255,255,255,0.055)] p-[22px] shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:p-[26px]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden border border-white/20 bg-[#112F7F] font-display text-[20px] font-[700] text-white">
                    {profile.photo ? (
                      <Image src={profile.photo} alt={`${profile.name}, Build with ASES builder`} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span aria-hidden="true">{initials(profile.name)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="m-0 font-display text-[22px] font-[700] leading-[1.1] text-white">{profile.name}</h3>
                    <p className="mb-0 mt-1 font-subhead text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
                      {[profile.role, profile.school].filter(Boolean).join(' · ') || 'Builder'}
                    </p>
                  </div>
                </div>

                {profile.bio && <p className="mb-0 mt-5 font-body text-[13px] leading-[1.65] text-white/68">{profile.bio}</p>}

                <div className="mt-6 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-center">
                  <div><strong className="block font-subhead text-[20px] text-white">{profile.projects.length}</strong><span className="font-subhead text-[9px] uppercase tracking-[0.12em] text-white/45">Projects</span></div>
                  <div><strong className="block font-subhead text-[20px] text-white">{shipped}</strong><span className="font-subhead text-[9px] uppercase tracking-[0.12em] text-white/45">Shipped</span></div>
                  <div><strong className="block font-subhead text-[20px] text-white">{active}</strong><span className="font-subhead text-[9px] uppercase tracking-[0.12em] text-white/45">In motion</span></div>
                </div>

                {profile.tickets.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-4 font-subhead text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                      <span>Ship-ticket progress</span><span>{completion}%</span>
                    </div>
                    <div className="mt-2 h-[6px] overflow-hidden bg-white/10"><div className="h-full bg-[#F46951]" style={{ width: `${completion}%` }} /></div>
                  </div>
                )}

                {profile.projects.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {profile.projects.map(project => <span key={project.title} className="border border-white/15 px-2 py-1 font-subhead text-[10px] font-semibold text-white/65">{project.title}</span>)}
                  </div>
                )}

                {latest && (
                  <div className="mt-auto pt-6">
                    <p className="m-0 font-subhead text-[9px] font-bold uppercase tracking-[0.14em] text-[#F46951]">Latest ticket · {latest.episode}</p>
                    <p className="mb-0 mt-2 line-clamp-2 font-body text-[12px] leading-[1.55] text-white/70">“{latest.pledge}”</p>
                  </div>
                )}
              </motion.article>
            );

            return profile.profileUrl ? (
              <a key={profile.slug} href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="block h-full no-underline">{card}</a>
            ) : <div key={profile.slug} className="h-full">{card}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
