import StatusBadge from "./StatusBadge";

const assets = [
  {
    id: "AF-003",
    name: "Dell Laptop",
    location: "Desk E12",
    status: "Verified",
  },
  {
    id: "AF-9921",
    name: "Office Chair",
    location: "Desk E14",
    status: "Missing",
  },
  {
    id: "AF-9838",
    name: "Monitor",
    location: "Desk E15",
    status: "Damaged",
  },
];

function AuditTable() {
  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-50">

          <tr>

            <th className="text-left p-4">
              Asset
            </th>

            <th className="text-left p-4">
              Expected Location
            </th>

            <th className="text-left p-4">
              Verification
            </th>

          </tr>

        </thead>

        <tbody>

          {assets.map((asset) => (

            <tr key={asset.id} className="border-t">

              <td className="p-4">
                <p className="font-medium">{asset.id}</p>
                <p className="text-gray-500">{asset.name}</p>
              </td>

              <td className="p-4">
                {asset.location}
              </td>

              <td className="p-4">
                <StatusBadge status={asset.status} />
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AuditTable;