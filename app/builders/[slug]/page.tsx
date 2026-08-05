import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { TicketCard } from '@/components/ui/TicketCard';
import { getBwaContent, getShipTickets } from '@/lib/sanity/getBwaContent';
import { getBuilderBySlug } from '@/lib/builders';
import { siteUrl } from '@/lib/site';

export const revalidate = 60;

const normalizeProjectName = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function loadBuilder(slug: string) { const [content, tickets] = await Promise.all([getBwaContent(), getShipTickets()]); return getBuilderBySlug(content.projects.items, tickets, slug); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const builder = await loadBuilder(slug); if (!builder) return {};
  return { title: `${builder.name} — Builder Profile`, description: `Follow ${builder.name}'s projects and ship-ticket progress at Build with ASES.`, alternates: { canonical: `/builders/${slug}` }, openGraph: { type: 'profile', title: `${builder.name} — Build with ASES`, description: builder.bio || `Projects and shipping progress from ${builder.name}.`, images: builder.photo ? [builder.photo] : builder.projects[0]?.previewImage ? [builder.projects[0].previewImage] : [] } };
}

export default async function BuilderProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const builder = await loadBuilder(slug); if (!builder) notFound();
  return <><Nav /><main className="min-h-screen bg-[#F6F7FC] pt-[76px]" data-nav-theme="light">
    <section className="relative overflow-hidden bg-[#112F7F] px-[24px] py-[64px] text-white sm:px-[40px] lg:px-[64px] lg:py-[88px]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '48px 48px' }} data-nav-theme="dark">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[300px_1fr] lg:items-center">
        <div className="relative aspect-square w-full max-w-[300px] overflow-hidden border-2 border-white/50 bg-[#0C143F] shadow-[14px_14px_0_rgba(3,12,48,0.55)]">{builder.photo ? <Image src={builder.photo} alt={builder.name} fill sizes="300px" className="object-cover" priority /> : builder.projects[0] ? <Image src={builder.projects[0].previewImage} alt={`${builder.name}'s project`} fill sizes="300px" className="object-cover" priority /> : <div className="flex h-full items-center justify-center font-display text-[72px] font-[700]">{builder.name[0]}</div>}</div>
        <div><p className="m-0 font-subhead text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF9A86]">Builder profile · {builder.completion}% shipped</p><h1 className="mb-0 mt-3 font-display text-[clamp(44px,8vw,92px)] font-[700] leading-none tracking-[-0.03em]">{builder.name}</h1><p className="mb-0 mt-3 font-subhead text-[12px] font-bold uppercase tracking-[0.12em] text-white/70">{[builder.role, builder.school].filter(Boolean).join(' · ') || 'Builder'}</p>{builder.bio && <p className="mb-0 mt-6 max-w-[62ch] font-body text-[16px] leading-[1.75] text-white/85">{builder.bio}</p>}<div className="mt-7 flex flex-wrap gap-3"><Link href={`/builders/${slug}/edit`} className="bg-[#D33C24] px-5 py-3 font-subhead text-[12px] font-bold uppercase tracking-[0.1em] text-white">Request profile edit</Link>{builder.profileUrl && <a href={builder.profileUrl} target="_blank" rel="noopener noreferrer" className="border border-white/40 px-5 py-3 font-subhead text-[12px] font-bold uppercase tracking-[0.1em] text-white">External profile ↗</a>}</div></div>
      </div>
    </section>
    <section className="bwa-surface px-[24px] py-[72px] sm:px-[40px] lg:px-[64px]"><div className="mx-auto max-w-[1180px]"><h2 className="m-0 font-display text-[clamp(30px,5vw,52px)] font-[700] text-[#0C143F]">Projects</h2><div className="mt-8 grid gap-6 md:grid-cols-2">{builder.projects.map(project => <article key={project.title} className="overflow-hidden border border-[#112F7F]/20 bg-white shadow-[0_18px_48px_rgba(7,31,107,0.12)]"><div className="relative aspect-[16/9]"><Image src={project.previewImage} alt={project.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" /></div><div className="p-6"><p className="m-0 font-subhead text-[10px] font-bold uppercase tracking-[0.14em] text-[#D33C24]">{project.batch} · {project.industry}</p><h3 className="mb-0 mt-2 font-display text-[25px] font-[700] text-[#0C143F]">{project.title}</h3><p className="mb-0 mt-3 font-body text-[14px] leading-[1.7] text-[#0C143F]/70">{project.description}</p><a href={project.url} target={project.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="mt-5 inline-block font-subhead text-[12px] font-bold uppercase tracking-[0.1em] text-[#D33C24]">View project →</a></div></article>)}{builder.projectNames.filter(name => !builder.projects.some(project => normalizeProjectName(project.title) === normalizeProjectName(name))).map(name => <article key={name} className="border border-dashed border-[#112F7F]/35 bg-white p-6 shadow-[0_18px_48px_rgba(7,31,107,0.08)]"><p className="m-0 font-subhead text-[10px] font-bold uppercase tracking-[0.14em] text-[#D33C24]">Named on a ship ticket</p><h3 className="mb-0 mt-2 font-display text-[25px] font-[700] text-[#0C143F]">{name}</h3><p className="mb-0 mt-3 font-body text-[14px] leading-[1.7] text-[#0C143F]/70">This project is connected through the builder’s public ship-ticket history. Its full project page has not been added yet.</p></article>)}</div></div></section>
    <section className="px-[24px] pb-[96px] sm:px-[40px] lg:px-[64px]"><div className="mx-auto max-w-[1180px]"><h2 className="m-0 font-display text-[clamp(30px,5vw,52px)] font-[700] text-[#0C143F]">Ship-ticket history</h2>{builder.tickets.length ? <div className="mt-8 grid gap-5">{builder.tickets.map((ticket, index) => <TicketCard key={ticket.id} ticket={ticket} index={index} />)}</div> : <p className="mt-6 font-body text-[#0C143F]/65">No public ship tickets yet.</p>}</div></section>
  </main><Footer /></>;
}
