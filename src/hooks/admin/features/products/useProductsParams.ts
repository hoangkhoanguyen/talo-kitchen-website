import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

const useProductsParams = () => {
  const [query, setQuery] = useQueryStates({
    limit: parseAsInteger.withDefault(10),
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    isActive: parseAsBoolean,
  });

  return { query, setQuery };
};

export default useProductsParams;
