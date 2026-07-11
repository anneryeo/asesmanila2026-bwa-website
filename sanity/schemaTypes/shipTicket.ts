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
      name: 'episode',
      title: 'Episode',
      type: 'string',
      description: 'Episode where the ticket was posted, e.g. "Episode 03".',
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
      name: 'postedAt',
      title: 'Posted at',
      type: 'datetime',
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
