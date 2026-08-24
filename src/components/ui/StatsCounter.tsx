import { useEffect, useState } from 'react';

const STATS = [
  { end: 1,   suffix: ' Day', label: 'Avg. response time',       duration: 1 },
  { end: 15,  suffix: '+',    label: 'Happy Clients',            duration: 7 },
  { end: 70,  suffix: '+',    label: 'Projects Delivered',       duration: 10 },
  { end: 12,  suffix: '+',    label: 'Years Combined Experience', duration: 3 },
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
        {/* Before hydration, render the final figure so the markup is never
            wrong for no-JS readers or for a crawler. */}
        <div className="count-outer">{run ? value : stat.end}{stat.suffix}</div>
        <div className="milestone-details">{stat.label}</div>
      </div>
    </div>
  );
}

export default function StatsCounter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="row">
      {STATS.map((stat) => (
        <Stat key={stat.label} stat={stat} run={mounted} />
      ))}
    </div>
  );
}
