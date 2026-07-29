import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

const useReservationParams = () => {
  const [query, setQuery] = useQueryStates({
    limit: parseAsInteger.withDefault(10),
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    status: parseAsArrayOf(parseAsString).withDefault([]),
  });

  return { query, setQuery };
};

export default useReservationParams;
