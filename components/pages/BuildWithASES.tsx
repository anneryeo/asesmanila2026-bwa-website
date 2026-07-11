'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAGE_COPY = {
  badge: "ASES Manila '25 to '26",
  heading: "Show us what you're building.",
  headingAccent: "building.",
  subhead:
    "Bring the thing you've been hacking on at 2am. We'll put it in front of a room that actually gives a damn — founders, operators, and the people who hire — and they'll help you make it sharper.",
  rolePresent: "I'm presenting",
  roleWatch: "I'm watching",
  roleSubPresent: "Show your build live and defend it. Honest feedback, no clapping for the sake of it.",
  roleSubWatch: "Watch other builders get tested and meet people shipping the same way you are.",
  submitPresenter: "Send it in",
  submitWatcher: "Save my spot",
  subheadingTrack: "Pick your track",
  successPresenter:
    "You're in the queue. We'll review what you're building and reach out before the session — come ready to be honest about where you really are. We'll also ping you when the next one drops.",
  successWatcher:
    "Got it. We'll email your confirmation before the session — spots are limited, so hang tight. We'll keep you in the loop for every Build with ASES after this one too.",
  sessionFallback: "No upcoming sessions just yet. Drop your details below and we'll pull you in for the next one.",
  placeholderCuriosity: 'e.g. "A tool that helps freelancers invoice international clients in USD."',
  placeholderQ1: "e.g. \"Is the problem I'm solving actually real, or am I imagining it?\"",
  placeholderQ2: 'e.g. "Would you pay for this? What would make you not?"',
  placeholderQ3: "e.g. \"What's the one thing that would kill this in 6 months?\"",
  charLimit: 160,
  labelSession: "Which session?",
  labelName: "Name",
  labelEmail: "Email",
  labelProjectName: "What are you building?",
  labelOneLiner: "One-liner",
  labelOneLinerHint: "One sentence. What is it and who's it for.",
  labelStage: "Stage",
  labelStageIdea: "Idea — no code yet",
  labelStagePrototype: "Prototype — early build",
  labelStageLive: "Live — people are using it",
  labelLink: "Link or deck",
  labelLinkHint: "Site, deck, repo, or demo — whatever shows the build. This one's required.",
  labelQuestions: "The question you want answered by the end of the night",
  labelQuestionsHint: "The whole point of the room. Make it count.",
  labelMembership: "Are you an ASES member?",
  labelMembershipMember: "Yes — ASES member",
  labelMembershipNon: "Not yet",
  membershipNote: "Watching is free for ASES members. Non-members pay a small door fee — we'll email the details.",
  labelCuriosity: "What kind of build are you hoping to see? (optional)",
  labelNotifyFuture: "Notify me when the next Build with ASES drops",
  sessionLoading: "Loading sessions…",
  submitting: "Sending…",
  errorGeneric: "Something went wrong. Please try again.",
  errorEmailInvalid: "Please enter a valid email address.",
  errorRequired: "This field is required.",
  errorNoSession: "Pick a session so we know where to slot you.",
  errorMembership: "Let us know so we can sort out entry.",
  backHome: "← Back to ASES Manila",
  galleryLabel: "Scenes from past sessions",
} as const;

// Playful "I see what you're doing" bubbles for junk in the link/deck field.
// Always end on a CTA — never a scolding.
const LINK_JUNK_MESSAGES = [
  "Hey, I see what you're doing. Drop the real link — we actually want to see it.",
  "A lone dot? Bold. Now paste the deck or demo so we can geek out over it.",
  "We both know that's not a link. Give us something clickable.",
  "Nice try. That's not it — show us the build: site, repo, or deck.",
  "C'mon, you built something cool. Link it so the room can see it.",
] as const;

const LINK_EMPTY_MESSAGE =
  "Presenters need a link — site, deck, repo, or demo. Show us the build.";

// Ace pokes his head out and whispers one of these — rotates each page visit.
// Keep them short (one bubble line) and curious, never instructional.
const ACE_PEEK_LINES = [
  "psst… you new here?",
  "psst… don't know what Build with ASES is?",
  "first time? c'mere, I'll explain.",
  "lost? tap me real quick.",
  "wanna know what this is?",
  "10-second rundown? this way.",
] as const;

const GALLERY = [
  { src: '/images/bwa/bwa-01.webp', tall: false, width: 1600, height: 1067 },
  { src: '/images/bwa/bwa-06.webp', tall: true, width: 1200, height: 1600 },
  { src: '/images/bwa/bwa-03.webp', tall: false, width: 1600, height: 1200 },
  { src: '/images/bwa/bwa-07.webp', tall: true, width: 1200, height: 1600 },
  { src: '/images/bwa/bwa-02.webp', tall: false, width: 1600, height: 1067 },
  { src: '/images/bwa/bwa-08.webp', tall: false, width: 1600, height: 1200 },
  { src: '/images/bwa/bwa-05.webp', tall: false, width: 1600, height: 1200 },
  { src: '/images/bwa/bwa-04.webp', tall: false, width: 1600, height: 1200 },
  { src: '/images/bwa/bwa-09.webp', tall: false, width: 1600, height: 1200 },
] as const;

