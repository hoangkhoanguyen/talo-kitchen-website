"use client";
import { useState } from "react";
import { IconButton } from "../button/IconButton";

export const PasswordInput = () => {
  const [isShow, setShow] = useState(false);

  const toggleShow = () => {
    setShow((p) => !p);
  };

  return (
    <div className="input">
      <input type={isShow ? "text" : "password"} />
      <IconButton
        onClick={toggleShow}
        icon={isShow ? "solar:eye-outline" : "formkit:eyeclosed"}
      />
    </div>
  );
};
