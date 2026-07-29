import { useTransition } from "react";

const useCustomActionState = <T, K>(
  serverAction: (data: T) => Promise<{
    result: "success" | "error";
    data: K;
  }>,
  options?: {
    onSuccess?(data: K): void;
    onSuccess?(data: K): void;
  },
) => {
  const [isPending, startTransition] = useTransition();

  return {
    isPending,
    action: (data: T) => {
      startTransition(() => {
        serverAction(data);
      });
    },
  };
};

export default useCustomActionState;