// White-primary blueprint surface: dark-navy hairlines on true white, same
// 48px cell and fixed attachment as the parent's grid system.
const BG = {
  backgroundColor: '#FFFFFF',
  backgroundImage: 'linear-gradient(rgba(7,31,107,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(7,31,107,0.06) 1px, transparent 1px)',
  backgroundSize: '48px 48px, 48px 48px',
  backgroundAttachment: 'fixed, fixed',
} as const;

const NAVY_INK = '#0C143F';

const BASE_FIELD: React.CSSProperties = {
  width: '100%',
  borderRadius: 6,
  color: NAVY_INK,
  fontFamily: 'var(--font-montserrat)',
  fontSize: 14,
  padding: '10px 12px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const TEXT_FIELD: React.CSSProperties = {
  ...BASE_FIELD,
  background: 'rgba(7,31,107,0.03)',
  border: '1px solid rgba(7,31,107,0.2)',
};

const SELECT_FIELD: React.CSSProperties = {
  ...BASE_FIELD,
  background: 'rgba(7,31,107,0.05)',
  border: '1px solid rgba(7,31,107,0.25)',
  paddingRight: 36,
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none' as 'none',
  cursor: 'pointer',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-cocogoose)',
  fontSize: 12,
  fontWeight: 400,
  color: NAVY_INK,
  marginBottom: 6,
  letterSpacing: '0.03em',
};

const HINT_STYLE: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(12,20,63,0.55)',
  fontFamily: 'var(--font-montserrat)',
  marginTop: 4,
};

const ERROR_STYLE: React.CSSProperties = {
  fontSize: 11,
  color: '#C03418',
  fontFamily: 'var(--font-montserrat)',
  marginTop: 4,
};

type Session = { id: string; label: string };
type Role = 'presenter' | 'watcher';
type Membership = '' | 'member' | 'non-member';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface PresenterFields {
  name: string;
  contact: string;
  projectName: string;
  oneLiner: string;
  stage: string;
  link: string;
  q1: string;
  q2: string;
  q3: string;
  notifyFuture: boolean;
}

interface WatcherFields {
  name: string;
  email: string;
  membership: Membership;
  curiosity: string;
  notifyFuture: boolean;
}

/** A link is "real enough" if it looks like a URL or a domain with a TLD. */
function isPlausibleLink(value: string): boolean {
  const s = value.trim().toLowerCase();
  if (s.length < 4) return false;
  const junk = new Set(['n/a', 'na', 'none', 'nope', 'idk', 'tbd', 'tba', 'soon', 'wip', '-', '.', '..', '...']);
  if (junk.has(s)) return false;
  if (/^https?:\/\/\S{3,}/i.test(s)) return true;
  if (/[a-z0-9][a-z0-9-]*\.[a-z]{2,}/i.test(s)) return true;
  return false;
}

