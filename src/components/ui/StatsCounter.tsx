import CountUp from 'react-countup';
import { useState, useEffect } from 'react';

const STATS = [
  { end: 92,  suffix: '%', label: 'Success Rate',       duration: 2 },
  { end: 15,  suffix: '+', label: 'Happy Customers',    duration: 7 },
  { end: 70,  suffix: '+', label: 'Projects Finished',  duration: 10 },
  { end: 12,  suffix: '+', label: 'Years of Experience',duration: 3 },
];

export default function StatsCounter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="row">
      {STATS.map((stat) => (
        <div key={stat.label} className="col-md-3 col-6">
          <div className="milestone-counter">
            <div className="count-outer">
              {mounted
                ? <CountUp end={stat.end} duration={stat.duration} suffix={stat.suffix} />
                : `${stat.end}${stat.suffix}`}
            </div>
            <div className="milestone-details">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
