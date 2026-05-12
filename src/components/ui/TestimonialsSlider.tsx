import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const TESTIMONIALS = [
  {
    quote: "The team at CloudAlgo has been extremely helpful in elevating our Salesforce consulting services to new heights. Their expertise, dedication, collaboration, and innovative solutions have consistently exceeded our expectations. Their exceptional communication, flexibility and unwavering work ethic have been phenomenal. We look forward to continuing our partnership and achieving even greater successes together in the future.",
    author: "Jessica Lillquist",
    company: "Minlopro Partners",
    photo: "/testimonials-user.png",
  },
];

export default function TestimonialsSlider() {
  return (
    <Swiper
      modules={[Navigation, Autoplay, A11y]}
      spaceBetween={50}
      slidesPerView={1}
      loop={TESTIMONIALS.length > 1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      navigation
    >
      {TESTIMONIALS.map((t, i) => (
        <SwiperSlide key={i}>
          <div className="col-sm-8 mx-auto">
            <div className="text-center py-3">
              <div className="user-photo">
                <img src={t.photo} alt={t.author} className="img-fluid" />
              </div>
              <div className="slider-caption mt-4">
                <p className="paragraph-large">{t.quote}</p>
                <figcaption className="blockquote-footer">
                  {t.author},
                  <cite className="paragraph-medium"> {t.company}</cite>
                </figcaption>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
