import Icon from "@/components/common/Icon";
import React, { FC, ReactNode } from "react";
import { Button } from "../../ui/button";
import ReservationInformation from "./ReservationInformation";
import { ReservationDB } from "@/db/schemas";
import moment from "moment";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";

const ReservationSubmitSuccess: FC<{
  configs: any;
  reservation: ReservationDB;
}> = ({ configs, reservation }) => {
  const renderBackToHomeButton = () => (
    <Button
      as={Link}
      href={webRoutes.home()}
      variant={"primary"}
      className="w-full"
    >
      Back to home
    </Button>
  );
  return (
    <section>
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-5">
            <h3 className="text-web-h2-mobile lg:text-web-h2 text-web-primary mb-5">
              {configs.success_title || "Reservation Submitted Successfully!"}
            </h3>

            <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
              {configs.success_description ||
                "Thank you for choosing our restaurant. We have received your reservation request and will get back to you shortly to confirm the details."}
            </p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 gap-5">
            <Card>
              <CardTitle label="Make a Reservation" icon="ph:calendar-blank" />
              <ul className="flex flex-col gap-5">
                <InfoItem
                  label="Reservation Code"
                  value={`#${reservation.code}`}
                />
                <InfoItem
                  label="Preferred Date"
                  value={moment(reservation.arrivalDate, "YYYY-MM-DD").format(
                    "DD/MM/YYYY",
                  )}
                />
                <InfoItem
                  label="Preferred Time"
                  value={moment(reservation.arrivalTime, "HH:mm:ss").format(
                    "hh:mm A",
                  )}
                />
                <InfoItem
                  label="Number of Guests"
                  value={reservation.numberOfPeople}
                />
              </ul>
            </Card>

            <Card>
              <CardTitle label="Contact Information" icon="ph:phone" />
              <ul className="flex flex-col gap-5">
                <InfoItem
                  label="Full name"
                  value={`${reservation.customerFullName}`}
                />
                <InfoItem
                  label="Phone Number in Vietnam"
                  value={`${reservation.customerPhone}`}
                />
              </ul>
            </Card>

            <Card>
              <CardTitle label="Special requests" icon="ph:chat-circle" />
              <div className="w-full p-2.5 rounded-lg bg-web-background-2 border border-web-content-3">
                <p className="text-web-body-mobile lg:text-web-body text-web-content-2">
                  {reservation.note || "No special requests"}
                </p>
              </div>
            </Card>
            {renderBackToHomeButton()}
          </div>
          <div className="lg:col-span-2">
            <ReservationInformation configs={configs} />
          </div>
        </div>
        <div className="lg:hidden fixed z-40 bottom-0 left-0 w-full bg-white px-3 py-2.5 border-t border-web-content-3">
          {renderBackToHomeButton()}
        </div>
      </div>
    </section>
  );
};

export default ReservationSubmitSuccess;

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-web-background-1 border border-web-content-3 p-5 flex flex-col items-stretch gap-10">
      {children}
    </div>
  );
}

function CardTitle({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="text-2xl text-web-secondary-1" />

      <h3 className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-1 capitalize">
        {label}
      </h3>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-2 capitalize">
        {label}
      </span>
      <span className="text-web-caption-mobile lg:text-web-caption text-web-content-2">
        {value}
      </span>
    </li>
  );
}
