'use client';

import { useState } from 'react';

export function BuilderEditRequest({ slug, name }: { slug: string; name: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending'); const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/builder-profile/edit-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, slug }) });
    const body = await response.json().catch(() => ({})); setMessage(body.message || 'Could not submit request.'); setState(response.ok && body.success ? 'done' : 'error');
  }
  if (state === 'done') return <div className="border-2 border-[#112F7F] bg-white p-8"><h1 className="m-0 font-display text-[32px] font-[700] text-[#0C143F]">Request received.</h1><p className="mb-0 mt-4 font-body leading-[1.7] text-[#0C143F]/70">{message}</p></div>;
  const field = 'w-full border border-[#112F7F]/30 bg-white px-4 py-3 font-body text-[14px] text-[#0C143F] outline-none focus:border-[#D33C24]';
  return <form onSubmit={submit} className="border-2 border-[#112F7F] bg-white p-6 shadow-[10px_10px_0_rgba(17,47,127,0.14)] sm:p-9"><p className="m-0 font-subhead text-[11px] font-bold uppercase tracking-[0.16em] text-[#D33C24]">Profile edit request</p><h1 className="mb-0 mt-2 font-display text-[clamp(30px,5vw,48px)] font-[700] text-[#0C143F]">Update {name}</h1><p className="mb-0 mt-4 font-body text-[14px] leading-[1.7] text-[#0C143F]/65">For safety, this submits an admin-reviewed change request. Email matching alone is not strong enough to auto-publish changes to a public profile.</p><div className="mt-7 grid gap-5"><label className="font-subhead text-[12px] font-bold text-[#0C143F]">Owner email<input required name="email" type="email" className={`${field} mt-2`} /></label><label className="font-subhead text-[12px] font-bold text-[#0C143F]">Role<input name="role" className={`${field} mt-2`} /></label><label className="font-subhead text-[12px] font-bold text-[#0C143F]">School or community<input name="school" className={`${field} mt-2`} /></label><label className="font-subhead text-[12px] font-bold text-[#0C143F]">Short bio<textarea name="bio" rows={5} className={`${field} mt-2 resize-y`} /></label><label className="font-subhead text-[12px] font-bold text-[#0C143F]">Portfolio/profile URL<input name="profileUrl" type="url" className={`${field} mt-2`} /></label></div>{state === 'error' && <p className="mb-0 mt-4 font-body text-[13px] text-[#D33C24]">{message}</p>}<button disabled={state === 'sending'} className="mt-7 bg-[#D33C24] px-6 py-4 font-display text-[14px] font-[350] text-white disabled:opacity-60">{state === 'sending' ? 'Submitting…' : 'Submit edit request'}</button></form>;
}
