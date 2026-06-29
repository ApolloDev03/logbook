import { useEffect, useState } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

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
    console.error("Invalid auth_user", error);
    return null;
  }
};

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
    <path d="M3 21H21M5 21V3H12V21M14 21V8H19V21M8 7H9M8 11H9M8 15H9M16 12H17M16 16H17" />
  </svg>
);
const UsersIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
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

export default function EngineerDashboard() {
  
  const { darkMode } = useApp();
const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [dashboardData, setDashboardData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sortDir, setSortDir] = useState(true);
  const [sortCol, setSortCol] = useState(null);
  const [loading, setLoading] = useState(false);

  const tickColor = darkMode ? "#98a2b3" : "#667085";
  const gridColor = darkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6";
  const [viewModalOpen, setViewModalOpen] = useState(false);
const [selectedLog, setSelectedLog] = useState(null);
const [viewLoading, setViewLoading] = useState(false);

const closeViewModal = () => {
  setSelectedLog(null);
  setViewModalOpen(false);
};

  const formatLogIdWithPrefix = (log) => {
    if (!log?.log_id) return "-";

    const prefix =
      log?.customer_prefix ||
      log?.prefix ||
      log?.log_prefix ||
      log?.company_prefix ||
      "";

    const id = String(log.log_id).padStart(4, "0");

    return prefix ? `${prefix}-${id}` : id;
  };
const authUser = getAuthUser();
const roleId = Number(
  authUser?.role_id ?? authUser?.customer?.role_id
);
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const customerRoleId = authUser?.customer?.role_id; 
      const payload = {
        customer_id: authUser?.customer?.customer_id || "",
        created_by_id: authUser?.id || "",
        role_id: String(authUser?.role_id || ""),
        is_admin_engineer: Number(customerRoleId) === 1 ? 1 : null,
      };

      console.log("Engineer Dashboard Payload:", payload);

      const response = await axios.post(
        `${apiUrl}/auth/dashboard`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );

      if (response.data?.success) {
        const data = response.data.data;
        setDashboardData(data);

        const recentLogsData = (data?.recent_logs || []).map((item) => ({
          id: `FS-${String(item.log_id).padStart(4, "0")}`,
          log_id: item.log_id,
          type: item.log_type || "-",
          engineer: item.engineer || "-",
          customer: item.customer_company || "-",
          building: item.building || "-",
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        }));

        setLogs(recentLogsData);
      }
    } catch (error) {
      console.error("Engineer dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);
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
      closeViewModal();
    }
  } catch (error) {
    console.error(error);
    closeViewModal();
  } finally {
    setViewLoading(false);
  }
};
  const summary = dashboardData?.summary || {};

  const metrics = [
    {
        label: "Engineers",
        value: summary.total_employee || 0,
        icon: <UsersIcon />,
        permissionName: "Employee Management",
      },
      {
        label: "Customers",
        value: summary.total_customers || 0,
        icon: <UsersIcon />,
        permissionName: "Customer Management",
      },
    {
      label: "Total Buildings",
      value: loading ? "..." : summary.total_buildings || 0,
      icon: <BuildingIcon />,
      permissionName: "Building Management",
    },
    {
      label: "Total Logs",
      value: loading ? "..." : summary.total_logs || 0,
      icon: <LogIcon />,
       permissionName: "Log Management",
    },{
        label: "Today Logs",
        value: summary.today_logs || 0,
        icon: <LogIcon />,
        permissionName: "Log Management",
      },
     {
        label: "System",
        value: summary.total_components || 0,
        icon: <ComponentIcon />,
         permissionName: "System Management",
      },
  ];

  const monthlyLogsData = MONTHS.map((month) => {
    const found = (dashboardData?.monthly_logs || []).find(
      (item) => String(item.month).slice(0, 3) === month,
    );

    return found ? Number(found.count) : 0;
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Logs",
        data: monthlyLogsData,
        backgroundColor: "#1570ef",
        hoverBackgroundColor: "#528bff",
        borderRadius: 6,
        barPercentage: 0.42,
        categoryPercentage: 0.65,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? "#374151" : "#ffffff",
        titleColor: darkMode ? "#ffffff" : "#344054",
        bodyColor: darkMode ? "#ffffff" : "#344054",
        borderColor: darkMode ? "#4b5563" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        caretSize: 6,
        cornerRadius: 6,
        callbacks: {
          title: () => "",
          label: (context) => `Logs: ${context.raw}`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: tickColor,
          font: {
            size: 11,
          },
        },
      },

      y: {
        min: 0,
        max: 400,
        ticks: {
          stepSize: 100,
          color: tickColor,
          font: {
            size: 11,
          },
          callback: function (value) {
            return value;
          },
        },
        grid: {
          color: gridColor,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const logTypes = dashboardData?.log_types || [];

  const donutData = {
    labels: logTypes.length
      ? logTypes.map((item) => item.type_name || "-")
      : ["No Logs"],
    datasets: [
      {
        data: logTypes.length
          ? logTypes.map((item) => Number(item.count))
          : [1],
        backgroundColor: logTypes.length
          ? ["#55acee", "#ffa85c", "#ff5d67", "#10c875", "#465fff", "#9b5cff"]
          : ["#e5e7eb"],
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
          padding: 14,
          usePointStyle: false,
          boxWidth: 38,
          boxHeight: 12,
        },
      },
    },
  };
  const hasReadPermission = (permissionName) => {
    //if (authUser?.role_id === 1) return true;
    
const permissions = Array.isArray(authUser?.permissions)
    ? authUser.permissions
    : [];

    return permissions?.some(
      (p) =>
        p.permission_name === permissionName &&
        Number(p.read) === 1
    );
  };
  const handleSort = (colKey) => {
    const dir = sortCol === colKey ? !sortDir : true;

    setSortDir(dir);
    setSortCol(colKey);

    setLogs(
      [...logs].sort((a, b) => {
        const first = String(a[colKey] || "");
        const second = String(b[colKey] || "");

        return dir ? first.localeCompare(second) : second.localeCompare(first);
      }),
    );
  };

  return (
    <>
    <PeriodFilter
  selectedPeriod={selectedPeriod}
  setSelectedPeriod={setSelectedPeriod}
/>
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* LEFT SIDE */}
        <div className="col-span-12 xl:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics
             .filter((m) => hasReadPermission(m.permissionName))
            .map((m) => (
              <div key={m.label} className="card rounded-2xl p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white">
                  {m.icon}
                </div>

                <span className="mt-4 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  {m.label}
                </span>

                <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">
                  {m.value}
                </h4>
              </div>
            ))}
          </div>

          <div className="card mt-6 rounded-2xl p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Monthly Logs
              </h3>

              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                ⋮
              </button>
            </div>

            <div className="h-[220px] w-full sm:h-[260px] xl:h-[180px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-12 xl:col-span-5">
          <div className="card h-full rounded-2xl p-4 sm:p-6">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Purpose of Visit
            </h3>

            <div className="h-[380px]">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>
        </div>

        {/* RECENT LOG TABLE */}
        <div className="col-span-12">
          <div className="card overflow-hidden rounded-xl">
            <div className="m-4 sm:m-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Recent Logs
              </h3>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full border border-gray-200 text-left text-sm dark:border-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {[
                      ["id", "Log ID"],
                      ["type", "Purpose of Visit"],
                      ["engineer", "Engineer"],
                      ["customer", "Customer"],
                      ["building", "Building"],
                      ["date", "Date"],
                    ].map(([k, label]) => (
                      <th
                        key={k}
                        className="table-th cursor-pointer whitespace-nowrap"
                        onClick={() => handleSort(k)}
                      >
                        {label}
                      </th>
                    ))}

                    <th className="table-th whitespace-nowrap">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length > 0 ? (
                    logs.map((row) => (
                      <tr key={row.log_id || row.id} className="table-row">
        <td   onClick={() => getLogById(row.log_id)} className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 ">
                      
                            {row.id}
                        </td>
                        <td className="table-td whitespace-nowrap">
                          {row.type}
                        </td>
                        <td className="table-td whitespace-nowrap">
                          {row.engineer}
                        </td>
                        <td className="table-td whitespace-nowrap">
                          {row.customer}
                        </td>
                        <td className="table-td whitespace-nowrap">
                          {row.building}
                        </td>
                        <td className="table-td whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="table-td whitespace-nowrap">
                         <button
  type="button"
  onClick={() => getLogById(row.log_id)}
  className="text-green-500 hover:text-green-700"
>
  <EyeIcon />
</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {loading ? "Loading..." : "No recent logs found"}
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
    
                  {selectedLog?.entry_on_place
                    ? <>
                      <span className="font-semibold">Generate Via:</span> {selectedLog?.entry_on_place == "2" ? "Manual Search" : (selectedLog?.entry_on_place == "1") ? "scanner" : "Admin"}
                    </>
                    : "Loading log information"
                  }
    
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
                   
                   {
                    roleId != 3 &&
                    <Info
                      label="Customer Name"
                      value={selectedLog?.customer_name}
                    />
                   }
    
                    <Info
                      label="Building Name"
                      value={selectedLog?.building_name}
                    />
                    <Info label="Postcode" value={selectedLog?.postcode} />
                    <Info label="Country" value={selectedLog?.country_name} />
                    <Info label="State" value={selectedLog?.state_name} />
                    <Info label="City" value={selectedLog?.city_name} />
                    <Info label="Landmark" value={selectedLog?.landmark} />
    
    
                    <Info label="Address" value={selectedLog?.address} />
    
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
                          label="start Time"
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