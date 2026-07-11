/**
 * Singleton settings document for buildwithases.asesmanila.com — hero and
 * manifesto copy, plus section headings. Every field is optional; empty
 * fields fall back to content/bwaContent.ts. Plain-object schema — register
 * in the parent Studio; see sanity/README.md.
 */
export const bwaSettings = {
  name: 'bwaSettings',
  title: 'BWA site settings',
  type: 'document',
  fields: [
    {
      name: 'heroHeading',
      title: 'Hero heading',
      type: 'string',
      description: 'Wrap the emphasized word in *stars*, e.g. "Where *students* show what they\'re building".',
    },
    {
      name: 'heroSubheading',
      title: 'Hero subheading',
      type: 'text',
      rows: 2,
    },
    {
      name: 'manifestoAdjectives',
      title: 'Manifesto: "Build like ___" endings',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'manifestoActions',
      title: 'Manifesto: "Build even if you\'re ___" endings',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keep each ending short so the line holds on one line. Default set includes "scared".',
    },
    {
      name: 'manifestoPurposes',
      title: 'Manifesto: "Build cause ___" endings',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'projectsHeading',
      title: 'Projects heading',
      type: 'string',
    },
    {
      name: 'projectsSubheading',
      title: 'Projects subheading',
      type: 'text',
      rows: 2,
      description: '*Starred* spans render bold.',
    },
    {
      name: 'faqHeading',
      title: 'FAQ heading',
      type: 'string',
    },
  ],
  preview: {
    prepare: () => ({ title: 'BWA site settings' }),
  },
};