export function BuildWithASES() {
  const [role, setRole] = useState<Role | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [linkBubble, setLinkBubble] = useState('');

  const [qCount, setQCount] = useState(1);

  const [presenter, setPresenter] = useState<PresenterFields>({
    name: '', contact: '', projectName: '', oneLiner: '',
    stage: 'idea', link: '', q1: '', q2: '', q3: '',
    notifyFuture: true,
  });

  const [watcher, setWatcher] = useState<WatcherFields>({
    name: '', email: '', membership: '', curiosity: '',
    notifyFuture: true,
  });

  useEffect(() => {
    fetch('/api/bwa-sessions')
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const selectedSession = sessions.find(s => s.id === sessionId);

  function flagLink() {
    if (presenter.link.trim() === '') {
      setLinkBubble(LINK_EMPTY_MESSAGE);
    } else {
      setLinkBubble(LINK_JUNK_MESSAGES[Math.floor(Math.random() * LINK_JUNK_MESSAGES.length)]);
    }
  }

  function isValid(): boolean {
    if (!role || !sessionId) return false;
    if (role === 'presenter') {
      return (
        presenter.name.trim().length > 0 &&
        EMAIL_REGEX.test(presenter.contact) &&
        presenter.projectName.trim().length > 0 &&
        presenter.oneLiner.trim().length > 0 &&
        isPlausibleLink(presenter.link) &&
        presenter.q1.trim().length > 0
      );
    }
    return (
      watcher.name.trim().length > 0 &&
      EMAIL_REGEX.test(watcher.email) &&
      watcher.membership !== ''
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (role === 'presenter' && !isPlausibleLink(presenter.link)) flagLink();
    if (!isValid()) return;

    setSubmitState('submitting');
    setErrorMessage('');

    const payload =
      role === 'presenter'
        ? {
            role,
            sessionId,
            sessionLabel: selectedSession?.label ?? '',
            name: presenter.name,
            contact: presenter.contact,
            projectName: presenter.projectName,
            oneLiner: presenter.oneLiner,
            stage: presenter.stage,
            link: presenter.link,
            questions: [presenter.q1, presenter.q2, presenter.q3].filter(Boolean),
            questionsText: [presenter.q1, presenter.q2, presenter.q3].filter(Boolean).join(' | '),
            notifyFuture: presenter.notifyFuture,
          }
        : {
            role,
            sessionId,
            sessionLabel: selectedSession?.label ?? '',
            name: watcher.name,
            email: watcher.email,
            membership: watcher.membership,
            curiosity: watcher.curiosity,
            notifyFuture: watcher.notifyFuture,
          };

    try {
      const res = await fetch('/api/bwa-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (data.success) {
        setSubmitState('success');
      } else {
        setSubmitState('error');
        setErrorMessage(data.message ?? PAGE_COPY.errorGeneric);
      }
    } catch {
      setSubmitState('error');
      setErrorMessage(PAGE_COPY.errorGeneric);
    }
  }

  const tf = (value: string): React.CSSProperties => ({
    ...TEXT_FIELD,
    border: attempted && !value.trim()
      ? '1px solid #D33C24'
      : '1px solid rgba(7,31,107,0.2)',
  });

  const ef = (value: string): React.CSSProperties => ({
    ...TEXT_FIELD,
    border: attempted && !EMAIL_REGEX.test(value)
      ? '1px solid #D33C24'
      : '1px solid rgba(7,31,107,0.2)',
  });

  /* ── success screen ── */
  if (submitState === 'success') {
    return (
      <div
        style={{
          minHeight: '100svh',
          ...BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <Image
            src="/images/ace-stand.svg"
            alt=""
            aria-hidden="true"
            width={750}
            height={750}
            unoptimized
            style={{ width: 120, height: 'auto', margin: '0 auto 24px', display: 'block' }}
          />
          <p
            style={{
              fontFamily: 'var(--font-cocogoose)',
              fontSize: 'clamp(16px, 2vw, 22px)',
              fontWeight: 300,
              color: NAVY_INK,
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            {role === 'presenter' ? PAGE_COPY.successPresenter : PAGE_COPY.successWatcher}
          </p>
          <Link
            href="https://www.asesmanila.com"
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 14,
              color: '#112F7F',
              textDecoration: 'none',
            }}
          >
            {PAGE_COPY.backHome}
          </Link>
        </div>
      </div>
    );
  }

  /* ── main form ── */
  return (
    <div
      style={{
        minHeight: '100svh',
        ...BG,
        padding: 'clamp(80px, 10vh, 120px) clamp(24px, 6vw, 80px) clamp(64px, 8vh, 96px)',
      }}
    >
      <div
        className="bwa-layout"
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(32px, 5vw, 72px)',
          alignItems: 'flex-start',
        }}
      >

        {/* ── LEFT: Form (capped width so the gallery absorbs extra space) ── */}
        <div className="bwa-form" style={{ flex: '0 1 560px', minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(12,20,63,0.55)',
              marginBottom: 10,
            }}
          >
            {PAGE_COPY.badge}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-cocogoose)',
              fontSize: 'clamp(28px, 4.4vw, 48px)',
              fontWeight: 350,
              color: NAVY_INK,
              marginBottom: 18,
              lineHeight: 1.1,
            }}
          >
            {PAGE_COPY.heading}
          </h1>

          {/* Punchy description — moved up, beneath the title, above the tracks */}
          <p
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              fontWeight: 400,
              color: 'rgba(12,20,63,0.82)',
              lineHeight: 1.7,
              maxWidth: 560,
              marginBottom: 28,
            }}
          >
            {PAGE_COPY.subhead}
          </p>

          {/* Ace gives the rundown — collapsible, remembered so returning users aren't nagged */}
          <AceRundown />

          <form id="form" onSubmit={handleSubmit} noValidate style={{ scrollMarginTop: 96 }}>

            {/* ── Role Toggle (red, submit-button styled) ── */}
            <div id="sessions" style={{ marginBottom: 32, scrollMarginTop: 96 }}>
              <div
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(12,20,63,0.55)',
                  marginBottom: 12,
                }}
              >
                {PAGE_COPY.subheadingTrack}
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                className="sm-role-row"
              >
                {(['presenter', 'watcher'] as Role[]).map(r => {
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="button-float-hover"
                      style={{
                        flex: 1,
                        padding: '16px 20px',
                        borderRadius: 0,
                        cursor: 'pointer',
                        textAlign: 'center',
                        background: selected ? '#D33C24' : 'rgba(211,60,36,0.72)',
                        border: selected ? `2px solid ${NAVY_INK}` : '2px solid rgba(12,20,63,0.2)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-cocogoose)',
                        fontSize: 'clamp(14px, 2vw, 17px)',
                        fontWeight: 350,
                        letterSpacing: '0.03em',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      {selected && (
                        <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: '0.95em', height: '0.95em', flexShrink: 0 }}>
                          <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {r === 'presenter' ? PAGE_COPY.rolePresent : PAGE_COPY.roleWatch}
                    </button>
                  );
                })}
              </div>
              {role && (
                <p style={{ ...HINT_STYLE, marginTop: 12, fontSize: 13, color: 'rgba(12,20,63,0.7)', lineHeight: 1.55 }}>
                  {role === 'presenter' ? PAGE_COPY.roleSubPresent : PAGE_COPY.roleSubWatch}
                </p>
              )}
            </div>

            {/* ── Session ── */}
            {role && (
              <div style={{ marginBottom: 28 }}>
                <label style={LABEL_STYLE}>{PAGE_COPY.labelSession}</label>
                {sessionsLoading ? (
                  <p style={{ ...HINT_STYLE, color: 'rgba(12,20,63,0.45)', marginTop: 10 }}>{PAGE_COPY.sessionLoading}</p>
                ) : sessions.length === 0 ? (
                  <p style={{ ...HINT_STYLE, color: 'rgba(12,20,63,0.55)', fontSize: 13, marginTop: 10 }}>{PAGE_COPY.sessionFallback}</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
                      {sessions.map(s => {
                        const selected = sessionId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSessionId(sessionId === s.id ? '' : s.id)}
                            style={{
                              width: '100%',
                              padding: '10px 18px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              border: selected
                                ? `1px solid ${NAVY_INK}`
                                : '1px solid rgba(211,60,36,0.6)',
                              background: selected
                                ? '#D33C24'
                                : 'rgba(211,60,36,0.45)',
                              color: '#ffffff',
                              fontFamily: 'var(--font-montserrat)',
                              fontSize: 13,
                              fontWeight: 500,
                              letterSpacing: '0.01em',
                              transition: 'border-color 0.2s ease, background 0.2s ease',
                            }}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                    {attempted && !sessionId && (
                      <p style={ERROR_STYLE}>{PAGE_COPY.errorNoSession}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Presenter Fields ── */}
            {role === 'presenter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FieldRow label={PAGE_COPY.labelName} required error={attempted && !presenter.name.trim()} errorMsg={PAGE_COPY.errorRequired}>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={presenter.name}
                    onChange={e => setPresenter(p => ({ ...p, name: e.target.value }))}
                    style={tf(presenter.name)}
                  />
                </FieldRow>

                <FieldRow label={PAGE_COPY.labelEmail} required error={attempted && !EMAIL_REGEX.test(presenter.contact)} errorMsg={PAGE_COPY.errorEmailInvalid}>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={presenter.contact}
                    onChange={e => setPresenter(p => ({ ...p, contact: e.target.value }))}
                    style={ef(presenter.contact)}
                  />
                </FieldRow>

                <FieldRow label={PAGE_COPY.labelProjectName} required error={attempted && !presenter.projectName.trim()} errorMsg={PAGE_COPY.errorRequired}>
                  <input
                    type="text"
                    required
                    value={presenter.projectName}
                    onChange={e => setPresenter(p => ({ ...p, projectName: e.target.value }))}
                    style={tf(presenter.projectName)}
                  />
                </FieldRow>

                <FieldRow label={PAGE_COPY.labelOneLiner} required hint={PAGE_COPY.labelOneLinerHint} error={attempted && !presenter.oneLiner.trim()} errorMsg={PAGE_COPY.errorRequired}>
                  <input
                    type="text"
                    required
                    value={presenter.oneLiner}
                    onChange={e => setPresenter(p => ({ ...p, oneLiner: e.target.value }))}
                    style={tf(presenter.oneLiner)}
                  />
                </FieldRow>

                <SelectField
                  label={PAGE_COPY.labelStage}
                  value={presenter.stage}
                  onChange={v => setPresenter(p => ({ ...p, stage: v }))}
                  options={[
                    { value: 'idea', label: PAGE_COPY.labelStageIdea },
                    { value: 'prototype', label: PAGE_COPY.labelStagePrototype },
                    { value: 'live', label: PAGE_COPY.labelStageLive },
                  ]}
                />

                {/* Link / deck — required, with playful junk-detection bubble */}
                <div style={{ position: 'relative' }}>
                  <AnimatePresence>
                    {linkBubble && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: 0,
                          maxWidth: 360,
                          background: '#D33C24',
                          color: '#ffffff',
                          borderRadius: 10,
                          padding: '10px 14px',
                          fontFamily: 'var(--font-montserrat)',
                          fontSize: 13,
                          lineHeight: 1.5,
                          boxShadow: '0 10px 28px rgba(12,20,63,0.22)',
                          zIndex: 5,
                        }}
                      >
                        {linkBubble}
                        <span style={{
                          position: 'absolute',
                          bottom: -5,
                          left: 22,
                          width: 10,
                          height: 10,
                          background: '#D33C24',
                          transform: 'rotate(45deg)',
                        }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <label style={LABEL_STYLE}>
                    {PAGE_COPY.labelLink}
                    <span style={{ color: '#D33C24', marginLeft: 3 }}>*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="url"
                    value={presenter.link}
                    onChange={e => {
                      setPresenter(p => ({ ...p, link: e.target.value }));
                      if (linkBubble) setLinkBubble('');
                    }}
                    onBlur={() => {
                      if (presenter.link.trim() !== '' && !isPlausibleLink(presenter.link)) flagLink();
                    }}
                    style={{
                      ...TEXT_FIELD,
                      border:
                        (attempted || linkBubble) && !isPlausibleLink(presenter.link)
                          ? '1px solid #D33C24'
                          : '1px solid rgba(7,31,107,0.2)',
                    }}
                  />
                  {!linkBubble && <p style={HINT_STYLE}>{PAGE_COPY.labelLinkHint}</p>}
                </div>

                {/* Question you want answered */}
                <div>
                  <label style={LABEL_STYLE}>
                    {PAGE_COPY.labelQuestions}
                    <span style={{ color: '#D33C24', marginLeft: 3 }}>*</span>
                  </label>
                  <p style={{ ...HINT_STYLE, marginTop: 0, marginBottom: 10 }}>{PAGE_COPY.labelQuestionsHint}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([
                      ['q1', presenter.q1, PAGE_COPY.placeholderQ1],
                      ['q2', presenter.q2, PAGE_COPY.placeholderQ2],
                      ['q3', presenter.q3, PAGE_COPY.placeholderQ3],
                    ] as const).slice(0, qCount).map(([key, val, ph], i) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontFamily: 'var(--font-subhead)',
                          fontWeight: 700,
                          fontSize: 15,
                          letterSpacing: '-0.04em',
                          color: '#C03418',
                          width: 18,
                          flexShrink: 0,
                          lineHeight: 1,
                        }}>{i + 1}</span>
                        <input
                          type="text"
                          required={i === 0}
                          value={val}
                          placeholder={ph}
                          onChange={e => setPresenter(p => ({ ...p, [key]: e.target.value }))}
                          style={{
                            ...TEXT_FIELD,
                            border: attempted && i === 0 && !val.trim()
                              ? '1px solid #D33C24'
                              : '1px solid rgba(7,31,107,0.2)',
                          }}
                        />
                        {i > 0 && i === qCount - 1 && (
                          <button
                            type="button"
                            aria-label="Remove question"
                            onClick={() => {
                              setPresenter(p => ({ ...p, [key]: '' }));
                              setQCount(c => c - 1);
                            }}
                            style={{
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              background: 'none',
                              border: '1px solid rgba(12,20,63,0.18)',
                              borderRadius: 4,
                              cursor: 'pointer',
                              color: 'rgba(12,20,63,0.45)',
                              padding: 0,
                            }}
                          >
                            <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: 12, height: 12 }}>
                              <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {qCount < 3 && (
                    <button
                      type="button"
                      onClick={() => setQCount(c => Math.min(c + 1, 3))}
                      style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'none',
                        border: '1px solid rgba(7,31,107,0.25)',
                        borderRadius: 4,
                        padding: '5px 12px',
                        color: 'rgba(12,20,63,0.65)',
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: 12, height: 12 }}>
                        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Add another question
                    </button>
                  )}
                  {attempted && !presenter.q1.trim() && (
                    <p style={ERROR_STYLE}>Add the question you want the room to answer.</p>
                  )}
                </div>

                <CheckboxField label={PAGE_COPY.labelNotifyFuture} checked={presenter.notifyFuture} onChange={v => setPresenter(p => ({ ...p, notifyFuture: v }))} />
              </div>
            )}

            {/* ── Watcher Fields ── */}
            {role === 'watcher' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FieldRow label={PAGE_COPY.labelName} required error={attempted && !watcher.name.trim()} errorMsg={PAGE_COPY.errorRequired}>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={watcher.name}
                    onChange={e => setWatcher(w => ({ ...w, name: e.target.value }))}
                    style={tf(watcher.name)}
                  />
                </FieldRow>

                <FieldRow label={PAGE_COPY.labelEmail} required error={attempted && !EMAIL_REGEX.test(watcher.email)} errorMsg={PAGE_COPY.errorEmailInvalid}>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={watcher.email}
                    onChange={e => setWatcher(w => ({ ...w, email: e.target.value }))}
                    style={ef(watcher.email)}
                  />
                </FieldRow>

                {/* Membership — free for ASES members, paid for non-members */}
                <div>
                  <label style={LABEL_STYLE}>
                    {PAGE_COPY.labelMembership}
                    <span style={{ color: '#D33C24', marginLeft: 3 }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {([
                      ['member', PAGE_COPY.labelMembershipMember, 'Free'],
                      ['non-member', PAGE_COPY.labelMembershipNon, 'Door fee'],
                    ] as const).map(([val, label, tag]) => {
                      const selected = watcher.membership === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setWatcher(w => ({ ...w, membership: val }))}
                          style={{
                            flex: 1,
                            padding: '12px 14px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            textAlign: 'left',
                            border: selected ? '1px solid rgba(211,60,36,0.8)' : '1px solid rgba(12,20,63,0.25)',
                            background: selected ? 'rgba(211,60,36,0.08)' : 'rgba(7,31,107,0.04)',
                            color: NAVY_INK,
                            transition: 'border-color 0.2s ease, background 0.2s ease',
                          }}
                        >
                          <div style={{ fontFamily: 'var(--font-cocogoose)', fontWeight: 350, fontSize: 14, color: selected ? '#C03418' : NAVY_INK }}>{label}</div>
                          <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'rgba(12,20,63,0.55)', marginTop: 3 }}>{tag}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ ...HINT_STYLE, marginTop: 8 }}>{PAGE_COPY.membershipNote}</p>
                  {attempted && watcher.membership === '' && (
                    <p style={ERROR_STYLE}>{PAGE_COPY.errorMembership}</p>
                  )}
                </div>

                <CharTextarea
                  label={PAGE_COPY.labelCuriosity}
                  value={watcher.curiosity}
                  placeholder={PAGE_COPY.placeholderCuriosity}
                  onChange={v => setWatcher(w => ({ ...w, curiosity: v }))}
                />

                <CheckboxField label={PAGE_COPY.labelNotifyFuture} checked={watcher.notifyFuture} onChange={v => setWatcher(w => ({ ...w, notifyFuture: v }))} />
              </div>
            )}

            {/* ── Submit ── */}
            {role && (
              <div style={{ marginTop: 36, position: 'relative' }}>
                <button
                  type="submit"
                  disabled={submitState === 'submitting' || sessionsLoading || sessions.length === 0}
                  className="button-float-hover"
                  style={{
                    width: '100%',
                    border: 'none',
                    background: submitState === 'submitting' ? '#B7331D' : '#D33C24',
                    padding: '16px 20px',
                    cursor: submitState === 'submitting' ? 'wait' : 'pointer',
                    opacity: submitState === 'submitting' ? 0.9 : 1,
                    fontFamily: 'var(--font-cocogoose)',
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    fontWeight: 350,
                    lineHeight: 1,
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                  onMouseEnter={e => {
                    if (submitState !== 'submitting')
                      (e.currentTarget as HTMLButtonElement).style.background = '#BF351E';
                  }}
                  onMouseLeave={e => {
                    if (submitState !== 'submitting')
                      (e.currentTarget as HTMLButtonElement).style.background = '#D33C24';
                  }}
                >
                  {submitState === 'submitting' ? PAGE_COPY.submitting : (
                    <>
                      <span>{role === 'presenter' ? PAGE_COPY.submitPresenter : PAGE_COPY.submitWatcher}</span>
                      <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: '1em', height: '1em', display: 'block', flexShrink: 0 }}>
                        <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {submitState === 'submitting' && (
                    <motion.div
                      aria-live="polite"
                      aria-busy="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: NAVY_INK }}>
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy-950/25 border-t-navy-950" aria-hidden="true" />
                        <div style={{ fontFamily: 'var(--font-cocogoose)', fontWeight: 300, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {PAGE_COPY.submitting}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {submitState === 'error' && (
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#C03418', marginTop: 12 }}>
                    {errorMessage}
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* ── RIGHT: Photo gallery (infinite scroll marquee) ── */}
        <div
          id="gallery"
          className="bwa-info"
          style={{
            flex: '1 1 520px',
            minWidth: 0,
            position: 'sticky',
            top: 80,
            scrollMarginTop: 96,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(12,20,63,0.55)',
              marginBottom: 14,
            }}
          >
            {PAGE_COPY.galleryLabel}
          </div>
          <GalleryScroll images={GALLERY} />
        </div>

      </div>

      <style>{`
        @keyframes bwa-scroll-up {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(0, -50%, 0); }
        }
        /* Gallery fills the viewport height on desktop, capped for ultra-tall screens */
        .bwa-gallery {
          height: calc(100vh - 112px);
          min-height: 560px;
          max-height: 900px;
        }
        @media (max-width: 960px) {
          .bwa-layout { flex-direction: column !important; }
          .bwa-form { flex: 1 1 auto !important; max-width: none !important; width: 100% !important; }
          .bwa-info { flex: none !important; width: 100% !important; position: static !important; }
          .bwa-gallery { height: 72vh; min-height: 480px; max-height: 760px; }
        }
        @media (min-width: 640px) {
          .sm-role-row { flex-direction: row !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(12,20,63,0.35); }
        input[type="email"], input[type="text"] { color-scheme: light; }
        select option { background: #ffffff; color: #0C143F; }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function AceRundown() {
  // null until we read localStorage, to avoid a flash for returning users
  const [open, setOpen] = useState<boolean | null>(null);
  // Picked client-side (in the effect) so SSR/hydration never mismatch.
  const [peekLine, setPeekLine] = useState('');

  useEffect(() => {
    let seen = false;
    // Storage can throw when a browser restricts it (Brave shields, private
    // mode). Default to showing the rundown rather than crashing the page.
    try { seen = localStorage.getItem('bwa:aceSeen') === '1'; } catch { /* storage restricted */ }
    setOpen(!seen);
    setPeekLine(ACE_PEEK_LINES[Math.floor(Math.random() * ACE_PEEK_LINES.length)]);
  }, []);

  function dismiss() {
    setOpen(false);
    try { localStorage.setItem('bwa:aceSeen', '1'); } catch { /* ignore */ }
  }

  if (open === null) return null;

  if (!open) {
    // Collapsed state: Ace pokes his head out behind the edge with a comic
    // speech bubble. Hover/tap makes him rise out; clicking opens the rundown.
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        style={{ display: 'block', maxWidth: '100%', marginBottom: 28 }}
      >
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Ace's rundown of Build with ASES"
          initial="rest"
          animate="rest"
          whileHover="peek"
          whileTap="peek"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: 'fit-content',
            maxWidth: '100%',
            padding: 0,
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          {/* Ace, clipped by the bottom edge so only his head peeks out */}
          <motion.div
            variants={{ rest: { height: 54 }, peek: { height: 96 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{ position: 'relative', width: 76, overflow: 'hidden', flexShrink: 0 }}
          >
            <Image
              src="/images/ace-stand.svg"
              alt=""
              width={750}
              height={750}
              unoptimized
              style={{ display: 'block', width: 'auto', height: 122 }}
            />
          </motion.div>

          {/* Comic speech bubble — wraps instead of forcing overflow on mobile */}
          <motion.span
            variants={{ rest: { scale: 1 }, peek: { scale: 1.05 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            style={{
              position: 'relative',
              flex: '0 1 auto',
              minWidth: 0,
              transformOrigin: 'left center',
              background: '#ffffff',
              color: '#0C143F',
              fontFamily: 'var(--font-montserrat)',
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.4,
              padding: '9px 15px',
              borderRadius: 14,
              border: '1px solid rgba(7,31,107,0.14)',
              boxShadow: '0 10px 28px rgba(12,20,63,0.16)',
            }}
          >
            {peekLine || ACE_PEEK_LINES[0]}
            {/* tail pointing left, toward Ace */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: -5,
                top: '50%',
                width: 12,
                height: 12,
                background: '#ffffff',
                borderLeft: '1px solid rgba(7,31,107,0.14)',
                borderBottom: '1px solid rgba(7,31,107,0.14)',
                transform: 'translateY(-50%) rotate(45deg)',
                borderRadius: 2,
              }}
            />
          </motion.span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(12px, 3vw, 18px)',
        marginBottom: 32,
        padding: 'clamp(14px, 3vw, 18px) clamp(16px, 3.5vw, 20px)',
        borderRadius: 12,
        border: '1px solid rgba(7,31,107,0.15)',
        background: 'rgba(7,31,107,0.04)',
      }}
    >
      {/* Ace, sized to the body text and gently floating */}
      <motion.img
        src="/images/ace-stand.svg"
        alt="Ace, the ASES mascot"
        style={{ width: 'auto', height: 'clamp(84px, 22vw, 118px)', flexShrink: 0, alignSelf: 'center' }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
      />
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 13.5,
          fontWeight: 400,
          color: 'rgba(12,20,63,0.88)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          <strong style={{ fontWeight: 600 }}>Hey, I'm Ace.</strong> Quick rundown: Build with ASES is our session
          for people who actually make things. Pick a track below — <strong style={{ fontWeight: 600 }}>present</strong> to
          put your build in front of the room, or <strong style={{ fontWeight: 600 }}>watch</strong> to see what everyone's
          shipping. That's the whole thing. Go.
        </p>
        <button
          type="button"
          onClick={dismiss}
          style={{
            marginTop: 12,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid rgba(12,20,63,0.3)',
            background: 'transparent',
            color: NAVY_INK,
            fontFamily: 'var(--font-cocogoose)',
            fontWeight: 350,
            fontSize: 12,
            letterSpacing: '0.03em',
            cursor: 'pointer',
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: '0.9em', height: '0.9em', display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>
            <path d="M2 8.5l3.5 3.5 8-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Got it
        </button>
      </div>
    </motion.div>
  );
}

function FieldRow({
  label,
  required,
  hint,
  error,
  errorMsg,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: boolean;
  errorMsg?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label}
        {required && <span style={{ color: '#D33C24', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={HINT_STYLE}>{hint}</p>}
      {error && errorMsg && <p style={ERROR_STYLE}>{errorMsg}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  errorMsg,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: boolean;
  errorMsg?: string;
}) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            ...SELECT_FIELD,
            border: error ? '1px solid #D33C24' : '1px solid rgba(7,31,107,0.25)',
            width: '100%',
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            width: 14,
            height: 14,
            flexShrink: 0,
          }}
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="rgba(7,31,107,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error && errorMsg && <p style={ERROR_STYLE}>{errorMsg}</p>}
    </div>
  );
}

function CharTextarea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const limit = PAGE_COPY.charLimit;
  const over = value.length > 140;
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={limit}
        rows={4}
        onChange={e => onChange(e.target.value)}
        style={{ ...TEXT_FIELD, resize: 'vertical', lineHeight: 1.6 }}
      />
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-montserrat)', fontSize: 11, color: over ? '#C03418' : 'rgba(12,20,63,0.45)', marginTop: 4 }}>
        {value.length}/{limit}
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'rgba(12,20,63,0.75)' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: '#D33C24', width: 16, height: 16, cursor: 'pointer' }}
      />
      {label}
    </label>
  );
}

// ── Infinite-scroll photo marquee ────────────────────────────────────────────
// To add more photos: push entries to the GALLERY array at the top of the file.
// Two columns scroll at different speeds (parallax). Hover pauses on desktop;
// tap to toggle-pause on mobile. The track is duplicated so translateY(-50%)
// lands exactly on a repeat — the GAP lives on each image (marginBottom),
// including the last, so both copies are identical height and the loop is seamless.
const GALLERY_GAP = 10;

function GalleryColumn({
  items,
  duration,
  paused,
  offset,
  keyPrefix,
}: {
  items: ReadonlyArray<{ src: string; width: number; height: number }>;
  duration: number;
  paused: boolean;
  offset: number;
  keyPrefix: string;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
      <div
        style={{
          marginTop: offset,
          willChange: 'transform',
          animationName: 'bwa-scroll-up',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {[...items, ...items].map((g, i) => (
          <Image
            key={`${keyPrefix}-${i}`}
            src={g.src}
            alt=""
            aria-hidden="true"
            width={g.width}
            height={g.height}
            loading="lazy"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 12,
              marginBottom: GALLERY_GAP,
              border: '1px solid rgba(7,31,107,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryScroll({ images }: { images: ReadonlyArray<{ src: string; tall: boolean; width: number; height: number }> }) {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  const paused = hovered || locked;

  // Split into two interleaved columns so neighbours differ left-vs-right.
  const col1 = images.filter((_, i) => i % 2 === 0);
  const col2 = images.filter((_, i) => i % 2 !== 0);

  return (
    <div
      className="bwa-gallery"
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setLocked(l => !l)}
      title={locked ? 'Click to resume' : 'Hover to pause · Click to lock'}
    >
      {/* top + bottom gradient masks so photos fade in/out instead of hard-cutting */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #FFFFFF 0%, transparent 10%, transparent 90%, #FFFFFF 100%)',
        }}
      />

      {/* pause indicator */}
      {paused && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(7,31,107,0.2)',
            borderRadius: 999,
            padding: '5px 14px',
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            color: 'rgba(12,20,63,0.7)',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}
        >
          paused — click to resume
        </div>
      )}

      <div style={{ display: 'flex', gap: GALLERY_GAP, height: '100%', overflow: 'hidden' }}>
        <GalleryColumn items={col1} duration={42} paused={paused} offset={0} keyPrefix="c1" />
        <GalleryColumn items={col2} duration={32} paused={paused} offset={-70} keyPrefix="c2" />
      </div>
    </div>
  );
}
