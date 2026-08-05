import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';
import { FALLBACK_CONTENT, type BwaBuilder, type BwaContent, type BwaProject, type ShipTicket } from '@/content/bwaContent';

// Document types read from the shared asesmanila Sanity project:
//   project     — shared with the parent site (batch/industry added for BWA)
//   bwaSettings — singleton for this site's hero + manifesto copy
//   bwaFaqItem  — BWA-specific FAQ notes (distinct from the parent's faqItem)
//   shipTicket  — public ship-ticket pledges
const SITE_QUERY = /* groq */ `{
  "settings": *[_type == "bwaSettings"][0],
  "projects": *[_type == "project"] | order(order asc) {
    title, description, previewImage, url, batch, industry,
    "builders": select(
      count(builderRefs) > 0 => builderRefs[]->{ name, "slug": slug.current, role, school, bio, photo, profileUrl },
      builders[]{ name, "slug": slug.current, role, school, bio, photo, profileUrl }
    )
  },
  "faqItems": *[_type == "bwaFaqItem"] | order(order asc) { question, answer }
}`;

const TICKETS_QUERY = /* groq */ `*[_type == "shipTicket"] | order(postedAt desc) {
  "id": _id,
  "name": coalesce(builderRef->name, name),
  "builderSlug": coalesce(builderRef->slug.current, builderSlug),
  "project": coalesce(projectRef->title, project),
  episode, pledge, status, postedAt, shippedEpisode,
  "carriedCount": count(history[action == "carried-over"])
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
        items: data?.projects?.length
          ? data.projects.map((p: {
              title: string; description: string; previewImage?: unknown;
              url: string; batch?: string; industry?: string;
              builders?: Array<{
                name?: string; slug?: string; role?: string; school?: string;
                bio?: string; photo?: unknown; profileUrl?: string;
              }>;
            }): BwaProject => ({
              title: p.title,
              description: p.description,
              previewImage: urlFor(p.previewImage) ?? f.projects.items[0].previewImage,
              url: p.url,
              batch: p.batch?.trim() || 'Earlier episodes',
              industry: p.industry?.trim() || 'Misc',
              builders: (p.builders ?? [])
                .filter(builder => builder.name?.trim())
                .map((builder): BwaBuilder => ({
                  name: builder.name!.trim(),
                  slug: builder.slug?.trim() || builder.name!.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  role: builder.role?.trim() || undefined,
                  school: builder.school?.trim() || undefined,
                  bio: builder.bio?.trim() || undefined,
                  photo: urlFor(builder.photo),
                  profileUrl: builder.profileUrl?.trim() || undefined,
                })),
            }))
          : f.projects.items,
      },
      faq: {
        heading: pick(s.faqHeading, f.faq.heading),
        items: data?.faqItems?.length ? data.faqItems : f.faq.items,
      },
      ticketsHeading: pick(s.ticketsHeading, f.ticketsHeading),
      buildersHeading: pick(s.buildersHeading, f.buildersHeading),
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
      id: string; name: string; builderSlug?: string; project?: string; episode?: string;
      pledge: string; status?: string; postedAt?: string;
      shippedEpisode?: string; carriedCount?: number;
    }): ShipTicket => ({
      id: t.id,
      name: t.name,
      builderSlug: t.builderSlug?.trim() || undefined,
      project: t.project || undefined,
      episode: t.episode ?? '',
      pledge: t.pledge,
      status: t.status === 'shipped' || t.status === 'carried-over' ? t.status : 'pledged',
      shippedEpisode: t.shippedEpisode || undefined,
      carriedCount: t.carriedCount || undefined,
      date: t.postedAt
        ? new Date(t.postedAt).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })
        : '',
    }));
  } catch (error) {
    console.error('[sanity] ship tickets fetch failed, using fallback:', error);
    return FALLBACK_CONTENT.shipTickets;
  }
}
