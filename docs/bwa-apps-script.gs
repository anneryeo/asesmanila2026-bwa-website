/**
 * Build with ASES — sessions + applications backend (Google Apps Script)
 * ---------------------------------------------------------------------------
 * This is the source of truth for the Apps Script bound to the Build with ASES
 * spreadsheet. It is kept here for version control only — the deployed copy
 * lives in the spreadsheet's Apps Script project. Keep the two in sync.
 * (Supersedes the copy in asesmanila2026-website/docs/bwa-apps-script.gs.)
 *
 * Endpoints (one /exec URL serves all):
 *   GET                          -> doGet()  : upcoming sessions [{ id, label }]
 *   GET ?action=lookup&email=…   -> doGet()  : returning-builder check
 *                                   { found, role, name, lastSession }
 *   POST role=presenter|watcher  -> doPost() : stores an application
 *   POST role=shipticket         -> doPost() : stores a public ship ticket
 *                                   (email must exist in Presenters/Watchers;
 *                                   dedupes identical pledges; max 5 per day
 *                                   per email to keep spam off the wall)
 *
 * Consumed by:
 *   app/api/bwa-sessions/route.ts  (GET sessions)
 *   app/api/bwa-lookup/route.ts    (GET lookup)
 *   app/api/bwa-submit/route.ts    (POST applications)
 *   app/api/ship-ticket/route.ts   (POST ship tickets)
 *
 * Deploy:  Extensions > Apps Script > Deploy > Manage deployments
 *          > (edit existing) > Version: New version > Deploy
 *          Execute as: Me   |   Who has access: Anyone
 * The /exec URL stays the same on a new version, so the Next routes need no
 * changes. One-time: run setup() from the editor to create the tabs + headers.
 * Existing sheets keep working — the new Ship ticket column is appended and
 * the lookup action only reads.
 *
 * Current deployment:
 * https://script.google.com/macros/s/AKfycbzLnt_-1g2H_paCD11hy6eOsw8R_9DY6DLcCqz3UVnZ5UqOhwI28lFwKwyfWDCey17A/exec
 *
 * Sheet layout:
 *   Sessions     : ID | Label | Active
 *   Presenters   : Timestamp | Session ID | Session | Name | Email | Project |
 *                  One-liner | Stage | Link / Deck | Question 1 | Question 2 |
 *                  Question 3 | Notify future | Returning | Ship ticket
 *   Watchers     : Timestamp | Session ID | Session | Name | Email |
 *                  Membership | Hoping to see | Notify future | Returning |
 *                  Ship ticket
 *   ShipTickets  : Timestamp | Email | Name | Project | Episode | Pledge
 *   MailingList  : Email | Name | Role | Last session | Notify future | Updated
 */

const SHEETS = {
  sessions: 'Sessions',
  presenters: 'Presenters',
  watchers: 'Watchers',
  shiptickets: 'ShipTickets',
  mailing: 'MailingList',
};

const HEADERS = {
  sessions:   ['ID', 'Label', 'Active'],
  presenters: ['Timestamp', 'Session ID', 'Session', 'Name', 'Email', 'Project',
               'One-liner', 'Stage', 'Link / Deck', 'Question 1', 'Question 2',
               'Question 3', 'Notify future', 'Returning', 'Ship ticket'],
  watchers:   ['Timestamp', 'Session ID', 'Session', 'Name', 'Email', 'Membership',
               'Hoping to see', 'Notify future', 'Returning', 'Ship ticket'],
  shiptickets: ['Timestamp', 'Email', 'Name', 'Project', 'Episode', 'Pledge'],
  mailing:    ['Email', 'Name', 'Role', 'Last session', 'Notify future', 'Updated'],
};

// Anti-spam: max ship tickets per email per rolling 24h.
const SHIP_TICKETS_PER_DAY = 5;

