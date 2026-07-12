export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "bg-blue-100",
  iconColor = "text-blue-600",
  trend = "+12%",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">

      {/* Top */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h2>
        </div>

        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <div className={iconColor}>
            {icon}
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="mt-5 flex items-center justify-between">

        <span className="text-xs text-gray-500">
          {subtitle}
        </span>

        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          ↑ {trend}
        </span>

      </div>

    </div>
  );
}