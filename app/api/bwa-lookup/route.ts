import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec';

/**
 * Duplicate / returning-builder check. Proxies the Apps Script's
 * `?action=lookup&email=` endpoint (see docs/bwa-apps-script.gs) and always
 * degrades to { found: false } — a deployed script that predates the lookup
 * action, a network failure, or junk output must never block the form.
 */
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase() ?? '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ found: false });
  }

  try {
    const upstream = await fetch(
      `${APPS_SCRIPT_URL}?action=lookup&email=${encodeURIComponent(email)}`,
      { cache: 'no-store' },
    );
    const text = await upstream.text();

    let body: { found?: boolean; role?: string; name?: string; lastSession?: string };
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }

    if (body?.found !== true) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      role: body.role ?? '',
      name: body.name ?? '',
      lastSession: body.lastSession ?? '',
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
