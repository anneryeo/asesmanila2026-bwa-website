'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAGE_COPY = {
  badge: 'Build with ASES · ASES Manila',
  heading: "Show us what you're building.",
  subhead:
    "Bring the thing you've been hacking on at 2am. We'll put it in front of a room that actually gives a damn: founders, operators, and the people who hire. They'll help you make it sharper.",
  trackPresent: "I'm presenting",
  trackWatch: "I'm watching",
  trackPresentAgain: 'Presenting again',
  trackWatchAgain: 'Watching again',
  trackTicket: 'Just posting a ship ticket',
  beenBefore: 'Been to an episode before?',
  roleSubPresent: 'Show your build live and defend it. Honest feedback, no clapping for the sake of it.',
  roleSubWatch: 'Watch other builders get tested and meet people shipping the same way you are.',
  roleSubPresentAgain: "Back for another round. We'll confirm your email against past episode lists, then it's the usual form.",
  roleSubWatchAgain: "Good to have you back in the room. We'll confirm your email first, then save your spot.",
  roleSubTicket: 'A public pledge for the wall: what will you ship by the next episode? For people who have been in the room.',
  submitPresenter: 'Send it in',
  submitWatcher: 'Save my spot',
  submitTicket: 'Put it on the wall',
  stepTrack: '01 · Pick your track',
  stepVerify: '02 · Confirm your email',
  stepSession: (n: string) => `${n} · Which session?`,
  stepDetails: (n: string) => `${n} · The details`,
  stepTicket: '03 · Your ticket',
  verifyLabel: 'Your email',
  verifyHint: "We'll check it against past episode lists so we know it's really you.",
  verifyButton: 'Find me',
  verifyChecking: 'Checking the episode lists…',
  verifyFoundPrefix: 'Found you',
  verifyNotFoundAgain:
    "We couldn't find that email in any past episode. If this is your first time, use I'm presenting or I'm watching above.",
  verifyNotFoundTicket:
    "We couldn't find that email on any episode list. Ship tickets are for people who've been in the room. Register above, show up, then come post one.",
  switchHint: "Looks like you've been to an episode before.",
  successPresenter:
    "You're in the queue. We'll review what you're building and reach out before the session. Come ready to be honest about where you really are. We'll also ping you when the next one drops.",
  successWatcher:
    "Got it. We'll email your confirmation before the session. Spots are limited, so hang tight. We'll keep you in the loop for every Build with ASES after this one too.",
  successTicket: "Ticket's on the wall. See you at the next episode. Bring receipts.",
  sessionFallback: "No upcoming sessions just yet. Drop your details below and we'll pull you in for the next one.",
  placeholderCuriosity: 'e.g. "A tool that helps freelancers invoice international clients in USD."',
  placeholderQ1: "e.g. \"Is the problem I'm solving actually real, or am I imagining it?\"",
  placeholderQ2: 'e.g. "Would you pay for this? What would make you not?"',
  placeholderQ3: "e.g. \"What's the one thing that would kill this in 6 months?\"",
  placeholderPledge: 'e.g. "Finish my MVP and put it in front of 5 real users before the next episode."',
  charLimit: 160,
  labelName: 'Name',
  labelEmail: 'Email',
  labelProjectName: 'What are you building?',
  labelOneLiner: 'One-liner',
  labelOneLinerHint: "One sentence. What is it and who's it for.",
  labelStage: 'Stage',
  labelStageIdea: 'Idea, no code yet',
  labelStagePrototype: 'Prototype, early build',
  labelStageLive: 'Live, people are using it',
  labelLink: 'Link or deck',
  labelLinkHint: "Site, deck, repo, or demo. Whatever shows the build. This one's required.",
  labelQuestions: 'The question you want answered by the end of the night',
  labelQuestionsHint: 'The whole point of the room. Make it count.',
  labelMembership: 'Are you an ASES member?',
  labelMembershipMember: 'Yes, ASES member',
  labelMembershipNon: 'Not yet',
  membershipNote: "Watching is free for ASES members. Non-members pay a small door fee. We'll email the details.",
  labelCuriosity: 'What kind of build are you hoping to see? (optional)',
  labelNotifyFuture: 'Notify me when the next Build with ASES drops',
  labelTicketName: 'Your name',
  labelTicketNameHint: 'Shown publicly on the wall next to your pledge.',
  labelTicketProject: 'Project (optional)',
  labelTicketPledge: 'Your pledge',
  labelTicketPledgeHint: 'One sentence. It goes up on the public wall and you stamp it done next episode.',
  sessionLoading: 'Loading sessions…',
  submitting: 'Sending…',
  errorGeneric: 'Something went wrong. Please try again.',
  errorEmailInvalid: 'Please enter a valid email address.',
  errorRequired: 'This field is required.',
  errorNoSession: 'Pick a session so we know where to slot you.',
  errorMembership: 'Let us know so we can sort out entry.',
  errorVerifyFirst: 'Confirm your email above first.',
  backHome: '← Back to Build with ASES',
  galleryLabel: 'Scenes from past sessions',
} as const;

