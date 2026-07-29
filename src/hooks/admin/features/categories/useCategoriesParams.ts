import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

const useCategoriesParams = () => {
  const [query, setQuery] = useQueryStates({
    limit: parseAsInteger.withDefault(20),
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    isActive: parseAsBoolean,
  });

  return { query, setQuery };
};

export default useCategoriesParams;
