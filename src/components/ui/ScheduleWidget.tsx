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
