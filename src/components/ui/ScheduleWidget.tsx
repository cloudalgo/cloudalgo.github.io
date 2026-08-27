import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type CSSProperties,
  type SubmitEvent,
} from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 640
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}
import { track } from '@/lib/analytics';
import { pageType } from '@/lib/engagement';
import { IoCloseOutline } from 'react-icons/io5';
import { FiClock, FiVideo, FiCalendar, FiGlobe, FiArrowLeft, FiCheck } from 'react-icons/fi';

const API_URL = import.meta.env.PUBLIC_SCHEDULE_API_URL as string;
// Guards against missing env var in local dev without a .env file
if (typeof window !== 'undefined' && !API_URL) {
  console.warn('[ScheduleWidget] PUBLIC_SCHEDULE_API_URL is not set. Slot loading will fail.');
}
const SLOT_DURATION_MIN = 30;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Dates and times are rendered in the visitor's own locale rather than forced
// into US English. `undefined` lets Intl fall back to the host default.
const LOCALE = typeof navigator !== 'undefined' ? navigator.language : undefined;

// Monday-first short weekday names, to match getFirstDayOffset(). 2024-01-01
// was a Monday, so seven days from there cover the week in display order.
// How many attention cues the launcher gets before it settles for good.
const MAX_CUES = 3;

// Where the launcher paints itself on, and where it unpaints. The two numbers
// are deliberately different: a single threshold flips the button on and off
// around one pixel every time a trackpad drifts across it, and this entrance
// is five seconds long — half-painted, reversed, half-painted again is not a
// button, it is a flicker.
const LAUNCHER_SHOW_Y = 320;
const LAUNCHER_HIDE_Y = 80;

// How long the reversed paint takes to lift, after which the launcher
// unmounts. MUST equal --fab-paint-total × --fab-paint-k-out in
// tokens/_components.scss — the CSS runs the strokes, this runs the timer,
// and if they disagree the button either vanishes mid-stroke or sits blank.
const LAUNCHER_EXIT_MS = 5200 * 0.45;

// How long the entrance takes end to end: --fab-paint-lead + --fab-paint-total,
// at --fab-paint-k. Nothing may schedule an animation over the launcher before
// this has elapsed.
const LAUNCHER_PAINT_MS = 600 + 5200;

// One pass of the attention sheen — --fab-sheen-t.
const LAUNCHER_CUE_MS = 1150;

