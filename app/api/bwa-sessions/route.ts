import { NextResponse } from 'next/server';

const APPS_SCRIPT_GET_URL =
  'https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec';

export async function GET() {
  try {
    const upstream = await fetch(APPS_SCRIPT_GET_URL, {
      cache: 'no-store',
    });

    const text = await upstream.text();

    let sessions: Array<{ id: string; label: string }>;
    try {
      sessions = text ? (JSON.parse(text) as Array<{ id: string; label: string }>) : [];
    } catch {
      sessions = [];
    }

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ sessions: [] }, { status: 200 });
  }
}