// Playful "I see what you're doing" bubbles for junk in the link/deck field.
// Always end on a CTA, never a scolding.
const LINK_JUNK_MESSAGES = [
  "Hey, I see what you're doing. Drop the real link, we actually want to see it.",
  'A lone dot? Bold. Now paste the deck or demo so we can geek out over it.',
  "We both know that's not a link. Give us something clickable.",
  "Nice try. That's not it. Show us the build: site, repo, or deck.",
  "C'mon, you built something cool. Link it so the room can see it.",
] as const;

const LINK_EMPTY_MESSAGE =
  'Presenters need a link: site, deck, repo, or demo. Show us the build.';

// Ace pokes his head out and whispers one of these. Rotates each page visit.
const ACE_PEEK_LINES = [
  'psst… you new here?',
  "psst… don't know what Build with ASES is?",
  "first time? c'mere, I'll explain.",
  'lost? tap me real quick.',
  'wanna know what this is?',
  '10-second rundown? this way.',
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

const STEP_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-montserrat)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(12,20,63,0.55)',
  marginBottom: 12,
};

type Session = { id: string; label: string };
type Track = 'presenter' | 'watcher' | 'presenter-again' | 'watcher-again' | 'shipticket';
type Membership = '' | 'member' | 'non-member';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/** Email verification against the Google Sheet episode lists. */
interface VerifyState {
  status: 'idle' | 'checking' | 'found' | 'notfound';
  email: string;
  name: string;
  role: string;
  lastSession: string;
}

const VERIFY_IDLE: VerifyState = { status: 'idle', email: '', name: '', role: '', lastSession: '' };

/** A returning builder's open (not-yet-shipped) ship ticket. */
interface OpenTicket {
  id: string;
  pledge: string;
  project?: string;
  episode: string;
  status: 'pledged' | 'carried-over';
  carriedCount: number;
}

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

/** Blueprint corner "+" marks for the form card. */
function Corners() {
  return (
    <>
      {[
        { top: 10, left: 12 },
        { top: 10, right: 12 },
        { bottom: 6, left: 12 },
        { bottom: 6, right: 12 },
      ].map((pos, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            fontFamily: 'monospace',
            fontSize: 16,
            color: 'rgba(7,31,107,0.25)',
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1,
            ...pos,
          }}
        >+</span>
      ))}
    </>
  );
}

