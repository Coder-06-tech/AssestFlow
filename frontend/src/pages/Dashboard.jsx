import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHeader from "../components/dashboards/DashboardHeader";
import KPICard from "../components/dashboards/KPICard";
import AssetHealth from "../components/dashboards/AssetHealth";
import RecentActivity from "../components/dashboards/RecentActivity";
import UpcomingReturns from "../components/dashboards/UpcomingReturns";
import { kpiData } from "../data/dashboardData";

export default function Dashboard() {
  return (
    <DashboardLayout>

      <DashboardHeader />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpiData.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2">
          <AssetHealth />
        </div>

      {/* Bottom Table */}
      <UpcomingReturns />
        <RecentActivity />

      </div>

    </DashboardLayout>
  );
}