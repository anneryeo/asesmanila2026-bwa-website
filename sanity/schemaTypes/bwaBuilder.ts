/**
 * Canonical public builder profile. Projects and ship tickets reference this
 * document so one person can own multiple builds without duplicating profile
 * data. `email` is private and must never be selected by public GROQ queries.
 */
export const bwaBuilder = {
  name: 'bwaBuilder',
  title: 'BWA builder',
  type: 'document',
  fields: [
    { name: 'name', title: 'Builder name', type: 'string', validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'slug', title: 'Profile slug', type: 'slug', options: { source: 'name', maxLength: 64 }, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'school', title: 'School or community', type: 'string' },
    { name: 'bio', title: 'Short bio', type: 'text', rows: 4 },
    { name: 'photo', title: 'Profile photo', type: 'image', options: { hotspot: true } },
    { name: 'profileUrl', title: 'Portfolio or profile URL', type: 'url' },
    { name: 'email', title: 'Owner email (private)', type: 'string', description: 'Used only for ownership verification. Never rendered publicly.' },
    { name: 'featuredRank', title: 'Featured rank', type: 'number', description: 'Lower numbers appear first in the homepage top-five preview.' },
  ],
  orderings: [{ title: 'Featured first', name: 'featuredRankAsc', by: [{ field: 'featuredRank', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
};
