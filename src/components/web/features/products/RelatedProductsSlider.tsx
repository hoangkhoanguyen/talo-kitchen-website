"use client";
import React, { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

const RelatedProductsSlider: FC<{ children: React.ReactNode[] }> = ({
  children,
}) => {
  return (
    <Swiper
      autoplay={{ delay: 3000 }}
      modules={[Autoplay]}
      breakpoints={{
        0: {
          slidesPerView: 1.2,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 2.2,
          spaceBetween: 12,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
      }}
    >
      {children.map((child, index) => (
        <SwiperSlide key={index}>{child}</SwiperSlide>
      ))}
      {/* <SwiperSlide>
        <ProductCard />
      </SwiperSlide>
      <SwiperSlide>
        <ProductCard />
      </SwiperSlide>
      <SwiperSlide>
        <ProductCard />
      </SwiperSlide>
      <SwiperSlide>
        <ProductCard />
      </SwiperSlide> */}
    </Swiper>
  );
};

export default RelatedProductsSlider;