export function ApplicationForm() {
  const [track, setTrack] = useState<Track | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [linkBubble, setLinkBubble] = useState('');
  const [qCount, setQCount] = useState(1);

  // Email verification for the returning + ship ticket tracks
  const [verify, setVerify] = useState<VerifyState>(VERIFY_IDLE);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyAttempted, setVerifyAttempted] = useState(false);

  // Gentle hint on the first-timer tracks when the email is recognized
  const [hintFound, setHintFound] = useState(false);
  const hintChecked = useRef('');

  // Ship ticket fields (own track)
  const [ticketName, setTicketName] = useState('');
  const [ticketProject, setTicketProject] = useState('');
  const [ticketPledge, setTicketPledge] = useState('');
  const [ticketAttempted, setTicketAttempted] = useState(false);
  const [ticketError, setTicketError] = useState('');

  // Open tickets for a verified returning builder — stamp shipped/carried-over
  // right here instead of re-typing everything on the /shiptickets wall.
  const [openTickets, setOpenTickets] = useState<OpenTicket[]>([]);
  const [openTicketsLoading, setOpenTicketsLoading] = useState(false);
  const [stampedTickets, setStampedTickets] = useState<Record<string, 'shipped' | 'carried-over'>>({});
  const [stampBusyId, setStampBusyId] = useState<string | null>(null);
  const [stampError, setStampError] = useState('');
  const openTicketsChecked = useRef('');

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

  const isReturning = track === 'presenter-again' || track === 'watcher-again';
  const needsVerify = isReturning || track === 'shipticket';
  const verified = verify.status === 'found';

  // Once the ship-ticket track verifies an email, look up their open tickets
  // so they can stamp shipped/carried-over without retyping anything, or skip
  // straight to posting a new pledge below.
  useEffect(() => {
    if (track !== 'shipticket' || !verified || !verify.email) return;
    if (openTicketsChecked.current === verify.email) return;
    openTicketsChecked.current = verify.email;
    setOpenTicketsLoading(true);
    fetch('/api/ship-ticket/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: verify.email }),
    })
      .then(res => res.json())
      .then((data: { success?: boolean; tickets?: OpenTicket[] }) => {
        setOpenTickets(data.success ? data.tickets ?? [] : []);
      })
      .catch(() => setOpenTickets([]))
      .finally(() => setOpenTicketsLoading(false));
  }, [track, verified, verify.email]);

  async function stampOpenTicket(ticketId: string, action: 'shipped' | 'carried-over') {
    setStampBusyId(ticketId);
    setStampError('');
    try {
      const res = await fetch('/api/ship-ticket/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verify.email,
          ticketId,
          action,
          episode: sessions[0]?.label ?? verify.lastSession,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setStampedTickets(prev => ({ ...prev, [ticketId]: action }));
      } else {
        setStampError(data.message ?? PAGE_COPY.errorGeneric);
      }
    } catch {
      setStampError(PAGE_COPY.errorGeneric);
    } finally {
      setStampBusyId(null);
    }
  }
  const role: 'presenter' | 'watcher' | null =
    track === 'presenter' || track === 'presenter-again' ? 'presenter'
    : track === 'watcher' || track === 'watcher-again' ? 'watcher'
    : null;
  // Application details show immediately for first-timers, after verification
  // for the returning tracks.
  const showApplication = role !== null && (!isReturning || verified);

  const sessionStepLabel = PAGE_COPY.stepSession(needsVerify ? '03' : '02');
  const detailsStepLabel = PAGE_COPY.stepDetails(needsVerify ? '04' : '03');

  function pickTrack(next: Track) {
    setTrack(next);
    setAttempted(false);
    setTicketAttempted(false);
    setErrorMessage('');
    setSubmitState('idle');
    setTicketError('');
  }

  /** Look an email up against the sheet lists (returning + ticket tracks). */
  async function runVerify() {
    const email = verifyInput.trim().toLowerCase();
    setVerifyAttempted(true);
    if (!EMAIL_REGEX.test(email)) return;
    setVerify({ ...VERIFY_IDLE, status: 'checking', email });
    try {
      const res = await fetch(`/api/bwa-lookup?email=${encodeURIComponent(email)}`);
      const data = await res.json() as { found?: boolean; role?: string; name?: string; lastSession?: string };
      if (data?.found) {
        setVerify({ status: 'found', email, name: data.name ?? '', role: data.role ?? '', lastSession: data.lastSession ?? '' });
        // Identify them: prefill the editable name fields.
        if (data.name) {
          setTicketName(n => n || data.name!);
          setPresenter(p => ({ ...p, name: p.name || data.name!, contact: email }));
          setWatcher(w => ({ ...w, name: w.name || data.name!, email }));
        } else {
          setPresenter(p => ({ ...p, contact: email }));
          setWatcher(w => ({ ...w, email }));
        }
      } else {
        setVerify({ ...VERIFY_IDLE, status: 'notfound', email });
      }
    } catch {
      setVerify({ ...VERIFY_IDLE, status: 'notfound', email });
    }
  }

  /** First-timer tracks: quietly check the email on blur and offer a switch. */
  async function hintCheck(email: string) {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(clean) || hintChecked.current === clean) return;
    hintChecked.current = clean;
    try {
      const res = await fetch(`/api/bwa-lookup?email=${encodeURIComponent(clean)}`);
      const data = await res.json() as { found?: boolean; name?: string; role?: string; lastSession?: string };
      setHintFound(!!data?.found);
      if (data?.found) {
        setVerify({ status: 'found', email: clean, name: data.name ?? '', role: data.role ?? '', lastSession: data.lastSession ?? '' });
        setVerifyInput(clean);
      }
    } catch {
      setHintFound(false);
    }
  }

  function switchToReturning() {
    if (!role) return;
    pickTrack(role === 'presenter' ? 'presenter-again' : 'watcher-again');
    setHintFound(false);
  }

  function flagLink() {
    if (presenter.link.trim() === '') {
      setLinkBubble(LINK_EMPTY_MESSAGE);
    } else {
      setLinkBubble(LINK_JUNK_MESSAGES[Math.floor(Math.random() * LINK_JUNK_MESSAGES.length)]);
    }
  }

  function isValid(): boolean {
    if (!role || !sessionId) return false;
    if (isReturning && !verified) return false;
    if (role === 'presenter') {
      return (
        presenter.name.trim().length > 0 &&
        EMAIL_REGEX.test(isReturning ? verify.email : presenter.contact) &&
        presenter.projectName.trim().length > 0 &&
        presenter.oneLiner.trim().length > 0 &&
        isPlausibleLink(presenter.link) &&
        presenter.q1.trim().length > 0
      );
    }
    return (
      watcher.name.trim().length > 0 &&
      EMAIL_REGEX.test(isReturning ? verify.email : watcher.email) &&
      watcher.membership !== ''
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setAttempted(true);
    if (role === 'presenter' && !isPlausibleLink(presenter.link)) flagLink();
    if (!isValid()) return;

    setSubmitState('submitting');
    setErrorMessage('');

    const email = isReturning ? verify.email : role === 'presenter' ? presenter.contact : watcher.email;
    const returning = isReturning || hintFound;

    const payload =
      role === 'presenter'
        ? {
            role,
            sessionId,
            sessionLabel: selectedSession?.label ?? '',
            name: presenter.name,
            contact: email,
            projectName: presenter.projectName,
            oneLiner: presenter.oneLiner,
            stage: presenter.stage,
            link: presenter.link,
            questions: [presenter.q1, presenter.q2, presenter.q3].filter(Boolean),
            questionsText: [presenter.q1, presenter.q2, presenter.q3].filter(Boolean).join(' | '),
            notifyFuture: presenter.notifyFuture,
            returning,
          }
        : {
            role,
            sessionId,
            sessionLabel: selectedSession?.label ?? '',
            name: watcher.name,
            email,
            membership: watcher.membership,
            curiosity: watcher.curiosity,
            notifyFuture: watcher.notifyFuture,
            returning,
          };

    try {
      const res = await fetch('/api/bwa-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { success?: boolean; duplicate?: boolean; message?: string };
      if (data.success) {
        setSubmitState('success');
      } else if (data.duplicate) {
        setSubmitState('error');
        setErrorMessage(data.message ?? "You're already on the list for this session. Pick a different one, or post a ship ticket instead.");
      } else {
        setSubmitState('error');
        setErrorMessage(data.message ?? PAGE_COPY.errorGeneric);
      }
    } catch {
      setSubmitState('error');
      setErrorMessage(PAGE_COPY.errorGeneric);
    }
  }

  /** Ship ticket track: verified email, name, pledge. Posts to the wall. */
  async function submitTicket() {
    setTicketAttempted(true);
    setTicketError('');
    if (!verified || !ticketName.trim() || !ticketPledge.trim()) return;

    setSubmitState('submitting');
    try {
      const res = await fetch('/api/ship-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticketName.trim(),
          email: verify.email,
          project: ticketProject.trim(),
          episode: verify.lastSession,
          pledge: ticketPledge.trim(),
        }),
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (data.success) {
        setSubmitState('success');
      } else {
        setSubmitState('idle');
        setTicketError(data.message ?? PAGE_COPY.errorGeneric);
      }
    } catch {
      setSubmitState('idle');
      setTicketError(PAGE_COPY.errorGeneric);
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
    const successCopy =
      track === 'shipticket' ? PAGE_COPY.successTicket
      : role === 'presenter' ? PAGE_COPY.successPresenter
      : PAGE_COPY.successWatcher;
    return (
      <div
        className="bwa-surface"
        style={{
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <Image
            src="/images/ace-parts_6.png"
            alt=""
            aria-hidden="true"
            width={1000}
            height={1000}
            style={{ width: 130, height: 'auto', margin: '0 auto 24px', display: 'block' }}
          />
          <p
            style={{
              fontFamily: 'var(--font-cocogoose)',
              fontSize: 'clamp(16px, 2vw, 22px)',
              fontWeight: 300,
              color: NAVY_INK,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {successCopy}
          </p>
          {track === 'shipticket' && (
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, marginBottom: 28 }}>
              <Link href="/shiptickets" style={{ color: '#C03418', fontWeight: 600 }}>
                See it on the wall →
              </Link>
            </p>
          )}
          <Link
            href="/"
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

  const trackButton = (t: Track, label: string, style: 'solid' | 'outline' | 'dashed') => {
    const selected = track === t;
    const base: React.CSSProperties = {
      flex: 1,
      padding: style === 'solid' ? '16px 20px' : '12px 16px',
      borderRadius: 0,
      cursor: 'pointer',
      textAlign: 'center',
      fontFamily: 'var(--font-cocogoose)',
      fontSize: style === 'solid' ? 'clamp(14px, 2vw, 17px)' : 'clamp(12px, 1.7vw, 14px)',
      fontWeight: 350,
      letterSpacing: '0.03em',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    };
    if (style === 'solid') {
      Object.assign(base, {
        background: selected ? '#D33C24' : 'rgba(211,60,36,0.72)',
        border: selected ? `2px solid ${NAVY_INK}` : '2px solid rgba(12,20,63,0.2)',
        color: '#ffffff',
      });
    } else if (style === 'outline') {
      Object.assign(base, {
        background: selected ? NAVY_INK : 'transparent',
        border: selected ? `2px solid ${NAVY_INK}` : '2px solid rgba(12,20,63,0.35)',
        color: selected ? '#ffffff' : NAVY_INK,
      });
    } else {
      Object.assign(base, {
        background: selected ? 'rgba(211,60,36,0.1)' : 'transparent',
        border: '2px dashed rgba(211,60,36,0.65)',
        color: '#C03418',
      });
    }
    return (
      <button key={t} type="button" onClick={() => pickTrack(t)} className="button-float-hover" style={base}>
        {selected && (
          <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: '0.95em', height: '0.95em', flexShrink: 0 }}>
            <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {label}
      </button>
    );
  };

  const trackSubcopy =
    track === 'presenter' ? PAGE_COPY.roleSubPresent
    : track === 'watcher' ? PAGE_COPY.roleSubWatch
    : track === 'presenter-again' ? PAGE_COPY.roleSubPresentAgain
    : track === 'watcher-again' ? PAGE_COPY.roleSubWatchAgain
    : track === 'shipticket' ? PAGE_COPY.roleSubTicket
    : '';

  /* ── main form ── */
  return (
    <div
      className="bwa-surface"
      style={{
        minHeight: '100svh',
        padding: 'clamp(96px, 12vh, 136px) clamp(24px, 6vw, 80px) clamp(64px, 8vh, 96px)',
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

        {/* ── LEFT: Form ── */}
        <div className="bwa-form" style={{ flex: '0 1 600px', minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#D33C24',
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

          {/* Ace gives the rundown. Collapsible, remembered so returning users aren't nagged */}
          <AceRundown />

          {/* The form card: white panel with blueprint corner marks */}
          <div
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(7,31,107,0.14)',
              boxShadow: '0 18px 48px rgba(7,31,107,0.08)',
              padding: 'clamp(20px, 3.5vw, 32px)',
            }}
          >
            <Corners />

            <form id="form" onSubmit={handleSubmit} noValidate style={{ scrollMarginTop: 96 }}>

              {/* ── 01 · Track picker ── */}
              <div id="sessions" style={{ marginBottom: 32, scrollMarginTop: 96 }}>
                <div style={STEP_STYLE}>{PAGE_COPY.stepTrack}</div>

                {/* First-timer tracks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="sm-role-row">
                  {trackButton('presenter', PAGE_COPY.trackPresent, 'solid')}
                  {trackButton('watcher', PAGE_COPY.trackWatch, 'solid')}
                </div>

                {/* Returning tracks */}
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(12,20,63,0.5)',
                    marginBottom: 8,
                  }}
                >
                  {PAGE_COPY.beenBefore}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="sm-role-row">
                  {trackButton('presenter-again', PAGE_COPY.trackPresentAgain, 'outline')}
                  {trackButton('watcher-again', PAGE_COPY.trackWatchAgain, 'outline')}
                </div>

                {/* Ship ticket, its own thing entirely */}
                <div style={{ display: 'flex', marginTop: 10 }}>
                  {trackButton('shipticket', PAGE_COPY.trackTicket, 'dashed')}
                </div>

                {track && (
                  <p style={{ ...HINT_STYLE, marginTop: 12, fontSize: 13, color: 'rgba(12,20,63,0.7)', lineHeight: 1.55 }}>
                    {trackSubcopy}
                  </p>
                )}
              </div>

              {/* ── 02 · Email verification (returning + ship ticket) ── */}
              {needsVerify && (
                <div style={{ marginBottom: 32 }}>
                  <div style={STEP_STYLE}>{PAGE_COPY.stepVerify}</div>
                  <label style={LABEL_STYLE}>
                    {PAGE_COPY.verifyLabel}
                    <span style={{ color: '#D33C24', marginLeft: 3 }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      value={verifyInput}
                      onChange={e => {
                        setVerifyInput(e.target.value);
                        if (verify.status !== 'idle') setVerify(VERIFY_IDLE);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); runVerify(); }
                      }}
                      style={{
                        ...TEXT_FIELD,
                        flex: 1,
                        border:
                          verifyAttempted && !EMAIL_REGEX.test(verifyInput.trim())
                            ? '1px solid #D33C24'
                            : '1px solid rgba(7,31,107,0.2)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={runVerify}
                      disabled={verify.status === 'checking'}
                      style={{
                        flexShrink: 0,
                        padding: '10px 18px',
                        border: 'none',
                        borderRadius: 0,
                        background: verify.status === 'checking' ? '#B7331D' : '#D33C24',
                        color: '#ffffff',
                        fontFamily: 'var(--font-cocogoose)',
                        fontWeight: 350,
                        fontSize: 13,
                        letterSpacing: '0.03em',
                        cursor: verify.status === 'checking' ? 'wait' : 'pointer',
                      }}
                    >
                      {PAGE_COPY.verifyButton}
                    </button>
                  </div>
                  {verify.status === 'idle' && <p style={HINT_STYLE}>{PAGE_COPY.verifyHint}</p>}
                  {verifyAttempted && verify.status === 'idle' && !EMAIL_REGEX.test(verifyInput.trim()) && (
                    <p style={ERROR_STYLE}>{PAGE_COPY.errorEmailInvalid}</p>
                  )}
                  {verify.status === 'checking' && (
                    <p style={{ ...HINT_STYLE, color: 'rgba(12,20,63,0.6)' }}>{PAGE_COPY.verifyChecking}</p>
                  )}

                  <AnimatePresence>
                    {verify.status === 'found' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          background: NAVY_INK,
                          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                          padding: '14px 16px',
                          marginTop: 12,
                        }}
                      >
                        <Image
                          src="/images/ace-parts_6.png"
                          alt=""
                          aria-hidden="true"
                          width={1000}
                          height={1000}
                          style={{ width: 40, height: 'auto', flexShrink: 0 }}
                        />
                        <p style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#ffffff', lineHeight: 1.6 }}>
                          <strong style={{ fontFamily: 'var(--font-cocogoose)', fontWeight: 350 }}>
                            {PAGE_COPY.verifyFoundPrefix}
                            {verify.name && <>, <Emphasis text={verify.name.split(' ')[0]} /></>}.
                          </strong>{' '}
                          {verify.role === 'presenter' ? 'You presented at ' : 'You were at '}
                          {verify.lastSession || 'a past episode'}. Welcome back.
                        </p>
                      </motion.div>
                    )}
                    {verify.status === 'notfound' && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ ...ERROR_STYLE, fontSize: 13, lineHeight: 1.6, marginTop: 10 }}
                      >
                        {track === 'shipticket' ? PAGE_COPY.verifyNotFoundTicket : PAGE_COPY.verifyNotFoundAgain}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Ship ticket track ── */}
              {track === 'shipticket' && verified && (
                <div style={{ marginBottom: 8 }}>
                  <div style={STEP_STYLE}>{PAGE_COPY.stepTicket}</div>

                  {/* Open tickets for this email — stamp them here, no retyping. */}
                  {!openTicketsLoading && openTickets.length > 0 && (
                    <div
                      style={{
                        border: '1px solid rgba(7,31,107,0.16)',
                        background: 'rgba(7,31,107,0.02)',
                        padding: '16px 16px 14px',
                        marginBottom: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <p style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(12,20,63,0.55)' }}>
                        You&apos;ve got open tickets
                      </p>
                      {openTickets.map(t => {
                        const done = stampedTickets[t.id];
                        return (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 10,
                              border: '1px solid rgba(12,20,63,0.12)',
                              background: '#fff',
                              padding: '12px 14px',
                            }}
                          >
                            <p style={{ margin: 0, fontFamily: 'var(--font-cocogoose)', fontWeight: 350, fontSize: 14, lineHeight: 1.5, color: NAVY_INK }}>
                              &ldquo;<Emphasis text={t.pledge} />&rdquo;
                            </p>
                            <p style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, color: 'rgba(12,20,63,0.5)' }}>
                              Pledged at {t.episode}
                              {t.carriedCount > 0 && ` · carried over ${t.carriedCount}×`}
                              {t.project && ` · ${t.project}`}
                            </p>
                            {done ? (
                              <span style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cocogoose)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 10px', border: `2px solid ${done === 'shipped' ? '#112F7F' : '#B98A00'}`, color: done === 'shipped' ? '#fff' : '#B98A00', background: done === 'shipped' ? '#112F7F' : 'transparent' }}>
                                {done === 'shipped' ? 'Shipped ✓' : 'Carried over'}
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  type="button"
                                  disabled={stampBusyId === t.id}
                                  onClick={() => stampOpenTicket(t.id, 'shipped')}
                                  style={{ cursor: stampBusyId === t.id ? 'wait' : 'pointer', border: 'none', background: '#112F7F', color: '#fff', fontFamily: 'var(--font-cocogoose)', fontWeight: 350, fontSize: 12, padding: '7px 14px', opacity: stampBusyId === t.id ? 0.6 : 1 }}
                                >
                                  Shipped it
                                </button>
                                <button
                                  type="button"
                                  disabled={stampBusyId === t.id}
                                  onClick={() => stampOpenTicket(t.id, 'carried-over')}
                                  style={{ cursor: stampBusyId === t.id ? 'wait' : 'pointer', border: '1px solid #B98A00', background: 'transparent', color: '#B98A00', fontFamily: 'var(--font-cocogoose)', fontWeight: 350, fontSize: 12, padding: '7px 14px', opacity: stampBusyId === t.id ? 0.6 : 1 }}
                                >
                                  Carry it over
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {stampError && <p style={{ ...ERROR_STYLE, margin: 0 }}>{stampError}</p>}
                      <p style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'rgba(12,20,63,0.55)' }}>
                        Shipping something new instead? Post a fresh pledge below.
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      border: '1px dashed rgba(211,60,36,0.5)',
                      background: 'rgba(211,60,36,0.03)',
                      padding: '16px 16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    {verify.lastSession && (
                      <p style={{ ...HINT_STYLE, margin: 0, fontSize: 12 }}>
                        Posting for: <strong style={{ color: NAVY_INK }}>{verify.lastSession}</strong>
                      </p>
                    )}
                    <FieldRow
                      label={PAGE_COPY.labelTicketName}
                      required
                      hint={PAGE_COPY.labelTicketNameHint}
                      error={ticketAttempted && !ticketName.trim()}
                      errorMsg={PAGE_COPY.errorRequired}
                    >
                      <input
                        type="text"
                        value={ticketName}
                        onChange={e => setTicketName(e.target.value)}
                        style={{
                          ...TEXT_FIELD,
                          border: ticketAttempted && !ticketName.trim() ? '1px solid #D33C24' : '1px solid rgba(7,31,107,0.2)',
                        }}
                      />
                    </FieldRow>
                    <FieldRow label={PAGE_COPY.labelTicketProject}>
                      <input
                        type="text"
                        value={ticketProject}
                        onChange={e => setTicketProject(e.target.value)}
                        style={TEXT_FIELD}
                      />
                    </FieldRow>
                    <div>
                      <label style={LABEL_STYLE}>
                        {PAGE_COPY.labelTicketPledge}
                        <span style={{ color: '#D33C24', marginLeft: 3 }}>*</span>
                      </label>
                      <p style={{ ...HINT_STYLE, marginTop: 0, marginBottom: 8 }}>
                        {PAGE_COPY.labelTicketPledgeHint}{' '}
                        <Link href="/shiptickets" style={{ color: '#C03418', fontWeight: 600 }}>
                          See the wall →
                        </Link>
                      </p>
                      <textarea
                        value={ticketPledge}
                        placeholder={PAGE_COPY.placeholderPledge}
                        maxLength={200}
                        rows={3}
                        onChange={e => setTicketPledge(e.target.value)}
                        style={{
                          ...TEXT_FIELD,
                          resize: 'vertical',
                          lineHeight: 1.6,
                          border: ticketAttempted && !ticketPledge.trim() ? '1px solid #D33C24' : '1px solid rgba(7,31,107,0.2)',
                        }}
                      />
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'rgba(12,20,63,0.45)', marginTop: 4 }}>
                        {ticketPledge.length}/200
                      </div>
                      {ticketAttempted && !ticketPledge.trim() && (
                        <p style={ERROR_STYLE}>{PAGE_COPY.errorRequired}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={submitTicket}
                      disabled={submitState === 'submitting'}
                      className="button-float-hover"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: submitState === 'submitting' ? '#B7331D' : '#D33C24',
                        padding: '14px 20px',
                        cursor: submitState === 'submitting' ? 'wait' : 'pointer',
                        fontFamily: 'var(--font-cocogoose)',
                        fontSize: 'clamp(14px, 2vw, 16px)',
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
                    >
                      {submitState === 'submitting' ? PAGE_COPY.submitting : (
                        <>
                          <span>{PAGE_COPY.submitTicket}</span>
                          <svg aria-hidden="true" viewBox="0 0 16 16" style={{ width: '1em', height: '1em', display: 'block', flexShrink: 0 }}>
                            <path d="M3 8h8.5M8.5 4l4 4-4 4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                          </svg>
                        </>
                      )}
                    </button>
                    {ticketError && (
                      <p style={{ ...ERROR_STYLE, fontSize: 13, marginTop: 0 }}>{ticketError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Session picker (application tracks) ── */}
              {showApplication && (
                <div style={{ marginBottom: 32 }}>
                  <div style={STEP_STYLE}>{sessionStepLabel}</div>
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

              {showApplication && <div style={STEP_STYLE}>{detailsStepLabel}</div>}

              {/* ── First-timer hint: this email has been here before ── */}
              <AnimatePresence>
                {showApplication && !isReturning && hintFound && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(7,31,107,0.05)',
                      border: '1px solid rgba(7,31,107,0.15)',
                      padding: '12px 14px',
                      marginBottom: 20,
                    }}
                  >
                    <p style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 12.5, color: 'rgba(12,20,63,0.8)', lineHeight: 1.5 }}>
                      {PAGE_COPY.switchHint}
                    </p>
                    <button
                      type="button"
                      onClick={switchToReturning}
                      style={{
                        padding: '7px 14px',
                        border: `1px solid ${NAVY_INK}`,
                        background: 'transparent',
                        color: NAVY_INK,
                        fontFamily: 'var(--font-cocogoose)',
                        fontWeight: 350,
                        fontSize: 12,
                        letterSpacing: '0.03em',
                        cursor: 'pointer',
                        borderRadius: 0,
                      }}
                    >
                      Switch to {role === 'presenter' ? PAGE_COPY.trackPresentAgain : PAGE_COPY.trackWatchAgain}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Presenter Fields ── */}
              {showApplication && role === 'presenter' && (
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

                  {/* Returning presenters already confirmed their email in step 02 */}
                  {!isReturning && (
                    <FieldRow label={PAGE_COPY.labelEmail} required error={attempted && !EMAIL_REGEX.test(presenter.contact)} errorMsg={PAGE_COPY.errorEmailInvalid}>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={presenter.contact}
                        onChange={e => setPresenter(p => ({ ...p, contact: e.target.value }))}
                        onBlur={e => hintCheck(e.target.value)}
                        style={ef(presenter.contact)}
                      />
                    </FieldRow>
                  )}

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

                  {/* Link / deck. Required, with playful junk-detection bubble */}
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
                      required
                      aria-required="true"
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
              {showApplication && role === 'watcher' && (
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

                  {/* Returning watchers already confirmed their email in step 02 */}
                  {!isReturning && (
                    <FieldRow label={PAGE_COPY.labelEmail} required error={attempted && !EMAIL_REGEX.test(watcher.email)} errorMsg={PAGE_COPY.errorEmailInvalid}>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={watcher.email}
                        onChange={e => setWatcher(w => ({ ...w, email: e.target.value }))}
                        onBlur={e => hintCheck(e.target.value)}
                        style={ef(watcher.email)}
                      />
                    </FieldRow>
                  )}

                  {/* Membership. Free for ASES members, paid for non-members */}
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

              {/* ── Submit (application tracks) ── */}
              {showApplication && (
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
              src="/images/ace-stand.webp"
              alt=""
              width={750}
              height={750}
              style={{ display: 'block', width: 'auto', height: 122 }}
            />
          </motion.div>

          {/* Comic speech bubble. Wraps instead of forcing overflow on mobile */}
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
        src="/images/ace-stand.webp"
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
          <strong style={{ fontWeight: 600 }}>Hey, I&apos;m Ace.</strong> Quick rundown: Build with ASES is our session
          for people who actually make things. Pick a track below: <strong style={{ fontWeight: 600 }}>present</strong>{' '}
          to put your build in front of the room, or <strong style={{ fontWeight: 600 }}>watch</strong>{' '}
          to see what everyone&apos;s shipping. That&apos;s the whole thing. Go.
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
// Two columns scroll at different speeds (parallax). Hover pauses on desktop;
// tap to toggle-pause on mobile. The track is duplicated so translateY(-50%)
// lands exactly on a repeat.
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
            loading={i === 0 ? 'eager' : 'lazy'}
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
          paused. click to resume
        </div>
      )}

      <div style={{ display: 'flex', gap: GALLERY_GAP, height: '100%', overflow: 'hidden' }}>
        <GalleryColumn items={col1} duration={42} paused={paused} offset={0} keyPrefix="c1" />
        <GalleryColumn items={col2} duration={32} paused={paused} offset={-70} keyPrefix="c2" />
      </div>
    </div>
  );
}
