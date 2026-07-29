import React, { useState } from "react";
import Filter from "../../shared/Filter";
import { EReservationStatus } from "@/types/reservations";
import { STATUS_RENDER } from "@/constants/reservation";

interface FilterQuery {
  status: string[];
}

const ReservationFilter = ({
  query: initQuery,
  setQuery: setURLQuery,
}: {
  query: FilterQuery;
  setQuery(value: FilterQuery): void;
}) => {
  const [query, setQuery] = useState<FilterQuery>(initQuery);

  const onChangeQuery = <K extends keyof FilterQuery>(
    key: K,
    value: FilterQuery[K],
  ) => {
    setQuery((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onUpdateToState = () => {
    setQuery(initQuery);
  };

  const onReset = () => {
    setQuery({
      status: [],
    });
  };

  const onSubmit = () => {
    setURLQuery(query);
  };

  return (
    <Filter
      onReset={onReset}
      onSubmit={onSubmit}
      onBeforeOpen={onUpdateToState}
    >
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend">Reservation Status</legend>
        {Object.values(EReservationStatus).map((status) => (
          <label className="label" key={status}>
            <input
              type="checkbox"
              checked={query.status.includes(status)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChangeQuery("status", [...query.status, status]);
                } else {
                  onChangeQuery(
                    "status",
                    query.status.filter((s) => s !== status),
                  );
                }
              }}
              className="checkbox"
            />
            <span>{STATUS_RENDER[status].label}</span>
          </label>
        ))}
      </fieldset>
    </Filter>
  );
};

export default ReservationFilter;
