/**
 * A public ship ticket: a pledge posted at a Build with ASES episode, shown
 * on buildwithases.asesmanila.com/shiptickets. Attenders come back the next
 * episode and mark it shipped (or carry it over).
 *
 * Plain-object schema — register it in the parent repo's Studio
 * (sanity/schemaTypes/index.ts). See sanity/README.md.
 */
export const shipTicket = {
  name: 'shipTicket',
  title: 'Ship ticket',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Builder name',
      type: 'string',
      description: 'Display name shown on the public ticket.',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'project',
      title: 'Project (optional)',
      type: 'string',
      description: 'The build the pledge belongs to, if any.',
    },
    {
      name: 'projectRef',
      title: 'Project reference (recommended)',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'Links this ticket to the project card and builder progress profile. Keep the text project field for backwards compatibility.',
    },
    {
      name: 'builderRef',
      title: 'Builder profile (recommended)',
      type: 'reference',
      to: [{ type: 'bwaBuilder' }],
      description: 'Canonical profile that owns this ticket.',
    },
    {
      name: 'builderSlug',
      title: 'Builder slug',
      type: 'string',
      description: 'Stable builder ID matching the slug on the project builder entry, e.g. "mika-reyes".',
    },
    {
      name: 'episode',
      title: 'Pledged at episode',
      type: 'string',
      description: 'Episode where the ticket was posted, e.g. "Episode 03". Never changes — carry-overs and the ship stamp are tracked in the history below.',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'pledge',
      title: 'Pledge',
      type: 'text',
      rows: 3,
      description: 'What they promise to ship by the next episode. Keep it one sentence.',
      validation: (Rule: { required: () => { max: (n: number) => unknown } }) => Rule.required().max(200),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pledged', value: 'pledged' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Carried over', value: 'carried-over' },
        ],
        layout: 'radio',
      },
      initialValue: 'pledged',
    },
    {
      name: 'shippedEpisode',
      title: 'Shipped at episode',
      type: 'string',
      description: 'Episode where the pledge was stamped shipped. Empty until then. A ticket pledged at Episode 01 and shipped at Episode 05 keeps both.',
    },
    {
      name: 'history',
      title: 'Status history',
      type: 'array',
      description: 'One entry per stamp: every carry-over and the final ship. Written by the site when a builder updates their ticket.',
      of: [
        {
          type: 'object',
          name: 'ticketStamp',
          fields: [
            {
              name: 'action',
              title: 'Action',
              type: 'string',
              options: {
                list: [
                  { title: 'Shipped', value: 'shipped' },
                  { title: 'Carried over', value: 'carried-over' },
                ],
              },
            },
            { name: 'episode', title: 'Episode', type: 'string' },
            { name: 'at', title: 'Stamped at', type: 'datetime' },
          ],
          preview: {
            select: { title: 'action', subtitle: 'episode' },
          },
        },
      ],
    },
    {
      name: 'postedAt',
      title: 'Posted at',
      type: 'datetime',
    },
    {
      name: 'updatedAt',
      title: 'Last updated',
      type: 'datetime',
      description: 'Set when the builder stamps the ticket shipped or carries it over.',
    },
    {
      name: 'email',
      title: 'Contact email (private)',
      type: 'string',
      description: 'Never rendered on the site — used to match returning builders to their tickets.',
    },
  ],
  preview: {
    select: { title: 'pledge', subtitle: 'name' },
  },
};
