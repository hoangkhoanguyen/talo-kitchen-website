"use client";
import { throttle } from "lodash";
import React, {
  FC,
  PropsWithChildren,
  useState,
  useRef,
  useEffect,
} from "react";

const AnimationHeaderScroll: FC<PropsWithChildren> = ({ children }) => {
  const [isShow, setShow] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      if (isScrollingUp || currentScrollY <= 150) {
        setShow(true);
      } else {
        setShow(false);
      }
      lastScrollY.current = currentScrollY;
    }, 200);
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => document.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 start-0 end-0 z-30 duration-200 ${
          isShow ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default AnimationHeaderScroll;