/** GET -> sessions list, or a returning-builder lookup when action=lookup. */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'lookup') return lookupEmail(e.parameter.email);

  const out = [];
  const sheet = ss().getSheetByName(SHEETS.sessions);
  if (sheet) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const id = rows[i][0], label = rows[i][1], active = rows[i][2];
      if (!id) continue;
      const off = active === false || String(active).trim().toLowerCase() === 'false'
               || String(active).trim().toLowerCase() === 'no';
      if (off) continue;
      out.push({ id: String(id), label: String(label) });
    }
  }
  return json(out);
}

/**
 * Has this email applied before (any session, either track)?
 * Scans Presenters then Watchers; the LAST match wins so the response
 * reflects their most recent application.
 */
function lookupEmail(email) {
  const target = String(email || '').trim().toLowerCase();
  if (!target) return json({ found: false });

  let hit = null;
  const scan = (sheetName, emailCol, nameCol, sessionCol, role) => {
    const sheet = ss().getSheetByName(sheetName);
    if (!sheet) return;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][emailCol]).trim().toLowerCase() === target) {
        hit = { role: role, name: String(rows[i][nameCol] || ''), lastSession: String(rows[i][sessionCol] || '') };
      }
    }
  };
  scan(SHEETS.presenters, 4, 3, 2, 'presenter');
  scan(SHEETS.watchers, 4, 3, 2, 'watcher');

  if (!hit) return json({ found: false });
  return json({ found: true, role: hit.role, name: hit.name, lastSession: hit.lastSession });
}

/** POST -> store a presenter or watcher application */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); }
  catch (err) { return json({ success: false, message: 'Server busy — please try again.' }); }

  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.role === 'presenter')  return handlePresenter(d);
    if (d.role === 'watcher')    return handleWatcher(d);
    if (d.role === 'shipticket') return handleShipTicket(d);
    return json({ success: false, message: 'Unknown application type.' });
  } catch (err) {
    return json({ success: false, message: 'Could not read submission: ' + err });
  } finally {
    lock.releaseLock();
  }
}

function handlePresenter(d) {
  const sheet = sheetOf(SHEETS.presenters, HEADERS.presenters);
  if (isDuplicate(sheet, 4, d.contact, 1, d.sessionId)) {
    return json({ success: false, duplicate: true,
                  message: "You've already applied to present at this session." });
  }
  const q = Array.isArray(d.questions) ? d.questions : [];
  sheet.appendRow([
    new Date(), d.sessionId || '', d.sessionLabel || '', d.name || '', d.contact || '',
    d.projectName || '', d.oneLiner || '', d.stage || '', d.link || '',
    q[0] || '', q[1] || '', q[2] || '', d.notifyFuture ? 'Yes' : 'No',
    d.returning ? 'Yes' : 'No', d.shipTicket || '',
  ]);
  if (d.notifyFuture) upsertMailing(d.contact, d.name, 'presenter', d.sessionLabel);
  return json({ success: true });
}

function handleWatcher(d) {
  const sheet = sheetOf(SHEETS.watchers, HEADERS.watchers);
  if (isDuplicate(sheet, 4, d.email, 1, d.sessionId)) {
    return json({ success: false, duplicate: true,
                  message: "You're already on the list for this session." });
  }
  const membership = d.membership === 'member' ? 'ASES member'
                   : d.membership === 'non-member' ? 'Non-member' : '';
  sheet.appendRow([
    new Date(), d.sessionId || '', d.sessionLabel || '', d.name || '', d.email || '',
    membership, d.curiosity || '', d.notifyFuture ? 'Yes' : 'No',
    d.returning ? 'Yes' : 'No', d.shipTicket || '',
  ]);
  if (d.notifyFuture) upsertMailing(d.email, d.name, 'watcher', d.sessionLabel);
  return json({ success: true });
}

/**
 * Public ship ticket: a pledge for the wall. Guarded three ways:
 *   1. the email must exist in Presenters or Watchers (been in the room),
 *   2. identical pledge from the same email -> duplicate,
 *   3. more than SHIP_TICKETS_PER_DAY tickets in 24h -> throttled.
 */
