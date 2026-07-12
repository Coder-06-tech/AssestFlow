const activities = [
  {
    title: "Laptop AF-0112 allocated",
    time: "2 min ago",
  },
  {
    title: "Maintenance Approved",
    time: "12 min ago",
  },
  {
    title: "Conference Room booked",
    time: "1 hour ago",
  },
  {
    title: "Audit Completed",
    time: "Yesterday",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

      <h2 className="text-lg font-semibold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.map((item) => (
          <div
            key={item.title}
            className="flex justify-between items-center border-b border-gray-100 pb-3"
          >
            <div>

              <p className="font-medium text-gray-800">
                {item.title}
              </p>

              <p className="text-sm text-gray-400">
                {item.time}
              </p>

            </div>

            <span className="h-3 w-3 rounded-full bg-blue-500"></span>

          </div>
        ))}

      </div>

    </div>
  );
}