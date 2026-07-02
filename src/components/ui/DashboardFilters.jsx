import { useState, useRef, useEffect } from "react";


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
  const dateRef = useRef(null);
  const [dateOpen, setDateOpen] = useState(false);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setMonthOpen(false);
      }

      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setDateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const daysInMonth =
    selectedMonth !== null
      ? new Date(selectedYear, selectedMonth + 1, 0).getDate()
      : 31;

  const firstDay =
    selectedMonth !== null
      ? new Date(selectedYear, selectedMonth, 1).getDay()
      : 0;


  useEffect(() => {
    const maxDays = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();

    if (!selectedDate) return;

    const day = Math.min(selectedDate.getDate(), maxDays);

    setSelectedDate(new Date(selectedYear, selectedMonth, day));
  }, [selectedYear, selectedMonth]);

  return (
    <div className="card rounded-xl p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Year */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
            Year
          </label>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
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
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black dark:text-white"
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
          </div>
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
            <div className="absolute left-0 z-50 mt-2 w-full rounded-xl border bg-white p-3 shadow-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white">
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
        <div className="relative" ref={dateRef}>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
            Date
          </label>

          <button
            type="button"
            onClick={() => setDateOpen(!dateOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <span>
              {selectedDate ? selectedDate.getDate() : "Select Date"}
            </span>

            <svg
              className={`h-5 w-5 transition ${dateOpen ? "rotate-180" : ""}`}
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

          {dateOpen && (
            <div className="absolute right-0 z-50 mt-2 rounded-xl border bg-white p-3 shadow-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white">
              <div className="grid grid-cols-7 gap-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty spaces before first day */}
                {Array.from({ length: firstDay }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-10 w-10" />
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedDate(
                        new Date(selectedYear, selectedMonth, index + 1)
                      );
                      setDateOpen(false);
                    }}
                    className={`h-10 w-10 rounded border transition
              ${selectedDate?.getDate() === index + 1
                        ? "bg-[#2563ea] border-[#2563ea] text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 border-none"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}