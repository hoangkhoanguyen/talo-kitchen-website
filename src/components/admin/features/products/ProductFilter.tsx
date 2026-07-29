import React, { useState } from "react";
import Filter from "../../shared/Filter";
import { parseAsBoolean, useQueryStates } from "nuqs";
import { Select } from "../../ui/form";

const ProductFilter = () => {
  const [urlQuery, setURLQuery] = useQueryStates({
    isActive: parseAsBoolean,
  });
  const [query, setQuery] = useState<{
    isActive: boolean | null;
  }>({
    isActive: null,
  });

  const onUpdateToState = () => {
    // update url to state
    setQuery(urlQuery);
  };

  const onSubmit = () => {
    // update state to url
    setURLQuery(query);
  };

  const onReset = () => {
    setQuery({
      isActive: null,
    });
  };

  const onChange = <T extends keyof typeof urlQuery>(
    key: T,
    value: (typeof urlQuery)[T],
  ) => {
    setQuery((p) => ({
      ...p,
      [key]: value,
    }));
  };

  return (
    <Filter
      onReset={onReset}
      onSubmit={onSubmit}
      onBeforeOpen={onUpdateToState}
    >
      <Select
        value={
          query.isActive === null
            ? "all"
            : query.isActive === true
            ? "true"
            : "false"
        }
        onChange={(e) => {
          switch (e.target.value) {
            case "all":
              onChange("isActive", null);
              break;
            case "true":
              onChange("isActive", true);
              break;
            default:
              onChange("isActive", false);
              break;
          }
        }}
      >
        <option value={"all"}>Tất cả</option>
        <option value={"true"}>Đang hoạt động</option>
        <option value={"false"}>Ngưng hoạt động</option>
      </Select>
    </Filter>
  );
};

export default ProductFilter;
