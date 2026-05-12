// src/components/ui/ServiceCard.tsx
import { LuCloud, LuPackage, LuWrench, LuSettings } from 'react-icons/lu';
import type { IconType } from 'react-icons';

const ICONS: Record<string, IconType> = {
  cloud:   LuCloud,
  package: LuPackage,
  wrench:  LuWrench,
  settings: LuSettings,
};

interface Props {
  icon: string;
  title: string;
  body: string;
  href: string;
  delay?: number;
}

export default function ServiceCard({ icon, title, body, href, delay = 0 }: Props) {
  const Icon = ICONS[icon] ?? LuCloud;
  return (
    <article
      className="bg-[#1a1a1a] p-7 rounded-xl border-t-2 border-primary hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(247,90,65,0.18)] hover:bg-[#222] transition-all duration-200 anim-scale-pop"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
        <Icon size={20} />
      </div>
      <h3 className="font-display font-extrabold text-white text-[17px] mb-2.5">{title}</h3>
      <p className="text-[13px] text-[#64748b] leading-relaxed mb-5">{body}</p>
      <a
        href={href}
        className="relative inline-flex text-[12px] font-extrabold text-primary after:absolute after:bottom-[-2px] after:left-0 after:h-px after:bg-primary after:w-0 hover:after:w-full after:transition-[width] after:duration-[250ms]"
      >
        Learn More →
      </a>
    </article>
  );
}
