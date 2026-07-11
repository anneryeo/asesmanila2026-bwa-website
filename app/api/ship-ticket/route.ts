import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion } from '@/lib/sanity/client';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec';

/**
 * Posts a public ship ticket to the wall. The Apps Script is the gatekeeper:
 * it verifies the email exists in the Presenters/Watchers lists (no tickets
 * from people who were never in the room), rejects identical pledges, and
 * throttles per-email volume. Only after the sheet accepts the ticket does it
 * get written to Sanity for the public wall (best effort; the sheet row is
 * the durable record either way).
 */
export async function POST(request: Request) {
  let body: { name?: string; email?: string; project?: string; episode?: string; pledge?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 });
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const pledge = body.pledge?.trim() ?? '';
  if (!name || !pledge || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: 'Name, a valid email, and a pledge are required.' }, { status: 400 });
  }
  if (pledge.length > 200) {
    return NextResponse.json({ success: false, message: 'Keep the pledge under 200 characters.' }, { status: 400 });
  }

  // 1. The sheet decides: attendance check, dedupe, and daily throttle all
  //    happen in the Apps Script so the rules live next to the data.
  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'shipticket',
        name,
        email,
        project: body.project?.trim() ?? '',
        episode: body.episode?.trim() ?? '',
        pledge,
      }),
      cache: 'no-store',
    });
    const text = await upstream.text();
    let sheetResult: { success?: boolean; message?: string; notFound?: boolean; duplicate?: boolean };
    try {
      sheetResult = text ? JSON.parse(text) : { success: false, message: 'Empty response from the sheet.' };
    } catch {
      sheetResult = { success: false, message: 'Invalid response from the sheet.' };
    }
    if (!sheetResult.success) {
      return NextResponse.json({
        success: false,
        notFound: !!sheetResult.notFound,
        duplicate: !!sheetResult.duplicate,
        message: sheetResult.message ?? 'The ticket was not accepted.',
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Could not reach the ticket service. Please try again.' },
      { status: 502 },
    );
  }

  // 2. Mirror to Sanity so the public wall updates (best effort).
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
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
      email,
    });
    return NextResponse.json({ success: true, stored: true });
  } catch (error) {
    console.error('[ship-ticket] Sanity write failed:', error);
    // The sheet already has the ticket; the wall catches up manually.
    return NextResponse.json({ success: true, stored: false });
  }
}
