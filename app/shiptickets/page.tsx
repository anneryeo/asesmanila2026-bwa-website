import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { ShipTicketWall } from '@/components/pages/ShipTicketWall';
import { getShipTickets } from '@/lib/sanity/getBwaContent';
import { siteConfig, siteUrl } from '@/lib/site';
import type { Metadata } from 'next';

// Re-check Sanity for fresh tickets at most once a minute.
export const revalidate = 60;

const pageUrl = `${siteUrl}/shiptickets`;

export const metadata: Metadata = {
  title: 'Ship Tickets | Build with ASES',
  description:
    'Public pledges from Build with ASES episodes. Builders say what they will ship by the next session, then come back and stamp it done. Post yours with your application.',
  alternates: {
    canonical: '/shiptickets',
  },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Ship Tickets | Build with ASES',
    description:
      'The public wall of builder pledges from Build with ASES episodes. Say what you will ship. The wall remembers.',
    siteName: siteConfig.name,
    locale: 'en_PH',
    images: [
      {
        url: '/images/bwa/bwa-01.webp',
        width: 1600,
        height: 1067,
        alt: 'Builders at a Build with ASES session',
      },
    ],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Build with ASES',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Ship Tickets',
      item: pageUrl,
    },
  ],
};

export default async function ShipTicketsPage() {
  const tickets = await getShipTickets();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
      />
      <Nav />
      <main>
        <ShipTicketWall tickets={tickets} />
      </main>
      <Footer />
    </>
  );
}
