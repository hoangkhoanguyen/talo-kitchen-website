import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

const useOrdersParams = () => {
  const [query, setQuery] = useQueryStates({
    limit: parseAsInteger.withDefault(10),
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    status: parseAsArrayOf(parseAsString).withDefault([]),
    order_type: parseAsArrayOf(parseAsString).withDefault([]),
    start_date: parseAsString.withDefault(""),
    end_date: parseAsString.withDefault(""),
  });

  return { query, setQuery };
};

export default useOrdersParams;
