import { cn } from "@/lib/utils";
import { Button } from "../button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  // totalPages can shrink below currentPage (e.g. after a filter/search
  // changes the result set, or a stale/tampered `?page=` in the URL), so
  // currentPage must be clamped into a valid range before it drives any
  // rendering or button-disabled logic below.
  const safeTotalPages = Math.max(totalPages, 0);
  const clampedCurrentPage =
    safeTotalPages === 0
      ? 1
      : Math.min(Math.max(currentPage, 1), safeTotalPages);

  const windowLength = Math.min(3, safeTotalPages);
  const windowStart = Math.min(
    Math.max(clampedCurrentPage - 1, 1),
    Math.max(safeTotalPages - windowLength + 1, 1),
  );
  const pagesAroundCurrent = Array.from(
    { length: windowLength },
    (_, i) => i + windowStart,
  );

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Button
        size={"sm"}
        onClick={() => onPageChange(clampedCurrentPage - 1)}
        disabled={clampedCurrentPage <= 1}
      >
        Previous
      </Button>
      <div className="flex items-center gap-2">
        {clampedCurrentPage > 3 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            color={clampedCurrentPage === page ? "primary" : "default"}
            size={"sm"}
            className={"w-10"}
          >
            {page}
          </Button>
        ))}
        {clampedCurrentPage < safeTotalPages - 2 && (
          <span className="px-2">...</span>
        )}
      </div>
      <Button
        size={"sm"}
        onClick={() => onPageChange(clampedCurrentPage + 1)}
        disabled={clampedCurrentPage >= safeTotalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
