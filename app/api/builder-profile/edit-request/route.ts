import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion } from '@/lib/sanity/client';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec';
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as null | Record<string, string>; const email = body?.email?.trim().toLowerCase() ?? ''; const slug = body?.slug?.trim() ?? '';
  if (!slug || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, message: 'A valid owner email is required.' }, { status: 400 });
  const token = process.env.SANITY_API_WRITE_TOKEN; if (!projectId || !token) return NextResponse.json({ success: false, message: 'Profile requests are unavailable right now.' }, { status: 503 });
  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  const owner = await client.fetch<{ _id: string } | null>(`*[_type == "bwaBuilder" && slug.current == $slug && lower(email) == $email][0]{ _id }`, { slug, email }).catch(() => null);
  if (!owner) return NextResponse.json({ success: false, message: 'That email does not match this builder profile.' }, { status: 403 });
  const payload = { role: 'builder-profile-edit-request', slug, email, changes: { role: body?.role ?? '', school: body?.school ?? '', bio: body?.bio ?? '', profileUrl: body?.profileUrl ?? '' } };
  const upstream = await fetch(APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), cache: 'no-store' }).catch(() => null);
  if (!upstream?.ok) return NextResponse.json({ success: false, message: 'Could not queue the request. Please try again.' }, { status: 502 });
  return NextResponse.json({ success: true, message: 'We matched the owner email and queued the changes for review. Nothing is auto-published.' });
}
