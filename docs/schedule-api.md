# Schedule Call — Google Apps Script API

The `ScheduleWidget` on the site calls a Google Apps Script web app as its backend.
This document covers setup, deployment, and the API contract.

## Environment variable

```
PUBLIC_SCHEDULE_API_URL=https://script.google.com/macros/s/AKfycbzIH100rcbBH84ragJP89fuv85j1ui0WrIdGX0pKNsgMZo1xFSTBHMKYeFCGui7BWgO/exec
```

Set this in:
- `.env` for local development
- GitHub Actions secret `PUBLIC_SCHEDULE_API_URL` for production builds

---

## Google Apps Script setup

### 1. Create the script

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Rename the project to something like `CloudAlgo Schedule API`
3. Replace the default `Code.gs` content with the script below

### 2. Script (`Code.gs`)

```javascript
// ── Configuration ─────────────────────────────────────────────────────────────
const CALENDAR_ID      = 'primary';               // or your calendar email address
const OWNER_EMAIL      = 'sandeep@cloudalgo.com';
const SLOT_DURATION_MIN = 30;
const BUSINESS_HOURS   = { start: 18, end: 21 };  // 18:00–21:00 IST
const BUFFER_BEFORE_MIN = 0;                       // gap before each slot (minutes)
const BUFFER_AFTER_MIN  = 0;                       // gap after each slot (minutes)

// ── Entry point ───────────────────────────────────────────────────────────────
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  let body;
  try {
    if (params.action === 'slots') {
      body = getSlots(params.date);
    } else if (params.action === 'book') {
      body = bookSlot(params);
    } else {
      body = { error: 'Unknown action' };
    }
  } catch (err) {
    body = { error: err.message };
  }
  return jsonResponse(body);
}

// ── Get available slots ───────────────────────────────────────────────────────
function getSlots(dateStr) {
  if (!dateStr) return { error: 'Missing date' };

  const [y, m, d] = dateStr.split('-').map(Number);
  // IST = UTC+5:30 → subtract 5h30m to get UTC
  const dayStart = new Date(Date.UTC(y, m - 1, d, BUSINESS_HOURS.start - 5, -30, 0));
  const dayEnd   = new Date(Date.UTC(y, m - 1, d, BUSINESS_HOURS.end   - 5, -30, 0));

  const cal      = CalendarApp.getCalendarById(CALENDAR_ID);
  const existing = cal.getEvents(dayStart, dayEnd);

  const busy = existing.map(ev => ({
    start: ev.getStartTime().getTime() - BUFFER_BEFORE_MIN * 60000,
    end:   ev.getEndTime().getTime()   + BUFFER_AFTER_MIN  * 60000,
  }));

  const slots    = [];
  const allSlots = [];
  let cursor     = new Date(dayStart);
  const slotMs   = SLOT_DURATION_MIN * 60000;

  while (cursor.getTime() + slotMs <= dayEnd.getTime()) {
    const slotEnd = new Date(cursor.getTime() + slotMs);
    const isFree  = !busy.some(b => cursor.getTime() < b.end && slotEnd.getTime() > b.start);
    const istMs   = cursor.getTime() + 5.5 * 3600 * 1000;
    const istDate = new Date(istMs);
    const hh      = String(istDate.getUTCHours()).padStart(2, '0');
    const mm      = String(istDate.getUTCMinutes()).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;
    allSlots.push(timeStr);
    if (isFree) slots.push(timeStr);
    cursor = new Date(cursor.getTime() + slotMs);
  }

  return { slots, allSlots };
}

// ── Book a slot ───────────────────────────────────────────────────────────────
function bookSlot(p) {
  const { name, email, date, time, notes, timezone } = p;
  if (!name || !email || !date || !time)
    return { success: false, error: 'Missing required fields' };

  const [y, m, d]   = date.split('-').map(Number);
  const [hour, min] = time.split(':').map(Number);

  const startUTC = new Date(Date.UTC(y, m - 1, d, hour - 5, min - 30, 0));
  const endUTC   = new Date(startUTC.getTime() + SLOT_DURATION_MIN * 60000);

  // Race-condition guard — check the slot is still free
  const cal       = CalendarApp.getCalendarById(CALENDAR_ID);
  const conflicts = cal.getEvents(startUTC, endUTC);
  if (conflicts.length > 0)
    return { success: false, error: 'This slot was just booked. Please choose another time.' };

  const description = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Timezone: ${timezone || 'Not specified'}`,
    notes ? `Notes: ${notes}` : '',
  ].filter(Boolean).join('\n');

  const event = cal.createEvent(`Call with ${name}`, startUTC, endUTC, {
    description,
    guests: [email, 'sandeep@cloudalgo.com', 'vikash@cloudalgo.com'].join(','),
    sendInvites: true,
  });

  sendConfirmationEmail({ name, email, date, time, timezone, notes });

  return { success: true, eventId: event.getId() };
}

