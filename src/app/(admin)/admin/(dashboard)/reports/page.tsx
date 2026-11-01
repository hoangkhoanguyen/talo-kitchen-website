import RevenueReport from "@/components/admin/features/reports/RevenueReport";
import Header from "@/components/admin/shared/header/Header";

const ReportsPage = () => {
  return (
    <div className="container px-5 pb-5 mx-auto flex flex-col gap-4 min-h-screen">
      <Header title="Báo cáo" />
      <RevenueReport />
    </div>
  );
};

export default ReportsPage;
