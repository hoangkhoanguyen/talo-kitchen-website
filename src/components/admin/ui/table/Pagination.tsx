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
  const pagesAroundCurrent = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + Math.max(currentPage - 1, 1),
  );

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Button
        size={"sm"}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <div className="flex items-center gap-2">
        {currentPage > 3 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            color={currentPage === page ? "primary" : "default"}
            size={"sm"}
            className={"w-10"}
          >
            {page}
          </Button>
        ))}
        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      </div>
      <Button
        size={"sm"}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
