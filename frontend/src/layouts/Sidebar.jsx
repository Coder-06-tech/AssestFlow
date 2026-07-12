import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Building2,
  Settings,
  Box,
  LogOut,
} from "lucide-react";

const bottomItems = [
  {
    name: "Settings",
    icon: Settings,
  },
  {
    name: "Logout",
    icon: LogOut,
  },
];

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, active: true },
  { title: "Assets", icon: Package },
  { title: "Allocations", icon: ArrowRightLeft },
  { title: "Resource Booking", icon: CalendarDays },
  { title: "Maintenance", icon: Wrench },
  { title: "Audits", icon: ClipboardCheck },
  { title: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#F7F8FC] border-r border-gray-200 flex flex-col justify-between">

      {/* Logo */}
      <div>

        <div className="px-6 py-6 border-b border-gray-200">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Box className="text-white" size={20} />
            </div>

            <div>
              <h1 className="font-bold text-xl text-blue-600">
                AssetFlow
              </h1>

              <p className="text-[10px] text-gray-500 tracking-wide">
                Enterprise Management
              </p>
            </div>

          </div>

        </div>

        {/* Menu */}

        <nav className="mt-5 px-4">

          <ul className="space-y-1">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.title}>

                  <button
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition

                    ${
                      item.active
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />

                    {item.title}
                  </button>

                </li>
              );
            })}

          </ul>

          <hr className="my-5 border-gray-200" />

          <ul className="space-y-1">

            {bottomItems.map((item) => {
              const Icon = item.icon;

              return (
          <li key={item.name}>

              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">

                <Icon size={18} />

                  {item.name}

              </button>

          </li>
            );
        })}

          </ul>

        </nav>

      </div>

    </aside>
  );
}