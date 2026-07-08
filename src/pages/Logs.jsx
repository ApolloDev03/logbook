import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumb from "../components/ui/Breadcrumb";
import PopupModal from "../components/ui/PopupModal";
// import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { apiUrl } from "../config";

// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const DownloadIcon = () => (
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
      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
    />
  </svg>
);

const PrintIcon = () => (
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
      d="M6 9V4h12v5M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v6H6v-6z"
    />
  </svg>
);

const SelectArrow = () => (
  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M4.79 7.4L10 12.6L15.21 7.4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

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
    return JSON.parse(localStorage.getItem("auth_user") || "{}");
  } catch (error) {
    return {};
  }
};

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

const escapeExcelValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    customerId: "",
    buildingId: "",
    fromDate: "",
    toDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [printLoadingId, setPrintLoadingId] = useState(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const datePickerRef = useRef(null);

  // const [range, setRange] = useState([
  //   {
  //     startDate: new Date(),
  //     endDate: new Date(),
  //     key: "selection",
  //   },
  // ]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "log_id",
    direction: "desc",
  });
  const authUser = getAuthUser();

  const roleId = Number(
    authUser?.role_id ?? authUser?.customer?.role_id
  );
  const logManagementPermission = (authUser?.permissions || []).find((item) => {
    const permissionName = String(item?.permission_name || "")
      .trim()
      .toLowerCase();

    return (
      Number(item?.permission_id) === 7 || permissionName === "log management"
    );
  });

  const isFullActionRole = roleId === 1 || roleId === 3;

  const canReadLog =
    isFullActionRole || Number(logManagementPermission?.read || 0) === 1;

  const canWriteLog =
    isFullActionRole || Number(logManagementPermission?.write || 0) === 1;



  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       datePickerRef.current &&
  //       !datePickerRef.current.contains(event.target)
  //     ) {
  //       setShowDatePicker(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  useEffect(() => {
    if (viewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [viewModalOpen]);

  const getCustomerDropdown = async () => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setCustomerLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/customerDropdownList`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setCustomerList(response?.data?.data || []);
      } else {
        setCustomerList([]);
        toast.error(response?.data?.message || "Customer list not found.");
      }
    } catch (error) {
      setCustomerList([]);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load customer list.",
      );
    } finally {
      setCustomerLoading(false);
    }
  };
  const getBuildingList = async (customerId = "") => {
    try {
      setBuildingLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/get_buildings_by_customer`,
        {
          customer_id: customerId || "",
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response?.data?.success) {
        setBuildingList(response?.data?.data || []);
      } else {
        setBuildingList([]);
      }
    } catch (error) {
      setBuildingList([]);
    } finally {
      setBuildingLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?.role_id === 1) return;

    const customerId = authUser?.customer?.customer_id;

    if (customerId) {
      getBuildingList(customerId);
    }
  }, []);

  useEffect(() => {
    getCustomerDropdown();
    getLogList(1);
    getBuildingList("");
  }, []);

  const getLogList = async (pageNumber = 1, customLimit = limit, customFilters = filters) => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setLoading(true);

      const payload = {
        page: pageNumber,
        limit: customLimit,
        search: customFilters.search || "",

        building_id: customFilters.buildingId || "",
        created_by_id:
          authUser?.role_id === 1 || authUser?.role_id === 3
            ? null
            : authUser?.id,
        customer_id:
          authUser?.role_id == 3
            ? customFilters.customerId || authUser?.customer.customer_id
            : customFilters.customerId,
        start_date: customFilters.fromDate || "",
        end_date: customFilters.toDate || "",
      };

      const response = await axios.post(`${apiUrl}/auth/log_list`, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        const apiLogs = response?.data?.data || [];
        setLogs(sortLogs(apiLogs, sortConfig.key, sortConfig.direction));
        setPage(response?.data?.page || pageNumber);
        setTotal(response?.data?.total || apiLogs.length || 0);
        setTotalPages(response?.data?.total_pages || 1);
      } else {
        setLogs([]);
        setTotal(0);
        setTotalPages(1);
        toast.error(response?.data?.message || "Logs not found.");
      }
    } catch (error) {
      setLogs([]);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load logs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getLogById = async (logId) => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

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
        },
      );

      if (response?.data?.success) {
        setSelectedLog(response?.data?.data || null);
      } else {
        toast.error(response?.data?.message || "Log details not found.");
        closeViewModal();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load log details.",
      );
      closeViewModal();
    } finally {
      setViewLoading(false);
    }
  };

  const printLog = async (logId) => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setPrintLoadingId(logId);

      const response = await axios.post(
        `${apiUrl}/auth/print_log`,
        {
          log_id: String(logId),
        },
        {
          headers: getAuthHeaders(),
          responseType: "text",
        },
      );

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast.error("Please allow popup to print log.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(response.data);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to print log.",
      );
    } finally {
      setPrintLoadingId(null);
    }
  };

  const downloadExcelRecord = async (log) => {
    try {
      if (!log?.log_id) {
        toast.error("Log ID not found.");
        return;
      }

      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDownloadLoadingId(log.log_id);

      const response = await axios.post(
        `${apiUrl}/auth/export_log`,
        {
          log_id: String(log.log_id), // static "1" nahi, actual row id
        },
        {
          headers: getAuthHeaders(),
          responseType: "blob",
        },
      );

      // If API returns JSON error inside blob
      const contentType = response.headers["content-type"];

      if (contentType && contentType.includes("application/json")) {
        const text = await response.data.text();
        const json = JSON.parse(text);

        toast.error(json?.message || "Export failed.");
        return;
      }

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `maintenance-log-${log.log_id}.xlsx`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded successfully.");
    } catch (error) {
      let message = "Failed to download Excel.";

      // Error response also can be blob
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          message = json?.message || message;
        } catch { }
      } else {
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          message;
      }

      toast.error(message);
    } finally {
      setDownloadLoadingId(null);
    }
  };
  const closeViewModal = () => {
    setSelectedLog(null);
    setViewModalOpen(false);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setPage(1);
  };

  const clearDateRange = () => {
    setFilters((prev) => ({
      ...prev,
      fromDate: "",
      toDate: "",
    }));

    // setRange([
    //   {
    //     startDate: new Date(),
    //     endDate: new Date(),
    //     key: "selection",
    //   },
    // ]);

    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    getLogList(newPage);
  };

  const getShowingStart = () => {
    if (total === 0) return 0;
    return (page - 1) * limit + 1;
  };

  const getShowingEnd = () => {
    return Math.min(page * limit, total);
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
  const getSortValue = (log, key) => {
    if (key === "log_id") return Number(log?.log_id) || 0;
    if (key === "maintenance_type_name")
      return log?.maintenance_type_name || "";
    if (key === "customer_company_name")
      return log?.customer_company_name || "";
    if (key === "building_name") return log?.building_name || "";
    if (key === "postcode") return log?.postcode || "";
    if (key === "created_by_name") return log?.created_by_name || "";
    if (key === "inspection_date") {
      return new Date(log?.start_time || log?.created_at || "").getTime() || 0;
    }

    return log?.[key] || "";
    // return log?.[key] || "";
  };

  const sortLogs = (data, key, direction) => {
    return [...data].sort((a, b) => {
      const aValue = getSortValue(a, key);
      const bValue = getSortValue(b, key);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    setSortConfig({ key, direction });
    setLogs((prev) => sortLogs(prev, key, direction));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }

    return (
      <span className="ml-1 text-blue-500">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };
  const resetFilters = () => {
    // setFilters({
    //   search: "",
    //   customerId: "",
    //   buildingId: "",
    //   fromDate: "",
    //   toDate: "",
    // });

    const emptyFilters = {
      search: "",
      customerId: "",
      buildingId: "",
      fromDate: "",
      toDate: "",
    };

    setFilters(emptyFilters);
    setPage(1);

    if (authUser?.role_id === 1) {
      getBuildingList("");
    } else {
      getBuildingList(authUser?.customer?.customer_id || "");
    }

    getLogList(1, limit, emptyFilters);

    // setRange([
    //   {
    //     startDate: new Date(),
    //     endDate: new Date(),
    //     key: "selection",
    //   },
    // ]);

    setPage(1);


    if (authUser?.role_id === 1) {
      getBuildingList("");
    } else {
      getBuildingList(authUser?.customer?.customer_id || "");
    }


    getLogList(1);
  };

  const exportLogs = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/auth/export_log`,
        {
          search: filters.search || "",
          building_id: filters.buildingId || "",
          customer_id: filters.customerId || "",
          start_date: filters.fromDate || "",
          end_date: filters.toDate || "",
          postcode: "",
          address: "",
          address_line_2: "",
        },
        {
          headers: getAuthHeaders(),
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "text/csv",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `logs-report.csv`; // or .xlsx if API returns Excel
      document.body.appendChild(link);

      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Logs exported successfully.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to export logs."
      );
    }
  };
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Log Reports
        </h1>

        <Breadcrumb pageName="Logs Reports" parentPage="Reports Management" />
      </div>

      <div className="card overflow-visible rounded-xl">
        <div className="m-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <input
              type="text"
              placeholder="Search List In Postcode,Address..."
              className="form-input"
              value={filters.search}
              onChange={(e) =>
                updateFilter("search", e.target.value)
              }
            />
            {authUser.role_id === 1 && (
              <div className="relative">
                <select
                  className="form-select"
                  value={filters.customerId}
                  onChange={(e) => {
                    const customerId = e.target.value;

                    setFilters((prev) => ({
                      ...prev,
                      customerId,
                      buildingId: "",
                    }));

                    // If company selected => company wise buildings
                    // If no company selected => all buildings
                    getBuildingList(customerId);
                  }}
                  disabled={customerLoading}
                >
                  <option value="">
                    {customerLoading ? "Loading..." : "Filter by Company"}
                  </option>

                  {customerList.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            )}

            <div className="relative">
              <select
                className="form-select"
                value={filters.buildingId}
                onChange={(e) => updateFilter("buildingId", e.target.value)}
                disabled={buildingLoading}
              >
                <option value="">All Buildings</option>

                {buildingList.map((building) => (
                  <option
                    key={building.building_id}
                    value={building.building_id}
                  >
                    {building.building_name}
                  </option>
                ))}
              </select>

              <SelectArrow />
            </div>

            <UniqueDateRangePicker
              value={{
                fromDate: filters.fromDate,
                toDate: filters.toDate,
              }}
              onChange={({ fromDate, toDate }) => {
                setFilters((prev) => ({
                  ...prev,
                  fromDate,
                  toDate,
                }));

                setPage(1);
              }}
              onClear={clearDateRange}
            />

          </div>
          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={() => getLogList(1)}
              className="btn-primary  disabled:cursor-not-allowed disabled:opacity-70"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={exportLogs}
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2  "
            >
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-left text-sm dark:border-gray-800">
            <thead>
              <tr
                onClick={() => handleSort("log_id")}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <th className="table-th whitespace-nowrap">
                  Inspection Date
                </th>
                <th className="table-th whitespace-nowrap">
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold"
                  >
                    Log ID
                  </button>
                </th>
                {(authUser.role_id === 1 || authUser.customer?.customer_id === null) && (
                  <th className="table-th whitespace-nowrap">Company Name </th>
                )}
                <th className="table-th whitespace-nowrap">
                  System & Purpose
                </th>
                <th className="table-th whitespace-nowrap">Building</th>
                <th className="table-th whitespace-nowrap">Postcode</th>
                <th className="table-th whitespace-nowrap">Engineer</th>
                <th className="table-th whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.log_id} className="table-row">
                    <td className="table-td whitespace-nowrap">
                      {formatDate(log.entry_date)}
                    </td>
                    <td
                      onClick={() => getLogById(log.log_id)}
                      className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 "
                    >
                      {formatLogIdWithPrefix(log)}
                    </td>
                    {(authUser.role_id === 1 || authUser.customer?.customer_id === null) && (
                      <td className="table-td whitespace-nowrap">
                        {log.customer_company_name || "-"}
                      </td>
                    )}
                    <td className="table-td whitespace-nowrap">
                      {log?.maintenance_entries?.map((entry, index) => (
                        <div>
                          <span className="">
                            {entry?.component_name}
                          </span>
                          {" - "}
                          <span>
                            {entry?.maintenance_cycle_name}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="table-td whitespace-nowrap">
                      {log.building_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {log.postcode || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {log.created_by_name || "-"}
                    </td>


                    <td className="table-td whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          title="View"
                          onClick={() => getLogById(log.log_id)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <EyeIcon />
                        </button>

                        {canWriteLog && (
                          <>
                            <button
                              type="button"
                              title="Print"
                              disabled={printLoadingId === log.log_id}
                              onClick={() => printLog(log.log_id)}
                              className="text-purple-500 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <PrintIcon />
                            </button>

                            {/* <button
                              type="button"
                              title="Download Excel"
                              disabled={downloadLoadingId === log.log_id}
                              onClick={() => downloadExcelRecord(log)}
                              className="text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <DownloadIcon />
                            </button> */}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show
            </span>

            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);

                setLimit(newLimit);
                setPage(1);

                // Fetch first page with new limit
                getLogList(1, newLimit);
              }}
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  disabled={loading}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${pageNumber === page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>
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
                  <span className="font-semibold">Create Date :</span> {formatDate(selectedLog?.entry_date)}
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

                {
                  roleId != 3 &&
                  <Info
                    label="Company Name"
                    value={selectedLog?.customer_company_name}
                  />
                }

                <Info
                  label="Building Name"
                  value={selectedLog?.building_name}
                />
                <Info label="UPRN" value={selectedLog?.uprn_no} />
                <Info label="Address Line 1" value={selectedLog?.address} />
                <Info label="Address Line 2" value={selectedLog?.address_line_2} />
                <Info label="Country" value={selectedLog?.country_name} />
                {!["uk", "united kingdom"].includes(
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

function UniqueDateRangePicker({
  value,
  onChange,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  const parseLocalDate = (dateValue) => {
    if (!dateValue) return null;

    const [yyyy, mm, dd] = dateValue.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  };

  const startDate = parseLocalDate(value.fromDate);
  const endDate = parseLocalDate(value.toDate);

  const displayDate =
    value.fromDate && value.toDate
      ? `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
      : "Select Date Range";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateChange = (dates) => {
    const [start, end] = dates;

    onChange({
      fromDate: start ? format(start, "yyyy-MM-dd") : "",
      toDate: end ? format(end, "yyyy-MM-dd") : "",
    });

    if (start && end) {
      setOpen(false);
    }
  };

  return (
    <>
      <style>
        {`
          .react-datepicker {
            border: none;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
            font-family: inherit;
          }

          .react-datepicker__header {
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
            padding: 15px 18px;
          }

          .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .calendar-title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
          }

          .calendar-arrow {
            width: 34px;
            height: 34px;
            border: none;
            background: transparent;
            border-radius: 8px;
            cursor: pointer;
            font-size: 22px;
          }

          .calendar-arrow:hover {
            background: #f3f4f6;
          }

          .react-datepicker__navigation {
            display: none;
          }

          .react-datepicker__current-month {
            display: none;
          }

          .react-datepicker__day-name {
            width: 2.6rem;
            line-height: 2.6rem;
            font-weight: 600;
            color: #6b7280;
          }

          .react-datepicker__day {
            width: 2.6rem;
            line-height: 2.6rem;
            margin: 2px;
            border-radius: 8px;
          }

          .react-datepicker__day:hover {
            background: #f3f4f6;
          }

          .react-datepicker__day--selected,
          .react-datepicker__day--in-selecting-range,
          .react-datepicker__day--in-range,
          .react-datepicker__day--range-start,
          .react-datepicker__day--range-end,
          .react-datepicker__day--keyboard-selected {
            background: #2563eb !important;
            color: #fff !important;
          }

          .react-datepicker__day--outside-month {
            color: #cbd5e1;
          }
        `}
      </style>

      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="form-input flex w-full items-center justify-between text-left"
        >
          <span
            className={
              value.fromDate && value.toDate
                ? "truncate text-gray-900 dark:text-white"
                : "truncate text-gray-400"
            }
          >
            {displayDate}
          </span>

          <CalendarIcon />
        </button>

        {open && (
          <div className="absolute left-1/2 top-full z-[9999] mt-3 w-[calc(100vw-32px)] max-w-[380px] -translate-x-1/2 rounded-2xl bg-white p-3 shadow-2xl dark:bg-gray-900 sm:left-0 sm:w-[380px] sm:translate-x-0 md:left-auto md:right-0 md:translate-x-0">
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              maxDate={new Date()}
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="calendar-header">
                  <button
                    type="button"
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    className="calendar-arrow"
                  >
                    &#10094;
                  </button>

                  <span className="calendar-title">
                    {format(date, "MMMM yyyy")}
                  </span>

                  <button
                    type="button"
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    className="calendar-arrow"
                  >
                    &#10095;
                  </button>
                </div>
              )}
            />

            <div className="mt-3 flex gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
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
