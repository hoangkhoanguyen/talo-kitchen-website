"use client";
import React, { FC, ReactNode, useState } from "react";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, FreeMode, Thumbs } from "swiper/modules";

const ProductImagesSlider: FC<{
  children: ReactNode[];
  thumbs: ReactNode[];
}> = ({ children, thumbs }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  return (
    <div>
      <Swiper
        className="mb-5"
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
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
        slidesPerView={6}
        spaceBetween={12}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Thumbs]}
        className="image-thumbs-swiper"
        // wrapperClass="justify-center"
      >
        {thumbs.map((item, index) => (
          <SwiperSlide key={index}>{item}</SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductImagesSlider;
