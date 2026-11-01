import { parseAsString, useQueryStates } from "nuqs";

const useReportParams = () => {
  const [query, setQuery] = useQueryStates({
    preset: parseAsString.withDefault("this_month"),
    start_date: parseAsString.withDefault(""),
    end_date: parseAsString.withDefault(""),
    // Lọc danh mục cho khối "Thống kê theo món" (rỗng = tất cả)
    category_id: parseAsString.withDefault(""),
  });

  return { query, setQuery };
};

export default useReportParams;
