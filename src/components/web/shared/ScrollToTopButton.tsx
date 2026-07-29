"use client";
import Icon from "@/components/common/Icon";

const ScrollToTopButton = () => {
  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="border border-web-content-1 rounded-full h-[52px] w-[52px] flex items-center justify-center bg-white/60  hover:bg-white duration-200"
    >
      <Icon icon="ph:caret-up" className="text-2xl text-web-content-1" />
    </button>
  );
};

export default ScrollToTopButton;
