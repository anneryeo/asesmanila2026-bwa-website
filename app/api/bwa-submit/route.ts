import { NextResponse } from 'next/server';

const APPS_SCRIPT_POST_URL =
  'https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const upstream = await fetch(APPS_SCRIPT_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await upstream.text();

    let body: { success?: boolean; duplicate?: boolean; message?: string };
    try {
      body = text
        ? (JSON.parse(text) as { success?: boolean; duplicate?: boolean; message?: string })
        : { success: false, message: 'Empty response from submission service.' };
    } catch {
      body = { success: false, message: 'Invalid response from submission service.' };
    }

    return NextResponse.json(body, {
      status: upstream.ok ? 200 : upstream.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        duplicate: false,
        message: error instanceof Error ? error.message : 'Submission request failed.',
      },
      { status: 500 },
    );
  }
}
