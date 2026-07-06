import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useApp } from "../context/AppContext";
import { apiUrl } from "../config";
import PeriodFilter from "../components/ui/PeriodFilter";
import PopupModal from "../components/ui/PopupModal";
import { format } from "date-fns";
import DashboardFilters from "../components/ui/DashboardFilters";

const getToken = () => localStorage.getItem("auth_token") || "";

const getAuthHeaders = () => {
  const token = getToken();

  return {
    Authorization: token,
    token: token,
    "x-access-token": token,
    "Content-Type": "application/json",
  };
};

const getAuthUser = () => {
  try {
    const authUserRaw = localStorage.getItem("auth_user");
    return authUserRaw ? JSON.parse(authUserRaw) : null;
  } catch (error) {
    console.error("Invalid auth_user in localStorage", error);
    return null;
  }
};

/* ✅ ApexCharts જેવી vertical gray hover background plugin */
const hoverBackgroundPlugin = {
  id: "hoverBackgroundPlugin",

  beforeDatasetsDraw(chart) {
    const {
      ctx,
      chartArea: { top, bottom },
    } = chart;

    const activeElements = chart.tooltip?.getActiveElements();

    if (!activeElements || activeElements.length === 0) return;

    const activeElement = activeElements[0];
    const datasetIndex = activeElement.datasetIndex;
    const index = activeElement.index;

    const meta = chart.getDatasetMeta(datasetIndex);
    const bar = meta.data[index];

    if (!bar) return;

    const { x, width } = bar.getProps(["x", "width"], true);

    const hoverWidth = width + 7;

    const bgColor =
      chart.options.plugins.hoverBackgroundPlugin?.bgColor ||
      "rgba(229,231,235,0.9)";

    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.fillRect(x - width / 2 - 7, top, hoverWidth, bottom - top);
    ctx.restore();
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  hoverBackgroundPlugin,
);

const EyeIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.8 5.6C7.59 5.6 6.61 6.59 6.61 7.8C6.61 9.01 7.59 10 8.8 10C10.02 10 11 9.01 11 7.8C11 6.59 10.02 5.6 8.8 5.6ZM5.11 7.8C5.11 5.76 6.76 4.1 8.8 4.1C10.85 4.1 12.5 5.76 12.5 7.8C12.5 9.84 10.85 11.5 8.8 11.5C6.76 11.5 5.11 9.84 5.11 7.8ZM4.86 15.32C4.09 16.09 3.7 17.06 3.52 17.86C3.48 18 3.52 18.12 3.61 18.21C3.7 18.31 3.87 18.4 4.08 18.4H13.42C13.63 18.4 13.8 18.31 13.89 18.21C13.98 18.12 14.02 18 13.98 17.86C13.8 17.06 13.41 16.09 12.64 15.32C11.88 14.57 10.69 13.96 8.75 13.96C6.81 13.96 5.62 14.57 4.86 15.32ZM3.81 14.25C4.87 13.2 6.46 12.46 8.75 12.46C11.04 12.46 12.63 13.2 13.69 14.25C14.74 15.29 15.22 16.56 15.44 17.52C15.77 18.9 14.61 19.9 13.42 19.9H4.08C2.89 19.9 1.74 18.9 2.06 17.52C2.28 16.56 2.76 15.29 3.81 14.25ZM15.3 11.5C14.47 11.5 13.7 11.22 13.08 10.75C13.37 10.33 13.61 9.86 13.76 9.36C14.16 9.75 14.7 9.99 15.3 9.99C16.52 9.99 17.5 9.01 17.5 7.8C17.5 6.59 16.52 5.6 15.3 5.6C14.7 5.6 14.16 5.84 13.76 6.23C13.61 5.73 13.37 5.27 13.08 4.84C13.7 4.38 14.47 4.1 15.3 4.1C17.35 4.1 19 5.76 19 7.8C19 9.84 17.35 11.5 15.3 11.5ZM19.92 19.9H16.39C16.7 19.47 16.92 18.97 16.98 18.4H19.92C20.13 18.4 20.3 18.31 20.39 18.21C20.48 18.12 20.52 18 20.48 17.86C20.3 17.06 19.91 16.09 19.14 15.32C18.4 14.59 17.26 13.99 15.42 13.96C15.22 13.69 15 13.44 14.75 13.19C14.51 12.96 14.26 12.74 13.99 12.54C14.39 12.48 14.8 12.45 15.25 12.45C17.54 12.45 19.13 13.2 20.19 14.25C21.24 15.29 21.72 16.56 21.94 17.52C22.27 18.9 21.11 19.9 19.92 19.9Z"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21H21M5 21V3H11V21M13 21V9H19V21M7 7H9M7 11H9M7 15H9M15 13H17M15 17H17" />
  </svg>
);

const ComponentIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z" />
  </svg>
);

const LogIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 3H17L21 7V21H7V3Z" />
    <path d="M17 3V7H21" />
    <path d="M3 7V21H7" />
    <path d="M10 12H18M10 16H18" />
  </svg>
);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "dd-MM-yyyy");
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "dd-MM-yyyy hh:mm a");
};

const formatOnlyTime = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
};


export default function Dashboard() {
  const { darkMode } = useApp();
  // const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [dashboardData, setDashboardData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sortDir, setSortDir] = useState(true);
  const [sortCol, setSortCol] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const gridColor = darkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6";
  const tickColor = darkMode ? "#98a2b3" : "#667085";
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const getNearestSunday = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const day = d.getDay();

    const diff = day === 0 ? 0 : 7 - day;

    d.setDate(d.getDate() + diff);

    return format(d, "yyyy-MM-dd");
  };

  const formatLogIdWithPrefix = (log) => {
    if (!log?.company_unique_log_id) return "-";

    const prefix =
      log?.customer_prefix ||
      log?.prefix ||
      log?.log_prefix ||
      log?.company_prefix ||
      "";

    const id = String(log.company_unique_log_id).padStart(4, "0");

    return prefix ? `${prefix}-${id}` : id;
  };
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const authUser = getAuthUser();

      const roleId =
        authUser?.role_id || localStorage.getItem("auth_role_id") || "";

      const roleName = String(authUser?.role_name || "").toLowerCase();
      const isEngineer = roleName.includes("engineer");

      const payload = {
        customer_id: authUser?.customer_id || "",
        created_by_id: isEngineer ? authUser?.id || "" : "",
        role_id: String(roleId),
        is_admin_engineer: isEngineer ? 1 : "",
      }
      if (selectedYear) {
        payload.year = String(selectedYear);
      }

      if (selectedMonth !== null) {
        payload.month = String(selectedMonth + 1);
      }

      if (selectedDate) {
        payload.start_date = format(selectedDate, "yyyy-MM-dd");
        payload.end_date = getNearestSunday(selectedDate);
      }


      const response = await axios.post(`${apiUrl}/auth/dashboard`, payload, {
        headers: getAuthHeaders(),
      });

      if (response.data?.success) {
        const data = response.data.data;
        setDashboardData(data);

        const recentLogs = (data?.recent_logs || []).map((item) => ({
          // id: `FS-${String(item.log_id).padStart(4, "0")}`,          
          id: item.company_unique_log_id,
          log_id: item.log_id,          
          type: `${item.details[0].System} - ${item.details[0].Purpose_of_Visit}`,
          engineer: item.engineer || "-",
          company: item.customer_company || "-",
          building: item.building || "-",
          postcode:  item.postcode || "-",
        }));

        setLogs(recentLogs);
      }
    } catch (error) {
      console.error("Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };
  const getLogById = async (logId) => {
    try {
      setSelectedLog(null);
      setViewModalOpen(true);
      setViewLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/get_log_by_id`,
        {
          log_id: String(logId),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response?.data?.success) {
        setSelectedLog(response?.data?.data || null);
      } else {
        setViewModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      setViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    setSelectedLog(null);
    setViewModalOpen(false);
  };
  useEffect(() => {
    fetchDashboard();
  }, [selectedYear, selectedMonth, selectedDate]);

  const summary = dashboardData?.summary || {};

  const metrics = useMemo(
    () => [
      {
        label: "Engineers",
        value: summary.total_employee || 0,
        icon: <UsersIcon />,
      },
      {
        label: "Customers",
        value: summary.total_customers || 0,
        icon: <UsersIcon />,
      },
      {
        label: "Buildings",
        value: summary.total_buildings || 0,
        icon: <BuildingIcon />,
      },
      {
        label: "Total Logs",
        value: summary.total_logs || 0,
        icon: <LogIcon />,
      },
      {
        label: "Today Logs",
        value: summary.today_logs || 0,
        icon: <LogIcon />,
      },
      {
        label: "System",
        value: summary.total_components || 0,
        icon: <ComponentIcon />,
      },
    ],
    [summary],
  );

  const dailyLogs = dashboardData?.daily_logs || [];

  const chartLabels = dailyLogs.map((item) => item.day);

  const chartData = dailyLogs.map((item) => Number(item.count));



  const maxValue = Math.max(...chartData, 10);
  const yMax = Math.ceil(maxValue / 10) * 10;

  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Logs",
        data: chartData,
        backgroundColor: "#465fff",
        hoverBackgroundColor: "#78a9ff",
        borderRadius: {
          topLeft: 5,
          topRight: 5,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: "bottom",
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
      delay: (context) => {
        if (context.type !== "data" || context.mode !== "default") {
          return 0;
        }
        return context.dataIndex * 120;
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      hoverBackgroundPlugin: {
        bgColor: darkMode ? "rgba(75,85,99,0.55)" : "rgba(229,231,235,0.9)",
      },
      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? "#374151" : "#ffffff",
        titleColor: darkMode ? "#ffffff" : "#111827",
        bodyColor: darkMode ? "#ffffff" : "#111827",
        borderColor: darkMode ? "#4b5563" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 8,
        caretSize: 0,
        callbacks: {
          title: function () {
            return "";
          },
          labelPointStyle: function () {
            return {
              pointStyle: "circle",
              rotation: 0,
            };
          },
          labelColor: function () {
            return {
              backgroundColor: "#465fff",
              borderColor: "#465fff",
              borderWidth: 0,
            };
          },
          label: function (context) {
            return `Logs: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: tickColor,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          font: {
            family: "Outfit",
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: yMax,
        ticks: {
          stepSize: Math.max(1, Math.ceil(yMax / 5)),
          color: tickColor,
          font: {
            family: "Outfit",
            size: 11,
          },
          callback: function (value) {
            return value;
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const chartColors = [
    "#465FFF",
    "#11C26D",
    "#F3A754",
    "#F96868",
    "#62A9EB",
    "#9B5CFF",
    "#00C2FF",
    "#FF6384",
  ];

  const purposeOfVisit = dashboardData?.purpose_of_visit || [];

  const donutData = {
    labels: purposeOfVisit.length
      ? purposeOfVisit.map((item) => item.type_name)
      : ["No Data"],

    datasets: [
      {
        data: purposeOfVisit.length
          ? purposeOfVisit.map((item) => Number(item.count))
          : [1],

        backgroundColor: purposeOfVisit.length
          ? purposeOfVisit.map((_, index) => chartColors[index % chartColors.length])
          : ["#465FFF"], // Blue when no data

        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: tickColor,
          font: {
            family: "Outfit",
            size: 12,
          },
          padding: 12,
          boxWidth: 40,
          boxHeight: 12,
        },
      },
    },
  };

  const handleSort = (colKey) => {
    const dir = sortCol === colKey ? !sortDir : true;
    setSortDir(dir);
    setSortCol(colKey);

    const sorted = [...logs].sort((a, b) => {
      const first = String(a[colKey] || "");
      const second = String(b[colKey] || "");

      return dir ? first.localeCompare(second) : second.localeCompare(first);
    });

    setLogs(sorted);
  };

  return (
    <>

      {/* <PeriodFilter
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}

      /> */}

      <DashboardFilters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left col */}
          <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-7">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="
                  card rounded-2xl p-3
                  min-h-[112px]
                  flex flex-col justify-between
                  sm:min-h-[135px] sm:p-5
                  lg:min-h-[150px] lg:p-6
                "
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white sm:h-11 sm:w-11 lg:h-12 lg:w-12">
                    <span className="[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
                      {m.icon}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400 sm:text-sm">
                      {m.label}
                    </span>

                    <h4 className="mt-1 text-lg font-bold text-gray-800 dark:text-white/90 sm:text-2xl lg:text-3xl">
                      {loading ? "..." : m.value}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="card overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                  Daily Logs
                </h3>

                {/* <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setDropOpen((v) => !v)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.24 6C10.24 5.03 11.03 4.25 12 4.25H12.01C12.97 4.25 13.75 5.03 13.75 6C13.75 6.97 12.97 7.75 12.01 7.75H12C11.03 7.75 10.24 6.97 10.24 6ZM10.24 18C10.24 17.03 11.03 16.25 12 16.25H12.01C12.97 16.25 13.75 17.03 13.75 18C13.75 18.97 12.97 19.75 12.01 19.75H12C11.03 19.75 10.24 18.97 10.24 18ZM12 10.25C11.03 10.25 10.24 11.03 10.24 12C10.24 12.97 11.03 13.75 12 13.75H12.01C12.97 13.75 13.75 12.97 13.75 12C13.75 11.03 12.97 10.25 12.01 10.25H12Z"
                      />
                    </svg>
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 top-8 z-20 w-[190px] max-w-[calc(100vw-32px)] rounded-2xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-[#1a2231]">
                      {[
                        "View Quarterly Logs",
                        "View Half Yearly Logs",
                        "View Yearly Logs",
                      ].map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setDropOpen(false)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </div> */}
              </div>

              <div className="h-[220px] w-full sm:h-[260px] xl:h-[180px]">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="col-span-12 xl:col-span-5">
            <div className="card rounded-2xl p-4 sm:p-5 md:p-6">
              <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                Purpose of Visit
              </h4>

              <div className="h-[280px] sm:h-[330px] md:h-[370px]">
                <Doughnut data={donutData} options={donutOptions} />
              </div>
            </div>
          </div>

          {/* Recent Logs Table */}
          <div className="col-span-12">
            <div className="card overflow-hidden rounded-xl">
              <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 md:flex-row md:items-center">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                 Log of the Day
                </h3>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="min-w-[700px] w-full border border-gray-200 text-left text-sm dark:border-gray-800">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800"
                       onClick={() => handleSort("log_id")}                
                    >
                                        
                <th className="table-th whitespace-nowrap">
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold"
                  >
                    Log ID
                  </button>
                </th>
                 {/* { (authUser.role_id === 1 || authUser.customer?.customer_id === null) && ( */}
                  <th className="table-th whitespace-nowrap">Company Name </th>
                {/* )}  */}
                <th className="table-th whitespace-nowrap">
                  System & Purpose
                </th>
                <th className="table-th whitespace-nowrap">Building</th>
                <th className="table-th whitespace-nowrap">Postcode</th>
                <th className="table-th whitespace-nowrap">Engineer</th>
                                
                    </tr>
                  </thead>

                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((row) => (
                        <tr key={row.log_id || row.id} className="table-row">
                          <td onClick={() => getLogById(row.log_id)} className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 ">

                            {row.id}
                          </td>
  <td className="table-td whitespace-nowrap">
                            {row.company}
                          </td>
                          <td className="table-td whitespace-nowrap">
                            {row.type}
                          </td>                     
                        
                          <td className="table-td whitespace-nowrap">
                            {row.building}
                          </td>
<td className="table-td whitespace-nowrap">
                            {row.postcode}
                          </td>
                           <td className="table-td whitespace-nowrap">
                            {row.engineer}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          {loading ? "Loading..." : "No Today Log found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="block border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:hidden">
                Swipe left/right to view full table.
              </div>
            </div>
          </div>
        </div>
      </div>
      <PopupModal
        open={viewModalOpen}
        onClose={closeViewModal}
        maxWidth="max-w-[900px]"
        className="px-3 py-4 sm:px-4 sm:py-6"
        bodyClassName="max-h-[92vh] p-5 sm:p-8"
      >
        <button
          type="button"
          onClick={closeViewModal}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl leading-none text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          ×
        </button>

        <div className="mb-6 pr-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            View Log Details
          </h2>
          <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">

              {selectedLog?.log_id
                ? <>
                  <span className="font-semibold">LOG ID :</span> {formatLogIdWithPrefix(selectedLog)}
                </>
                : "Loading log information"
              }

            </span>
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">

              {selectedLog?.entry_date
                ? <>
                  <span className="font-semibold">Create Date :</span> {formatDateTime(selectedLog?.entry_date)}
                </>
                : "Loading log information"
              }

            </span>
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedLog?.entry_on_place !== undefined &&
                selectedLog?.entry_on_place !== null ? (
                <>
                  <span className="font-semibold">Generate Via:</span>{" "}
                  {Number(selectedLog.entry_on_place) === 0
                    ? "Manual"
                    : Number(selectedLog.entry_on_place) === 1
                      ? "Scanner"
                      : Number(selectedLog.entry_on_place) === 2
                        ? "Mobile Manual"
                        : ""}
                </>
              ) : null}
            </span>
          </div>
        </div>

        {viewLoading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Loading log details...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
              <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                Customer & Building Information
              </h3>

              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">

                <Info
                  label="Company Name"
                  value={selectedLog?.customer_name}
                />

                <Info
                  label="Building Name"
                  value={selectedLog?.building_name}
                />
                <Info label="UPRN" value={selectedLog?.uprn_no} />    
                <Info label="Address Line 1" value={selectedLog?.address} />
                <Info label="Address Line 2" value={selectedLog?.address_line_2} />
                <Info label="Country" value={selectedLog?.country_name} />
                 {!["uk", "united kingdom","United Kingdom"].includes(
                  selectedLog?.country_name?.toLowerCase()
                ) && (
                    <Info
                      label="State"
                      value={selectedLog?.state_name}
                    />
                  )}
                <Info label="City" value={selectedLog?.city_name} />
                 <Info label="Postcode" value={selectedLog?.postcode} />
                <Info label="Access Information" value={selectedLog?.landmark} />


              </div>
            </div>

            {selectedLog?.maintenance_entries?.length > 0 ? (
              selectedLog.maintenance_entries.map((entry) => (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                  <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                    {entry?.component_name}
                  </h3>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">

                    <Info
                      label="Purpose of Visit"
                      value={entry?.maintenance_cycle_name}
                    />
                    <Info
                      label="Date"
                      value={formatDate(entry?.entry_date)}
                    />
                    <Info
                      label="Start Time"
                      value={`${formatOnlyTime(entry?.start_time)} `}
                    />
                    <Info
                      label="End Time"
                      value={`${formatOnlyTime(
                        entry?.finish_time,
                      )} `}
                    />
                    <Info label="Remidial Action Taken" value={entry?.remark || "-"} />
                  </div>
                </div>

              ))
            ) : (
              <div className="rounded-2xl border border-gray-200 p-4 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No maintenance entries found
              </div>
            )}


            <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
              <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                Engineer Information
              </h3>

              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
                <Info
                  label="Engineer Name"
                  value={selectedLog?.created_by_name}
                />
                <Info
                  label="Engineer Email"
                  value={selectedLog?.created_by_email}
                />
              </div>
            </div>
          </div>
        )}
      </PopupModal>
    </>
  );
}


function Info({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-900 dark:text-gray-400">{label}</p>
      <p className="break-words text-sm  text-gray-500 dark:text-white">
        {value || "-"}
      </p>
    </div>
  );
}