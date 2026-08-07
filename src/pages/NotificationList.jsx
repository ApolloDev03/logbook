import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";

const getToken = () => {
    return localStorage.getItem("auth_token") || "";
};

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
        return authUserRaw ? JSON.parse(authUserRaw) : {};
    } catch (error) {
        return {};
    }
};

const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    const [datePart, timePart] = String(dateValue).split(" ");

    if (!datePart) return "-";

    const [year, month, day] = datePart.split("-");

    if (!year || !month || !day) return dateValue;

    return `${day}-${month}-${year}${timePart ? ` ${timePart}` : ""}`;
};

export default function NotificationList() {
    const authUser = getAuthUser();

    const roleId = Number(authUser?.role_id || 0);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
    });

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const getCompanyId = () => {
        if (roleId === 3) {
            return String(
                authUser?.customer?.customer_id ||
                authUser?.company_id ||
                authUser?.customer_id ||
                ""
            );
        }

        return "";
    };

    const getNotificationLogList = async (
        pageNumber = 1,
        customLimit = limit,
        customFilters = filters
    ) => {
        try {
            const token = getToken();

            if (!token) {
                toast.error("Token not found. Please login again.");
                return;
            }

            setLoading(true);

            const response = await axios.post(
                `${apiUrl}/auth/notification_log_list`,
                {
                    company_id: getCompanyId(),
                    fromDate: customFilters.fromDate || "",
                    toDate: customFilters.toDate || "",
                    page: pageNumber,
                    limit: customLimit,
                },
                {
                    headers: getAuthHeaders(),
                }
            );

            if (response?.data?.success) {
                setNotifications(response?.data?.data || []);
                setPage(response?.data?.page || pageNumber);
                setLimit(Number(response?.data?.limit || customLimit));
                setTotal(response?.data?.total || 0);
                setTotalPages(response?.data?.total_pages || 1);
            } else {
                setNotifications([]);
                setTotal(0);
                setTotalPages(1);
                toast.error(response?.data?.message || "Notification list not found.");
            }
        } catch (error) {
            setNotifications([]);
            setTotal(0);
            setTotalPages(1);

            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to load notification list."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNotificationLogList(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        getNotificationLogList(newPage);
    };

    const getVisiblePages = () => {
        const visibleCount = 5;

        if (totalPages <= visibleCount) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const maxStartPage = totalPages - visibleCount + 1;
        const startPage = Math.min(page, maxStartPage);

        return Array.from(
            { length: visibleCount },
            (_, index) => startPage + index
        );
    };

    const getShowingStart = () => {
        if (total === 0) return 0;
        return (page - 1) * limit + 1;
    };

    const getShowingEnd = () => {
        return Math.min(page * limit, total);
    };

    const updateFilter = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));

        setPage(1);
    };

    const handleSearch = () => {
        getNotificationLogList(1, limit, filters);
    };

    const handleClear = () => {
        const emptyFilters = {
            fromDate: "",
            toDate: "",
        };

        setFilters(emptyFilters);
        setPage(1);
        getNotificationLogList(1, limit, emptyFilters);
    };

    return (
        <>
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Notification List
                </h1>

                <div className="w-full sm:w-auto">
                    <Breadcrumb
                        pageName="Notification List"
                        parentPage="Notifications"
                    />
                </div>
            </div>

            <div className="card overflow-hidden rounded-xl">
                <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[520px]">
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => updateFilter("fromDate", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />

                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => updateFilter("toDate", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={loading}
                            className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[980px] border border-gray-200 text-left text-sm dark:border-gray-800">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="table-th whitespace-nowrap">Sr. No</th>
                                <th className="table-th whitespace-nowrap">Datetime</th>
                                <th className="table-th whitespace-nowrap">Created By</th>
                                <th className="table-th whitespace-nowrap">Description</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        Loading notifications...
                                    </td>
                                </tr>
                            ) : notifications.length > 0 ? (
                                notifications.map((item, index) => (
                                    <tr key={item.notification_id} className="table-row">
                                        <td className="table-td whitespace-nowrap">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        <td className="table-td whitespace-nowrap">
                                            {formatDateTime(item.datetime || item.created_at)}
                                        </td>

                                        <td className="table-td whitespace-nowrap">
                                            {item.created_by_name || item.created_by || "-"}
                                        </td>

                                        <td className="table-td min-w-[420px]">
                                            {item.description || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No notifications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <span>
                            Showing {getShowingStart()} to {getShowingEnd()} of {total} entries
                        </span>

                        <div className="flex items-center gap-2">
                            <span>Show</span>

                            <div className="relative">
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        const newLimit = Number(e.target.value);

                                        setLimit(newLimit);
                                        setPage(1);
                                        getNotificationLogList(1, newLimit);
                                    }}
                                    className="appearance-none rounded-lg border border-gray-300 px-2 py-2 pr-7 text-sm dark:border-gray-700 dark:bg-gray-900"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>

                                <svg
                                    className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-black dark:text-white"
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
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1 || loading}
                            onClick={() => handlePageChange(1)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            First
                        </button>

                        <button
                            type="button"
                            disabled={page <= 1 || loading}
                            onClick={() => handlePageChange(page - 1)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>

                        {getVisiblePages().map((pageNumber) => (
                            <button
                                key={pageNumber}
                                type="button"
                                disabled={loading}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`min-w-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${pageNumber === page
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={page >= totalPages || loading}
                            onClick={() => handlePageChange(page + 1)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Next
                        </button>

                        <button
                            type="button"
                            disabled={page >= totalPages || loading}
                            onClick={() => handlePageChange(totalPages)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Last
                        </button>
                    </div>
                </div>

                <div className="block border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:hidden">
                    Swipe left/right to view full table.
                </div>
            </div>
        </>
    );
}