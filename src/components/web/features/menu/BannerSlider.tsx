"use client";
import React, { FC, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";

const BannerSlider: FC<{ children: ReactNode[]; autoplay: boolean }> = ({
  children,
  autoplay,
}) => {
  return (
    <Swiper
      pagination={{
        clickable: true,
      }}
      autoplay={autoplay ? { delay: 3000 } : false}
      loop
      modules={[Pagination, Autoplay]}
      className="my-slider"
      wrapperClass="!pb-0"
    >
      {children.map((child, index) => (
        <SwiperSlide key={index}>{child}</SwiperSlide>
      ))}
    </Swiper>
  );
};

export default BannerSlider;
