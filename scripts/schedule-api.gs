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
