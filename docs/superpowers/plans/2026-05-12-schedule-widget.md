# Schedule Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Calendly-style floating scheduling widget backed by Google Apps Script + Google Calendar, matching CloudAlgo's brand (Outfit font, `#f75a41`), rendered on every page.

**Architecture:** A React component (`ScheduleWidget.tsx`) mounted in `Page.astro` via `client:only="react"` handles the UI — floating launcher, date/time picker modal, details form, and confirmation screen. A Google Apps Script Web App (deployed separately) serves availability slots from Google Calendar and creates bookings. All communication goes over a single `PUBLIC_SCHEDULE_API_URL` env variable.

**Tech Stack:** Astro 6 · React 19 · TypeScript strict · react-icons (already installed) · Google Apps Script · Formspree not used (emails sent from Apps Script via GmailApp)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `scripts/schedule-api.gs` | Google Apps Script source (version-controlled copy) |
| Modify | `.env.example` | Document `PUBLIC_SCHEDULE_API_URL` |
| Create | `.env` | Local dev value (gitignored) |
| Modify | `.github/workflows/deploy.yml` | Pass `PUBLIC_SCHEDULE_API_URL` secret to build |
| Modify | `src/styles/global.css` | All `.sw-*` widget styles |
| Create | `src/components/ui/ScheduleWidget.tsx` | Full widget — launcher, modal, all steps |
| Modify | `src/layouts/Page.astro` | Mount `<ScheduleWidget client:only="react" />` |

---

## Task 1: Remove react-calendly

We installed `react-calendly` in an earlier session but are not using it. Remove it before it causes type errors.

**Files:** Modify `package.json`, `package-lock.json`

- [ ] **Step 1: Uninstall the package**

```bash
npm uninstall react-calendly
```

- [ ] **Step 2: Verify it's gone**

```bash
npm run astro check
```

Expected: exits 0 with no errors about react-calendly.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused react-calendly package"
```

---

## Task 2: Google Apps Script Backend

Create the Apps Script file and deploy it as a Web App. All requests use GET (avoids CORS preflight). The `action` param routes between `slots` and `book`.

**Files:** Create `scripts/schedule-api.gs`

- [ ] **Step 1: Create `scripts/schedule-api.gs`**

```javascript
// scripts/schedule-api.gs
// Deploy as: Execute as Me | Access: Anyone (even anonymous)

var CALENDAR_ID   = 'sandeep@cloudalgo.com';
var SLOT_START_H  = 18;   // 6:00 PM IST
var SLOT_END_H    = 21;   // 9:00 PM IST
var SLOT_DURATION = 30;   // minutes
var HOST_EMAIL    = 'sandeep@cloudalgo.com';

