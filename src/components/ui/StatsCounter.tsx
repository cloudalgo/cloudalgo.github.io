import { useEffect, useRef, useState } from 'react';

// Durations are staggered so the four figures do not all land on the same
// frame, but stay inside a couple of seconds: a counter that is still climbing
// after the reader has moved on is just a distraction.
const STATS = [
  { end: 1,   suffix: ' Day', label: 'Avg. response time',        duration: 1.2 },
  { end: 15,  suffix: '+',    label: 'Happy Clients',             duration: 2 },
  { end: 70,  suffix: '+',    label: 'Projects Delivered',        duration: 2.4 },
  { end: 12,  suffix: '+',    label: 'Years Combined Experience', duration: 1.6 },
];

// countup.js' default easing, kept verbatim so the numbers accelerate exactly
// as they did when this leaned on react-countup. Returns 1 precisely at t === d.
function easeOutExpo(t: number, d: number) {
  return ((-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023;
}

function useCountUp(end: number, duration: number, run: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return;
    }

    const ms = duration * 1000;
    let start: number | null = null;
    let frame = requestAnimationFrame(function step(now) {
      if (start === null) start = now;
      const elapsed = Math.min(now - start, ms);
      setValue(Math.round(end * easeOutExpo(elapsed, ms)));
      if (elapsed < ms) frame = requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(frame);
  }, [end, duration, run]);

  return value;
}

function Stat({ stat, run }: { stat: (typeof STATS)[number]; run: boolean }) {
  const value = useCountUp(stat.end, stat.duration, run);

  return (
    <div className="col-md-3 col-6">
      <div className="milestone-counter">
        {/* Until the counter starts, render the final figure so the markup is
            never wrong for no-JS readers, for a crawler, or for anyone who
            never scrolls this far. */}
        <div className="count-outer">{run ? value : stat.end}{stat.suffix}</div>
        <div className="milestone-details">{stat.label}</div>
      </div>
    </div>
  );
}

export default function StatsCounter() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  // The stats bar sits directly under the hero, so on hydration it is still
  // below the fold — counting there would spend most of the animation unseen.
  // The bottom margin starts it just before it scrolls in, which also keeps the
  // reset from the server-rendered figure back to 0 off-screen.
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setRun(true); return; }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setRun(true);
      observer.disconnect();
    }, { rootMargin: '0px 0px 120px 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="row" ref={rowRef}>
      {STATS.map((stat) => (
        <Stat key={stat.label} stat={stat} run={run} />
      ))}
    </div>
  );
}
