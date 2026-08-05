/**
 * Optional fields to ADD to the parent repo's existing `project` schema
 * (asesmanila2026-website/sanity/schemaTypes/project.ts). They power this
 * site's project catalogue filters. Optional, so existing project documents
 * keep working untouched.
 */
export const projectBwaFields = [
  {
    name: 'batch',
    title: 'BWA episode batch',
    type: 'string',
    description: 'Episode run the project was presented in, e.g. "Episode 02". Drives the batch filter on buildwithases.asesmanila.com.',
  },
  {
    name: 'industry',
    title: 'Industry',
    type: 'string',
    description: 'The space the project plays in, e.g. "Fintech", "EdTech". Drives the industry filter on buildwithases.asesmanila.com.',
  },
  {
    name: 'builderName',
    title: 'Builder name',
    type: 'string',
    description: 'The public-facing builder or team name shown with this project. Add this even when canonical builder profiles are linked below.',
  },
  {
    name: 'builderRefs',
    title: 'Builder profiles',
    type: 'array',
    description: 'Canonical builder profiles attached to this project. Use this for new content; the embedded Builders field remains for legacy documents.',
    of: [{ type: 'reference', to: [{ type: 'bwaBuilder' }] }],
  },
  {
    name: 'builders',
    title: 'Builders (legacy embedded profiles)',
    type: 'array',
    description: 'The people building this project. A stable slug links their projects and ship tickets into one public progress profile.',
    of: [
      {
        type: 'object',
        name: 'projectBuilder',
        fields: [
          {
            name: 'name',
            title: 'Builder name',
            type: 'string',
            validation: (Rule: { required: () => unknown }) => Rule.required(),
          },
          {
            name: 'slug',
            title: 'Builder slug',
            type: 'slug',
            options: { source: 'name', maxLength: 64 },
            description: 'Keep this identical for the same builder across projects, e.g. "mika-reyes".',
            validation: (Rule: { required: () => unknown }) => Rule.required(),
          },
          { name: 'role', title: 'Role', type: 'string', description: 'e.g. Founder, Designer, Engineer' },
          { name: 'school', title: 'School or community', type: 'string' },
          { name: 'bio', title: 'Short builder bio', type: 'text', rows: 3 },
          { name: 'photo', title: 'Profile photo', type: 'image', options: { hotspot: true } },
          { name: 'profileUrl', title: 'Portfolio or profile URL', type: 'url' },
        ],
        preview: {
          select: { title: 'name', subtitle: 'role', media: 'photo' },
        },
      },
    ],
  },
];
