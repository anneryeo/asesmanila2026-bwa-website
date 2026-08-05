import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/application`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/shiptickets`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/builders`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
  ];
}
