"use client";
import React, { FC, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export const ReviewsSliders: FC<{ children: ReactNode[] }> = ({ children }) => {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      pagination={{
        clickable: true,
        bulletActiveClass:
          "!bg-web-secondary-1 opacity-100 swiper-pagination-bullet-active",
        bulletClass: "swiper-pagination-bullet !h-2.5 !w-2.5",
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      breakpoints={{
        0: {
          slidesPerView: 1,
          spaceBetween: 12,
        },
        640: {
          slidesPerView: 1.5,
          spaceBetween: 12,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 12,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 12,
        },
      }}
    >
      {children.map((child, index) => (
        <SwiperSlide key={index} className="pb-8">
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