function handleShipTicket(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const name = String(d.name || '').trim();
  const pledge = String(d.pledge || '').trim();
  if (!email || !name || !pledge) {
    return json({ success: false, message: 'Name, email, and pledge are required.' });
  }
  if (!emailExists(email)) {
    return json({ success: false, notFound: true,
                  message: "That email hasn't been to a BWA episode yet. Register for a session first." });
  }

  const sheet = sheetOf(SHEETS.shiptickets, HEADERS.shiptickets);
  const rows = sheet.getDataRange().getValues();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let recent = 0;
  for (let i = 1; i < rows.length; i++) {
    const rowEmail = String(rows[i][1]).trim().toLowerCase();
    if (rowEmail !== email) continue;
    if (String(rows[i][5]).trim().toLowerCase() === pledge.toLowerCase()) {
      return json({ success: false, duplicate: true,
                    message: "That exact pledge is already on the wall. Post a new one." });
    }
    const ts = rows[i][0] instanceof Date ? rows[i][0].getTime() : Date.parse(rows[i][0]);
    if (ts && ts > dayAgo) recent++;
  }
  if (recent >= SHIP_TICKETS_PER_DAY) {
    return json({ success: false, throttled: true,
                  message: 'Easy there. That email has posted enough tickets for today. Ship one of them instead.' });
  }

  sheet.appendRow([
    new Date(), email, name, String(d.project || '').trim(), String(d.episode || '').trim(), pledge,
  ]);
  return json({ success: true });
}

/** Is this email anywhere in the Presenters or Watchers lists? */
function emailExists(email) {
  const target = String(email || '').trim().toLowerCase();
  if (!target) return false;
  const sheetsToScan = [SHEETS.presenters, SHEETS.watchers];
  for (let s = 0; s < sheetsToScan.length; s++) {
    const sheet = ss().getSheetByName(sheetsToScan[s]);
    if (!sheet) continue;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][4]).trim().toLowerCase() === target) return true;
    }
  }
  return false;
}

/** Same email + same session already in the sheet -> duplicate. */
function isDuplicate(sheet, emailCol, email, sessionCol, sessionId) {
  if (!email) return false;
  const rows = sheet.getDataRange().getValues();
  const target = String(email).trim().toLowerCase();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][emailCol]).trim().toLowerCase() === target &&
        String(rows[i][sessionCol]).trim() === String(sessionId).trim()) return true;
  }
  return false;
}

/** Keep one row per email in the retention list, refreshed on each opt-in. */
function upsertMailing(email, name, role, lastSession) {
  if (!email) return;
  const sheet = sheetOf(SHEETS.mailing, HEADERS.mailing);
  const rows = sheet.getDataRange().getValues();
  const target = String(email).trim().toLowerCase();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === target) {
      sheet.getRange(i + 1, 1, 1, 6)
           .setValues([[email, name, role, lastSession, 'Yes', new Date()]]);
      return;
    }
  }
  sheet.appendRow([email, name, role, lastSession, 'Yes', new Date()]);
}

/* -- helpers -- */
function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheetOf(name, headers) {
  let s = ss().getSheetByName(name);
  if (!s) s = ss().insertSheet(name);
  if (s.getLastRow() === 0) {
    s.appendRow(headers);
    s.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    s.setFrozenRows(1);
  }
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

/** Run ONCE from the editor: creates tabs, headers, and sample sessions. */
function setup() {
  sheetOf(SHEETS.sessions, HEADERS.sessions);
  sheetOf(SHEETS.presenters, HEADERS.presenters);
  sheetOf(SHEETS.watchers, HEADERS.watchers);
  sheetOf(SHEETS.shiptickets, HEADERS.shiptickets);
  sheetOf(SHEETS.mailing, HEADERS.mailing);
  const sx = ss().getSheetByName(SHEETS.sessions);
  if (sx.getLastRow() < 2) {
    sx.appendRow(['2026-07-15', 'Build with ASES — July 15, 2026', true]);
    sx.appendRow(['2026-08-05', 'Build with ASES — August 5, 2026', true]);
  }
}
