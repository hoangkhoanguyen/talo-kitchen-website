import { parseAsString, useQueryStates } from "nuqs";

const useReportParams = () => {
  const [query, setQuery] = useQueryStates({
    preset: parseAsString.withDefault("this_month"),
    start_date: parseAsString.withDefault(""),
    end_date: parseAsString.withDefault(""),
  });

  return { query, setQuery };
};

export default useReportParams;