function doGet(e) {
  var action = e.parameter.action || 'slots';
  var result;
  if (action === 'slots') {
    result = { slots: getAvailableSlots(e.parameter.date) };
  } else if (action === 'book') {
    result = createBooking(
      e.parameter.name,
      e.parameter.email,
      e.parameter.date,
      e.parameter.time,
      e.parameter.notes || '',
      e.parameter.timezone
    );
  } else {
    result = { error: 'Unknown action' };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAvailableSlots(dateStr) {
  if (!dateStr) return [];
  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  var date = new Date(dateStr + 'T00:00:00+05:30');
  var events = calendar.getEventsForDay(date);
  var dayStartMs = date.getTime();

  var busyIntervals = events.map(function(ev) {
    return {
      start: (ev.getStartTime().getTime() - dayStartMs) / 60000,
      end:   (ev.getEndTime().getTime()   - dayStartMs) / 60000,
    };
  });

  // Filter past slots when date is today (IST)
  var nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
  var todayIST = nowIST.getUTCFullYear() + '-'
    + pad(nowIST.getUTCMonth() + 1) + '-'
    + pad(nowIST.getUTCDate());
  var nowMinutesIST = nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();

  var slots = [];
  for (var m = SLOT_START_H * 60; m < SLOT_END_H * 60; m += SLOT_DURATION) {
    var slotEnd = m + SLOT_DURATION;
    var slotKey = pad(Math.floor(m / 60)) + ':' + pad(m % 60);
    if (dateStr === todayIST && m <= nowMinutesIST) continue;
    var busy = busyIntervals.some(function(b) { return m < b.end && slotEnd > b.start; });
    if (!busy) slots.push(slotKey);
  }
  return slots;
}

function createBooking(name, email, date, time, notes, timezone) {
  try {
    var parts = time.split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var startDate = new Date(date + 'T' + pad(h) + ':' + pad(m) + ':00+05:30');
    var endDate   = new Date(startDate.getTime() + SLOT_DURATION * 60000);

    CalendarApp.getCalendarById(CALENDAR_ID).createEvent(
      'Meeting with ' + name,
      startDate,
      endDate,
      { description: notes, guests: email }
    );

    var displayTime = startDate.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    GmailApp.sendEmail(
      email,
      'Your meeting with CloudAlgo Sales is confirmed',
      'Hi ' + name + ',\n\nYour 30-minute meeting is scheduled:\n\n'
        + displayTime + ' (' + timezone + ')\n\n'
        + 'We\'ll send web conferencing details before the meeting.\n\n'
        + 'Best,\nCloudAlgo Sales Team',
      { name: 'CloudAlgo Sales', replyTo: HOST_EMAIL }
    );

    GmailApp.sendEmail(
      HOST_EMAIL,
      'New booking: Meeting with ' + name,
      'New 30-min meeting booked.\n\n'
        + 'Name: ' + name + '\nEmail: ' + email + '\n'
        + 'Time: ' + displayTime + ' (' + timezone + ')\n\n'
        + 'Notes:\n' + (notes || '(none)'),
      { name: 'CloudAlgo Schedule Widget' }
    );

    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function pad(n) {
  return String(n).padStart(2, '0');
}
```

- [ ] **Step 2: Deploy the Apps Script**

1. Go to [script.google.com](https://script.google.com) and sign in as `sandeep@cloudalgo.com`.
2. Click **New project**.
3. Delete the default `myFunction` code. Paste the entire contents of `scripts/schedule-api.gs`.
4. Click **Deploy → New deployment**.
5. Set type: **Web app**.
6. Execute as: **Me (sandeep@cloudalgo.com)**.
7. Who has access: **Anyone**.
8. Click **Deploy**. Copy the Web App URL — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
9. Authorize the script when prompted (allow Calendar and Gmail access).

- [ ] **Step 3: Smoke-test the endpoint in a browser**

Paste this URL (replace `YOUR_ID` with your script ID):
```
https://script.google.com/macros/s/YOUR_ID/exec?action=slots&date=2026-05-15
```

Expected response:
```json
{"slots":["18:00","18:30","19:00","19:30","20:00","20:30","21:00"]}
```
(Slots may vary if events exist on that date.)

- [ ] **Step 4: Commit**

```bash
git add scripts/schedule-api.gs
git commit -m "feat: add Google Apps Script schedule API"
```

---

## Task 3: Environment Variable Setup

Wire the Apps Script URL into the Astro build so the React widget can call it.

**Files:** Create `.env.example`, create `.env`, modify `.github/workflows/deploy.yml`

- [ ] **Step 1: Check `.gitignore` includes `.env`**

Run:
```bash
grep "^\.env$" .gitignore
```
If nothing prints, add `.env` to `.gitignore`:
```bash
echo ".env" >> .gitignore
```

- [ ] **Step 2: Create `.env.example`** (safe to commit)

Create the file `/Volumes/WorkHD/cloudalgo/cloudalgo.github.io/.env.example`:
```
PUBLIC_SCHEDULE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

- [ ] **Step 3: Create local `.env`** (gitignored)

Create the file `/Volumes/WorkHD/cloudalgo/cloudalgo.github.io/.env`:
```
PUBLIC_SCHEDULE_API_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec
```
(Paste your real script URL from Task 2.)

- [ ] **Step 4: Update GitHub Actions to pass the secret**

Modify `.github/workflows/deploy.yml`. Replace the `Build` step:

Old:
```yaml
      - name: Build
        run: npm run build
```

New:
```yaml
      - name: Build
        run: npm run build
        env:
          PUBLIC_SCHEDULE_API_URL: ${{ secrets.PUBLIC_SCHEDULE_API_URL }}
```

- [ ] **Step 5: Add the secret in GitHub**

Go to your repository → **Settings → Secrets and variables → Actions → New repository secret**.
- Name: `PUBLIC_SCHEDULE_API_URL`
- Value: your Apps Script Web App URL

- [ ] **Step 6: Commit**

```bash
git add .env.example .github/workflows/deploy.yml .gitignore
git commit -m "feat: add PUBLIC_SCHEDULE_API_URL env variable for schedule widget"
```

---

## Task 4: Widget CSS

Add all `.sw-*` styles to `global.css`. These are scoped by the `sw-` prefix and won't conflict with existing Bootstrap-derived class names.

**Files:** Modify `src/styles/global.css` — append at the end.

- [ ] **Step 1: Append styles to `src/styles/global.css`**

Add the following block at the very end of the file:

```css
/* ============================================================
   Schedule Widget  (.sw-*)
   ============================================================ */

.sw-launcher {
  position: fixed;
  bottom: 0;
  right: 16px;
  padding-bottom: 16px;
  width: 276px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  animation: swFadeIn 1s ease 2s both;
}

@keyframes swFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.sw-tooltip {
  position: relative;
  background: #fff;
  border: 1px solid #eaf0f6;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 16px;
  width: 240px;
  margin-bottom: 12px;
  font-family: 'Outfit', system-ui, sans-serif;
}

.sw-tooltip-text {
  font-size: 14px;
  color: var(--ca-secondary-black);
  margin: 0;
  line-height: 1.5;
}

.sw-tooltip-close {
  position: absolute;
  top: 6px;
  right: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: #7c98b6;
  font-size: 18px;
  line-height: 1;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 150ms;
}

.sw-tooltip-close:hover { color: var(--ca-secondary-black); }

.sw-launcher-btn-wrap {
  display: flex;
  justify-content: flex-end;
}

.sw-launcher-btn {
  background: var(--ca-orange);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(247, 90, 65, 0.4);
  transition: transform 100ms ease-in-out, background 150ms;
}

.sw-launcher-btn:hover {
  transform: scale(1.1);
  background: #d94e37;
}

/* Overlay & Modal */
.sw-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.sw-modal {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  font-family: 'Outfit', system-ui, sans-serif;
}

/* Steps */
.sw-step {
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 480px;
}

.sw-step--confirmed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
}

.sw-step-left {
  padding: 32px 24px;
  border-right: 1px solid #eaf0f6;
}

.sw-step-right {
  padding: 32px 32px;
  overflow-y: auto;
}

/* Close button */
.sw-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 22px;
  color: #7c98b6;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 150ms;
  z-index: 1;
}

.sw-modal-close:hover { color: var(--ca-secondary-black); }

/* Calendar */
.sw-cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sw-cal-month {
  font-weight: 600;
  font-size: 15px;
  color: var(--ca-primary-black);
}

.sw-cal-nav {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 22px;
  color: var(--ca-secondary-black);
  line-height: 1;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 150ms;
}

.sw-cal-nav:hover:not(:disabled) { background: #f3f3f3; }
.sw-cal-nav:disabled { opacity: 0.3; cursor: default; }

.sw-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 16px;
}

.sw-cal-dow {
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  color: #7c98b6;
  padding: 4px 0 8px;
  letter-spacing: 0.02em;
}

.sw-cal-day {
  aspect-ratio: 1;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Outfit', system-ui, sans-serif;
  color: var(--ca-primary-black);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms, color 120ms;
  padding: 0;
  width: 100%;
}

.sw-cal-day:hover:not(:disabled):not(.sw-cal-day--empty):not(.sw-cal-day--selected) {
  background: rgba(247, 90, 65, 0.12);
  color: var(--ca-orange);
}

.sw-cal-day--empty { cursor: default; visibility: hidden; }

.sw-cal-day--disabled {
  color: #c8c8c8;
  cursor: default;
}

.sw-cal-day--today {
  box-shadow: 0 0 0 2px var(--ca-orange);
  color: var(--ca-orange);
  font-weight: 600;
}

.sw-cal-day--selected {
  background: var(--ca-orange) !important;
  color: #fff !important;
  font-weight: 600;
}

.sw-timezone {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ca-secondary-black);
  margin-top: 8px;
}

/* Slots panel */
.sw-slots-heading {
  font-size: 16px;
  font-weight: 600;
  color: var(--ca-primary-black);
  margin-bottom: 16px;
}

.sw-slots-prompt,
.sw-slots-empty {
  font-size: 14px;
  color: var(--ca-secondary-black);
  padding: 16px 0;
}

.sw-slot-btn {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border: 1.5px solid var(--ca-orange);
  border-radius: 6px;
  background: none;
  color: var(--ca-orange);
  font-size: 15px;
  font-weight: 600;
  font-family: 'Outfit', system-ui, sans-serif;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

.sw-slot-btn:hover {
  background: var(--ca-orange);
  color: #fff;
}

/* Spinner */
.sw-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #f3f3f3;
  border-top-color: var(--ca-orange);
  border-radius: 50%;
  animation: swSpin 0.7s linear infinite;
  margin: 24px auto;
}

@keyframes swSpin {
  to { transform: rotate(360deg); }
}

/* Step 2 — Details */
.sw-back-btn {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ca-secondary-black);
  margin-bottom: 20px;
  transition: border-color 150ms, color 150ms;
}

.sw-back-btn:hover { border-color: var(--ca-orange); color: var(--ca-orange); }

.sw-org-label {
  font-size: 12px;
  color: var(--ca-secondary-black);
  margin-bottom: 4px;
}

.sw-event-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ca-primary-black);
  margin-bottom: 20px;
  line-height: 1.3;
}

.sw-event-meta {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sw-event-meta li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--ca-secondary-black);
  line-height: 1.5;
}

.sw-event-meta li svg { flex-shrink: 0; margin-top: 2px; }

.sw-form-heading {
  font-size: 20px;
  font-weight: 700;
  color: var(--ca-primary-black);
  margin-bottom: 24px;
}

.sw-field {
  margin-bottom: 16px;
}

.sw-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ca-primary-black);
  margin-bottom: 6px;
}

.sw-field input,
.sw-field textarea {
  width: 100%;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: 'Outfit', system-ui, sans-serif;
  color: var(--ca-primary-black);
  transition: border-color 150ms;
  outline: none;
  resize: vertical;
}

.sw-field input:focus,
.sw-field textarea:focus {
  border-color: var(--ca-orange);
}

.sw-error-msg {
  font-size: 13px;
  color: #e53e3e;
  margin-bottom: 12px;
}

.sw-submit-btn {
  background: var(--ca-orange);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Outfit', system-ui, sans-serif;
  cursor: pointer;
  transition: background 150ms;
  width: 100%;
  margin-top: 8px;
}

.sw-submit-btn:hover:not(:disabled) { background: #d94e37; }
.sw-submit-btn:disabled { opacity: 0.6; cursor: default; }

/* Confirmation */
.sw-confirmed-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ca-orange);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 20px;
}

.sw-confirmed-heading {
  font-size: 24px;
  font-weight: 700;
  color: var(--ca-primary-black);
  margin-bottom: 12px;
}

.sw-confirmed-detail {
  font-size: 15px;
  color: var(--ca-secondary-black);
  margin-bottom: 8px;
  max-width: 400px;
}

.sw-confirmed-email {
  font-size: 14px;
  color: var(--ca-secondary-black);
  margin-bottom: 28px;
}

/* Mobile */
@media (max-width: 640px) {
  .sw-launcher .sw-tooltip { display: none; }

  .sw-step {
    grid-template-columns: 1fr;
  }

  .sw-step-left {
    border-right: none;
    border-bottom: 1px solid #eaf0f6;
  }

  .sw-modal {
    max-height: 95vh;
  }

  .sw-step-right {
    padding: 24px 20px;
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npm run astro check
```

Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add schedule widget CSS styles"
```

---

## Task 5: ScheduleWidget.tsx

Create the full React component in a single file. Sub-components are defined in the same file to avoid prop-drilling through module boundaries.

**Files:** Create `src/components/ui/ScheduleWidget.tsx`

- [ ] **Step 1: Create `src/components/ui/ScheduleWidget.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { AiFillSchedule } from 'react-icons/ai';
import { IoCloseOutline } from 'react-icons/io5';
import { FiClock, FiVideo, FiCalendar, FiGlobe, FiArrowLeft, FiCheck } from 'react-icons/fi';

const API_URL = import.meta.env.PUBLIC_SCHEDULE_API_URL as string;
const SLOT_DURATION_MIN = 30;

type Step = 'date' | 'details' | 'confirmed';

// ── Utilities ──────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function istSlotToLocal(date: Date, istTime: string, timezone: string): string {
  const [h, m] = istTime.split(':').map(Number);
  const d = new Date(
    `${toDateStr(date)}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`
  );
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}

function addSlotMinutes(istTime: string, minutes: number): string {
  const [h, m] = istTime.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function formatBookingSummary(date: Date, istTime: string, timezone: string): string {
  const start = istSlotToLocal(date, istTime, timezone);
  const end = istSlotToLocal(date, addSlotMinutes(istTime, SLOT_DURATION_MIN), timezone);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} – ${end}, ${dateLabel}`;
}

function getTimezoneLabel(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'long',
      timeZone: timezone,
    }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value ?? timezone;
  } catch {
    return timezone;
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1; // convert to Mon=0
}

function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
}

function isPastDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < today;
}

function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

// ── ScheduleLauncher ───────────────────────────────────────────────────────

interface LauncherProps {
  tooltipVisible: boolean;
  onDismissTooltip: () => void;
  onOpen: () => void;
}

function ScheduleLauncher({ tooltipVisible, onDismissTooltip, onOpen }: LauncherProps) {
  return (
    <div className="sw-launcher">
      {tooltipVisible && (
        <div className="sw-tooltip">
          <p className="sw-tooltip-text">
            Need help or have questions? Schedule a time with us.
          </p>
          <button className="sw-tooltip-close" onClick={onDismissTooltip} aria-label="Dismiss">
            <IoCloseOutline />
          </button>
        </div>
      )}
      <div className="sw-launcher-btn-wrap">
        <button className="sw-launcher-btn" onClick={onOpen} aria-label="Schedule a meeting">
          <AiFillSchedule />
        </button>
      </div>
    </div>
  );
}

// ── StepDatePicker ─────────────────────────────────────────────────────────

interface StepDatePickerProps {
  selectedDate: Date | null;
  currentMonth: Date;
  availableSlots: string[];
  slotsLoading: boolean;
  slotsError: string | null;
  userTimezone: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  onSelectSlot: (slot: string) => void;
  onClose: () => void;
}

function StepDatePicker({
  selectedDate, currentMonth, availableSlots, slotsLoading, slotsError,
  userTimezone, onPrevMonth, onNextMonth, onSelectDate, onSelectSlot, onClose,
}: StepDatePickerProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const offset = getFirstDayOffset(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSelected = (day: number) =>
    selectedDate?.getFullYear() === year &&
    selectedDate?.getMonth() === month &&
    selectedDate?.getDate() === day;

  const isDisabled = (day: number) =>
    isPastDate(year, month, day) || isWeekend(year, month, day);

  const tzLabel = getTimezoneLabel(userTimezone);

  return (
    <div className="sw-step sw-step--date">
      <div className="sw-step-left">
        <div className="sw-calendar">
          <div className="sw-cal-header">
            <button
              className="sw-cal-nav"
              onClick={onPrevMonth}
              disabled={isCurrentMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="sw-cal-month">{monthLabel}</span>
            <button className="sw-cal-nav" onClick={onNextMonth} aria-label="Next month">
              ›
            </button>
          </div>

          <div className="sw-cal-grid">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
              <span key={d} className="sw-cal-dow">{d}</span>
            ))}
            {cells.map((day, i) => {
              const empty = day === null;
              const disabled = !empty && isDisabled(day!);
              const selected = !empty && isSelected(day!);
              const today_ = !empty && isToday(year, month, day!);
              return (
                <button
                  key={i}
                  className={[
                    'sw-cal-day',
                    empty ? 'sw-cal-day--empty' : '',
                    disabled ? 'sw-cal-day--disabled' : '',
                    today_ && !selected ? 'sw-cal-day--today' : '',
                    selected ? 'sw-cal-day--selected' : '',
                  ].filter(Boolean).join(' ')}
                  disabled={empty || disabled}
                  onClick={() => day && !disabled && onSelectDate(new Date(year, month, day))}
                  aria-label={day ? `${monthLabel} ${day}` : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="sw-timezone">
            <FiGlobe size={14} />
            <span>{tzLabel}</span>
          </div>
        </div>
      </div>

      <div className="sw-step-right">
        {!selectedDate && (
          <p className="sw-slots-prompt">Select a date to see available times.</p>
        )}
        {selectedDate && (
          <>
            <h3 className="sw-slots-heading">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            {slotsLoading && <div className="sw-spinner" aria-label="Loading slots" />}
            {slotsError && !slotsLoading && (
              <p className="sw-slots-empty">{slotsError}</p>
            )}
            {!slotsLoading && !slotsError && availableSlots.length === 0 && (
              <p className="sw-slots-empty">No slots available for this date.</p>
            )}
            {!slotsLoading && !slotsError && availableSlots.map(slot => (
              <button
                key={slot}
                className="sw-slot-btn"
                onClick={() => onSelectSlot(slot)}
              >
                {istSlotToLocal(selectedDate, slot, userTimezone)}
              </button>
            ))}
          </>
        )}
      </div>

      <button className="sw-modal-close" onClick={onClose} aria-label="Close">
        <IoCloseOutline />
      </button>
    </div>
  );
}

// ── StepDetails ────────────────────────────────────────────────────────────

interface StepDetailsProps {
  selectedDate: Date;
  selectedTime: string;
  userTimezone: string;
  onBack: () => void;
  onConfirmed: (email: string) => void;
  onClose: () => void;
}

function StepDetails({
  selectedDate, selectedTime, userTimezone, onBack, onConfirmed, onClose,
}: StepDetailsProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const summary = formatBookingSummary(selectedDate, selectedTime, userTimezone);
  const tzLabel = getTimezoneLabel(userTimezone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        action: 'book',
        name: name.trim(),
        email: email.trim(),
        date: toDateStr(selectedDate),
        time: selectedTime,
        notes: notes.trim(),
        timezone: userTimezone,
      });
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data: { success: boolean; error?: string } = await res.json();
      if (data.success) {
        onConfirmed(email.trim());
      } else {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="sw-step sw-step--details">
      <div className="sw-step-left">
        <button className="sw-back-btn" onClick={onBack} aria-label="Back">
          <FiArrowLeft />
        </button>
        <p className="sw-org-label">Sales CloudAlgo</p>
        <h2 className="sw-event-title">Meeting with CloudAlgo Sales</h2>
        <ul className="sw-event-meta">
          <li><FiClock size={15} /><span>30 min</span></li>
          <li><FiVideo size={15} /><span>Web conferencing details provided upon confirmation.</span></li>
          <li><FiCalendar size={15} /><span>{summary}</span></li>
          <li><FiGlobe size={15} /><span>{tzLabel}</span></li>
        </ul>
      </div>

      <div className="sw-step-right">
        <h3 className="sw-form-heading">Enter Details</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="sw-field">
            <label htmlFor="sw-name">Name <span aria-hidden="true">*</span></label>
            <input
              id="sw-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="sw-field">
            <label htmlFor="sw-email">Email <span aria-hidden="true">*</span></label>
            <input
              id="sw-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="sw-field">
            <label htmlFor="sw-notes">
              Please share anything that will help prepare for our meeting.
            </label>
            <textarea
              id="sw-notes"
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          {errorMsg && <p className="sw-error-msg">{errorMsg}</p>}
          <button
            type="submit"
            className="sw-submit-btn"
            disabled={submitting || !name.trim() || !email.trim()}
          >
            {submitting ? 'Scheduling…' : 'Schedule Event'}
          </button>
        </form>
      </div>

      <button className="sw-modal-close" onClick={onClose} aria-label="Close">
        <IoCloseOutline />
      </button>
    </div>
  );
}

// ── StepConfirmation ───────────────────────────────────────────────────────

interface StepConfirmationProps {
  email: string;
  selectedDate: Date;
  selectedTime: string;
  userTimezone: string;
  onClose: () => void;
}

function StepConfirmation({
  email, selectedDate, selectedTime, userTimezone, onClose,
}: StepConfirmationProps) {
  const summary = formatBookingSummary(selectedDate, selectedTime, userTimezone);
  return (
    <div className="sw-step sw-step--confirmed">
      <button className="sw-modal-close" onClick={onClose} aria-label="Close">
        <IoCloseOutline />
      </button>
      <div className="sw-confirmed-icon"><FiCheck /></div>
      <h2 className="sw-confirmed-heading">You're scheduled!</h2>
      <p className="sw-confirmed-detail">{summary}</p>
      <p className="sw-confirmed-email">
        A confirmation email has been sent to <strong>{email}</strong>.
      </p>
      <button className="sw-submit-btn" onClick={onClose} style={{ maxWidth: 200 }}>
        Close
      </button>
    </div>
  );
}

// ── ScheduleWidget (root) ──────────────────────────────────────────────────

export default function ScheduleWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [userTimezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      setTooltipVisible(true);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const fetchSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setAvailableSlots([]);
    try {
      const res = await fetch(`${API_URL}?action=slots&date=${toDateStr(date)}`);
      const data: { slots?: string[]; error?: string } = await res.json();
      setAvailableSlots(data.slots ?? []);
    } catch {
      setSlotsError('Could not load slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedTime(slot);
    setStep('details');
  };

  const handleBack = () => {
    setSelectedTime(null);
    setStep('date');
  };

  const handleConfirmed = (email: string) => {
    setConfirmedEmail(email);
    setStep('confirmed');
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep('date');
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableSlots([]);
      setConfirmedEmail('');
    }, 300);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTooltipVisible(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const today = new Date();
      const prevMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return prevMonth < thisMonth ? prev : prevMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (!visible) return null;

  return (
    <>
      <ScheduleLauncher
        tooltipVisible={tooltipVisible}
        onDismissTooltip={() => setTooltipVisible(false)}
        onOpen={handleOpen}
      />
      {isOpen && (
        <div className="sw-overlay" onClick={handleClose}>
          <div
            className="sw-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Schedule a meeting"
          >
            {step === 'date' && (
              <StepDatePicker
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                slotsError={slotsError}
                userTimezone={userTimezone}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelectDate={handleSelectDate}
                onSelectSlot={handleSelectSlot}
                onClose={handleClose}
              />
            )}
            {step === 'details' && selectedDate && selectedTime && (
              <StepDetails
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                userTimezone={userTimezone}
                onBack={handleBack}
                onConfirmed={handleConfirmed}
                onClose={handleClose}
              />
            )}
            {step === 'confirmed' && selectedDate && selectedTime && (
              <StepConfirmation
                email={confirmedEmail}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                userTimezone={userTimezone}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run astro check
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ScheduleWidget.tsx
git commit -m "feat: add ScheduleWidget React component"
```

---

## Task 6: Mount in Page.astro

Add the widget to the layout so it appears on every page.

**Files:** Modify `src/layouts/Page.astro`

- [ ] **Step 1: Update `src/layouts/Page.astro`**

Replace the entire file with:

```astro
---
// src/layouts/Page.astro
import Base from './Base.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import ScheduleWidget from '../components/ui/ScheduleWidget';
import '../styles/global.css';

export interface Props {
  title: string;
  description?: string;
  image?: string;
  canonicalURL?: string;
}

const props = Astro.props;
---
<Base {...props}>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
  <ScheduleWidget client:only="react" />
</Base>
```

Note: `client:only="react"` is required — the widget uses `window.Intl` and `setTimeout` on mount; SSR must be skipped entirely.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: exits 0, `dist/` populated with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Page.astro
git commit -m "feat: mount ScheduleWidget on every page via Page.astro"
```

---

## Task 7: Browser Verification

Manually verify the full flow in the dev server.

**Files:** None

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:4321`.

- [ ] **Step 2: Verify the launcher**

After 2 seconds, a round orange button should appear bottom-right with a tooltip bubble: *"Need help or have questions? Schedule a time with us."*

- [ ] **Step 3: Dismiss tooltip**

Click ✕ on the tooltip. The bubble should hide; the button should remain.

- [ ] **Step 4: Open modal**

Click the orange button. The modal should open with the two-column layout: calendar on the left, *"Select a date to see available times."* on the right.

- [ ] **Step 5: Navigate months**

Click `›` to go to next month. Click `‹` to return. The `‹` button should be disabled on the current month.

- [ ] **Step 6: Select a weekday**

Click a weekday in the future. The date should highlight orange. The right panel should show a spinner then a list of available time slots (requires the Apps Script URL to be set in `.env`).

  - If `PUBLIC_SCHEDULE_API_URL` is not yet set: expect a *"Could not load slots"* error message — that is correct behaviour.
  - Once the Apps Script is deployed and `.env` is set, restart the dev server (`Ctrl+C`, `npm run dev`) and re-test.

- [ ] **Step 7: Select a time slot**

Click a time slot. The modal should transition to Step 2 with the event summary on the left and the details form on the right.

- [ ] **Step 8: Test back button**

Click `←`. Should return to the calendar with the previously selected date still highlighted.

- [ ] **Step 9: Submit the booking form**

Fill in Name and Email, optionally add notes. Click *Schedule Event*. On success: the confirmation screen appears with *"You're scheduled!"* and the selected date/time.

- [ ] **Step 10: Close modal**

Click *Close* or click the backdrop. The modal should close. Re-opening should show a fresh calendar (no previously selected state).

- [ ] **Step 11: Verify on mobile viewport**

In browser DevTools, set viewport to 375×812 (iPhone). The tooltip bubble should be hidden. The modal should render in single-column layout.

- [ ] **Step 12: Final commit if any tweaks were made**

```bash
git add -p
git commit -m "fix: schedule widget browser verification adjustments"
```

---

## Self-Review Checklist

| Spec requirement | Covered in |
|---|---|
| Floating launcher button + tooltip | Task 5 (`ScheduleLauncher`) |
| Tooltip dismiss | Task 5 (`onDismissTooltip`) |
| Fade-in after 2s | Task 5 (`useEffect` setTimeout) |
| Calendar with month navigation | Task 5 (`StepDatePicker`) |
| Past dates + weekends disabled | Task 5 (`isPastDate`, `isWeekend`) |
| Selected date highlighted orange | Task 4 (`.sw-cal-day--selected`) |
| Today outlined ring | Task 4 (`.sw-cal-day--today`) |
| Timezone auto-detected | Task 5 (`Intl.DateTimeFormat`) |
| Available slots fetched from API | Task 5 (`fetchSlots`) |
| Slots converted to user timezone | Task 5 (`istSlotToLocal`) |
| Loading + empty + error slot states | Task 5 (spinner, `sw-slots-empty`) |
| Step 2: event summary left panel | Task 5 (`StepDetails` left panel) |
| Step 2: details form | Task 5 (`StepDetails` form) |
| Form submits booking via GET params | Task 5 (`handleSubmit`) |
| Confirmation screen | Task 5 (`StepConfirmation`) |
| Confirmation email to visitor | Task 2 (`GmailApp.sendEmail`) |
| Notification email to host | Task 2 (`GmailApp.sendEmail`) |
| Calendar event created | Task 2 (`calendar.createEvent`) |
| Past slots filtered for today | Task 2 (`nowMinutesIST` filter) |
| Brand colors + Outfit font | Task 4 (CSS tokens) |
| Mobile single-column layout | Task 4 (`@media max-width: 640px`) |
| `PUBLIC_SCHEDULE_API_URL` env var | Task 3 |
| GitHub Actions secret wired in | Task 3 |
