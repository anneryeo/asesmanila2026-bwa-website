/**
 * Two optional fields to ADD to the parent repo's existing `project` schema
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
];
