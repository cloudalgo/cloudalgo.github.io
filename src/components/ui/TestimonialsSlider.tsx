import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, A11y } from 'swiper/modules';
import { motion } from 'framer-motion';
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
            <motion.div
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.span
                className="testimonial-quote-mark"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              >
                "
              </motion.span>
              <motion.p
                className="slider-caption"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              >
                {t.quote}
              </motion.p>
              <motion.div
                className="blockquote-footer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
              >
                {t.photo && (
                  <div className="user-photo">
                    <img src={t.photo} alt={t.author} />
                  </div>
                )}
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9375rem' }}>{t.author}</strong>
                  <cite>{t.company}</cite>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
