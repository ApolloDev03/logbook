import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";


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
  selectedEndDate,
  setSelectedEndDate,
}) {
  const [monthOpen, setMonthOpen] = useState(false);
  const monthRef = useRef(null);
  const dateRef = useRef(null);
  const [dateOpen, setDateOpen] = useState(false);

  const CalendarIcon = () => (
    <svg
      className="h-5 w-5 text-gray-500 dark:text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
      />
    </svg>
  );


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



  const monthStartDate = new Date(selectedYear, selectedMonth, 1);
  const monthEndDate = new Date(selectedYear, selectedMonth + 1, 0);

  useEffect(() => {
    const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    setSelectedDate((prev) => {
      if (!prev) return prev;

      const day = Math.min(prev.getDate(), maxDays);
      return new Date(selectedYear, selectedMonth, day);
    });

    setSelectedEndDate((prev) => {
      if (!prev) return prev;

      const day = Math.min(prev.getDate(), maxDays);
      return new Date(selectedYear, selectedMonth, day);
    });
  }, [selectedYear, selectedMonth, setSelectedDate, setSelectedEndDate]);

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

        {/* Date Range */}
        <div className="relative" ref={dateRef}>
          <style>
            {`
      .dashboard-range-picker .react-datepicker {
        border: none;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
        font-family: inherit;
      }

      .dashboard-range-picker .react-datepicker__month-container {
        float: none;
      }

      .dashboard-range-picker .react-datepicker__header {
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        padding: 12px 10px 8px;
      }

      .dashboard-range-picker .react-datepicker__current-month,
      .dashboard-range-picker .react-datepicker__navigation {
        display: none !important;
      }

      .dashboard-range-picker .react-datepicker__day-name {
        width: 2.6rem;
        line-height: 2.6rem;
        font-weight: 600;
        color: #6b7280;
      }

      .dashboard-range-picker .react-datepicker__day {
        width: 2.6rem;
        line-height: 2.6rem;
        margin: 2px;
        border-radius: 8px;
      }

      .dashboard-range-picker .react-datepicker__day:hover {
        background: #f3f4f6;
      }

      .dashboard-range-picker .react-datepicker__day--selected,
      .dashboard-range-picker .react-datepicker__day--in-selecting-range,
      .dashboard-range-picker .react-datepicker__day--in-range,
      .dashboard-range-picker .react-datepicker__day--range-start,
      .dashboard-range-picker .react-datepicker__day--range-end,
      .dashboard-range-picker .react-datepicker__day--keyboard-selected {
        background: #2563ea !important;
        color: #fff !important;
      }

      .dashboard-range-picker .react-datepicker__day--disabled {
        color: #d1d5db !important;
        background: transparent !important;
        cursor: not-allowed;
      }

      .dark .dashboard-range-picker .react-datepicker {
        background: #111827;
      }

      .dark .dashboard-range-picker .react-datepicker__header {
        background: #111827;
        border-color: #374151;
      }

      .dark .dashboard-range-picker .react-datepicker__day {
        color: #e5e7eb;
      }

      .dark .dashboard-range-picker .react-datepicker__day-name {
        color: #9ca3af;
      }

      .dark .dashboard-range-picker .react-datepicker__day--disabled {
        color: #4b5563 !important;
      }
    `}
          </style>

          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
            Date
          </label>

          <button
            type="button"
            onClick={() => setDateOpen(!dateOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <span
              className={
                selectedDate
                  ? "truncate text-gray-900 dark:text-white"
                  : "truncate text-gray-400"
              }
            >
              {selectedDate
                ? `${format(selectedDate, "MMM dd, yyyy")} - ${format(
                  selectedEndDate || selectedDate,
                  "MMM dd, yyyy"
                )}`
                : "Select Date Range"}
            </span>

            <CalendarIcon />
          </button>

          {dateOpen && (
            <div className="dashboard-range-picker absolute right-0 z-50 mt-2 rounded-2xl bg-white p-3 shadow-2xl dark:bg-gray-900">
              <DatePicker
                key={`${selectedYear}-${selectedMonth}`}
                selected={selectedDate}
                onChange={(dates) => {
                  const [start, end] = dates;

                  setSelectedDate(start);
                  setSelectedEndDate(end);

                  if (start && end) {
                    setDateOpen(false);
                  }
                }}
                startDate={selectedDate}
                endDate={selectedEndDate}
                selectsRange
                inline
                openToDate={selectedDate || monthStartDate}
                minDate={monthStartDate}
                maxDate={monthEndDate}
                renderCustomHeader={() => null}
              />

              <div className="mt-3 flex gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedEndDate(null);
                    setDateOpen(false);
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setDateOpen(false)}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        {/* <div className="relative" ref={dateRef}>
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
        </div> */}

      </div>
    </div>
  );
}