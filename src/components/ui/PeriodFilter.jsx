// // components/PeriodFilter.jsx

// const FILTER_OPTIONS = [
//   { label: "Weekly", value: "weekly" },
//   { label: "Monthly", value: "monthly" },
//   { label: "Quarterly", value: "quarterly" },
//   { label: "Half Yearly", value: "half_yearly" },
//   { label: "Yearly", value: "yearly" },
// ];

// export default function PeriodFilter({
//   selectedPeriod,
//   setSelectedPeriod,
// }) {
//   return (
//     <div className="flex flex-wrap gap-2 pb-4">
//       {FILTER_OPTIONS.map((item) => (
//         <button
//           key={item.value}
//           onClick={() => setSelectedPeriod(item.value)}
//           className={`rounded-lg px-4 py-2 text-sm font-medium transition-all
//             ${
//               selectedPeriod === item.value
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
//             }`}
//         >
//           {item.label}
//         </button>
//       ))}
//     </div>
//   );
// }

// components/PeriodFilter.jsx

const FILTER_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Half Yearly", value: "half_yearly" },
  { label: "Yearly", value: "yearly" },
];

export default function PeriodFilter({
  selectedPeriod,
  setSelectedPeriod,
}) {
  return (
    <div className="mb-5">
      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {FILTER_OPTIONS.map((item) => (
          <button
            key={item.value}
            onClick={() => setSelectedPeriod(item.value)}
            className={`min-w-[110px] rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200
              ${
                selectedPeriod === item.value
                  ? "bg-[#465FFF] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}