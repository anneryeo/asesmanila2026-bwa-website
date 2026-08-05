import type { BwaBuilder, BwaProject, ShipTicket } from '@/content/bwaContent';

export type BuilderProgress = BwaBuilder & {
  projects: BwaProject[];
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
        profiles.set(key, { ...existing, ...builder, projects: existing.projects, tickets: existing.tickets });
      } else profiles.set(key, { ...builder, slug: key, projects: [project], tickets: [] });
    });
    projectBuilders.set(normalizeBuilderKey(project.title), keys);
  });

  tickets.forEach(ticket => {
    const explicitKey = ticket.builderSlug || normalizeBuilderKey(ticket.name);
    const linked = ticket.project ? projectBuilders.get(normalizeBuilderKey(ticket.project)) ?? [] : [];
    const key = profiles.has(explicitKey) ? explicitKey : linked.length === 1 ? linked[0] : explicitKey;
    const existing = profiles.get(key);
    if (existing) existing.tickets.push(ticket);
    else profiles.set(key, {
      name: ticket.name,
      slug: key,
      role: 'Builder',
      projects: ticket.project ? projects.filter(project => normalizeBuilderKey(project.title) === normalizeBuilderKey(ticket.project!)) : [],
      tickets: [ticket],
    });
  });

  return [...profiles.values()].map(profile => {
    const shippedCount = profile.tickets.filter(ticket => ticket.status === 'shipped').length;
    const activeCount = profile.tickets.length - shippedCount;
    return { ...profile, shippedCount, activeCount, completion: profile.tickets.length ? Math.round(shippedCount / profile.tickets.length * 100) : 0 };
  }).sort((a, b) => (b.tickets.length * 10 + b.projects.length) - (a.tickets.length * 10 + a.projects.length) || a.name.localeCompare(b.name));
}

export const getBuilderBySlug = (projects: BwaProject[], tickets: ShipTicket[], slug: string) =>
  buildBuilderProfiles(projects, tickets).find(builder => builder.slug === slug);
