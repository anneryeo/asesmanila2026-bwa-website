import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { BwaIntro } from '@/components/sections/BwaIntro';
import { Hero } from '@/components/sections/Hero';
import { BuildManifesto } from '@/components/sections/BuildManifesto';
import { FloatingParts } from '@/components/sections/FloatingParts';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ShipTicketPreview } from '@/components/sections/ShipTicketPreview';
import { FaqSection } from '@/components/sections/FaqSection';
import { CtaSection } from '@/components/sections/CtaSection';
import { BuilderProfilesSection } from '@/components/sections/BuilderProfilesSection';
import { getBwaContent, getShipTickets } from '@/lib/sanity/getBwaContent';
import { siteConfig, siteUrl } from '@/lib/site';
import type { Metadata } from 'next';

// Re-check Sanity for fresh content at most once a minute.
export const revalidate = 60;

// This standalone site's root IS the Build with ASES page.
const pageUrl = siteUrl;

export const metadata: Metadata = {
  title: "Build with ASES: Where Students Show What They're Building",
  description:
    'Build with ASES is a builder session by ASES Manila where students show the projects they are actually building and get honest feedback in a room of founders, operators, and the companies who hire. Apply to present or join as a watcher.',
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: "Build with ASES: Where Students Show What They're Building",
    description:
      'Bring something you are building. A room of founders and operators helps you make it sharper. Apply to present or join as a watcher.',
    siteName: siteConfig.name,
    locale: 'en_PH',
    images: [
      {
        url: '/images/bwa/bwa-01.webp',
        width: 1600,
        height: 1067,
        alt: 'Builders presenting at a Build with ASES session',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Build with ASES: Where Students Show What They're Building",
    description:
      'Bring something you are building. Get honest feedback from founders, operators, and the people who hire.',
    images: ['/images/bwa/bwa-01.webp'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ASES Manila',
      item: siteConfig.parentSiteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Build with ASES',
      item: pageUrl,
    },
  ],
};

const eventSeriesSchema = {
  '@context': 'https://schema.org',
  '@type': 'EventSeries',
  '@id': `${pageUrl}/#event-series`,
  name: 'Build with ASES',
  url: pageUrl,
  description:
    'A recurring builder session hosted by ASES Manila where student founders present the projects they are building and get honest, direct feedback from founders, operators, and the companies who hire.',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  inLanguage: 'en-PH',
  image: [`${siteUrl}/images/bwa/bwa-01.webp`],
  location: {
    '@type': 'Place',
    name: 'Manila, Philippines',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manila',
      addressCountry: 'PH',
    },
  },
  organizer: {
    '@id': `${siteUrl}/#organization`,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'PHP',
    availability: 'https://schema.org/LimitedAvailability',
    url: `${pageUrl}application`,
    description: 'Free for ASES members. Paid entry for non-members.',
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${pageUrl}/#webpage`,
  url: pageUrl,
  name: 'Build with ASES',
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: { '@id': `${siteUrl}/#organization` },
  primaryImageOfPage: `${siteUrl}/images/bwa/bwa-01.webp`,
  inLanguage: 'en-PH',
};

export default async function BuildWithASESPage() {
  const [content, tickets] = await Promise.all([getBwaContent(), getShipTickets()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, eventSeriesSchema, webPageSchema]),
        }}
      />
      <BwaIntro />
      <Nav />
      <main>
        {/* Hero + manifesto share one relative wrapper so the floating Ace
            parts drift seamlessly across BOTH sections (and only those two). */}
        <div className="relative overflow-hidden">
          <Hero heading={content.hero.heading} subheading={content.hero.subheading} />
          <BuildManifesto
            adjectives={content.manifesto.adjectives}
            actions={content.manifesto.actions}
            purposes={content.manifesto.purposes}
          />
          <FloatingParts />
        </div>
        <ProjectsSection
          heading={content.projects.heading}
          items={content.projects.items}
        />
        <ShipTicketPreview heading={content.ticketsHeading} tickets={tickets} />
        <BuilderProfilesSection
          heading={content.buildersHeading}
          projects={content.projects.items}
          tickets={tickets}
        />
        <FaqSection heading={content.faq.heading} items={content.faq.items} />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
