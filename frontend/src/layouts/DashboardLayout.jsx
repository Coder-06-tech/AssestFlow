import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#EEF2FF] p-4">
      <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <Sidebar />

        <div className="flex flex-col flex-1">
          <Navbar />

          <main className="flex-1 overflow-y-auto bg-[#FAFBFD] p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}