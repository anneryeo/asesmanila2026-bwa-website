import { createClient, type SanityClient } from '@sanity/client';

// Same Sanity project as the main asesmanila.com site — this repo only reads
// from it (projects, BWA FAQ notes, ship tickets). Copy the values from the
// parent repo's .env.local; see .env.example.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
export const apiVersion = '2026-07-11';

/** null when no Sanity project is configured — callers fall back to local content. */
export const sanityClient: SanityClient | null = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;
