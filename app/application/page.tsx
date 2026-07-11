import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { ApplicationForm } from '@/components/pages/ApplicationForm';
import { siteConfig, siteUrl } from '@/lib/site';
import type { Metadata } from 'next';

const pageUrl = `${siteUrl}/application`;

export const metadata: Metadata = {
  title: 'Apply — Build with ASES',
  description:
    'Apply to present what you are building at a Build with ASES session, or save a spot as a watcher. Honest feedback from founders, operators, and the companies who hire.',
  alternates: {
    canonical: '/application',
  },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Apply — Build with ASES',
    description:
      'Pick your track: present your build to the room, or watch other builders get tested. Post a public ship ticket while you are at it.',
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
      name: 'Apply',
      item: pageUrl,
    },
  ],
};

export default function ApplicationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
      />
      <Nav />
      <main>
        <ApplicationForm />
      </main>
      <Footer />
    </>
  );
}
