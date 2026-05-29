import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const TESTIMONIALS = [
  {
    quote: "The team at CloudAlgo has been extremely helpful in elevating our Salesforce consulting services to new heights. Their expertise, dedication, collaboration, and innovative solutions have consistently exceeded our expectations. Their exceptional communication, flexibility and unwavering work ethic have been phenomenal.",
    author: "Jessica Lillquist",
    company: "Minlopro Partners",
    photo: "/testimonials-user.webp",
  },
];

export default function TestimonialsSlider() {
  return (
    <Swiper
      modules={[Navigation, Autoplay, A11y]}
      spaceBetween={32}
      slidesPerView={1}
      loop={TESTIMONIALS.length > 1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      navigation
    >
      {TESTIMONIALS.map((t, i) => (
        <SwiperSlide key={i}>
          <div style={{ maxWidth: '680px' }}>
            <div className="testimonial-card">
              <span className="testimonial-quote-mark">"</span>
              <p className="slider-caption">{t.quote}</p>
              <div className="blockquote-footer">
                {t.photo && (
                  <div className="user-photo">
                    <img src={t.photo} alt={t.author} />
                  </div>
                )}
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9375rem' }}>{t.author}</strong>
                  <cite>{t.company}</cite>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
