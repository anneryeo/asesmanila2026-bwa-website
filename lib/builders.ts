import type { BwaBuilder, BwaProject, ShipTicket } from '@/content/bwaContent';

export type BuilderProgress = BwaBuilder & {
  projects: BwaProject[];
  /** Project labels named on tickets that do not yet have a full Sanity project document. */
  projectNames: string[];
  tickets: ShipTicket[];
  shippedCount: number;
  activeCount: number;
  completion: number;
};

export const normalizeBuilderKey = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function buildBuilderProfiles(projects: BwaProject[], tickets: ShipTicket[]): BuilderProgress[] {
  const profiles = new Map<string, Omit<BuilderProgress, 'shippedCount' | 'activeCount' | 'completion'>>();
  const projectBuilders = new Map<string, string[]>();

  projects.forEach(project => {
    const keys: string[] = [];
    project.builders.forEach(builder => {
      const key = builder.slug || normalizeBuilderKey(builder.name);
      keys.push(key);
      const existing = profiles.get(key);
      if (existing) {
        if (!existing.projects.some(item => item.title === project.title)) existing.projects.push(project);
        profiles.set(key, { ...existing, ...builder, projects: existing.projects, projectNames: existing.projectNames, tickets: existing.tickets });
      } else profiles.set(key, { ...builder, slug: key, projects: [project], projectNames: [project.title], tickets: [] });
    });
    projectBuilders.set(normalizeBuilderKey(project.title), keys);
  });

  tickets.forEach(ticket => {
    const explicitKey = ticket.builderSlug || normalizeBuilderKey(ticket.name);
    const linked = ticket.project ? projectBuilders.get(normalizeBuilderKey(ticket.project)) ?? [] : [];
    const key = profiles.has(explicitKey) ? explicitKey : linked.length === 1 ? linked[0] : explicitKey;
    const existing = profiles.get(key);
    const ticketProjectKey = ticket.project ? normalizeBuilderKey(ticket.project) : '';
    const matchingProject = ticketProjectKey
      ? projects.find(project => {
          const projectKey = normalizeBuilderKey(project.title);
          return projectKey === ticketProjectKey || projectKey.startsWith(`${ticketProjectKey}-`) || ticketProjectKey.startsWith(`${projectKey}-`);
        })
      : undefined;
    if (existing) {
      existing.tickets.push(ticket);
      if (matchingProject && !existing.projects.some(project => project.title === matchingProject.title)) existing.projects.push(matchingProject);
      const projectName = matchingProject?.title || ticket.project;
      if (projectName && !existing.projectNames.some(name => normalizeBuilderKey(name) === normalizeBuilderKey(projectName))) existing.projectNames.push(projectName);
    } else profiles.set(key, {
      name: ticket.name,
      slug: key,
      role: 'Builder',
      projects: matchingProject ? [matchingProject] : [],
      projectNames: matchingProject ? [matchingProject.title] : ticket.project ? [ticket.project] : [],
      tickets: [ticket],
    });
  });

  return [...profiles.values()].map(profile => {
    const shippedCount = profile.tickets.filter(ticket => ticket.status === 'shipped').length;
    const activeCount = profile.tickets.length - shippedCount;
    return { ...profile, shippedCount, activeCount, completion: profile.tickets.length ? Math.round(shippedCount / profile.tickets.length * 100) : 0 };
  }).sort((a, b) => (b.tickets.length * 10 + b.projectNames.length) - (a.tickets.length * 10 + a.projectNames.length) || a.name.localeCompare(b.name));
}

export const getBuilderBySlug = (projects: BwaProject[], tickets: ShipTicket[], slug: string) =>
  buildBuilderProfiles(projects, tickets).find(builder => builder.slug === slug);
