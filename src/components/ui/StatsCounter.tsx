import CountUp from 'react-countup';
import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';

const STATS = [
  { end: 92,  suffix: '%', label: 'Success Rate',       duration: 2 },
  { end: 15,  suffix: '+', label: 'Happy Customers',    duration: 7 },
  { end: 70,  suffix: '+', label: 'Projects Finished',  duration: 10 },
  { end: 12,  suffix: '+', label: 'Years of Experience',duration: 3 },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function StatsCounter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div
      className="row"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {STATS.map((stat) => (
        <motion.div key={stat.label} className="col-md-3 col-6" variants={item}>
          <div className="milestone-counter">
            <div className="count-outer">
              {mounted
                ? <CountUp end={stat.end} duration={stat.duration} suffix={stat.suffix} />
                : `${stat.end}${stat.suffix}`}
            </div>
            <div className="milestone-details">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
