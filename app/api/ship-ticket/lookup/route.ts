import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion } from '@/lib/sanity/client';

/**
 * Returns a builder's open ship tickets (pledged or carried over) so they can
 * come back and stamp them. Honor-system identity: the email they posted with
 * is the key. The email itself is never returned — only the public fields of
 * their own tickets plus the Sanity ids needed to stamp them.
 */
export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: 'Enter a valid email address.' }, { status: 400 });
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    return NextResponse.json(
      { success: false, message: 'Ticket updates are not available right now.' },
      { status: 503 },
    );
  }

  try {
    const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
    const tickets: {
      id: string; pledge: string; project?: string; episode?: string; status?: string; carriedCount?: number;
    }[] = await client.fetch(
      /* groq */ `*[_type == "shipTicket" && lower(email) == $email && status != "shipped"]
        | order(postedAt desc) {
          "id": _id, pledge, project, episode, status,
          "carriedCount": count(history[action == "carried-over"])
        }`,
      { email },
    );

    return NextResponse.json({
      success: true,
      tickets: tickets.map(t => ({
        id: t.id,
        pledge: t.pledge,
        project: t.project || undefined,
        episode: t.episode ?? '',
        status: t.status === 'carried-over' ? 'carried-over' : 'pledged',
        carriedCount: t.carriedCount || 0,
      })),
    });
  } catch (error) {
    console.error('[ship-ticket/lookup] Sanity fetch failed:', error);
    return NextResponse.json(
      { success: false, message: 'Could not look up tickets. Please try again.' },
      { status: 502 },
    );
  }
}
