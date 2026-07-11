import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion } from '@/lib/sanity/client';

/**
 * Posts a public ship ticket to the wall. Writes a `shipTicket` document to
 * the shared Sanity project when SANITY_API_WRITE_TOKEN is configured;
 * otherwise it's a graceful no-op (the pledge still lands in the Google
 * Sheet via the main application payload). Best-effort by design — the
 * application submit must never fail because of the wall.
 */
export async function POST(request: Request) {
  let body: { name?: string; email?: string; project?: string; episode?: string; pledge?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 });
  }

  const name = body.name?.trim() ?? '';
  const pledge = body.pledge?.trim() ?? '';
  if (!name || !pledge) {
    return NextResponse.json({ success: false, message: 'Name and pledge are required.' }, { status: 400 });
  }
  if (pledge.length > 200) {
    return NextResponse.json({ success: false, message: 'Keep the pledge under 200 characters.' }, { status: 400 });
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    // No CMS write access configured — accept the ticket quietly so the
    // form flow stays intact. The team can transcribe from the sheet.
    return NextResponse.json({ success: true, stored: false });
  }

  try {
    const writeClient = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
    await writeClient.create({
      _type: 'shipTicket',
      name,
      project: body.project?.trim() || undefined,
      episode: body.episode?.trim() || '',
      pledge,
      status: 'pledged',
      postedAt: new Date().toISOString(),
      email: body.email?.trim().toLowerCase() || undefined,
    });
    return NextResponse.json({ success: true, stored: true });
  } catch (error) {
    console.error('[ship-ticket] Sanity write failed:', error);
    // Still a soft success — the pledge is preserved in the sheet.
    return NextResponse.json({ success: true, stored: false });
  }
}
