# Schedule Widget — Design Spec

**Date:** 2026-05-12  
**Status:** Approved  

---

## Overview

A floating Calendly-style scheduling widget that appears on every page of the CloudAlgo site. Visitors can pick a 30-minute meeting slot, enter their details, and book directly against a real Google Calendar. No third-party scheduling service required.

---

## Architecture

```
GitHub Pages (static)          Google Apps Script (serverless)
─────────────────────          ───────────────────────────────
ScheduleWidget.tsx  ──fetch──▶  Web App URL  ──reads──▶ Google Calendar
(React component)   ◀──JSON───  (deployed once)  ──writes──▶ Google Calendar
                                                 ──emails──▶ host + guest
```

The React widget communicates with a single Google Apps Script Web App URL exposed as an anonymous HTTPS endpoint. All availability logic and calendar writes happen in the script — the frontend only renders and submits.

---

## Backend: Google Apps Script

### File
A single `.gs` file deployed as a Google Apps Script Web App (Execute as: Me, Access: Anyone).

### Configuration constants
```js
const CALENDAR_ID    = 'sandeep@cloudalgo.com';
const SLOT_START_IST = '18:00';   // 6:00 PM IST = 12:30 UTC
const SLOT_END_IST   = '21:00';   // 9:00 PM IST = 15:30 UTC
const SLOT_DURATION  = 30;        // minutes
const HOST_EMAIL     = 'sandeep@cloudalgo.com';
const MEETING_TITLE  = 'Meeting with CloudAlgo Sales';
```

### GET `?date=YYYY-MM-DD`
1. Parse the requested date.
2. Fetch all calendar events for that day via `CalendarApp.getCalendarById(CALENDAR_ID).getEventsForDay(date)`.
3. Generate all 30-min slots between `SLOT_START_IST` and `SLOT_END_IST` in IST (UTC+5:30).
4. Filter out slots that overlap any existing event.
5. Return `{ slots: ["18:00", "18:30", "19:00", ...] }` (IST times as strings).

Weekends and past dates are filtered client-side; the backend does no date validation.

### POST `{ name, email, date, time, notes }`
1. Parse `date` (`YYYY-MM-DD`) and `time` (`HH:MM` IST).
2. Compute start/end `Date` objects in UTC.
3. Create a 30-min event on `CALENDAR_ID` titled `"Meeting with [name]"` with `notes` in the description.
4. Send confirmation email to visitor (`email`) with date/time shown in their timezone (passed as `timezone` field from client).
5. Send notification email to `HOST_EMAIL` with all booking details.
6. Return `{ success: true }` or `{ success: false, error: "..." }`.

### CORS
The script sets `Access-Control-Allow-Origin: *` headers so the GitHub Pages domain can call it freely.

---

## Frontend: React Widget

### File
`src/components/ui/ScheduleWidget.tsx` — single file, all sub-components defined inline.

### Mounted in
`src/layouts/Page.astro` — renders on every page.

### Environment variable
```
PUBLIC_SCHEDULE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```
Set in `.env` locally and as a GitHub Actions secret for CI builds.

---

## Component Structure

```
<ScheduleWidget>
  ├── <ScheduleLauncher>        fixed bottom-right, floating button + tooltip bubble
  └── <ScheduleModal>           modal overlay (backdrop click to close)
      ├── <StepDatePicker>      Step 1 — calendar + time slot list
      ├── <StepDetails>         Step 2 — booking form
      └── <StepConfirmation>    Success screen
```

### State
```ts
type Step = 'date' | 'details' | 'confirmed';

interface WidgetState {
  isOpen: boolean;
  step: Step;
  selectedDate: Date | null;
  selectedTime: string | null;   // "18:30" IST
  availableSlots: string[];
  slotsLoading: boolean;
  userTimezone: string;          // Intl.DateTimeFormat().resolvedOptions().timeZone
}
```

---

## UI Behaviour

### Floating launcher
- Fixed bottom-right, `z-index: 999`, fades in after 2s delay.
- Round `#f75a41` button, `AiFillSchedule` icon from `react-icons`.
- Tooltip bubble above button: *"Need help or have questions? Schedule a time with us."*
  - White card, shadow, `border-radius: 4px`.
  - Dismissible with ✕ (persists dismissed state in component state only — resets on page reload).
  - Hidden on mobile (`display: none` below 576px).

### Modal
- Backdrop: semi-transparent black overlay, click to close.
- White card, `border-radius: 8px`, `max-width: 900px`, centered.
- Two-column layout (left info / right content) on desktop, single column on mobile.

### Step 1 — Date & Time Picker

**Left panel (calendar):**
- Month header with `<` `>` navigation. Cannot navigate before current month.
- Day-of-week headers: MON TUE WED THU FRI SAT SUN.
- Date grid:
  - Past dates: greyed out, not clickable.
  - Weekends: greyed out, not clickable.
  - Available dates (Mon–Fri, current/future): orange-tinted circle on hover, solid `#f75a41` circle when selected.
  - Today: outlined `#f75a41` ring if not selected.
- Bottom: globe icon + detected timezone name (e.g. *"India Standard Time (IST)"*).

**Right panel (time slots):**
- Heading: selected date formatted as *"Thursday, May 14"*.
- Fetches `GET ?date=YYYY-MM-DD` when a date is selected.
- Loading state: spinner.
- Empty state: *"No slots available for this date."*
- Slots rendered as buttons: `#f75a41` border + text, fills solid on hover, white text.
- Clicking a slot advances to Step 2.

### Step 2 — Enter Details

**Left panel (event summary):**
- `←` back button (returns to Step 1, preserves selected date).
- *"Sales CloudAlgo"* label.
- **"Meeting with CloudAlgo Sales"** title.
- Icons + metadata:
  - Clock icon: *"30 min"*
  - Video icon: *"Web conferencing details provided upon confirmation."*
  - Calendar icon: formatted slot (e.g. *"6:30pm – 7:00pm, Thursday, May 14, 2026"*) converted to user's local timezone.
  - Globe icon: detected timezone name.

**Right panel (form):**
- Heading: *"Enter Details"*
- `Name *` text input (required)
- `Email *` email input (required, validated)
- Textarea: placeholder *"Please share anything that will help prepare for our meeting."*
- `Schedule Event` button — solid `#f75a41`, white text, rounded, full-width on mobile.
- Submits `POST` to Apps Script with `{ name, email, date, time, notes, timezone }`.
- Loading state: button shows *"Scheduling…"*, disabled.
- Error state: inline error message below button.

### Confirmation Screen
- Replaces modal content entirely.
- Green checkmark icon (or `#f75a41` checkmark to stay on-brand).
- *"You're scheduled!"* heading.
- Recap: date, time (in user's local timezone), duration.
- *"A confirmation email has been sent to [email]."*
- *"Close"* button.

---

## Styling

All styles scoped to the component via inline styles or a dedicated CSS block in `global.css` under a `.schedule-widget` namespace. Uses existing brand tokens:

| Token | Value |
|-------|-------|
| Primary | `#f75a41` |
| Primary dark (hover) | `#d94e37` |
| Font | `Outfit`, system-ui |
| Modal shadow | `0 20px 60px rgba(0,0,0,0.15)` |
| Border radius | `8px` (modal), `50%` (date circles), `4px` (tooltip) |

---

## Not in scope

- Guest invites ("Add Guests" feature from Calendly screenshots — omitted for simplicity).
- Blocked-date configuration (no holiday list).
- Buffer time between meetings (handled by existing calendar events).
- Timezone selection UI — timezone is auto-detected, display-only.
- Analytics / booking history dashboard.
