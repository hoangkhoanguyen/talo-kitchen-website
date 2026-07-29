import React, { FC, useState } from "react";
import { Input } from "../ui/form";
import { parseAsString, useQueryState } from "nuqs";

const SearchInput: FC<{
  className?: string;
  placeholder?: string;
  onSubmit(search: string): void;
}> = ({ placeholder = "Search...", onSubmit, className }) => {
  const [query, setQuery] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [search, setSearch] = useState(query);

  const onSubmitSearch = () => {
    if (onSubmit) return onSubmit(search);
    setQuery(search);
  };

  return (
    <Input
      placeholder={placeholder}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          onSubmitSearch();
        }
      }}
      className={className}
    />
  );
};

export default SearchInput;
