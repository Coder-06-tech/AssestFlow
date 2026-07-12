function DiscrepancyCard() {
  return (
    <div className="space-y-5">

      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 flex justify-between items-center">

        <div>

          <h2 className="font-semibold text-lg">
            2 Assets Flagged
          </h2>

          <p className="text-gray-500">
            Discrepancy report generated automatically.
          </p>

        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
          Generate Report
        </button>

      </div>

      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Close Audit Cycle
      </button>

    </div>
  );
}

export default DiscrepancyCard;