const returns = [
  {
    asset: "Dell Latitude 7420",
    employee: "Priya Sharma",
    due: "13 Jul 2026",
    status: "Tomorrow",
  },
  {
    asset: "Canon EOS 90D",
    employee: "Rahul Das",
    due: "15 Jul 2026",
    status: "3 Days",
  },
  {
    asset: "Projector XG-200",
    employee: "Ananya Roy",
    due: "16 Jul 2026",
    status: "4 Days",
  },
  {
    asset: "MacBook Pro",
    employee: "Karan Patel",
    due: "18 Jul 2026",
    status: "6 Days",
  },
];

export default function UpcomingReturns() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-8">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Returns
          </h2>

          <p className="text-sm text-gray-500">
            Assets expected to be returned soon
          </p>
        </div>

        <button className="text-blue-600 text-sm hover:underline">
          View All
        </button>

      </div>

      <table className="w-full">

        <thead>

          <tr className="border-b border-gray-200 text-left">

            <th className="py-3 text-sm text-gray-500">Asset</th>
            <th className="py-3 text-sm text-gray-500">Employee</th>
            <th className="py-3 text-sm text-gray-500">Due Date</th>
            <th className="py-3 text-sm text-gray-500">Status</th>

          </tr>

        </thead>

        <tbody>

          {returns.map((item) => (

            <tr
              key={item.asset}
              className="border-b border-gray-100 hover:bg-gray-50"
            >

              <td className="py-4 font-medium">
                {item.asset}
              </td>

              <td>{item.employee}</td>

              <td>{item.due}</td>

              <td>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">

                  {item.status}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}