const WEEKDAY_LABELS = (() => {
  const fmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
})();

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
  return d.toLocaleTimeString(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
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
  const dateLabel = date.toLocaleDateString(LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} – ${end}, ${dateLabel}`;
}

function getTimezoneLabel(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat(LOCALE, {
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

function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

// The fragment carries the booking selection so a date and slot survive a
// reload and can be shared: #schedule, #schedule/YYYY-MM-DD, or
// #schedule/YYYY-MM-DD/HH:MM where HH:MM is the slot's IST key.
interface ScheduleHash {
  open: boolean;
  date: Date | null;
  time: string | null;
}

function parseScheduleHash(): ScheduleHash {
  const closed: ScheduleHash = { open: false, date: null, time: null };
  if (typeof window === 'undefined') return closed;

  const [name, dateStr, timeStr] = window.location.hash.replace(/^#/, '').split('/');
  if (name !== 'schedule') return closed;

  let date: Date | null = null;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const parsed = new Date(y, m - 1, d);
    // Round-tripping rejects impossible dates like 2026-02-31; the calendar
    // offers no past or weekend days, so a link to one falls back to the default
    if (
      toDateStr(parsed) === dateStr &&
      !isPastDate(y, m - 1, d) &&
      !isWeekend(y, m - 1, d)
    ) {
      date = parsed;
    }
  }

  // A time without a usable date has nothing to book against
  const time = date && timeStr && /^\d{2}:\d{2}$/.test(timeStr) ? timeStr : null;
  return { open: true, date, time };
}

function setScheduleHash(open: boolean, date?: Date | null, time?: string | null) {
  if (typeof window === 'undefined') return;
  const base = window.location.pathname + window.location.search;
  let hash = '';
  if (open) {
    hash = '#schedule';
    if (date) {
      hash += `/${toDateStr(date)}`;
      if (time) hash += `/${time}`;
    }
  }
  history.replaceState(null, '', base + hash);
}

// ── ScheduleLauncher ───────────────────────────────────────────────────────

interface LauncherProps {
  onOpen: () => void;
  attention: boolean;
  exiting: boolean;
}

const LAUNCHER_LABEL = 'Schedule a Call';

/* The launcher paints itself on rather than fading in, so the button's parts
   are separate elements the stylesheet can time independently: the ember edge,
   the drawn outline, the coat, the wet leading edge, the drawn icon and one
   span per character. All of it is decorative -- the button carries its own
   aria-label, so every painted part is hidden from assistive tech and the
   split lettering is never announced letter by letter.
   Timings live in tokens/_components.scss as --fab-paint-*. */
function ScheduleLauncher({ onOpen, attention, exiting }: LauncherProps) {
  return (
    <div className="sw-launcher">
      <div className="sw-launcher-btn-wrap">
        <button
          className={
            'sw-launcher-btn' +
            (exiting ? ' sw-launcher-btn--exit' : '') +
            (attention ? ' sw-launcher-btn--attention' : '')
          }
          onClick={onOpen}
          aria-label="Schedule a meeting"
          // Out of the tab order while it is being unpainted: it is on its
          // way off the page, and pointer-events cannot reach the keyboard.
          tabIndex={exiting ? -1 : undefined}
        >
          <span className="sw-launcher-btn__shade" aria-hidden="true" />
          <span className="sw-launcher-btn__body" aria-hidden="true">
            <span className="sw-launcher-btn__fill">
              <span className="sw-launcher-btn__grain" />
            </span>
            <span className="sw-launcher-btn__wet" />
            <span className="sw-launcher-btn__sheen" />
          </span>
          <svg
            className="sw-launcher-btn__outline"
            viewBox="0 0 178 48"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              pathLength={100}
              vectorEffect="non-scaling-stroke"
              d="M0.5 0.5 H177.5 V47.5 H0.5 Z"
            />
          </svg>
          <span className="sw-launcher-btn__edge" aria-hidden="true" />
          <svg className="sw-launcher-btn__ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect className="sw-ico-band" x="3.5" y="6.5" width="17" height="4.5" />
            <g>
              <path className="sw-ico-line" style={{ '--j': 0 } as CSSProperties}
                pathLength={100} d="M8 2.4V6.5" />
              <path className="sw-ico-line" style={{ '--j': 1 } as CSSProperties}
                pathLength={100} d="M16 2.4V6.5" />
              <path className="sw-ico-line" style={{ '--j': 2 } as CSSProperties}
                pathLength={100} d="M3.5 6.5H20.5V20.5H3.5Z" />
              <path className="sw-ico-line" style={{ '--j': 3 } as CSSProperties}
                pathLength={100} d="M3.5 11H20.5" />
            </g>
            <g className="sw-ico-dots" fill="currentColor">
              {[[8, 14.6], [12, 14.6], [16, 14.6], [8, 17.9], [12, 17.9]].map(
                ([cx, cy], j) => (
                  <circle
                    key={`${cx}-${cy}`}
                    style={{ '--j': j } as CSSProperties}
                    cx={cx}
                    cy={cy}
                    r={1.15}
                  />
                ),
              )}
            </g>
          </svg>
          <span className="sw-launcher-btn__label" aria-hidden="true">
            {[...LAUNCHER_LABEL].map((ch, i) => (
              <span key={`${ch}-${i}`} style={{ '--i': i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
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
  allSlots: string[];
  slotsLoading: boolean;
  slotsError: string | null;
  userTimezone: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  onSelectSlot: (slot: string) => void;
  onClose: () => void;
  mobileShowCalendar: boolean;
  onMobileBackToCalendar: () => void;
}

function StepDatePicker({
  selectedDate, currentMonth, availableSlots, allSlots, slotsLoading, slotsError,
  userTimezone, onPrevMonth, onNextMonth, onSelectDate, onSelectSlot, onClose,
  mobileShowCalendar, onMobileBackToCalendar,
}: StepDatePickerProps) {
  // Picking a time here does not advance the dialog -- it marks the slot
  // pending and offers a Next. Someone who picks a time and then does not
  // press Next has told us more than someone who never picked one, and
  // until this event the two were the same reader in the reports.
  const considerSlot = (slot: string) => {
    track('schedule_step', {
      step: 'slot_considered',
      page_type: pageType(window.location.pathname),
    });
    setPendingSlot(slot);
  };
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const monthLabel = currentMonth.toLocaleDateString(LOCALE, {
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

  const minDate = addBusinessDays(new Date(), 2);
  const maxDate = (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })();
  const isLastAllowedMonth = new Date(year, month + 1, 1) > maxDate;

  const isDisabled = (day: number) => {
    const d = new Date(year, month, day);
    return d < minDate || d > maxDate || isWeekend(year, month, day);
  };

  const tzLabel = getTimezoneLabel(userTimezone);
  const isMobile = useIsMobile();
  const showCalendar = !isMobile || mobileShowCalendar;
  const showSlots = !isMobile || !mobileShowCalendar;

  return (
    <div className="sw-step sw-step--date">
      {showCalendar && <div className={`sw-step-left${isMobile ? ' sw-step-left--mobile-cal' : ''}`}>
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
            <button className="sw-cal-nav" onClick={onNextMonth} disabled={isLastAllowedMonth} aria-label="Next month">
              ›
            </button>
          </div>

          <div className="sw-cal-grid" key={monthLabel}>
            {WEEKDAY_LABELS.map(d => (
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
      </div>}

      {showSlots && !isMobile && (
        <div className="sw-step-right">
          {!selectedDate && (
            <p className="sw-slots-prompt">Select a date to see available times.</p>
          )}
          {selectedDate && (
            <>
              <h3 className="sw-slots-heading">
                {selectedDate.toLocaleDateString(LOCALE, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {slotsLoading && (
                <div role="status" aria-live="polite">
                  <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                    Loading available slots…
                  </span>
                  <div className="sw-spinner" />
                </div>
              )}
              {slotsError && !slotsLoading && (
                <p className="sw-slots-empty">{slotsError}</p>
              )}
              {!slotsLoading && !slotsError && allSlots.length === 0 && (
                <p className="sw-slots-empty">No slots available for this date.</p>
              )}
              {!slotsLoading && !slotsError && allSlots.map(slot => {
                const isAvailable = availableSlots.includes(slot);
                return pendingSlot === slot ? (
                  <div key={slot} className="sw-mobile-slot-row">
                    <button className="sw-mobile-slot-selected" onClick={() => setPendingSlot(null)}>
                      {istSlotToLocal(selectedDate!, slot, userTimezone)}
                    </button>
                    <button className="sw-mobile-slot-next" onClick={() => { setPendingSlot(null); onSelectSlot(slot); }}>
                      Next
                    </button>
                  </div>
                ) : (
                  <button
                    key={slot}
                    className="sw-slot-btn"
                    disabled={!isAvailable}
                    onClick={() => considerSlot(slot)}
                  >
                    {istSlotToLocal(selectedDate!, slot, userTimezone)}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}

      {showSlots && isMobile && (
        <div className="sw-mobile-panel">
          {/* Mobile header */}
          <div className="sw-mobile-panel-header">
            <button className="sw-mobile-back-circle" onClick={onMobileBackToCalendar} aria-label="Back to calendar">
              <FiArrowLeft size={18} />
            </button>
            <div className="sw-mobile-panel-date">
              <strong>{selectedDate
                ? selectedDate.toLocaleDateString(LOCALE, { weekday: 'long' })
                : 'Select a date'}</strong>
              {selectedDate && (
                <span>{selectedDate.toLocaleDateString(LOCALE, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              )}
            </div>
            <button className="sw-modal-close sw-modal-close--inline" onClick={onClose} aria-label="Close">
              <IoCloseOutline />
            </button>
          </div>

          {/* Timezone */}
          <div className="sw-mobile-panel-tz">
            <span className="sw-mobile-panel-tz-label">Time zone</span>
            <div className="sw-mobile-panel-tz-value">
              <FiGlobe size={15} />
              <span>{tzLabel}</span>
            </div>
          </div>

          <hr className="sw-mobile-divider" />

          {/* Slots body */}
          <div className="sw-mobile-panel-body">
            <h3 className="sw-mobile-slots-title">Select a Time</h3>
            <p className="sw-mobile-slots-duration">Duration: 30 min</p>

            {slotsLoading && (
              <div role="status" aria-live="polite">
                <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                  Loading available slots…
                </span>
                <div className="sw-spinner" style={{ margin: '32px auto' }} />
              </div>
            )}
            {slotsError && !slotsLoading && (
              <p className="sw-mobile-slots-empty">{slotsError}</p>
            )}
            {!slotsLoading && !slotsError && allSlots.length === 0 && (
              <p className="sw-mobile-slots-empty">No slots available for this date.</p>
            )}
            {!slotsLoading && !slotsError && allSlots.map(slot => {
              const isAvailable = availableSlots.includes(slot);
              return pendingSlot === slot ? (
                <div key={slot} className="sw-mobile-slot-row">
                  <button className="sw-mobile-slot-selected" onClick={() => setPendingSlot(null)}>
                    {istSlotToLocal(selectedDate!, slot, userTimezone)}
                  </button>
                  <button className="sw-mobile-slot-next" onClick={() => { setPendingSlot(null); onSelectSlot(slot); }}>
                    Next
                  </button>
                </div>
              ) : (
                <button key={slot} className="sw-slot-btn" disabled={!isAvailable} onClick={() => considerSlot(slot)}>
                  {istSlotToLocal(selectedDate!, slot, userTimezone)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isMobile && <button className="sw-modal-close" onClick={onClose} aria-label="Close">
        <IoCloseOutline />
      </button>}
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
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const summary = formatBookingSummary(selectedDate, selectedTime, userTimezone);
  const tzLabel = getTimezoneLabel(userTimezone);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const addEmail = (raw: string) => {
    const v = raw.trim().replace(/,+$/, '');
    if (v && isValidEmail(v) && !emails.includes(v)) {
      setEmails(prev => [...prev, v]);
    }
    setEmailInput('');
  };

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      addEmail(emailInput);
    } else if (e.key === 'Backspace' && !emailInput && emails.length > 0) {
      setEmails(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allEmails = emailInput.trim() ? [...emails, emailInput.trim()] : emails;
    if (!allEmails.length) return;
    setSubmitting(true);
    setErrorMsg('');
    // Reported before the request, and paired with 'failed' below. Without
    // it a broken booking endpoint is indistinguishable in the reports from
    // a reader who changed their mind at the last field.
    const funnelStep = (step: string, extra: Record<string, unknown> = {}) =>
      track('schedule_step', {
        step,
        page_type: pageType(window.location.pathname),
        ...extra,
      });
    funnelStep('submit', { guests: allEmails.length });
    try {
      const params = new URLSearchParams({
        action: 'book',
        name: name.trim(),
        email: allEmails.join(','),
        date: toDateStr(selectedDate),
        time: selectedTime,
        notes: notes.trim(),
        timezone: userTimezone,
      });
      params.append('_t', String(Date.now())); // cache-buster: booking requests must not be served from cache
      const res = await fetch(`${API_URL}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { success: boolean; error?: string } = await res.json();
      if (data.success) {
        onConfirmed(allEmails[0]);
      } else {
        funnelStep('failed', { reason: 'rejected' });
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
      }
    } catch {
      funnelStep('failed', { reason: 'network' });
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
        <p className="sw-org-label">CloudAlgo Sales</p>
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
        {/* Named so the form_start event can tell this form from the one
          on /contact/. An id is the only thing that distinguishes them in
          a report -- see initEngagement() in lib/engagement.ts. */}
      <form id="scheduleForm" onSubmit={handleSubmit} noValidate>
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
            <div
              className="sw-email-pills"
              onMouseDown={e => {
                // Pointer convenience only — clicking the padding focuses the
                // input. Ignore clicks that land on a pill's remove button, and
                // preventDefault so focus lands where we put it.
                if (e.target !== e.currentTarget) return;
                e.preventDefault();
                emailInputRef.current?.focus();
              }}
            >
              {emails.map(em => (
                <span key={em} className="sw-email-pill">
                  {em}
                  <button type="button" className="sw-email-pill-remove" onClick={() => setEmails(prev => prev.filter(x => x !== em))} aria-label={`Remove ${em}`}>×</button>
                </span>
              ))}
              <input
                ref={emailInputRef}
                id="sw-email"
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                onBlur={() => addEmail(emailInput)}
                placeholder={emails.length === 0 ? 'name@example.com' : ''}
                autoComplete="email"
              />
            </div>
            <p className="sw-email-hint">Press Enter or comma to add multiple emails</p>
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
          {errorMsg && <p className="sw-error-msg" role="alert">{errorMsg}</p>}
          <button
            type="submit"
            className={`sw-submit-btn${submitting ? ' sw-submit-btn--busy' : ''}`}
            disabled={submitting || !name.trim() || (emails.length === 0 && !emailInput.trim())}
          >
            {submitting ? 'Scheduling…' : 'Schedule Call'}
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
      <h2 className="sw-confirmed-heading">You’re scheduled!</h2>
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
  const initialHash = useMemo(() => parseScheduleHash(), []);
  const openFromUrl = initialHash.open;
  const defaultDate = useMemo(
    () => initialHash.date ?? addBusinessDays(new Date(), 2),
    [initialHash]
  );

  const [isOpen, setIsOpen] = useState(openFromUrl);
  const [step, setStep] = useState<Step>(initialHash.time ? 'details' : 'date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialHash.time);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [mobileShowCalendar, setMobileShowCalendar] = useState(false);
  const [visible, setVisible] = useState(openFromUrl);
  const [exiting, setExiting] = useState(false);
  const [paintKey, setPaintKey] = useState(0);
  // Where the launcher is in its paint cycle. A ref rather than state because
  // the scroll listener reads it on every frame and must not be rebuilt when
  // it changes — and because the render only cares about the two booleans.
  const launcherPhase = useRef<'hidden' | 'shown' | 'exiting'>(
    openFromUrl ? 'shown' : 'hidden'
  );
  const [attention, setAttention] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() =>
    new Date(defaultDate.getFullYear(), defaultDate.getMonth(), 1)
  );
  const [userTimezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // ── The booking funnel ──
  //
  // Five sixths of the people who open this dialog never finish it, and
  // until now every one of those was indistinguishable from someone who
  // never opened it. `schedule_step` reports each rung, so the drop-off
  // has a shape: readers who never pick a date are a calendar problem,
  // readers who pick one and stop at the form are a form problem.
  //
  // `step` lives in a ref as well as in state because handleClose reads it
  // from inside a callback that must not be rebuilt on every step change.
  const stepRef = useRef(step);
  stepRef.current = step;
  // Same reason, for the scroll listener: it must not rebuild on every open.
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const announcedOpen = useRef(false);
  const funnel = useCallback(
    (name: string, extra: Record<string, unknown> = {}) => {
      track('schedule_step', {
        step: name,
        page_type: pageType(window.location.pathname),
        ...extra,
      });
    },
    []
  );

  useEffect(() => {
    if (!isOpen) {
      announcedOpen.current = false;
      return;
    }
    if (announcedOpen.current) return;
    announcedOpen.current = true;
    funnel('open', { entry: openFromUrl ? 'shared_link' : 'launcher' });
  }, [isOpen, openFromUrl, funnel]);

  // The launcher is tied to the scroll rather than to a timer. It paints
  // itself on once the reader has committed to the page, and unpaints when
  // they come back to the top — where the masthead already carries a call to
  // action and a floating second one is just in the way.
  //
  // Coming back is the same gesture reversed (see --exit in the stylesheet),
  // so it needs an unmount at the end rather than a class that stops
  // mattering: a fully unpainted button is still a focusable, hit-testable
  // 178×48 rectangle sitting over the footer.
  //
  // paintKey remounts the button on every entrance. Nothing else replays the
  // animation — the CSS animations on those nodes have already run to
  // completion, and re-adding a class the browser is already applying does
  // not restart them. Fresh nodes are the only reliable restart, and they
  // also make an interrupted exit (scroll up, change your mind, scroll down)
  // repaint properly instead of snapping back.
  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout> | null = null;

    const paintOn = () => {
      if (exitTimer) {
        clearTimeout(exitTimer);
        exitTimer = null;
      }
      if (launcherPhase.current === 'shown') return;
      launcherPhase.current = 'shown';
      setExiting(false);
      setPaintKey(k => k + 1);
      setVisible(true);
    };

    const paintOff = () => {
      // Never pull the launcher out from under an open dialog
      if (launcherPhase.current !== 'shown' || isOpenRef.current) return;
      launcherPhase.current = 'exiting';
      setExiting(true);
      exitTimer = setTimeout(() => {
        exitTimer = null;
        launcherPhase.current = 'hidden';
        setVisible(false);
        setExiting(false);
      }, LAUNCHER_EXIT_MS);
    };

    const sync = () => {
      if (window.scrollY > LAUNCHER_SHOW_Y) paintOn();
      else if (window.scrollY < LAUNCHER_HIDE_Y) paintOff();
    };

    sync(); // a restored scroll position, or a #anchor, is already past it
    window.addEventListener('scroll', sync, { passive: true });
    return () => {
      window.removeEventListener('scroll', sync);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Attention cue — light crosses the slab a handful of times every 6–14s
  // while the launcher is up and the modal is closed, then it settles.
  // Looping for the whole visit re-renders forever without adding any signal:
  // a visitor who has ignored three passes is not going to notice the fourth.
  useEffect(() => {
    if (!visible || isOpen || exiting) return;
    // Under reduced motion the CSS suppresses the animation anyway, so the
    // state churn would buy nothing at all
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let remaining = MAX_CUES;
    let nextTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    const cue = () => {
      // A cue in a backgrounded tab is spent unseen; wait for it to come back
      if (document.hidden) {
        nextTimer = setTimeout(cue, 6000);
        return;
      }
      setAttention(true);
      resetTimer = setTimeout(() => setAttention(false), LAUNCHER_CUE_MS + 50);
      if (--remaining > 0) nextTimer = setTimeout(cue, 6000 + Math.random() * 8000);
    };
    // The first cue waits out the entrance. Both the sheen and the shadow
    // lift override an animation-name the paint is still using, so a cue
    // that lands early does not decorate the entrance — it truncates it.
    nextTimer = setTimeout(cue, LAUNCHER_PAINT_MS + 2000 + Math.random() * 3000);

    return () => {
      clearTimeout(nextTimer);
      clearTimeout(resetTimer);
      setAttention(false);
    };
  }, [visible, isOpen, exiting]);

  const abortRef = useRef<AbortController | null>(null);

  const fetchSlots = useCallback(async (date: Date) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    setSlotsLoading(true);
    setSlotsError(null);
    setAvailableSlots([]);
    setAllSlots([]);
    try {
      const res = await fetch(`${API_URL}?action=slots&date=${toDateStr(date)}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { slots?: string[]; allSlots?: string[]; error?: string } = await res.json();
      setAvailableSlots(data.slots ?? []);
      setAllSlots(data.allSlots ?? data.slots ?? []);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setSlotsError('Could not load slots. Please try again.');
      }
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (openFromUrl && defaultDate) {
      fetchSlots(defaultDate);
    }
  }, [fetchSlots, defaultDate, openFromUrl]);

  // Fragment changes that come from outside the widget: an in-page #schedule
  // link, or the visitor editing the URL. Our own writes use replaceState,
  // which does not fire hashchange, so this never sees them.
  useEffect(() => {
    const onHashChange = () => {
      const { open, date, time } = parseScheduleHash();
      if (!open) {
        setIsOpen(false);
        return;
      }
      setIsOpen(true);
      // A #schedule link shows the launcher wherever the reader is on the
      // page, scroll gate included; the phase has to be told, or the next
      // scroll to the top would think there was nothing to unpaint.
      launcherPhase.current = 'shown';
      setExiting(false);
      setVisible(true);
      if (date) {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        fetchSlots(date);
      }
      setSelectedTime(time);
      setStep(time ? 'details' : 'date');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [fetchSlots]);

  // A shared link can name a slot that has since been taken. Once real
  // availability arrives, drop back to the calendar rather than let someone
  // fill in a booking that cannot succeed. A failed fetch leaves slots empty,
  // so this stays put instead of bouncing them out on a transient error.
  const deepLinkedTime = initialHash.time;
  const deepLinkChecked = useRef(false);
  useEffect(() => {
    if (!deepLinkedTime || deepLinkChecked.current) return;
    if (slotsLoading || availableSlots.length === 0) return;
    deepLinkChecked.current = true;
    if (!availableSlots.includes(deepLinkedTime)) {
      setSelectedTime(null);
      setStep('date');
      setScheduleHash(true, selectedDate, null);
    }
  }, [deepLinkedTime, slotsLoading, availableSlots, selectedDate]);

  const handleSelectDate = (date: Date) => {
    funnel('date_selected');
    setSelectedDate(date);
    setScheduleHash(true, date, null);
    fetchSlots(date);
    setMobileShowCalendar(false);
  };

  const handleSelectSlot = (slot: string) => {
    funnel('slot_selected');
    setSelectedTime(slot);
    setScheduleHash(true, selectedDate, slot);
    setStep('details');
  };

  const handleBack = () => {
    setSelectedTime(null);
    setScheduleHash(true, selectedDate, null);
    setStep('date');
  };

  const handleConfirmed = (email: string) => {
    funnel('confirmed');
    // The one event on this site that means a stranger became a
    // conversation. It carries no value: the site publishes no rate, and
    // a made-up number would poison every report built on it.
    track('generate_lead', { method: 'schedule_call' });
    setConfirmedEmail(email);
    setStep('confirmed');
  };

  const handleClose = useCallback(() => {
    if (isClosing) return;
    // Which rung they were standing on when they left. A close from
    // 'confirmed' is the dialog being dismissed after a successful
    // booking, which is not an abandonment.
    if (stepRef.current !== 'confirmed') {
      funnel('abandoned', { last_step: stepRef.current });
    }
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      abortRef.current?.abort();
      setIsOpen(false);
      setStep('date');
      setSelectedDate(defaultDate);
      setSelectedTime(null);
      setAvailableSlots([]);
      setAllSlots([]);
      setConfirmedEmail('');
      setMobileShowCalendar(false);
      setScheduleHash(false);
    }, 300);
  }, [isClosing, defaultDate, funnel]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Remember what had focus before the dialog opened, and hand it back on close
  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      return;
    }
    const previous = lastFocusedRef.current;
    lastFocusedRef.current = null;
    if (previous && document.contains(previous)) previous.focus();
  }, [isOpen]);

  // Move focus into the dialog and keep Tab inside it. Re-runs per step so each
  // screen lands focus on its own first control.
  useEffect(() => {
    if (!isOpen) return;
    const node = modalRef.current;
    if (!node) return;

    const focusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

    (focusable()[0] ?? node).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const outside = !active || !node.contains(active);
      if (e.shiftKey && (outside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, step]);

  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setScheduleHash(true);
    fetchSlots(defaultDate);
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
    setCurrentMonth(prev => {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 1);
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return next > maxDate ? prev : next;
    });
  };

  if (!visible) return null;

  return (
    <>
      <ScheduleLauncher
        key={paintKey}
        onOpen={handleOpen}
        attention={attention}
        exiting={exiting}
      />
      {(isOpen || isClosing) && (
        <div className={`sw-overlay ${isClosing ? 'sw-overlay--exit' : 'sw-overlay--enter'}`}>
          <div
            ref={modalRef}
            tabIndex={-1}
            className={`sw-modal ${isClosing ? 'sw-modal--exit' : 'sw-modal--enter'}`}
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
                allSlots={allSlots}
                slotsLoading={slotsLoading}
                slotsError={slotsError}
                userTimezone={userTimezone}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelectDate={handleSelectDate}
                onSelectSlot={handleSelectSlot}
                onClose={handleClose}
                mobileShowCalendar={mobileShowCalendar}
                onMobileBackToCalendar={() => setMobileShowCalendar(true)}
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
