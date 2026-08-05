import type { Metadata } from 'next';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { BuilderDirectory } from '@/components/pages/BuilderDirectory';
import { getBwaContent, getShipTickets } from '@/lib/sanity/getBwaContent';
import { buildBuilderProfiles } from '@/lib/builders';
import { siteUrl } from '@/lib/site';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Builders', description: 'Follow Build with ASES builders across projects, ship tickets, carry-overs, and shipped milestones.', alternates: { canonical: '/builders' } };

export default async function BuildersPage() {
  const [content, tickets] = await Promise.all([getBwaContent(), getShipTickets()]);
  const builders = buildBuilderProfiles(content.projects.items, tickets);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Build with ASES Builders', url: `${siteUrl}/builders` }) }} /><Nav /><main><BuilderDirectory builders={builders} /></main><Footer /></>;
}