// ── Confirmation email ────────────────────────────────────────────────────────
function sendConfirmationEmail({ name, email, date, time, timezone, notes }) {
  const subject = 'Your call with CloudAlgo is confirmed!';
  const body = `Hi ${name},

Your 30-minute call with the CloudAlgo team has been confirmed.

Date:     ${date}
Time:     ${time} IST
Duration: 30 minutes
Meeting:  Video call (link will be shared shortly)
${notes ? '\nYour notes: ' + notes + '\n' : ''}
If you need to reschedule, reply to this email.

Talk soon,
Sandeep Kumar
CloudAlgo
${OWNER_EMAIL}`;

  MailApp.sendEmail({ to: email, subject, body, name: 'CloudAlgo' });

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: `New call booked: ${name} — ${date} at ${time} IST`,
    body: `New booking:\n\nName:     ${name}\nEmail:    ${email}\nDate:     ${date}\nTime:     ${time} IST\nTimezone: ${timezone}\nNotes:    ${notes || 'None'}`,
  });
}

// ── JSON response ─────────────────────────────────────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy as a web app

1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Set:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy** and authorise the required permissions (Calendar + Gmail)
5. Copy the URL: `https://script.google.com/macros/s/AKfycbzIH100rcbBH84ragJP89fuv85j1ui0WrIdGX0pKNsgMZo1xFSTBHMKYeFCGui7BWgO/exec`

> Every time you edit the script you must create a **new deployment** (or **manage deployments → edit**) — the URL stays the same but the version updates.

### 4. Wire it up locally

```bash
# .env (git-ignored)
PUBLIC_SCHEDULE_API_URL=https://script.google.com/macros/s/AKfycbzIH100rcbBH84ragJP89fuv85j1ui0WrIdGX0pKNsgMZo1xFSTBHMKYeFCGui7BWgO/exec
```

### 5. Wire it up in GitHub Actions

Add a repository secret:

| Name | Value |
|------|-------|
| `PUBLIC_SCHEDULE_API_URL` | `https://script.google.com/macros/s/AKfycbzIH100rcbBH84ragJP89fuv85j1ui0WrIdGX0pKNsgMZo1xFSTBHMKYeFCGui7BWgO/exec` |

The deploy workflow already passes `PUBLIC_*` env vars to the Astro build step (verify in `.github/workflows/deploy.yml` if needed).

---

## API contract

All requests are `GET`. The script returns `application/json`.

### `?action=slots&date=YYYY-MM-DD`

Returns available 30-minute slots for the given date in **IST**.

```json
{ "slots": ["18:00", "19:00"], "allSlots": ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"] }
```

An empty array means no slots are available. On error:

```json
{ "error": "Missing date" }
```

### `?action=book&name=…&email=…&date=YYYY-MM-DD&time=HH:MM&notes=…&timezone=…`

Books the slot, creates a Google Calendar event (with the guest invited), and sends confirmation emails to both the booker and the owner.

```json
{ "success": true, "eventId": "abc123" }
```

On failure:

```json
{ "success": false, "error": "This slot was just booked. Please choose another time." }
```

---

## Configuration reference

| Constant | Default | Description |
|----------|---------|-------------|
| `CALENDAR_ID` | `'primary'` | Calendar to read/write. Use a specific calendar email to keep bookings separate. |
| `OWNER_EMAIL` | `sandeep@cloudalgo.com` | Receives notification emails for every new booking. |
| `SLOT_DURATION_MIN` | `30` | Must match the widget constant (`SLOT_DURATION_MIN`). |
| `BUSINESS_HOURS.start` | `18` | First slot start hour in IST (24h). |
| `BUSINESS_HOURS.end` | `21` | No slots start at or after this hour in IST. |
| `BUFFER_BEFORE_MIN` | `0` | Minutes of buffer before an existing event (blocks surrounding slots). |
| `BUFFER_AFTER_MIN` | `0` | Minutes of buffer after an existing event. |
