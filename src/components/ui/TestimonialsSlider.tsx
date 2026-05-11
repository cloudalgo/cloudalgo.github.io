// src/components/ui/TestimonialsSlider.tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The team at CloudAlgo has been extremely helpful in elevating our Salesforce consulting services to new heights. Their expertise, dedication, collaboration, and innovative solutions have consistently exceeded our expectations. Their exceptional communication, flexibility and unwavering work ethic have been phenomenal.",
    author: "Jessica Lillquist",
    company: "Minlopro Partners",
  },
];

export default function TestimonialsSlider() {
  return (
    <Swiper
      modules={[Navigation, Autoplay, A11y]}
      slidesPerView={1}
      loop={TESTIMONIALS.length > 1}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      navigation
      className="w-full"
    >
      {TESTIMONIALS.map((t, i) => (
        <SwiperSlide key={i}>
          <div className="text-center max-w-2xl mx-auto px-8 py-4">
            <div className="text-[80px] text-[#f75a41] leading-none mb-5 font-serif">"</div>
            <p className="text-[18px] text-[#374151] font-semibold leading-relaxed italic mb-6">
              {t.quote}
            </p>
            <div className="text-[15px] font-extrabold text-black" style={{ fontFamily: "'Syne', system-ui" }}>{t.author}</div>
            <div className="text-[12px] text-[#6b7280] font-semibold mt-1">{t.company}</div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
