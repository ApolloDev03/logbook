import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PopupModal from "../components/ui/PopupModal";
import axios from "axios";
import { toast } from "react-toastify";
import { apiUrl } from "../config";
import { format } from "date-fns";

export default function BuildingLogs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const buildingId = searchParams.get("building_id");

  const [logReports, setLogReports] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const headerInfo = logReports?.[0] || null;
  const [viewLoading, setViewLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [logPagination, setLogPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

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
        `${apiUrl}/auth/log_by_id`,
        {
          log_id: String(logId),
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
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

  const closeViewModal = () => {
    setSelectedLog(null);
    setViewModalOpen(false);
  };
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "-";

    return format(date, "dd-MM-yyyy");
  };

  // const formatDateTime = (dateValue) => {
  //   if (!dateValue) return "-";

  //   const date = new Date(dateValue);

  //   if (Number.isNaN(date.getTime())) return "-";

  //   return format(date, "MMM dd, yyyy hh:mm a");
  // };

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
  const calculateDuration = (startTime, finishTime) => {
    if (!startTime || !finishTime) return "-";

    const start = new Date(startTime);
    const finish = new Date(finishTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(finish.getTime())) {
      return "-";
    }

    const diffMs = finish - start;

    if (diffMs < 0) return "-";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${minutes}m`;
  };
  const fetchBuildingLogs = async (page = 1) => {
    if (!buildingId) return;

    try {
      setLogLoading(true);
      setLogError("");

      const response = await axios.post(
        `${apiUrl}/auth/bilding_logList`,
        {
          page,
          limit: 10,
          customer_id: "",
          created_by_id: "",
          start_date: "",
          end_date: "",
          building_id: String(buildingId),
        },
        {
          //  headers: getAuthHeaders(),
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      const result = response.data;

      if (result?.success) {
        setLogReports(Array.isArray(result?.data) ? result.data : []);

        setLogPagination({
          page: Number(result?.page || 1),
          limit: Number(result?.limit || 10),
          total: Number(result?.total || 0),
          total_pages: Number(result?.total_pages || 1),
        });
      } else {
        setLogReports([]);
        setLogError(result?.message || "Logs not found.");
      }
    } catch (error) {
      setLogReports([]);
      setLogError(
        error?.response?.data?.message ||
        "Something went wrong while fetching logs."
      );
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    if (!buildingId) {
      navigate("/engineer-scan", { replace: true });
      return;
    }

    fetchBuildingLogs(1);
  }, [buildingId]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-900">
                Building
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-400">
                {headerInfo?.building_name || "-"}
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                Address : {headerInfo?.address || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-900">
                Company
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-400">
                {headerInfo?.customer_company_name || "-"}
              </h3>
              <p className="mt-1 text-xs text-slate-700">
                Postcode :  {headerInfo?.postcode || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-900">
                Customer
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-400">
                {headerInfo?.customer_name || "-"}
              </h3>

            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Powered By
              </span>

              <img
                src="/images/logo/logo-dark.svg" // Update with your actual logo path
                alt="Fire Systems"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Inspection Date</th>
                  <th className="px-6 py-4">Log ID</th>

                  <th className="px-6 py-4">Engineer</th>
                  <th className="table-th whitespace-nowrap">
                    System & Purpose
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {logLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : logError ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-red-500"
                    >
                      {logError}
                    </td>
                  </tr>
                ) : logReports.length > 0 ? (
                  logReports.map((item) => (
                    <tr key={item.log_id} className="hover:bg-slate-50">
                      <td className="px-6 py-5">
                        {formatDate(item.created_at)}
                      </td>
                      <td
                        onClick={() => {
                          console.log("Clicked Log:", item);
                          setSelectedLog(item); setViewModalOpen(true);
                        }
                        }
                        className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 "
                      >
                        {formatLogIdWithPrefix(item)}
                      </td>

                      <td className="px-6 py-5">
                        {item.created_by_name || "-"}
                      </td>
                      <td className="table-td whitespace-nowrap">
                        {item?.maintenance_entries?.map((entry, index) => (
                          <div className="">
                            <span className="text-black dark:text-white">
                              {entry?.component_name}
                            </span>
                            {" - "}
                            <span className="text-black dark:text-white">
                              {entry?.maintenance_cycle_name}
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No logs found for this building.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>
              Showing {logReports.length > 0 ? 1 : 0} to {logReports.length} of{" "}
              {logPagination.total} entries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={logPagination.page <= 1 || logLoading}
                onClick={() => fetchBuildingLogs(logPagination.page - 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                {logPagination.page}
              </button>

              <button
                type="button"
                disabled={
                  logPagination.page >= logPagination.total_pages || logLoading
                }
                onClick={() => fetchBuildingLogs(logPagination.page + 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="block text-xs font-semibold uppercase text-gray-900 dark:text-gray-200">
                  LOG ID
                </span>
                <span className="font-medium text-gray-400 dark:text-gray-200">
                  {selectedLog?.log_id ? formatLogIdWithPrefix(selectedLog) : "-"}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="block text-xs font-semibold uppercase text-gray-900 dark:text-gray-200">
                  Create Date
                </span>
                <span className="font-medium text-gray-400 dark:text-gray-200">
                  {selectedLog?.created_at ? formatDate(selectedLog?.created_at) : "-"}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="block text-xs font-semibold uppercase text-gray-900 dark:text-gray-200">
                  Generate Via
                </span>
                <span className="font-medium text-gray-400 dark:text-gray-200">
                  {selectedLog?.entry_on_place != null
                    ? selectedLog?.entry_on_place == "2"
                      ? "Manual Search"
                      : selectedLog?.entry_on_place == "1"
                        ? "Scanner"
                        : "Admin"
                    : "-"}
                </span>
              </div>
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
                    label="Customer Name"
                    value={selectedLog?.customer_name}
                  />

                  <Info
                    label="Building Name"
                    value={selectedLog?.building_name}
                  />
                  <Info label="Postcode" value={selectedLog?.postcode} />
                  {/* <Info label="Country" value={selectedLog?.country_name} />
                        <Info label="State" value={selectedLog?.state_name} />
                        <Info label="City" value={selectedLog?.city_name} /> */}
                  <Info label="Access Information" value={selectedLog?.landmark} />


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
                      <Info
                        label="Duration"
                        value={calculateDuration(entry?.start_time, entry?.finish_time)}
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
      </div>
    </div>

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