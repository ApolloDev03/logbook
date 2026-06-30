import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";
import { toast } from "react-toastify";


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

const EditIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.586-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.414-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
    />
  </svg>
);

const getCycleBadgeClass = (cycle) => {
  switch (cycle?.trim()) {
    case "Daily":
      return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400";

    case "Weekly":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400";

    case "Monthly":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400";

    case "Quarterly":
      return "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400";

    case "Half Yearly":
      return "bg-pink-50 text-pink-700 ring-1 ring-pink-600/20 dark:bg-pink-500/10 dark:text-pink-400";

    case "Yearly":
      return "bg-green-50 text-green-700 ring-1 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400";

    default:
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400";
  }
};

export default function MaintenanceType() {
  const navigate = useNavigate();

  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMaintenanceTypeId, setDeleteMaintenanceTypeId] = useState(null);
  const getAuthUser = () => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "{}");
    } catch (error) {
      return {};
    }
  };

  const authUser = getAuthUser();
  const isAdmin = Number(authUser?.role_id) === 1;

  const getPermission = (permissionName) => {
    if (isAdmin) {
      return {
        read: 1,
        write: 1,
      };
    }

    const permissions = Array.isArray(authUser?.permissions)
      ? authUser.permissions
      : [];

    return permissions.find(
      (permission) =>
        String(permission?.permission_name || "")
          .trim()
          .toLowerCase() === String(permissionName).trim().toLowerCase(),
    );
  };

  const maintenanceTypePermission = getPermission("Purpose of Visit");

  const canReadMaintenanceType =
    isAdmin || Number(maintenanceTypePermission?.read || 0) === 1;

  const canWriteMaintenanceType =
    isAdmin || Number(maintenanceTypePermission?.write || 0) === 1;
  useEffect(() => {
    if (deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [deleteModalOpen]);

  const fetchMaintenanceTypes = async (customPage = page, customLimit = limit) => {
    try {
      if (!canReadMaintenanceType) {
        setMaintenanceTypes([]);
        setTotalRecords(0);
        setTotalPages(1);
        return;
      }
      setLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/maintenance_type_list`,
        {
          page: customPage,
          limit: customLimit,
          search,
        },
        { headers: getAuthHeaders() },
      );

      if (res.data?.success) {
        setMaintenanceTypes(res.data.data || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalRecords(res.data.total || 0);
      } else {
        setMaintenanceTypes([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Purpose of Visit List API Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load Purpose of Visit list",
      );
      setMaintenanceTypes([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceTypes();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMaintenanceTypes();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const sortedMaintenanceTypes = [...maintenanceTypes].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = "";
    let bValue = "";

    if (sortConfig.key === "type") {
      aValue = (a.maintenance_cycle_name || "").toLowerCase();
      bValue = (b.maintenance_cycle_name || "").toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;

    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  };

  const openDeleteModal = (id) => {
    setDeleteMaintenanceTypeId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteMaintenanceTypeId(null);
    setDeleteModalOpen(false);
  };

  const confirmDeleteMaintenanceType = async () => {
    if (!deleteMaintenanceTypeId) return;

    try {
      setDeleteLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/delete_maintenance_type`,
        {
          id: String(deleteMaintenanceTypeId),
        },
        { headers: getAuthHeaders() },
      );

      if (res.data?.success) {
        closeDeleteModal();
        fetchMaintenanceTypes();
      } else {
        toast.error(res.data?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete Purpose of Visit API Error:", error);
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCycles = (item) => {
    if (Array.isArray(item?.maintenance_cycles)) {
      return item.maintenance_cycles
        .map((cycle) => cycle.maintenance_cycle_name)
        .filter(Boolean);
    }

    if (item?.maintenance_cycle) {
      return String(item.maintenance_cycle)
        .split(",")
        .map((cycle) => cycle.trim())
        .filter(Boolean);
    }

    return [];
  };

  const handleEditComponent = (componentId) => {
    navigate(`/create-maintenance?maintenance_type_id=${componentId}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Purpose of Visit
        </h1>

        <Breadcrumb
          pageName="Purpose of Visit"
          parentPage="Purpose of Visit Management"
        />
      </div>

      <div className="card rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 m-6">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search Purpose of Visit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>

          {canWriteMaintenanceType && (
            <button
              type="button"
              onClick={() => navigate("/create-maintenance")}
              className="btn-gray"
            >
              Add Purpose of Visit
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-800">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th
                  onClick={() => handleSort("type")}
                  className="table-th cursor-pointer select-none"
                >
                  <span className="inline-flex items-center">Purpose of Visit</span>
                </th>

                
                <th className="table-th">Created By</th>
                {/* <th className="table-th">Status</th> */}
                {canWriteMaintenanceType && (
                  <th className="table-th">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sortedMaintenanceTypes.length > 0 ? (
                sortedMaintenanceTypes.map((item) => (
                  <tr key={item.maintenance_cycle_id} className="table-row">
                 

                    <td className="table-td">
                      {/* <div className="flex flex-wrap gap-2">
                        {getCycles(item).map((cycle) => (
                          <span
                            key={`${item.id}-${cycle}`}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getCycleBadgeClass(
                              cycle,
                            )}`}
                          >
                            {cycle}
                          </span>
                        ))}

                        {getCycles(item).length === 0 && "-"}
                      </div> */}
                      {item.maintenance_cycle_name || "-"}
                    </td>

                    <td className="table-td">{item.created_by_name || "-"}</td>

                    {/* <td className="table-td">
                      {item.status === 1 ? (
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400">
                          Inactive
                        </span>
                      )}
                    </td> */}

                    <td className="table-td">
                      {canWriteMaintenanceType && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => handleEditComponent(item.maintenance_cycle_id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() => openDeleteModal(item.maintenance_cycle_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {!canReadMaintenanceType
                      ? "You do not have permission to view Purpose of Visit."
                      : "No Purpose of Visit found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-4">
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
                fetchMaintenanceTypes(1, newLimit);
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
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>

          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
          </div>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/45 backdrop-blur-[1px] px-4">
          <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Delete Purpose of Visit
            </h3>

            <p className="mb-7 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this Purpose of Visit?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteMaintenanceType}
                disabled={deleteLoading}
                className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
