"use client";
import Icon from "@/components/common/Icon";
import React, { FC } from "react";
import { Button } from "../../ui/button";
import { cn, splitTextByNewLine } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { useReservationContext } from "./ReservationProvider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/(web)/[locale]/reservation/datepicker-custom.css";

const ReservationForm: FC<{
  configs: any;
}> = ({ configs }) => {
  const { control, onSubmit, reservationConfigs } = useReservationContext();

  return (
    <div className="reservation-card-shadow bg-white rounded-xl p-5 @container">
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-5">
        <div className="col-span-1 @md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex justify-center items-center w-11 aspect-square rounded-full bg-web-secondary-1">
              <Icon
                icon={"ph:calendar-blank"}
                className="text-web-content-1 text-2xl"
              />
            </div>
            <h3 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1">
              Make a Reservation
            </h3>
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
            Please fill out all required fields to secure your dining experience
          </p>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <div className="flex items-center gap-2">
            <Icon
              icon="ph:calendar-blank"
              className="text-2xl text-web-secondary-1"
            />
            <h4 className="text-web-h4-mobile lg:text-web-h4 text-web-primary">
              Reservation Details
            </h4>
          </div>
        </div>

        <div className="col-span-1">
          <div>
            <label className="web-reservation-label">
              Preferred Date (GMT +7) *
            </label>
            <Controller
              control={control}
              name="arrivalDate"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <>
                  <DatePicker
                    selected={value ? new Date(value) : null}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const day = date.getDate().toString().padStart(2, "0");
                        onChange(`${year}-${month}-${day}`);
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="MM/dd/yyyy"
                    className={cn(
                      "web-input w-full",
                      !!error && " web-input-error",
                    )}
                    placeholderText="Select date"
                  />
                  {error?.message && (
                    <p className="text-web-error text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="col-span-1">
          <div>
            <label className="web-reservation-label">
              Preferred Time (GMT +7) *
            </label>
            <Controller
              control={control}
              name="arrivalTime"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <>
                  <DatePicker
                    selected={value ? new Date(`2000-01-01T${value}`) : null}
                    onChange={(date) => {
                      if (date) {
                        const hours = date
                          .getHours()
                          .toString()
                          .padStart(2, "0");
                        const minutes = date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0");
                        onChange(`${hours}:${minutes}`);
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className={cn(
                      "web-input w-full",
                      !!error && " web-input-error",
                    )}
                    placeholderText="Select time"
                  />
                  {error?.message && (
                    <p className="text-web-error text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <div>
            <label className="web-reservation-label">Number of Guests *</label>
            <Controller
              control={control}
              name="numberOfPeople"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <>
                  <select
                    className={cn(
                      "web-input w-full",
                      !!error && " web-input-error",
                    )}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  >
                    {reservationConfigs?.reservation.size_options.map(
                      (option: any) => (
                        <option key={option.value} value={option.value}>
                          {option.value}
                        </option>
                      ),
                    )}
                    <option hidden value={""}>
                      Please choose an option
                    </option>
                  </select>
                  {error?.message && (
                    <p className="text-web-error text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2"></div>

        <div className="col-span-1 @md:col-span-2">
          <div className="flex items-center gap-2">
            <Icon icon="ph:phone" className="text-2xl text-web-secondary-1" />
            <h4 className="text-web-h4-mobile lg:text-web-h4 text-web-primary">
              Contact Details
            </h4>
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <div>
            <label className="web-reservation-label">Full Name *</label>
            <Controller
              control={control}
              name="customerFullName"
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    type="text"
                    className={cn(
                      "web-input w-full",
                      !!error && " web-input-error",
                    )}
                    placeholder="Enter your full name"
                    {...field}
                  />
                  {error?.message && (
                    <p className="text-web-error text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <div>
            <label className="web-reservation-label">
              Phone Number at Vietnam *
            </label>
            <Controller
              control={control}
              name="customerPhone"
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    type="tel"
                    className={cn(
                      "web-input w-full",
                      !!error && " web-input-error",
                    )}
                    placeholder="Enter your phone number"
                    {...field}
                  />
                  {error?.message && (
                    <p className="text-web-error text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2"></div>

        <div className="col-span-1 @md:col-span-2">
          <div className="flex items-center gap-2">
            <Icon
              icon="ph:chat-circle"
              className="text-2xl text-web-secondary-1"
            />
            <h4 className="text-web-h4-mobile lg:text-web-h4 text-web-primary">
              Special Request
            </h4>
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <div>
            <label className="web-reservation-label">
              Additional Information (Optional)
            </label>
            <Controller
              control={control}
              name="note"
              render={({ field, fieldState: { error } }) => (
                <>
                  <textarea
                    rows={4}
                    className={cn(
                      "web-input bg-web-background-2 w-full",
                      !!error && " web-input-error",
                    )}
                    placeholder="Tell us about dietary restrictions, celebrations, seating preferences, or any other special requirements..."
                    {...field}
                  ></textarea>
                  {error?.message && (
                    <p className="text-web-error text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="col-span-1 @md:col-span-2 h-[1px] bg-web-content-3"></div>
        <div className="col-span-1 @md:col-span-2">
          <Button
            className="w-full rounded-lg py-4 text-web-button-mobile lg:text-web-button"
            variant={"primary"}
            type="button"
            onClick={onSubmit}
          >
            Submit Reservation Request
          </Button>
        </div>

        <div className="col-span-1 @md:col-span-2">
          <div className="p-2.5 bg-web-secondary-2 rounded-lg">
            {splitTextByNewLine(configs.note).map((line, index) => (
              <p
                key={index}
                className="text-web-content-2 text-web-body-mobile lg:text-web-body text-center"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
