import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DashboardFilters({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedDate,
  setSelectedDate,
}) {
  const [monthOpen, setMonthOpen] = useState(false);
  const monthRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setMonthOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="card rounded-xl p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Year */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
            Year
          </label>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            {Array.from(
              { length: new Date().getFullYear() - 2026 + 1 },
              (_, index) => {
                const year = 2026 + index;

                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              }
            )}
          </select>
        </div>

        {/* Month */}
        <div className="relative" ref={monthRef}>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
            Month
          </label>

          <button
            type="button"
            onClick={() => setMonthOpen(!monthOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <span>
              {selectedMonth !== null
                ? months[selectedMonth]
                : "Select Month"}
            </span>

            <svg
              className={`h-5 w-5 transition ${monthOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {monthOpen && (
            <div className="absolute left-0 z-50 mt-2 w-full rounded-xl border bg-white p-3 shadow-xl dark:bg-gray-900 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(index);
                      setMonthOpen(false);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm transition
                      ${selectedMonth === index
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
            Date
          </label>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd-MM-yyyy"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

      </div>
    </div>
  );
}