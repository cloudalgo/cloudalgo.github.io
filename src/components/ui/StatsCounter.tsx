// src/components/ui/StatsCounter.tsx
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface Stat {
  end: number;
  suffix: string;
  label: string;
  duration: number;
}

const STATS: Stat[] = [
  { end: 92,  suffix: '%', label: 'Success Rate',      duration: 2 },
  { end: 15,  suffix: '+', label: 'Happy Clients',     duration: 3 },
  { end: 70,  suffix: '+', label: 'Projects Done',     duration: 4 },
  { end: 12,  suffix: '+', label: 'Years Experience',  duration: 2 },
];

export default function StatsCounter() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-0">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="text-center py-8 px-4 border-r border-[#e5e5e5] last:border-r-0 [&:nth-child(2)]:border-b md:[&:nth-child(2)]:border-b-0 odd:border-b md:odd:border-b-0"
        >
          <div
            className="font-display font-black text-primary leading-none mb-1.5"
            style={{ fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-1px' }}
          >
            {inView
              ? <CountUp end={stat.end} duration={stat.duration} suffix={stat.suffix} />
              : `0${stat.suffix}`
            }
          </div>
          <div className="text-[12px] text-[#6b7280] font-semibold">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
