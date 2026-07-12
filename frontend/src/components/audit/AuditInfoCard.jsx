function AuditInfoCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">

      <h2 className="text-xl font-semibold text-slate-800">
        Q3 Audit – Engineering Department
      </h2>

      <div className="grid grid-cols-2 gap-8 mt-5">

        <div>
          <p className="text-sm text-gray-500">
            Audit Period
          </p>

          <p className="font-medium">
            1 – 15 July 2026
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Auditors
          </p>

          <p className="font-medium">
            A. Rao, S. Iqbal
          </p>
        </div>

      </div>

    </div>
  );
}

export default AuditInfoCard;