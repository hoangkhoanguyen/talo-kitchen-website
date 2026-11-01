import PricePrograms from "@/components/admin/features/price-programs/PricePrograms";
import { notFound } from "next/navigation";
import { FEATURES } from "@/constants/features";
import Header from "@/components/admin/shared/header/Header";

const PriceProgramsPage = () => {
  if (!FEATURES.PRICE_PROGRAMS) notFound();
  return (
    <div className="container px-5 pb-5 mx-auto flex flex-col gap-4 min-h-screen">
      <Header title="Giá theo khung giờ" />
      <PricePrograms />
    </div>
  );
};

export default PriceProgramsPage;
