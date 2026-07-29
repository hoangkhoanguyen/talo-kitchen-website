import Icon from "@/components/common/Icon";
import { cn } from "@/lib/utils";

export default function StatusItem({
  first,
  active,
  icon,
  label,
  color = "primary",
}: {
  first?: boolean;
  active?: boolean;
  icon: string;
  label: string;
  color?: "primary" | "error";
}) {
  return (
    <div className={cn("flex justify-end relative", first ? "" : "flex-1")}>
      {!first && (
        <span
          className={cn(
            "absolute top-1/2 left-0 -translate-y-1/2 w-full h-0.5 z-0",
            active
              ? color === "primary"
                ? "bg-primary"
                : "bg-error"
              : "bg-gray-300",
          )}
        ></span>
      )}
      <div
        className={cn(
          "relative w-12 aspect-square rounded-full flex items-center justify-center",
          active
            ? color === "primary"
              ? "bg-primary"
              : "bg-error"
            : "bg-gray-300",
        )}
      >
        <Icon icon={icon} className="text-white text-lg" />
        <span
          className={cn(
            "absolute -bottom-6 text-center w-max text-xs font-medium",
            active
              ? color === "primary"
                ? "text-primary"
                : "text-error"
              : "text-gray-400",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
