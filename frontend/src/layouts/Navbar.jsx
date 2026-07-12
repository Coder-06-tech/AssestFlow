import { Search, Bell, CircleHelp } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

      {/* Search Bar */}
      <div className="relative w-[420px]">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search assets, users, or tickets..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        <button className="text-gray-600 hover:text-blue-600">
          <Bell size={20} />
        </button>

        <button className="text-gray-600 hover:text-blue-600">
          <CircleHelp size={20} />
        </button>

        <div className="h-6 w-px bg-gray-300"></div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
          + New Asset
        </button>

      </div>

    </header>
  );
}