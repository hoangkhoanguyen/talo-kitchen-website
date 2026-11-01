import type { PriceSlot } from "@/lib/pricing";

export type PriceProgramInput = {
  name: string;
  isActive: boolean;
  slots: PriceSlot[];
  productIds: number[];
};

export type AdminPriceProgram = {
  id: number;
  name: string;
  isActive: boolean;
  slots: PriceSlot[];
  products: { id: number; title: string; price: number }[];
};
