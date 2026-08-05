# Sanity schemas for Build with ASES

This site **reads** from the same Sanity project as the main
`asesmanila2026-website` repo (same `NEXT_PUBLIC_SANITY_PROJECT_ID`, see
`.env.example`). The Studio itself lives in the parent repo — this folder only
version-controls the schema types this site needs, written as plain objects so
they can be dropped into the parent Studio unchanged.

## To register (one-time, in the parent repo)

1. Copy `shipTicket.ts`, `bwaFaqItem.ts`, `bwaSettings.ts`, and `bwaBuilder.ts` into
   `asesmanila2026-website/sanity/schemaTypes/`.
2. Add them to `sanity/schemaTypes/index.ts`:

   ```ts
   import { shipTicket } from './shipTicket';
   import { bwaFaqItem } from './bwaFaqItem';
   import { bwaSettings } from './bwaSettings';
   import { bwaBuilder } from './bwaBuilder';

   export const schemaTypes = [siteSettings, bwaSettings, bwaBuilder, project, bwaCard, event, faqItem, bwaFaqItem, shipTicket];
   ```

3. Add the BWA fields from `project-bwa-fields.ts` to the existing
   `project.ts` schema. `batch` + `industry` power project filters, while
   `builders` powers builder profiles and progress continuity. All are
   optional, so existing project documents keep working.
4. Optionally add Studio structure entries (see `sanity.config.ts` in the
   parent) for **BWA settings** (singleton), **BWA FAQ**, and **Ship tickets**.

## Document types

| Type          | Used by                | Notes                                        |
|---------------|------------------------|----------------------------------------------|
| `project`     | Projects + builders     | Shared with parent site; + `batch`, `industry`, `builders` |
| `bwaSettings` | Hero + manifesto copy  | Singleton                                    |
| `bwaBuilder`  | Builder profile pages   | Canonical identity; referenced by projects/tickets |
| `bwaFaqItem`  | Home FAQ sticky notes  | Separate from the parent's `faqItem`         |
| `shipTicket`  | Tickets + progress      | Public pledges; optional project/builder links |
