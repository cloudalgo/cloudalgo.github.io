import { describe, it, expect } from 'vitest';
import { formatTime, tickPlan } from './player';

describe('formatTime', () => {
  it('prints m:ss by default', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(47.9)).toBe('0:47');
    expect(formatTime(174.3)).toBe('2:54');
  });

  it('adds hours only when there are some', () => {
    expect(formatTime(3725)).toBe('1:02:05');
  });

  it('prints the counter form, hh:mm:ss, when long', () => {
    expect(formatTime(47, true)).toBe('00:00:47');
    expect(formatTime(174.3, true)).toBe('00:02:54');
  });

  it('reads a duration the browser does not know yet as zero', () => {
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(Infinity, true)).toBe('00:00:00');
    expect(formatTime(-3)).toBe('0:00');
  });
});

describe('tickPlan', () => {
  it('rules nothing until the duration is known', () => {
    expect(tickPlan(NaN)).toEqual([]);
    expect(tickPlan(0)).toEqual([]);
  });

  it('marks a minute walkthrough every 5s, major every 15s', () => {
    const ticks = tickPlan(59.9);
    expect(ticks).toHaveLength(12);
    expect(ticks.filter((t) => t.major).map((t) => t.label)).toEqual(['0:00', '0:15', '0:30', '0:45']);
  });

  it('marks a three-minute film every 10s, labelled every 30s', () => {
    const ticks = tickPlan(174.3);
    expect(ticks).toHaveLength(18);
    expect(ticks.filter((t) => t.label).map((t) => t.label)).toEqual(['0:00', '0:30', '1:00', '1:30', '2:00', '2:30']);
  });

  it('keeps a long film to a readable number of marks', () => {
    expect(tickPlan(45 * 60).length).toBeLessThanOrEqual(46);
  });

  it('drops a label that would run off the end, but keeps its mark', () => {
    const end = tickPlan(60).at(-1);
    expect(end).toMatchObject({ at: 1, major: true, label: undefined });
  });

  it('places every mark inside the ruler', () => {
    for (const t of tickPlan(174.3)) {
      expect(t.at).toBeGreaterThanOrEqual(0);
      expect(t.at).toBeLessThanOrEqual(1);
    }
  });
});
