export default function AssetHealth() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Asset Health
          </h2>

          <p className="text-sm text-gray-500">
            Current asset condition overview
          </p>
        </div>

        <button className="text-sm text-blue-600 hover:underline">
          View Report
        </button>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center h-64">

        {/* Placeholder Circle */}
        <div className="w-40 h-40 rounded-full border-8 border-blue-500 flex items-center justify-center">

          <div className="text-center">
            <h3 className="text-3xl font-bold">92%</h3>
            <p className="text-sm text-gray-500">
              Healthy
            </p>
          </div>

        </div>

      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm text-gray-500">
            Healthy
          </p>

          <h3 className="text-xl font-bold text-green-600">
            1148
          </h3>
        </div>

        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-sm text-gray-500">
            Maintenance
          </p>

          <h3 className="text-xl font-bold text-red-600">
            100
          </h3>
        </div>

      </div>

    </div>
  );
}