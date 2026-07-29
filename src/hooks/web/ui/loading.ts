import { useEffect } from "react";
import { create } from "zustand";

export const useLoading = create<{
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}>()((set) => ({
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export const useIsLoading = () => {
  return useLoading((state) => state.isLoading);
};

export const useSetLoading = (...loadings: boolean[]) => {
  const setLoading = useLoading((state) => state.setLoading);

  useEffect(() => {
    const isLoading = loadings.some((loading) => loading);
    setLoading(isLoading);
  }, [loadings, setLoading]);
};
