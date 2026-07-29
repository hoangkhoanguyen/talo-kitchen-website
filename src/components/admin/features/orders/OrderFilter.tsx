import React, { useState } from "react";
import Filter from "../../shared/Filter";
import { ORDER_STATUS, ORDER_TYPE } from "@/constants/orders";
import { OrderStatus } from "@/types/orders";
import { EShippingMethod } from "@/types/app-configs";

interface FilterQuery {
  status: string[];
  order_type: string[];
  start_date: string;
  end_date: string;
}

const OrderFilter = ({
  query: initQuery,
  setQuery: setURLQuery,
}: {
  query: FilterQuery;
  setQuery(value: FilterQuery): void;
}) => {
  const [query, setQuery] = useState<FilterQuery>(initQuery);
  // const [urlQuery, setURLQuery] = useState<FilterQuery>(initQuery);

  const onChangeQuery = <K extends keyof FilterQuery>(
    key: K,
    value: FilterQuery[K],
  ) => {
    // update url to state
    setQuery((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onUpdateToState = () => {
    // update url to state
    setQuery(initQuery);
  };

  const onReset = () => {
    setQuery({
      status: [],
      order_type: [],
      start_date: "",
      end_date: "",
    });
  };

  const onSubmit = () => {
    // update state to url
    setURLQuery(query);
  };

  return (
    <Filter
      onReset={onReset}
      onSubmit={onSubmit}
      onBeforeOpen={onUpdateToState}
    >
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend">Order Status</legend>
        {Object.values(OrderStatus).map((status) => (
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
            <span>{ORDER_STATUS[status].label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend">Shipping Method</legend>
        {Object.values(EShippingMethod).map((type) => (
          <label className="label" key={type}>
            <input
              type="checkbox"
              checked={query.order_type.includes(type)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChangeQuery("order_type", [...query.order_type, type]);
                } else {
                  onChangeQuery(
                    "order_type",
                    query.order_type.filter((t) => t !== type),
                  );
                }
              }}
              className="checkbox"
            />
            <span>{ORDER_TYPE[type].label}</span>
          </label>
        ))}
      </fieldset>
    </Filter>
  );
};

export default OrderFilter;
