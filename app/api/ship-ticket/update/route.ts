import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion } from '@/lib/sanity/client';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec';

/**
 * Stamps a ship ticket: shipped, or carried over to the current episode.
 * Honor-system identity — the ticket's own email must match the one supplied.
 * Sanity is the record for status (it holds the document); the Apps Script
 * gets a best-effort log so the sheet mirrors the outcome.
 *
 * The ticket keeps its journey: `episode` stays the pledged episode forever,
 * `shippedEpisode` records where it finally shipped, and every stamp is
 * appended to `history` — so a ticket pledged at Episode 01 and shipped at
 * Episode 05 tells that whole story on the wall.
 */
export async function POST(request: Request) {
  let body: { email?: string; ticketId?: string; action?: string; episode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const ticketId = body.ticketId?.trim() ?? '';
  const action = body.action === 'shipped' || body.action === 'carried-over' ? body.action : null;
  const episode = body.episode?.trim() ?? '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ticketId || !action) {
    return NextResponse.json(
      { success: false, message: 'Email, ticket, and a valid action are required.' },
      { status: 400 },
    );
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    return NextResponse.json(
      { success: false, message: 'Ticket updates are not available right now.' },
      { status: 503 },
    );
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  let ticket: {
    email?: string; status?: string; pledge?: string;
    history?: { action?: string; episode?: string }[];
  } | null;
  try {
    ticket = await client.fetch(
      /* groq */ `*[_type == "shipTicket" && _id == $id][0]{ email, status, pledge, history }`,
      { id: ticketId },
    );
  } catch (error) {
    console.error('[ship-ticket/update] Sanity fetch failed:', error);
    return NextResponse.json(
      { success: false, message: 'Could not load the ticket. Please try again.' },
      { status: 502 },
    );
  }

  if (!ticket || (ticket.email ?? '').trim().toLowerCase() !== email) {
    return NextResponse.json(
      { success: false, message: "That ticket doesn't match this email." },
      { status: 404 },
    );
  }
  if (ticket.status === 'shipped') {
    return NextResponse.json({
      success: false,
      message: 'That ticket is already stamped shipped. Post a new pledge instead.',
    });
  }
  const lastStamp = ticket.history?.[ticket.history.length - 1];
  if (
    action === 'carried-over' &&
    lastStamp?.action === 'carried-over' &&
    episode &&
    lastStamp?.episode === episode
  ) {
    return NextResponse.json({
      success: false,
      message: 'Already carried over to this episode.',
    });
  }

  const now = new Date().toISOString();
  try {
    let patch = client
      .patch(ticketId)
      .set({ status: action, updatedAt: now })
      .setIfMissing({ history: [] })
      .append('history', [
        { _key: now, _type: 'ticketStamp', action, episode, at: now },
      ]);
    if (action === 'shipped') patch = patch.set({ shippedEpisode: episode });
    await patch.commit();
  } catch (error) {
    console.error('[ship-ticket/update] Sanity patch failed:', error);
    return NextResponse.json(
      { success: false, message: 'Could not update the ticket. Please try again.' },
      { status: 502 },
    );
  }

  // Best-effort mirror to the sheet — Sanity already holds the new status.
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'shipticket-update',
        email,
        pledge: ticket.pledge ?? '',
        action,
        episode,
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[ship-ticket/update] Sheet log failed (non-fatal):', error);
  }

  return NextResponse.json({ success: true, status: action });
}
