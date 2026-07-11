/**
 * A BWA-specific FAQ sticky note (distinct from the parent site's faqItem,
 * which feeds asesmanila.com). Plain-object schema — register in the parent
 * Studio; see sanity/README.md.
 */
export const bwaFaqItem = {
  name: 'bwaFaqItem',
  title: 'BWA FAQ item',
  type: 'document',
  fields: [
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers show first.',
      initialValue: 0,
    },
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'question', subtitle: 'answer' },
  },
};
