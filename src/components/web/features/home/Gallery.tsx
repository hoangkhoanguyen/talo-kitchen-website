"use client";
import React, { FC, ReactNode, useState } from "react";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, FreeMode, Thumbs } from "swiper/modules";

export const Gallery: FC<{
  children: ReactNode[];
  thumbs: ReactNode[];
  autoplay?: boolean;
}> = ({ children, thumbs, autoplay }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  return (
    <div>
      <Swiper
        className="mb-5"
        slidesPerView={1}
        autoplay={
          autoplay
            ? {
                delay: 3000,
                disableOnInteraction: false,
              }
            : false
        }
        loop
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Thumbs, Autoplay]}
      >
        {children.map((child, index) => (
          <SwiperSlide key={index}>{child}</SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        onSwiper={setThumbsSwiper}
        slidesPerView={4}
        spaceBetween={8}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Thumbs]}
        wrapperClass="justify-center"
        breakpoints={{
          0: {
            slidesPerView: 5.5,
          },
          768: {
            slidesPerView: 6.5,
          },
          1024: {
            slidesPerView: 12.5,
          },
        }}
      >
        {thumbs.map((item, index) => (
          <SwiperSlide key={index}>{item}</SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
