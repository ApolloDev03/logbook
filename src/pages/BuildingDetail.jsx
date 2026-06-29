export default function BuildingDetail() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Apollo Infotech
        </h1>

        <p className="text-gray-600 text-sm mb-4">Building Details</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <p className="text-sm text-gray-500 mb-1">Company Name</p>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ABC Fire Safety Pvt. Ltd.
          </h2>

          <p className="text-sm text-gray-500 mb-1">Address</p>
          <p className="text-gray-700 leading-relaxed">
            402, Shivalik Business Center, Near Iscon Cross Road, Ahmedabad,
            Gujarat - 380015
          </p>
        </div>
      </div>
    </div>
  );
}
