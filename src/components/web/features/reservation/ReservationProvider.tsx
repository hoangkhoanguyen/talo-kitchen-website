"use client";
import { createReservationAction } from "@/actions/web/reservations";
import { ReservationDB } from "@/db/schemas";
import { useSetLoading } from "@/hooks/web/ui/loading";
import {
  createReservationSchema,
  CreateReservationType,
} from "@/validations/reservation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { createContext, FC, PropsWithChildren, useContext } from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "sonner";

const Context = createContext<{
  newReservation: ReservationDB | null;
  control: Control<CreateReservationType>;
  onSubmit(): void;
  reservationConfigs?: any;
} | null>(null);

const ReservationProvider: FC<
  PropsWithChildren<{
    reservationConfigs?: any;
  }>
> = ({ children, reservationConfigs }) => {
  const t = useTranslations("reservation");
  const [newReservation, setNewReservation] =
    React.useState<ReservationDB | null>(null);
  const { handleSubmit, control } = useForm<CreateReservationType>({
    defaultValues: {
      customerFullName: "",
      customerPhone: "",
      numberOfPeople: "",
      arrivalTime: "",
      arrivalDate: "",
      note: "",
    },
    resolver: zodResolver(createReservationSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createReservationAction,
    onSuccess(data) {
      if (data.success) {
        toast.success(
          t("toast.success", { code: data.reservation!.code }),
        );
        setNewReservation(data.reservation!);
      } else {
        toast.error(data.error);
      }
    },
  });

  const onSubmit = handleSubmit((data: CreateReservationType) => {
    mutate(data);
    // console.log("data", data);
  });

  useSetLoading(isPending);

  return (
    <Context.Provider
      value={{ newReservation, onSubmit, control, reservationConfigs }}
    >
      {children}
    </Context.Provider>
  );
};

export default ReservationProvider;

export const useReservationContext = () => {
  const context = useContext(Context);
  if (!context)
    throw new Error("useReservation must be wrapped in ReservationProvider");

  return context;
};
