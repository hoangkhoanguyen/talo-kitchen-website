"use client";
import React, { FC, PropsWithChildren } from "react";
import ReservationSubmitSuccess from "./ReservationSubmitSuccess";
import { useReservationContext } from "./ReservationProvider";

const Content: FC<
  PropsWithChildren<{
    configs?: any;
  }>
> = ({ configs, children }) => {
  const { newReservation } = useReservationContext();

  if (newReservation) {
    return (
      <ReservationSubmitSuccess
        configs={configs}
        reservation={newReservation}
      />
    );
  }

  return children;
};

export default Content;
