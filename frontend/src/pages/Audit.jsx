import DashboardLayout from "../layouts/DashboardLayout";
import AuditHeader from "../components/audit/AuditHeader";
import AuditInfoCard from "../components/audit/AuditInfoCard";
import AuditTable from "../components/audit/AuditTable";
import DiscrepancyCard from "../components/audit/DiscrepancyCard";

function Audit() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        <AuditHeader />

        <AuditInfoCard />

        <AuditTable />

        <DiscrepancyCard />

      </div>
    </DashboardLayout>
  );
}

export default Audit;