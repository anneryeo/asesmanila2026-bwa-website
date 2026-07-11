import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';
import { FALLBACK_CONTENT, type BwaContent, type BwaProject, type ShipTicket } from '@/content/bwaContent';

// Document types read from the shared asesmanila Sanity project:
//   project     — shared with the parent site (batch/industry added for BWA)
//   bwaSettings — singleton for this site's hero + manifesto copy
//   bwaFaqItem  — BWA-specific FAQ notes (distinct from the parent's faqItem)
//   shipTicket  — public ship-ticket pledges
const SITE_QUERY = /* groq */ `{
  "settings": *[_type == "bwaSettings"][0],
  "projects": *[_type == "project"] | order(order asc) { title, description, previewImage, url, batch, industry },
  "faqItems": *[_type == "bwaFaqItem"] | order(order asc) { question, answer }
}`;

const TICKETS_QUERY = /* groq */ `*[_type == "shipTicket"] | order(postedAt desc) {
  "id": _id, name, project, episode, pledge, status, postedAt
}`;

const urlFor = (source: unknown): string | undefined => {
  if (!sanityClient || !source) return undefined;
  try {
    return imageUrlBuilder(sanityClient)
      .image(source as Parameters<ReturnType<typeof imageUrlBuilder>['image']>[0])
      .width(1600)
      .auto('format')
      .url();
  } catch {
    return undefined;
  }
};

/** Use a Sanity value when present, otherwise the local fallback. */
const pick = <T>(value: T | null | undefined, fallback: T): T =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? fallback : value;

/**
 * Fetches all home-page content from Sanity, deep-merged over the local
 * fallbacks. If no Sanity project is configured (or the fetch fails), the
 * site renders entirely from FALLBACK_CONTENT — the build never breaks.
 */
export async function getBwaContent(): Promise<BwaContent> {
  if (!sanityClient) return FALLBACK_CONTENT;

  try {
    const data = await sanityClient.fetch(SITE_QUERY);
    const s = data?.settings ?? {};
    const f = FALLBACK_CONTENT;

    return {
      hero: {
        heading: pick(s.heroHeading, f.hero.heading),
        subheading: pick(s.heroSubheading, f.hero.subheading),
      },
      manifesto: {
        adjectives: s.manifestoAdjectives?.length ? s.manifestoAdjectives : f.manifesto.adjectives,
        actions: s.manifestoActions?.length ? s.manifestoActions : f.manifesto.actions,
        purposes: s.manifestoPurposes?.length ? s.manifestoPurposes : f.manifesto.purposes,
      },
      projects: {
        heading: pick(s.projectsHeading, f.projects.heading),
        subheading: pick(s.projectsSubheading, f.projects.subheading),
        items: data?.projects?.length
          ? data.projects.map((p: {
              title: string; description: string; previewImage?: unknown;
              url: string; batch?: string; industry?: string;
            }): BwaProject => ({
              title: p.title,
              description: p.description,
              previewImage: urlFor(p.previewImage) ?? f.projects.items[0].previewImage,
              url: p.url,
              batch: p.batch?.trim() || 'Earlier episodes',
              industry: p.industry?.trim() || 'Misc',
            }))
          : f.projects.items,
      },
      faq: {
        heading: pick(s.faqHeading, f.faq.heading),
        items: data?.faqItems?.length ? data.faqItems : f.faq.items,
      },
      shipTickets: f.shipTickets,
    };
  } catch (error) {
    console.error('[sanity] fetch failed, using fallback content:', error);
    return FALLBACK_CONTENT;
  }
}

/** Public ship tickets, newest first. Falls back to the local dummies. */
export async function getShipTickets(): Promise<ShipTicket[]> {
  if (!sanityClient) return FALLBACK_CONTENT.shipTickets;

  try {
    const rows = await sanityClient.fetch(TICKETS_QUERY);
    if (!rows?.length) return FALLBACK_CONTENT.shipTickets;

    return rows.map((t: {
      id: string; name: string; project?: string; episode?: string;
      pledge: string; status?: string; postedAt?: string;
    }): ShipTicket => ({
      id: t.id,
      name: t.name,
      project: t.project || undefined,
      episode: t.episode ?? '',
      pledge: t.pledge,
      status: t.status === 'shipped' || t.status === 'carried-over' ? t.status : 'pledged',
      date: t.postedAt
        ? new Date(t.postedAt).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })
        : '',
    }));
  } catch (error) {
    console.error('[sanity] ship tickets fetch failed, using fallback:', error);
    return FALLBACK_CONTENT.shipTickets;
  }
}
